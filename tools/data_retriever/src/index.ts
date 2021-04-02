import fs from "fs";
import { Airport } from "./airports/airport";
import { AirportDataProvider } from "./airports/airport-data-provider";
import { Connection } from "./connections/connection";
import { ConnectionDataProvider } from "./connections/connection-data-provider";

const DATA_FILE_PATH = "../../src/data/data.json";

void run();

async function run(): Promise<void> {
    const airports = await new AirportDataProvider().getAirports();
    const connections = await new ConnectionDataProvider().getRoutes();

    saveData(airports, connections);
}

function saveData(airports: Airport[], connections: Connection[]) {
    const stringData = getStringifiedData(airports, connections);
    fs.writeFileSync(DATA_FILE_PATH, stringData);
}

function getStringifiedData(airports: Airport[], connections: Connection[]): string {
    const data = {
        airports,
        connections
    };

    return JSON.stringify(data);
}
