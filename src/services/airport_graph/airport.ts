import { Connection } from "./connection";

export interface Airport {
    readonly iata: string;
    readonly latitude: number;
    readonly longitude: number;

    readonly connections: ReadonlyArray<Connection>;
}
