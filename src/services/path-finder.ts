export class PathFinder {
    public constructor() {

    }

    public findPath(srcIata: string, destIata: string): void {
        if (!this.isKnownIata(srcIata)) {
            throw new Error(`Airport '${srcIata}' is not recognized.`);
        }
    }

    private isKnownIata(iata: string): boolean {
        return false;
    }
}