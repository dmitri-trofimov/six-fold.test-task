import { Database } from "./database";
import data from "./data.json";

export class DataProvider {
    async getData(): Promise<Database> {
        return data as Database;
    }
}