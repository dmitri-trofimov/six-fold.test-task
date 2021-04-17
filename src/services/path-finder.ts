import { injectable } from "tsyringe";
import { Settings } from "../settings/settings";
import { SettingsProvider } from "../settings/settings-provider";
import { Airport } from "./airport_graph/airport";
import { AirportGraph } from "./airport_graph/airport-graph";
import { AirportGraphBuilder } from "./airport_graph/airport-graph-builder";
import { Connection } from "./airport_graph/connection";

@injectable()
export class PathFinder {
    private readonly _graph: AirportGraph;
    private readonly _settings: Settings;

    public constructor(
        airportGraphBuilder: AirportGraphBuilder,
        settingsProvider: SettingsProvider
    ) {
        if (!airportGraphBuilder)
            throw new Error("Argument 'airportGraphBuilder' is not defined.");
        if (!settingsProvider)
            throw new Error("Argument 'settingsProvider' is not defined.");

        this._graph = airportGraphBuilder.buildAirportGraph();
        this._settings = settingsProvider.getSettings();
    }

    public findPath(srcIata: string, destIata: string): Connection[] {
        if (!this._isKnownIata(srcIata))
            throw new Error(`Source airport '${srcIata}' is not recognized.`);
        if (!this._isKnownIata(destIata))
            throw new Error(`Destination airport '${destIata}' is not recognized.`);

        const source = this._graph.airports.get(srcIata) as Airport;
        const sourceConnection: Connection = {
            airport: source,
            distance: 0
        };

        const sourcePoint: Waypoint = {
            connection: sourceConnection,
            prevWaypoint: undefined,
            fullLength: 0,
            waypointIndex: 0,
            isPurged: false,
            children: []
        };

        const destination = this._graph.airports.get(destIata) as Airport;

        let queue = new Set<Waypoint>([sourcePoint]);

        const bestWaypoints = new Map<string, Waypoint[]>();
        this._addWaypoint(bestWaypoints, sourcePoint);

        const reachedDestination: Waypoint[] = [];

        for (const waypoint of queue) {
            if (waypoint.connection.airport === destination) {
                reachedDestination.push(waypoint);
                continue;
            }

            if (waypoint.waypointIndex === this._settings.pathFinding.maxLegCount) {
                continue;
            }

            for (const connection of waypoint.connection.airport.connections) {
                const newWaypoint: Waypoint = {
                    connection,
                    fullLength: waypoint.fullLength + connection.distance,
                    waypointIndex: waypoint.waypointIndex + 1,
                    prevWaypoint: waypoint,
                    isPurged: false,
                    children: []
                };

                const efficiency = this._getWaypointEfficiency(bestWaypoints, newWaypoint);
                if (!efficiency.canBeAdded) {
                    continue;
                }

                this._removeInefficientWaypoints(bestWaypoints, efficiency.inefficientWaypoints);
                this._addWaypoint(bestWaypoints, newWaypoint);

                this._purgeInefficientWaypointsFromQueue(queue, efficiency.inefficientWaypoints);

                queue.add(newWaypoint);
                waypoint.children.push(newWaypoint);
            }
        }

        if (reachedDestination.length === 0) {
            return [];
        }

        reachedDestination.sort((a, b) => a.fullLength - b.fullLength);

        return this._getConnectionsListFromLastWaypoint(reachedDestination[0]);
    }

    private _isKnownIata(iata: string): boolean {
        return this._graph.airports.has(iata);
    }

    private _addWaypoint(
        bestWaypoints: Map<string, Waypoint[]>,
        waypoint: Waypoint
    ): void {
        const iata = waypoint.connection.airport.iata;

        let waypoints = bestWaypoints.get(iata);
        if (!waypoints) {
            waypoints = [];
            bestWaypoints.set(iata, waypoints);
        }

        waypoints.push(waypoint);
    }

    private _getWaypointEfficiency(waypointsContainer: Map<string, Waypoint[]>, waypoint: Waypoint): WaypointEfficiency {
        const existingWaypoints = waypointsContainer.get(waypoint.connection.airport.iata);
        if (!existingWaypoints || existingWaypoints.length === 0) {
            return {
                canBeAdded: true,
                inefficientWaypoints: []
            };
        }

        const inefficientWaypoints: Waypoint[] = [];

        for (const existingWaypoint of existingWaypoints) {
            if (existingWaypoint.waypointIndex > waypoint.waypointIndex) {
                if (existingWaypoint.fullLength >= waypoint.fullLength) {
                    // new path point is more efficient
                    inefficientWaypoints.push(existingWaypoint);
                    continue;
                }
            } else if (existingWaypoint.waypointIndex === waypoint.waypointIndex) {
                if (existingWaypoint.fullLength >= waypoint.fullLength) {
                    // new path point is more efficient
                    inefficientWaypoints.push(existingWaypoint);
                    continue;
                } else {
                    // existing path point is more efficient
                    return {
                        canBeAdded: false,
                        inefficientWaypoints: []
                    }
                }
            } else {
                if (existingWaypoint.fullLength <= waypoint.fullLength) {
                    // existing path point is more efficient
                    return {
                        canBeAdded: false,
                        inefficientWaypoints: []
                    }
                }
            }

            // if we got to this point then it was not possible to tell with certainty which
            // path point was more efficient, lets check the other ones
        }

        // if we got here, then the new path point deserves its place among the most efficient ones
        return {
            canBeAdded: true,
            inefficientWaypoints: inefficientWaypoints
        };
    }

    private _removeInefficientWaypoints(
        bestWaypoints: Map<string, Waypoint[]>,
        inefficientWaypoints: Waypoint[]
    ): void {
        if (inefficientWaypoints.length === 0) {
            return;
        }

        const waypoints = bestWaypoints.get(inefficientWaypoints[0].connection.airport.iata) as Waypoint[];

        for (const point of inefficientWaypoints) {
            const index = waypoints.indexOf(point);
            waypoints.splice(index, 1);
        }
    }

    private _purgeInefficientWaypointsFromQueue(queue: Set<Waypoint>, inefficientWaypoints: Waypoint[]): void {
        for (const waypoint of inefficientWaypoints) {
            this._purgeInefficientSingleWaypointFromQueue(queue, waypoint);
        }
    }

    private _purgeInefficientSingleWaypointFromQueue(queue: Set<Waypoint>, inefficientWaypoint: Waypoint): void {
        if (inefficientWaypoint.isPurged) {
            return;
        }

        queue.delete(inefficientWaypoint);

        for (const childWaypoint of inefficientWaypoint.children) {
            this._purgeInefficientSingleWaypointFromQueue(queue, childWaypoint);
        }

        inefficientWaypoint.isPurged = true;
    }

    private _getConnectionsListFromLastWaypoint(lastWaypoint: Waypoint): Connection[] {
        const result: Connection[] = [];

        let currentWaypoint: Waypoint | undefined = lastWaypoint;

        while (currentWaypoint) {
            result.push(currentWaypoint.connection);
            currentWaypoint = currentWaypoint.prevWaypoint;
        }

        result.reverse();

        return result;
    }
}

interface Waypoint {
    readonly connection: Connection;
    readonly prevWaypoint?: Waypoint;
    readonly fullLength: number;
    readonly waypointIndex: number;
    readonly children: Waypoint[];

    isPurged: boolean;
}

interface WaypointEfficiency {
    readonly inefficientWaypoints: Waypoint[];
    readonly canBeAdded: boolean;
}
