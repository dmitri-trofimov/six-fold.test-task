import { injectable } from "tsyringe";
import connectionsData from "../connections.json";
import { ConnectionRaw } from "./connection-raw";

@injectable()
export class ConnectionRepository {
    public getConnections(): ConnectionRaw[] {
        return connectionsData;
    }
}
