import { container } from "tsyringe";
import { DataProvider } from "./data/data-provider";
import { SettingsProvider } from "./settings/settings-provider";

container.register(DataProvider, { useClass: DataProvider });
container.register(SettingsProvider, { useClass: SettingsProvider });
