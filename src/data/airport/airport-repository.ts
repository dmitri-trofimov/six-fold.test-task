import { injectable } from "tsyringe";
import airportsData from "../airports.json";
import { AirportRaw } from "./airport-raw";

@injectable()
export class AirportRepository {
    public getAirports(): AirportRaw[] {
        return airportsData;
    }
}