import { container } from "tsyringe";
import { SettingsProvider } from "./settings/settings-provider";

container.register(SettingsProvider, { useClass: SettingsProvider });
