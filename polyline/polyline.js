/**
 * Steps:
 * 1. https://maps.googleapis.com/maps/api/directions/json?origin=%2298%20Ho%C3%A0ng%20Qu%E1%BB%91c%20Vi%E1%BB%87t,%20Ngh%C4%A9a%20%C4%90%C3%B4,%20C%E1%BA%A7u%20Gi%E1%BA%A5y,%20H%C3%A0%20N%E1%BB%99i,%20Vietnam%22&destination=%22D%E1%BB%8Bch%20V%E1%BB%8Dng%20H%E1%BA%ADu,%20C%E1%BA%A7u%20Gi%E1%BA%A5y,%20H%C3%A0%20N%E1%BB%99i,%20Vietnam%22
 * 2. Copy: routes->overview_polyline->points string
 * 3. 
 */

var polyline = require('polyline');

// returns an array of lat, lon pairs
var pl = 'acj_C{zwdSz@cCBc@AO]g@m@[c@a@OWIYo@aCOw@a@gGg@_Gc@cEq@}F[wCQ_C}EeAuA]uEaAq@EW@eCq@qDaAaBYsA_@wEy@eAWwB]yHcBgJmBmDu@QYQo@BaHIOCA?g@{EVo@FIi@MiB?u@HqCh@kGLaA';
//var pl = "grm_CagvdS@~KEbGDtF?bEdBElMBjJMjAItC?pA?hC@vB@pAFdFt@fBTb@TRXIzDGdFQ|GIxECzEA`BX?lE@hC?lB?SgAOc@m@cB";
var e = polyline.decode(pl);
console.log(e);
var mind = 0;
for (var i = 1, len = e.length; i < len; i++) {
	var dis = pDistance(21.0433, 105.82196, e[i-1][0],e[i-1][1],e[i][0],e[i][1]);
	console.log(distance(21.0433, 105.82196,dis[0], dis[1],"K")*1000);
	//console.log(i + ": " + dis);
  //console.log("{ latitude:" + e[i][0] + ", longitude:"+e[i][1] + "},");
};

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


function pDistance(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return [xx, yy, Math.sqrt(dx * dx + dy * dy)];
};

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit=="K") { dist = dist * 1.609344; };
	if (unit=="N") { dist = dist * 0.8684; };
	return dist;
};