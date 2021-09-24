# Test task for software engineer position at Sixfold

## Task description

Build a JSON over HTTP API endpoint that takes as input two IATA/ICAO airport codes and provides as output a route between these two airports so that:

1. The route consists of at most 4 legs/flights (that is, 3 stops/layovers, if going from A->B, a valid route could be A->1->2->3->B, or for example A->1->B etc.)
1. The route is the shortest such route as measured in kilometers of geographical distance.

For the bonus part, extend your service so that it also allows changing airports during stops that are within 100km of each other. For example, if going from A->B, a valid route could be A->1->2=>3->4->B, where “2=>3” is a change of airports done via ground. These switches are not considered as part of the legs/layover/hop count, but their distance should be reflected in the final distance calculated for the route.

Notes:

-   The weekdays and flight times are not important for the purposes of the test task
-   You are free to assume that all flights can depart any required time
-   You are free to choose any publicly available airport and flight/route database
-   You are free to choose to use any open-source libraries
-   You are free to choose any programming language (TypeScript is preferred, but not mandatory)

## Data sources

This application uses [airport](https://openflights.org/data.html#airport) and [connections](https://openflights.org/data.html#route) information from [openflights.org](https://openflights.org). The data has been pre-downloaded and pre-converted into JSON format by a tool that can be found in [tools/data-retriever](https://github.com/dmitri-trofimov/six-fold.test-task/tree/main/tools/data_retriever) folder.

## Requirements

Node v16.10.0 on Windows 10. It is very likely that it will work on lower version of Node on Mac or Linux, but I haven't tested that scenario.

## How to run

```
git clone https://github.com/dmitri-trofimov/six-fold.test-task.git
cd six-fold.test-task
npm install
npm start
```

It might take a few seconds to start because it loads the entire DB of all the airports and connections between them from JSON files.

The server is ready for requests when this line is displayed:

```
server started at http://localhost:8080
```

## Application endpoints

### Airports

Get a JSON with all the available airports:

```
http://localhost:8080/airports
```

### Connections

Get a JSON with all the available direct connections between airports:

```
http://localhost:8080/connections
```

### Find flight path

```
http://localhost:8080/SRC/DST
```

### Example

```
http://localhost:8080/TLL/SYD
```

```json
{
    "totalDistanceKM": 15270.68717493974,
    "calculationTimeMS": 119,
    "flights": [
        {
            "index": 0,
            "source": "TLL",
            "destination": "LED",
            "distance": 308.53039270272484
        },
        {
            "index": 1,
            "source": "LED",
            "destination": "OVB",
            "distance": 3099.0625454995056
        },
        {
            "index": 2,
            "source": "OVB",
            "destination": "HKG",
            "distance": 4465.766420828632
        },
        {
            "index": 3,
            "source": "HKG",
            "destination": "SYD",
            "distance": 7397.327815908878
        }
    ]
}
```
