import { Airport } from "./airport_graph/airport";
import { AirportGraph } from "./airport_graph/airport-graph";
import { AirportGraphBuilder } from "./airport_graph/airport-graph-builder";
import { Connection } from "./airport_graph/connection";

export class PathFinder {
    private readonly _graph: AirportGraph;

    public constructor(airportGraphBuilder: AirportGraphBuilder) {
        if (!airportGraphBuilder)
            throw new Error("Argument 'airportGraphBuilder' is not defined.");

        this._graph = airportGraphBuilder.buildAirportGraph();
    }

    public findPath(srcIata: string, destIata: string): Connection[] {
        if (!this.isKnownIata(srcIata))
            throw new Error(`Source airport '${srcIata}' is not recognized.`);
        if (!this.isKnownIata(destIata))
            throw new Error(`Destination airport '${destIata}' is not recognized.`);

        const source = this._graph.airports.get(srcIata) as Airport;
        const sourceConnection: Connection = {
            airport: source,
            distance: 0
        };

        const sourcePoint: PathPoint = {
            connection: sourceConnection,
            prevPoint: undefined,
            fullLength: 0
        };

        const destination = this._graph.airports.get(destIata) as Airport;

        let currentQueue: PathPoint[] = [sourcePoint];
        let nextQueue: PathPoint[] = [];

        const existingPathPoints = new Map<string, PathPoint>();
        existingPathPoints.set(srcIata, sourcePoint);

        // TODO: I need to go through the graph twice
        // 1) get a subgraph that has connected vertices not more than 4 hops away
        // 2) go through that subgraph to find optimal path

        while (currentQueue.length > 0) {
            for (const pathPoint of currentQueue) {
                for (const connection of pathPoint.connection.airport.connections) {
                    const newPathPoint = {
                        connection,
                        prevPoint: pathPoint,
                        fullLength: pathPoint.fullLength + connection.distance
                    };

                    const existingPathPoint = existingPathPoints.get(connection.airport.iata);
                    if (existingPathPoint) {
                        if (existingPathPoint.fullLength > newPathPoint.fullLength) {
                            existingPathPoints.set(connection.airport.iata, newPathPoint);
                            nextQueue.push(newPathPoint);
                        }
                    } {


                    }
                }
            }

            currentQueue = nextQueue;
            nextQueue = [];
        }

        return [];
    }

    private isKnownIata(iata: string): boolean {
        return this._graph.airports.has(iata);
    }

    private _getConnectionsListFromLastPathPoint(lastPathPoint: PathPoint): Connection[] {
        const result: Connection[] = [];

        let currentPathPoint: PathPoint | undefined = lastPathPoint;

        while (currentPathPoint) {
            result.push(currentPathPoint.connection);
            currentPathPoint = currentPathPoint.prevPoint;
        }

        result.reverse();

        return result;
    }
}

interface PathPoint {
    connection: Connection;
    prevPoint?: PathPoint;
    fullLength: number;
}