import { injectable } from "tsyringe";
import { Airport } from "./airport";

const EARTH_RADIUS_KM = 6374;

/**
 * Provides methods for distance calculation between two airports.
 */
@injectable()
export class AirportDistanceCalculator {
    /**
     * Calculates distance in KM between two airports. The method assumes Earth to be a perfect sphere with radius of 6374 KM.
     * @param airport1 
     * @param airport2 
     * @returns 
     */
    public getDistance(airport1: Airport, airport2: Airport): number {
        if (!airport1)
            throw new Error("Argument 'airport1' is not defined.");
        if (!airport2)
            throw new Error("Argument 'airport2' is not defined.");

        const lat1 = degreesToRadians(airport1.latitude);
        const lat2 = degreesToRadians(airport2.latitude);
        const long1 = degreesToRadians(airport1.longitude);
        const long2 = degreesToRadians(airport2.longitude);

        const diffLat = lat1 - lat2;
        const diffLong = long1 - long2;

        const a =
            Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(diffLong / 2) * Math.sin(diffLong / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = EARTH_RADIUS_KM * c;

        return Math.abs(d);
    }
}

function degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}