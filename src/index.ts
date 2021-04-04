import express from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { AirportRepository } from "./data/airport/airport-repository";
import { ConnectionRepository } from "./data/connection/connection-repository";
import { SettingsProvider } from "./settings/settings-provider";

const airportRepository = container.resolve(AirportRepository);
const connectionRepository = container.resolve(ConnectionRepository);
const settings = container.resolve(SettingsProvider).getSettings();

const app = express();

app.get("/airports", async (_req, res) => {
    const airports = airportRepository.getAirports();

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify(
            {
                totalCount: airports.length,
                airports: airports
            },
            null,
            4));
});

app.get("/connections", async (_req, res) => {
    const connections = connectionRepository.getConnections();

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify(
            {
                totalCount: connections.length,
                connections: connections
            },
            null,
            4));
});

const port = settings.connection.port;
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
