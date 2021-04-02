import "reflect-metadata";
import express from "express";
import { container } from "tsyringe"
import { SettingsProvider } from "./settings/settings-provider"
import { DataProvider } from "./data/data-provider";

const dataProvider = container.resolve(DataProvider);
const settings = container.resolve(SettingsProvider).getSettings();

const app = express();

app.get("/airports", async (_req, res) => {
    const data = await dataProvider.getData();

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify(
            {
                totalCount: data.airports.length,
                airports: data.airports
            }, 
            null,
            4));
});

app.get("/connections", async (_req, res) => {
    const data = await dataProvider.getData();

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify(
            {
                totalCount: data.connections.length,
                connections: data.connections
            }, 
            null,
            4));
});

const port = settings.connection.port;
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
