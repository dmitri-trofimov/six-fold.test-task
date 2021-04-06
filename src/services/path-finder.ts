import { Settings } from "../settings/settings";
import { SettingsProvider } from "../settings/settings-provider";
import { Airport } from "./airport_graph/airport";
import { AirportGraph } from "./airport_graph/airport-graph";
import { AirportGraphBuilder } from "./airport_graph/airport-graph-builder";
import { Connection } from "./airport_graph/connection";

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
            waypointIndex: 0
        };

        const destination = this._graph.airports.get(destIata) as Airport;

        let currentQueue: Waypoint[] = [sourcePoint];
        let nextQueue: Waypoint[] = [];

        const bestWaypoints = new Map<string, Waypoint[]>();
        this._addWaypoint(bestWaypoints, sourcePoint);

        const reachedDestination: Waypoint[] = [];

        while (currentQueue.length > 0) {
            for (const waypoint of currentQueue) {
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
                        prevWaypoint: waypoint
                    };

                    const efficiency = this._getWaypointEfficiency(bestWaypoints, newWaypoint);
                    if (!efficiency.canBeAdded) {
                        continue;
                    }

                    this._removeInefficientWaypoints(bestWaypoints, efficiency.inefficientWaypoints);
                    this._addWaypoint(bestWaypoints, newWaypoint);
                    this._purgeInefficientWaypointsFromCurrentQueue(currentQueue, efficiency.inefficientWaypoints);

                    currentQueue.push(newWaypoint);
                }
            }

            currentQueue = nextQueue;
            nextQueue = [];
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
        const index = waypoint.waypointIndex;

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

        const lessEfficientWaypoints: Waypoint[] = [];

        for (const existingWaypoint of existingWaypoints) {
            if (existingWaypoint.waypointIndex > waypoint.waypointIndex) {
                if (existingWaypoint.fullLength >= waypoint.fullLength) {
                    // new path point is more efficient
                    lessEfficientWaypoints.push(existingWaypoint);
                    continue;
                }
            } else if (existingWaypoint.waypointIndex === waypoint.waypointIndex) {
                if (existingWaypoint.fullLength >= waypoint.fullLength) {
                    // new path point is more efficient
                    lessEfficientWaypoints.push(existingWaypoint);
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
            inefficientWaypoints: lessEfficientWaypoints
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

    private _purgeInefficientWaypointsFromCurrentQueue(currentQueue: Waypoint[], inefficientWaypoints: Waypoint[]): void {
        if (inefficientWaypoints.length === 0) {
            return;
        }

        for (let queueIndex = currentQueue.length - 1; queueIndex >= 0; queueIndex--) {
            let queueItem: Waypoint | undefined = currentQueue[queueIndex];

            while (queueItem) {
                if (inefficientWaypoints.some(x => x === queueItem)) {
                    currentQueue.splice(queueIndex, 1);
                    break;
                }

                queueItem = queueItem.prevWaypoint;
            }
        }
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
}

interface WaypointEfficiency {
    readonly inefficientWaypoints: Waypoint[];
    readonly canBeAdded: boolean;
}
