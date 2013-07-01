Divvy API API
=============

Inspired by [Tom MacWright](https://github.com/tmcw/wmataapiapi), this is a very
simple API to get information about the Divvy stations near you.

I proxy the real (unpublished) [Divvy API](http://www.divvybikes.com/stations/json/)
and throw it into a KNN tree so you can make efficient nearby lookups based on a provided lat/lon.
You can also filter results to only include stations with bikes or with available docks.

`/stations/all`
---------------

Returns all stations and their statuses as a GeoJSON document.

`/stations/nearby`
------------------

Returns stations near a specified lat/lon pair as a GeoJSON document.

| Query Arg | Description     |
|----------:|-----------------|
| `lat`     | *required* The latitude to search from.
| `lon`     | *required* The longitude to search from.
| `prefer`  | When not present, all stations are returned. When `bikes`, only stations with available bikes are returned. When `docks`, only stations with available docks are returned.
| `max_stations` | The maximum number of stations to return. Default is 5.