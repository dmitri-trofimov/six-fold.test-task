import should from "should";
import { PathFinder } from "../../src/services/path-finder";

describe("PathFinder", () => {
    describe("when searching for path", () => {
        describe("and source airport in unknown", () => {
            let pathFinder: PathFinder;
            // let dataProvider: sinon.SinonStubbedInstance<DataProvider>;

            before(() => {

                pathFinder = new PathFinder();
            });

            it("should throw", () => {
                should(() => pathFinder.findPath("narnia", "TLL")).throwError("Airport 'narnia' is not recognized.");
            });
        });

        describe("and destination airport in unknown", () => {
            let pathFinder: PathFinder;

            before(() => {
                pathFinder = new PathFinder();
            });

            it("should throw", () => {
                should(() => pathFinder.findPath("TLL", "mordor")).throwError("Airport 'mordor' is not recognized.");
            });
        });
    });
});