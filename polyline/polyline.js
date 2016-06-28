var polyline = require('polyline');

// returns an array of lat, lon pairs
var e = polyline.decode('acj_C{zwdSz@cCBc@AO]g@m@[c@a@OWIYo@aCOw@a@gGg@_Gc@cEq@}F[wCQ_C}EeAuA]uEaAq@EW@eCq@qDaAaBYsA_@wEy@eAWwB]yHcBgJmBmDu@QYQo@BaHIOCA?g@{EVo@FIi@MiB?u@HqCh@kGLaA');
console.log(e);

// returns a string-encoded polyline
var p = polyline.encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
console.log(p);

// returns a string-encoded polyline from a GeoJSON LineString
polyline.fromGeoJSON({ "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]
  },
  "properties": {}
});