import should from "should";
import { Airport } from "../../src/services/airport_graph/airport";
import { AirportDistanceCalculator } from "../../src/services/airport_graph/airport-distance-calculator";

describe("AirportDistanceCalculator", () => {
    describe("when calculating distance", () => {
        let calculator: AirportDistanceCalculator;
        let tllAirport: Airport;
        let rixAirport: Airport;
        let nullAirport: Airport;
        let undefinedAirport: Airport;

        before(() => {
            calculator = new AirportDistanceCalculator();

            tllAirport = {
                iata: "TLL",
                latitude: 59.41329956049999,
                longitude: 24.832799911499997,
                connections: []
            };

            rixAirport = {
                iata: "RIX",
                latitude: 56.92359924316406,
                longitude: 23.971099853515625,
                connections: []
            };

            nullAirport = null as unknown as Airport;
            undefinedAirport = undefined as unknown as Airport;
        });

        describe("and first airport is not provided", () => {
            it("should throw", () => {
                should(() => calculator.getDistance(nullAirport, tllAirport)).throwError("Argument 'airport1' is not defined.");
                should(() => calculator.getDistance(undefinedAirport, tllAirport)).throwError("Argument 'airport1' is not defined.");
            });
        });

        describe("and second airport is not provided", () => {
            it("should throw", () => {
                should(() => calculator.getDistance(tllAirport, nullAirport)).throwError("Argument 'airport2' is not defined.");
                should(() => calculator.getDistance(tllAirport, undefinedAirport)).throwError("Argument 'airport2' is not defined.");
            });
        });

        describe("and both airports are provided", () => {
            it("should calculate correctly", () => {
                const d = calculator.getDistance(tllAirport, rixAirport);
                d.should.be.approximately(282, .5);
            });
        })
    });
});