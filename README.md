Divvy API API
=============

Inspired by [Tom MacWright](https://github.com/tmcw/wmataapiapi), this is a very
simple API to get information about the [Divvy](http://divvybikes.com/) stations near you.

I proxy the real (unpublished) [Divvy API](http://www.divvybikes.com/stations/json/)
and throw it into a KNN tree so you can make efficient nearby lookups based on a provided lat/lon.
You can also filter results to only include stations with bikes or with available docks.

A sample application can be viewed at [http://shrouded-beach-2183.herokuapp.com](http://shrouded-beach-2183.herokuapp.com).
This is also the API endpoint where the calls below can be directed.

`/stations/nearby`
------------------

Returns stations near a specified lat/lon pair as a GeoJSON document.

| Query Arg | Description     |
|----------:|-----------------|
| `lat`     | *required* The latitude to search from.
| `lon`     | *required* The longitude to search from.
| `prefer`  | When not present, all stations are returned. When `bikes`, only stations with available bikes are returned. When `docks`, only stations with available docks are returned.
| `max_stations` | The maximum number of stations to return. Default is 5.

`/stations/:id`
------------------

Returns the specified station as a GeoJSON document.
