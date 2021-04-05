import { expect } from "chai";
import Sinon from "sinon";
import { AirportRepository } from "../../src/data/airport/airport-repository";
import { ConnectionRepository } from "../../src/data/connection/connection-repository";
import { AirportDistanceCalculator } from "../../src/services/airport_graph/airport-distance-calculator";
import { AirportGraphBuilder } from "../../src/services/airport_graph/airport-graph-builder";
import { PathFinder } from "../../src/services/path-finder";

describe("PathFinder", () => {
    describe("when searching for path", () => {
        let graphBuilder: AirportGraphBuilder;
        let pathFinder: PathFinder;

        before(() => {
            graphBuilder = getConfiguredGraphBuilder();
            pathFinder = new PathFinder(graphBuilder);
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
    });
});

function getConfiguredGraphBuilder(): AirportGraphBuilder {
    const airRepo = Sinon.createStubInstance(AirportRepository);
    const conRepo = Sinon.createStubInstance(ConnectionRepository);

    airRepo.getAirports.returns([
        { iata: "MOON", latitude: 0, longitude: 0 },
        { iata: "TLL", latitude: 59.41329956049999, longitude: 24.832799911499997 },
        { iata: "RIX", latitude: 56.92359924316406, longitude: 23.971099853515625 }
    ]);

    conRepo.getConnections.returns([
        { sourceIata: "TLL", destinationIata: "RIX" }
    ]);

    return new AirportGraphBuilder(new AirportDistanceCalculator(), airRepo, conRepo);
}