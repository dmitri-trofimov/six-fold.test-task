import { expect } from "chai";
import sinon from "sinon";
import { AirportRaw } from "../../src/data/airport/airport-raw";
import { AirportRepository } from "../../src/data/airport/airport-repository";
import { ConnectionRaw } from "../../src/data/connection/connection-raw";
import { ConnectionRepository } from "../../src/data/connection/connection-repository";
import { AirportDistanceCalculator } from "../../src/services/airport_graph/airport-distance-calculator";
import { AirportGraph } from "../../src/services/airport_graph/airport-graph";
import { AirportGraphBuilder } from "../../src/services/airport_graph/airport-graph-builder";

describe("AirportGraphBuilder", () => {
    let graphBuilder: AirportGraphBuilder;
    let distanceCalculatorStub: sinon.SinonStubbedInstance<AirportDistanceCalculator>;
    let airportRepoStub: sinon.SinonStubbedInstance<AirportRepository>;
    let connectionsRepoStub: sinon.SinonStubbedInstance<ConnectionRepository>;

    before(() => {
        distanceCalculatorStub = sinon.createStubInstance(AirportDistanceCalculator);
        airportRepoStub = sinon.createStubInstance(AirportRepository);
        connectionsRepoStub = sinon.createStubInstance(ConnectionRepository);
    });

    describe("when initializing new instance", () => {
        describe("and AirportDistanceCalculator is not provided", () => {
            it("should throw", () => {
                const createInstanceWithoutCalculator = (calculator: unknown) =>
                    new AirportGraphBuilder(
                        calculator as AirportDistanceCalculator,
                        airportRepoStub,
                        connectionsRepoStub);

                expect(() => createInstanceWithoutCalculator(null)).to.throw("Argument 'airportDistanceCalculator' is not defined.");
                expect(() => createInstanceWithoutCalculator(undefined)).to.throw("Argument 'airportDistanceCalculator' is not defined.");
            });
        });

        describe("and AirportRepository is not provided", () => {
            it("should throw", () => {
                const createInstanceWithoutAirRepo = (repo: unknown) =>
                    new AirportGraphBuilder(
                        distanceCalculatorStub,
                        repo as AirportRepository,
                        connectionsRepoStub);

                expect(() => createInstanceWithoutAirRepo(null)).to.throw("Argument 'airportRepository' is not defined.");
                expect(() => createInstanceWithoutAirRepo(undefined)).to.throw("Argument 'airportRepository' is not defined.");
            });
        });

        describe("and ConnectionRepository is not provided", () => {
            it("should throw", () => {
                const createInstanceWithoutConnectionRepo = (repo: unknown) =>
                    new AirportGraphBuilder(
                        distanceCalculatorStub,
                        airportRepoStub,
                        repo as ConnectionRepository);

                expect(() => createInstanceWithoutConnectionRepo(null)).to.throw("Argument 'connectionRepository' is not defined.");
                expect(() => createInstanceWithoutConnectionRepo(undefined)).to.throw("Argument 'connectionRepository' is not defined.");
            });
        });
    });

    describe("when building airport graph", () => {
        let graph: AirportGraph;
        let tllRaw: AirportRaw;
        let rixRaw: AirportRaw;
        let tllRixConnection: ConnectionRaw;
        let tllVnoConnection: ConnectionRaw;
        let rixVnoConnection: ConnectionRaw;
        let rixTllConnection: ConnectionRaw;

        before(() => {
            tllRaw = { iata: "TLL", latitude: 59.41329956049999, longitude: 24.832799911499997 };
            rixRaw = { iata: "RIX", latitude: 56.92359924316406, longitude: 23.971099853515625 };

            tllRixConnection = { sourceIata: "TLL", destinationIata: "RIX" };
            tllVnoConnection = { sourceIata: "TLL", destinationIata: "VNO" };
            rixVnoConnection = { sourceIata: "RIX", destinationIata: "VNO" };
            rixTllConnection = { sourceIata: "RIX", destinationIata: "VNO" };

            airportRepoStub.getAirports.returns([
                tllRaw,
                rixRaw
            ]);

            connectionsRepoStub.getConnections.returns([tllRixConnection, tllVnoConnection, rixVnoConnection, rixTllConnection]);

            distanceCalculatorStub.getDistance.returns(282);

            graphBuilder = new AirportGraphBuilder(distanceCalculatorStub, airportRepoStub, connectionsRepoStub);
            graph = graphBuilder.buildAirportGraph();
        });

        it("should add all airports from repo", () => {
            const tll = graph.airports.get("TLL");

            expect(tll).to.not.be.undefined;
            expect(tll?.iata).to.equal(tllRaw.iata);
            expect(tll?.latitude).to.equal(tllRaw.latitude);
            expect(tll?.longitude).to.equal(tllRaw.longitude);

            const rix = graph.airports.get("RIX");

            expect(rix).to.not.be.undefined;
            expect(rix?.iata).to.equal(rixRaw.iata);
            expect(rix?.latitude).to.equal(rixRaw.latitude);
            expect(rix?.longitude).to.equal(rixRaw.longitude);
        });

        it("should add all connections from repo for existing airports", () => {
            const tll = graph.airports.get("TLL");
            const rix = graph.airports.get("RIX");

            const tllRixConnection = tll?.connections.filter(x => x.airport.iata === "RIX")[0];
            expect(tllRixConnection?.airport).to.equal(rix);
            expect(tllRixConnection?.distance).to.be.approximately(282, .5);

            const rixTllConnection = rix?.connections.filter(x => x.airport.iata === "TLL")[0];
            expect(rixTllConnection?.airport).to.equal(tll);
            expect(rixTllConnection?.distance).to.be.approximately(282, .5);
        });

        it("should not add conections that include airport not present in repo", () => {
            expect(graph.airports.get("TLL")?.connections).to.have.length(1);
            expect(graph.airports.get("RIX")?.connections).to.have.length(1);
        });
    });
});