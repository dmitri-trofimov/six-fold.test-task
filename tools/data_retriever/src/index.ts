import fs from "fs";
import { Airport } from "./airports/airport";
import { AirportDataProvider } from "./airports/airport-data-provider";
import { Route } from "./routes/route";
import { RouteDataProvider } from "./routes/route-data-provider";

const DATA_FILE_PATH = "../../src/data/data.json";

void run();

async function run(): Promise<void> {
    const airports = await new AirportDataProvider().getAirports();
    const routes = await new RouteDataProvider().getRoutes();

    saveData(airports, routes);
}

function saveData(airports: Airport[], routes: Route[]) {
    const stringData = getStringifiedData(airports, routes);
    fs.writeFileSync(DATA_FILE_PATH, stringData);
}

function getStringifiedData(airports: Airport[], routes: Route[]): string {
    const data = {
        airports,
        routes
    };

    return JSON.stringify(data);
}
