import { Airport } from "./airports/airport";
import { AirportDataProvider } from "./airports/airport-data-provider";
import { Route } from "./routes/route";
import { RouteDataProvider } from "./routes/route-data-provider";

void run();

async function run(): Promise<void> {
    let airports: Airport[];
    let routes: Route[];

    await benchmark("Getting airport data... ", async () => { airports = await new AirportDataProvider().getAirports(); });
    await benchmark("Getting routes data...  ", async () => { routes = await new RouteDataProvider().getRoutes(); });
}

async function benchmark(funcName: string, func: () => Promise<void>): Promise<void> {
    process.stdout.write(funcName);

    const start = new Date();
    await func();
    const end = new Date();

    const milliseconds = end.getTime() - start.getTime();
    console.log(`${milliseconds}ms`);
}
