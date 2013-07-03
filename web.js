var request = require('request'),
    express = require('express'),
    cors = require('cors'),
    sphereKnn = require('sphere-knn'),
    TempoDBClient = require('tempodb').TempoDBClient;
var app = express();
app.use(express.logger());

var tempodb = new TempoDBClient(process.env.TEMPODB_API_KEY, process.env.TEMPODB_API_SECRET);

var stations = {},
    stationsById = {},
    stationsLookup = null;

function availableDocks(station) {
    return station.availableDocks > 0;
}

function availableBikes(station) {
    return station.availableBikes > 0;
}

app.get('/', function(req, res) {
    return res.sendfile('index.html');
});
app.get('/stations/nearby', cors(), function(req, res) {
    if (!stationsLookup) {
        return res.status(500).send({error: 'No stations available.'});
    }

    if (!(req.query.lat && req.query.lon)) {
        return res.status(400).send({error: 'Requires lat/lon query arg.'});
    }

    var stations = stationsLookup(req.query.lat, req.query.lon),
        max_stations = req.query.max_stations || 5,
        prefer = req.query.prefer;

    if (prefer === 'bikes') {
        stations = stations.filter(availableBikes);
    } else if (prefer === 'docks') {
        stations = stations.filter(availableDocks);
    }

    stations = stations.slice(0, max_stations);

    return res.send(stations.map(stationToGeoJson));
});
app.get('/stations/:id', cors(), function(req, res) {
    if (!stationsById) {
        return res.status(500).send({error: 'No stations available.'});
    }

    var station = stationsById[req.params.id];

    if (!station) {
        return res.status(404).send({error: 'Do not know that station id.'});
    }

    return res.send(stationToGeoJson(station));
});

function stationToGeoJson(obj) {
    return {
        "type": "Feature",
        "properties": {
            "id": obj.id,
            "stationName": obj.stationName,
            "availableDocks": obj.availableDocks,
            "availableBikes": obj.availableBikes,
            "statusValue": obj.statusValue,
            "landmark": obj.landMark,
            "testStation": obj.testStation
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                obj.longitude,
                obj.latitude
            ]
        }
    };
}

function minutely() {
    request({
        uri: 'http://www.divvybikes.com/stations/json/',
        json: true
    }, function(err, resp, body) {
        if (err) return;
        stations = body.stationBeanList;
        stationsLookup = new sphereKnn(stations);

        tempoData = [];
        stationsById = {};
        for (var i = 0; i < stations.length; i++) {
            stationsById[stations[i].id] = stations[i];
            tempoData.push({key: "divvy-" + stations[i].id + "-availableDocks", v: stations[i].availableDocks});
            tempoData.push({key: "divvy-" + stations[i].id + "-availableBikes", v: stations[i].availableBikes});
            tempoData.push({key: "divvy-" + stations[i].id + "-status", v: stations[i].statusKey});
        }

        var lastUpdate = new Date(body.executionTime + " UTC-05:00"),
            ago = new Date().getTime() - lastUpdate.getTime();

        tempodb.write_bulk(lastUpdate, tempoData);

        console.log("Successfully loaded " + stations.length + " stations. Last update was " + ago + "ms ago");
    });
}

setInterval(minutely, 1000 * 60);
minutely();

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});