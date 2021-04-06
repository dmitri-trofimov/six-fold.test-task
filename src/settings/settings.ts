export interface Settings {
    readonly connection: {
        readonly port: number
    };

    readonly pathFinding: {
        readonly maxLegCount: number;
    }
}
