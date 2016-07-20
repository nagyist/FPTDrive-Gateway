//var exports = module.exports = {};

exports.pDistance = function(x, y, x1, y1, x2, y2) {

	var A = x - x1;
	var B = y - y1;
	var C = x2 - x1;
	var D = y2 - y1;

	var dot = A * C + B * D;
	var len_sq = C * C + D * D;
	var param = -1;
	if (len_sq !== 0)//in case of 0 length line
		param = dot / len_sq;

	var xx,
	    yy;

	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}

	var dx = x - xx;
	var dy = y - yy;
	return [xx, yy, Math.sqrt(dx * dx + dy * dy)];
};

exports.geo_distance = function(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1 / 180;
	var radlat2 = Math.PI * lat2 / 180;
	var theta = lon1 - lon2;
	var radtheta = Math.PI * theta / 180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180 / Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit == "K") {
		dist = dist * 1.609344;
	}
	if (unit == "N") {
		dist = dist * 0.8684;
	}
	return dist;
};

exports.polyline_decode = function(str, precision) {
	var index = 0,
	    lat = 0,
	    lng = 0,
	    coordinates = [],
	    shift = 0,
	    result = 0,
	    byte = null,
	    latitude_change,
	    longitude_change,
	    factor = Math.pow(10, precision || 5);

	// Coordinates have variable length when encoded, so just keep
	// track of whether we've hit the end of the string. In each
	// loop iteration, a single coordinate is decoded.
	while (index < str.length) {

		// Reset shift, result, and byte
		byte = null;
		shift = 0;
		result = 0;

		do {
			byte = str.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

		shift = result = 0;

		do {
			byte = str.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

		lat += latitude_change;
		lng += longitude_change;

		coordinates.push([lat / factor, lng / factor]);
	}

	return coordinates;
};

//return a [dx, dy] pair and a number of
//divider: in kilometer
exports.geo_divider = function(lat1, lon1, lat2, lon2, unit, divider) {
	var total = exports.geo_distance(lat1, lon1, lat2, lon2, unit);
	if (total <= divider) {
		return [1, lat2 - lat1, lon2 - lon1];
	}

	var count = total / divider - 1;
	return [count, (lat2 - lat1) / count, (lon2 - lon1) / count];
};

//detailize gmap route
exports.geo_detailize = function(str, precision, unit, divider) {
	var out = [];
	var coords = exports.polyline_decode(str, precision);
	var adivider;
	var xx,
	    yy;
	coords.forEach(function(elm, idx, arr) {
		if (idx < arr.length - 1) {
			adivider = exports.geo_divider(arr[idx][0], arr[idx][1], arr[idx+1][0], arr[idx+1][1], unit, divider);
			xx = arr[idx][0];
			yy = arr[idx][1];

			for ( i = 0; i < adivider[0]; i++) {
				out.push({
					latitude : xx,
					longitude : yy
				});
				xx += adivider[1];
				yy += adivider[2];
			}
		}

	});
	return out;
};

exports.distanceOnRoute = function(x1, y1, x2, y2, route) {
	var dis = -1;
	//passed loc
	var i = 0;
	while (true && i < route.length - 1) {
		if ((x1 - route[i][0]) * (x1 - route[i+1][0]) <= 0 && (y1 - route[i][1]) * (y1 - route[i+1][1]) <= 0)
			break;
		i++;
	}
	var j = route.length - 1;
	while (true && j > 0) {
		if ((x2 - route[j][0]) * (x2 - route[j-1][0]) <= 0 && (y2 - route[j][1]) * (y2 - route[j-1][1]) <= 0)
			break;
		j--;
	}
	console.log("Nearest index i: " + i);
	console.log("Nearest index j: " + j);
	if (i < j) {
		dis = 0;
		for (var k = i + 1; k < j; k++) {
			dis += exports.geo_distance(x1, y1, route[k][0], route[k][1], "K");
			x1 = route[k][0];
			y1 = route[k][1];
		}
		dis += exports.geo_distance(route[j-1][0], route[j-1][1], x2, y2, "K");
	} else {
		//
	}

	if (dis == -1) {
		dis = {
			error: "passed",
			distance: exports.geo_distance(x1, y1, x2, y2, "K")
		};
	}
	
	return dis;
};

