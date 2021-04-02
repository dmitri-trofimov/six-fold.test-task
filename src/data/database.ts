import { Airport } from "./airport";
import { Connection } from "./connection";

export interface Database {
    airports: Airport[],
    connections: Connection[]
}
