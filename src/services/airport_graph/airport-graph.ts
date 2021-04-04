import { Airport } from "./airport";

export interface AirportGraph {
    readonly airports: ReadonlyMap<string, Airport>;
}
