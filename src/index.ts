import "reflect-metadata";
import express from "express";
import { container } from "tsyringe"
import { SettingsProvider } from "./settings/settings-provider"


const settings = container.resolve(SettingsProvider).getSettings();

const app = express();

app.get("/airports", (_req, res) => {
    res.json({ hello: "world "});
});

const port = settings.connection.port;
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
