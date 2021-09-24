import { DataProvider } from "../utils/data-provider";
import { Connection } from "./connection";

const ROUTES_DATA_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat";

export class ConnectionDataProvider extends DataProvider {
    public async getRoutes(): Promise<Connection[]> {
        const lines = await this.getParsedData(ROUTES_DATA_URL);

        const result: Connection[] = [];

        for (const line of lines) {
            const sourceIata = line[2];
            const destinationIata = line[4];
            const stopsCount = Number.parseFloat(line[7]);

            if (sourceIata.length > 3 || destinationIata.length > 3 || stopsCount > 0) {
                continue;
            }

            result.push({
                sourceIata: sourceIata,
                destinationIata: destinationIata
            });
        }

        return result;
    }
}
