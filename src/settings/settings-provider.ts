import { injectable } from "tsyringe";
import { Settings } from "./settings";

@injectable()
export class SettingsProvider {
    getSettings(): Settings {
        return {
            connection: {
                port: 8080
            }
        }
    }
}
