# Test task for software engineer position at Sixfold
## Task description
Build a JSON over HTTP API endpoint that takes as input two IATA/ICAO airport codes and provides as output a route between these two airports so that:

1) The route consists of at most 4 legs/flights (that is, 3 stops/layovers, if going from A->B, a valid route could be A->1->2->3->B, or for example A->1->B etc.)
1) The route is the shortest such route as measured in kilometers of geographical distance.

For the bonus part, extend your service so that it also allows changing airports during stops that are within 100km of each other. For example, if going from A->B, a valid route could be A->1->2=>3->4->B, where “2=>3” is a change of airports done via ground. These switches are not considered as part of the legs/layover/hop count, but their distance should be reflected in the final distance calculated for the route.

Notes:
* The weekdays and flight times are not important for the purposes of the test task
* You are free to assume that all flights can depart any required time
* You are free to choose any publicly available airport and flight/route database
* You are free to choose to use any open-source libraries
* You are free to choose any programming language (TypeScript is preferred, but not mandatory)