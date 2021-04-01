import { DataProvider } from "../utils/data-provider";
import { Airport } from "./airport";

const AIRPORTS_DATA_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

export class AirportDataProvider extends DataProvider {
    public async getAirports(): Promise<Airport[]> {
        const lines = await this.getParsedData(AIRPORTS_DATA_URL);

        const result: Airport[] = [];

        for (const line of lines) {
            const iata = line[4];
            const type = line[12];

            if (!iata || iata.length < 3 || type !== "airport") {
                continue;
            }

            const airport: Airport = {
                iata: iata,
                latitude: Number.parseFloat(line[6]),
                longitide: Number.parseFloat(line[7])
            };

            result.push(airport);
        }

        return result;
    }
}