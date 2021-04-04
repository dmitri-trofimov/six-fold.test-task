import { Airport } from "./airport";

export interface Connection {
    readonly airport: Airport;
    readonly distance: number;
}
