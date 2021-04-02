import { Settings } from "./settings";

export class SettingsProvider  {
    getSettings(): Settings {
        return {
            connection: {
                port: 8080
            }
        }
    }
}
