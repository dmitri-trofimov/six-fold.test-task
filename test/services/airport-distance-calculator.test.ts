import { expect } from "chai";
import { Airport } from "../../src/services/airport_graph/airport";
import { AirportDistanceCalculator } from "../../src/services/airport_graph/airport-distance-calculator";

describe("AirportDistanceCalculator", () => {
    describe("when calculating distance", () => {
        let calculator: AirportDistanceCalculator;
        let tllAirport: Airport;
        let rixAirport: Airport;
        let nullAirport: Airport;
        let undefinedAirport: Airport;
        let northPole: Airport;
        let southPole: Airport;

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

            northPole = {
                iata: "NORTHPOLE",
                latitude: 90,
                longitude: 0,
                connections: []
            };

            southPole = {
                iata: "SOUTHPOLE",
                latitude: -90,
                longitude: 0,
                connections: []
            };
        });

        describe("and first airport is not provided", () => {
            it("should throw", () => {
                expect(() => calculator.getDistance(nullAirport, tllAirport)).to.throw("Argument 'airport1' is not defined.");
                expect(() => calculator.getDistance(undefinedAirport, tllAirport)).to.throw("Argument 'airport1' is not defined.");
            });
        });

        describe("and second airport is not provided", () => {
            it("should throw", () => {
                expect(() => calculator.getDistance(tllAirport, nullAirport)).to.throw("Argument 'airport2' is not defined.");
                expect(() => calculator.getDistance(tllAirport, undefinedAirport)).to.throw("Argument 'airport2' is not defined.");
            });
        });

        describe("and both airports are provided", () => {
            describe("and they are north pole and south pole", () => {
                it("should calculate correctly", () => {
                    const d = calculator.getDistance(northPole, southPole);
                    expect(d).to.be.approximately(20024, 1);
                });
            });

            describe("and they are TLL and RIX", () => {
                it("should calculate correctly", () => {
                    const d = calculator.getDistance(tllAirport, rixAirport);
                    expect(d).to.be.approximately(282, 0.5);
                });
            });
        });
    });
});
