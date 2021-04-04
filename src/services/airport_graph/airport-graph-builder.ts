import { injectable } from "tsyringe";
import { AirportRaw } from "../../data/airport/airport-raw";
import { AirportRepository } from "../../data/airport/airport-repository";
import { ConnectionRaw } from "../../data/connection/connection-raw";
import { ConnectionRepository } from "../../data/connection/connection-repository";
import { Airport } from "./airport";
import { AirportDistanceCalculator } from "./airport-distance-calculator";
import { AirportGraph } from "./airport-graph";
import { Connection } from "./connection";

@injectable()
export class AirportGraphBuilder {
    private _airportDistanceCalculator: AirportDistanceCalculator;
    private _airports: AirportRaw[];
    private _connections: ConnectionRaw[];

    constructor(
        airportDistanceCalculator: AirportDistanceCalculator,
        airportRepository: AirportRepository,
        connectionRepository: ConnectionRepository
    ) {
        if (!airportDistanceCalculator)
            throw new Error("Argument 'airportDistanceCalculator' is not defined.");

        if (!airportRepository)
            throw new Error("Argument 'airportRepository' is not defined.");

        if (!connectionRepository)
            throw new Error("Argument 'connectionRepository' is not defined.");

        this._airportDistanceCalculator = airportDistanceCalculator;
        this._airports = airportRepository.getAirports();
        this._connections = connectionRepository.getConnections();
    }

    buildAirportGraph(): AirportGraph {
        const airports = new Map<string, Airport>();

        for (const airportRaw of this._airports) {
            if (airports.has(airportRaw.iata))
                continue;

            const airport: Airport = {
                iata: airportRaw.iata,
                latitude: airportRaw.latitude,
                longitude: airportRaw.longitude,
                connections: []
            };

            airports.set(airport.iata, airport);
        }

        for (const connectionRaw of this._connections) {
            const sourceAirport = airports.get(connectionRaw.sourceIata);
            const destinationAirport = airports.get(connectionRaw.destinationIata);

            if (!sourceAirport || !destinationAirport)
                continue;

            if (sourceAirport.connections.some(x => x.airport === destinationAirport))
                continue;

            if (destinationAirport.connections.some(x => x.airport === sourceAirport))
                continue;

            const airportDistance = this._airportDistanceCalculator.getDistance(sourceAirport, destinationAirport);

            const sourceAirportConnections = (sourceAirport.connections as Connection[]);
            const destinationAirportConnections = (destinationAirport.connections as Connection[]);

            sourceAirportConnections
                .push({
                    airport: destinationAirport,
                    distance: airportDistance
                });

            destinationAirportConnections
                .push({
                    airport: sourceAirport,
                    distance: airportDistance
                });
        }

        return {
            airports: airports
        };
    }
}