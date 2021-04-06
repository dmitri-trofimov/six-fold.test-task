import { expect } from "chai";
import Sinon from "sinon";
import { AirportRepository } from "../../src/data/airport/airport-repository";
import { ConnectionRepository } from "../../src/data/connection/connection-repository";
import { AirportDistanceCalculator } from "../../src/services/airport_graph/airport-distance-calculator";
import { AirportGraphBuilder } from "../../src/services/airport_graph/airport-graph-builder";
import { PathFinder } from "../../src/services/path-finder";
import { SettingsProvider } from "../../src/settings/settings-provider";

describe("PathFinder", () => {
    describe("when searching for path", () => {
        let graphBuilder: AirportGraphBuilder;
        let pathFinder: PathFinder;
        let settingsProvider: Sinon.SinonStubbedInstance<SettingsProvider>;

        before(() => {
            graphBuilder = getConfiguredGraphBuilder();

            settingsProvider = Sinon.createStubInstance(SettingsProvider);
            settingsProvider.getSettings.returns({
                connection: {
                    port: 8080
                },
                pathFinding: {
                    maxLegCount: 4
                }
            });

            pathFinder = new PathFinder(graphBuilder, settingsProvider);
        });

        describe("and source airport in unknown", () => {
            it("should throw", () => {
                expect(() => pathFinder.findPath("narnia", "TLL")).to.throw("Source airport 'narnia' is not recognized.");
            });
        });

        describe("and destination airport in unknown", () => {
            it("should throw", () => {
                expect(() => pathFinder.findPath("TLL", "mordor")).to.throw("Destination airport 'mordor' is not recognized.");
            });
        });

        describe("and there is no connection", () => {
            it("should return empty path", () => {
                const foundPath = pathFinder.findPath("MOON", "TLL")
                expect(foundPath).to.be.empty;
            });
        });

        describe("and there is direct connection", () => {
            it("should find path", () => {
                const foundPath = pathFinder.findPath("TLL", "RIX")
                expect(foundPath).to.have.lengthOf(2);
                expect(foundPath[0].airport.iata).to.eql("TLL");
                expect(foundPath[1].airport.iata).to.eql("RIX");
            });
        });

        describe("and there is indirect connection", () => {
            it("should find path", () => {
                const foundPath = pathFinder.findPath("TLL", "VNO")
                expect(foundPath).to.have.lengthOf(3);
                expect(foundPath[0].airport.iata).to.eql("TLL");
                expect(foundPath[1].airport.iata).to.eql("RIX");
                expect(foundPath[2].airport.iata).to.eql("VNO");
            });
        });

        describe("and there is direct connections as well as indirect one", () => {
            it("should choose direct", () => {
                const foundPath = pathFinder.findPath("TLL1", "VNO1")
                expect(foundPath).to.have.lengthOf(2);
                expect(foundPath[0].airport.iata).to.eql("TLL1");
                expect(foundPath[1].airport.iata).to.eql("VNO1");
            });
        });

        describe("and there are multiple indirect connections", () => {
            it("should choose the shortest one", () => {
                const foundPath = pathFinder.findPath("HEL2", "VNO2")
                expect(foundPath).to.have.lengthOf(3);
                expect(foundPath[0].airport.iata).to.eql("HEL2");
                expect(foundPath[1].airport.iata).to.eql("TLL2");
                expect(foundPath[2].airport.iata).to.eql("VNO2");
            });
        });

        describe("and there is a connection, but to many waypoints away", () => {
            it("should not find a path", () => {
                const foundPath = pathFinder.findPath("HEL3", "FRA3")
                expect(foundPath).to.have.lengthOf(0);
            });
        });
    });
});

function getConfiguredGraphBuilder(): AirportGraphBuilder {
    const airRepo = Sinon.createStubInstance(AirportRepository);
    const conRepo = Sinon.createStubInstance(ConnectionRepository);

    airRepo.getAirports.returns([
        { iata: "MOON", latitude: 0, longitude: 0 },

        { iata: "TLL", latitude: 59.41329956049999, longitude: 24.832799911499997 },
        { iata: "RIX", latitude: 56.92359924316406, longitude: 23.971099853515625 },
        { iata: "VNO", latitude: 54.63410200000000, longitude: 25.285801000000000 },

        { iata: "TLL1", latitude: 59.41329956049999, longitude: 24.832799911499997 },
        { iata: "RIX1", latitude: 56.92359924316406, longitude: 23.971099853515625 },
        { iata: "VNO1", latitude: 54.63410200000000, longitude: 25.285801000000000 },

        { iata: "TLL2", latitude: 59.41329956049999, longitude: 24.832799911499997 },
        { iata: "RIX2", latitude: 56.92359924316406, longitude: 23.971099853515625 },
        { iata: "VNO2", latitude: 54.63410200000000, longitude: 25.285801000000000 },
        { iata: "HEL2", latitude: 60.31719970703100, longitude: 24.963300704956000 },

        { iata: "HEL3", latitude: 60.31719970703100, longitude: 24.963300704956000 },
        { iata: "TLL3", latitude: 59.41329956049999, longitude: 24.832799911499997 },
        { iata: "RIX3", latitude: 56.92359924316406, longitude: 23.971099853515625 },
        { iata: "VNO3", latitude: 54.63410200000000, longitude: 25.285801000000000 },
        { iata: "WAW3", latitude: 52.16569900510000, longitude: 20.967100143399996 },
        { iata: "FRA3", latitude: 50.03333300000000, longitude: 8.5705560000000000 }
    ]);

    conRepo.getConnections.returns([
        { sourceIata: "TLL", destinationIata: "RIX" },
        { sourceIata: "RIX", destinationIata: "VNO" },

        { sourceIata: "TLL1", destinationIata: "RIX1" },
        { sourceIata: "RIX1", destinationIata: "VNO1" },
        { sourceIata: "TLL1", destinationIata: "VNO1" },

        // two connections from Helsinki to Vilnius 1) via Tallinn 2) via Riga (Tallinn is less KM)
        { sourceIata: "HEL2", destinationIata: "TLL2" },
        { sourceIata: "TLL2", destinationIata: "VNO2" },
        { sourceIata: "HEL2", destinationIata: "RIX2" },
        { sourceIata: "RIX2", destinationIata: "VNO2" },

        // connection that has more than allowed number of waypoints
        { sourceIata: "HEL3", destinationIata: "TLL" },
        { sourceIata: "TLL3", destinationIata: "RIX3" },
        { sourceIata: "RIX3", destinationIata: "VNO3" },
        { sourceIata: "VNO3", destinationIata: "WAW3" },
        { sourceIata: "WAW3", destinationIata: "FRA3" },
    ]);

    return new AirportGraphBuilder(new AirportDistanceCalculator(), airRepo, conRepo);
}