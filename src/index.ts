import express from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { AirportRepository } from "./data/airport/airport-repository";
import { ConnectionRepository } from "./data/connection/connection-repository";
import { Connection } from "./services/airport_graph/connection";
import { PathFinder } from "./services/path-finder";
import { SettingsProvider } from "./settings/settings-provider";

const airportRepository = container.resolve(AirportRepository);
const connectionRepository = container.resolve(ConnectionRepository);
const settings = container.resolve(SettingsProvider).getSettings();
const pathFinder = container.resolve(PathFinder);

const app = express();

function sendPrettyJson(res: express.Response, object: any): void {
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(object, null, 4));
}

function pathToJson(connections: Connection[], calculationTimeMS: number) {
    if (!connections || connections.length === 0) {
        throw new Error("Failed to find path.");
    }

    const flights = [];
    let totalDistanceKM = 0;
    for (let i = 1; i < connections.length; i++) {
        flights.push({
            index: i - 1,
            source: connections[i - 1].airport.iata,
            destination: connections[i].airport.iata,
            distance: connections[i].distance
        });

        totalDistanceKM += connections[i].distance;
    }

    return {
        totalDistanceKM,
        calculationTimeMS,
        flights
    };
}

app.get("/airports", async (_req, res) => {
    const airports = airportRepository.getAirports();

    sendPrettyJson(res, {
        totalCount: airports.length,
        airports: airports
    });
});

app.get("/connections", async (_req, res) => {
    const connections = connectionRepository.getConnections();

    sendPrettyJson(res, {
        totalCount: connections.length,
        connections: connections
    });
});

app.get("/:src/:dest", async (req, res) => {
    const sourceIata: string = req.params.src;
    const destinationIata: string = req.params.dest;

    try {
        const start = new Date();
        const path = pathFinder.findPath(sourceIata, destinationIata);
        const end = new Date();

        const json = pathToJson(path, end.getTime() - start.getTime());

        sendPrettyJson(res, json);
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error occured. See response body for more info.";

        let message: string;

        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else {
            message = "Unknown error.";
        }

        sendPrettyJson(res, {
            result: "error",
            message: message
        });
    }
});

const port = settings.connection.port;
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
