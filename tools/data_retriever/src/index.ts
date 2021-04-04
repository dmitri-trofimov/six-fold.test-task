import fs from "fs";
import path from "path";
import { AirportDataProvider } from "./airports/airport-data-provider";
import { ConnectionDataProvider } from "./connections/connection-data-provider";

const DATA_PATH = "../../src/data";

void run();

async function run(): Promise<void> {
    const airports = await new AirportDataProvider().getAirports();
    const connections = await new ConnectionDataProvider().getRoutes();

    saveData(airports, "airports.json");
    saveData(connections, "connections.json");
}

function saveData<T>(data: T, fileName: string) {
    const filePath = path.join(DATA_PATH, fileName);
    const stringData = JSON.stringify(data);

    fs.writeFileSync(filePath, stringData);
}
