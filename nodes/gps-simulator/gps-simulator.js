var LatLon = require('geodesy').LatLonSpherical;
var mo = require('./movable-object.js');


// Usage: init this object and call .start(callback) function.
// 
// Parameters:
// 		route: 		required
// 		objectName: optional
// 		interval: 	optional
//
// route = [
//		{
//			from_location:  { longitude, latitude },
//			to_location: 	{ longitude, latitude },
//			acceleration,
//			stop_duration
//		}
// ]
//
// callback(position, beStopped, movableObject)
// 
// position:
// {
//   	longitude: 105.83762177972369,
//   	latitude: 21.030965222197796
// }
var DEBUG = false;

exports.GpsSimulator = function (route, objectName, interval, fastFoward) {

	// route must be provided
	if (route == null || route.length < 1) return;
	var _route = route;

	if (interval == null || interval < 1000) {
		logInfo('Set interval to minimum 1000 milliseconds');
		interval = 1000;
	}
	var _interval = interval;

	if (objectName == null || objectName.length == 0) {
		objectName = 'Object';
	}
	var _objectName = objectName;
	var _fastFoward = fastFoward;
	if (_fastFoward == null || _fastFoward < 1) {
		fastFoward = 1;
	}

	function logInfo(info) {
		if (DEBUG == true)
			console.log('[' + _objectName + '] ' + info);
	}

	// Calculate distances for each route
	for (var i = 0; i < _route.length; i++) {
		var item = _route[i];
		var p1 = new LatLon(item.from_location.latitude, item.from_location.longitude);
		var p2 = new LatLon(item.to_location.latitude, item.to_location.longitude);
		item.distance = p1.distanceTo(p2);
		item.bearing = p1.bearingTo(p2);
	}
	logInfo('Will move in route:');
	if (DEBUG == true) {
		console.log(_route);
	}

	logInfo('Will be sampling info after each ' + _interval / 1000 + ' second(s)');


	// ++ Logic
	var movableObject = null;
	var currentRouteIndex = null;
	var currentRoute = null;

	function beginRoute(callback) {
		// Determine new route index
		if (currentRouteIndex == null) {
			currentRouteIndex = 0;
		} else {
			currentRouteIndex += 1;
		}

		if (currentRouteIndex < _route.length) {
			logInfo('Begin route with index ' + currentRouteIndex);

			currentRoute = _route[currentRouteIndex];
			movableObject.setPosition(currentRoute.from_location.longitude, currentRoute.from_location.latitude);
			movableObject.setAcceleration(currentRoute.acceleration);
			movableObject.setBearing(currentRoute.bearing);
		}

		if (callback) callback(movableObject.position, false, movableObject, currentRouteIndex);

		return (currentRouteIndex < _route.length);
	}

	
	var _countDown = null;
	
	function moveObject(duration, callback) {
		logInfo('------------------------------------------');
		logInfo('Move after ' + duration + ' seconds');
		
		var beStopped = false;

		if (currentRoute.stop_duration) {
			if (_countDown > 0) {
				logInfo('Will continue route in ' + _countDown + ' seconds');
			}
			movableObject.setVelocity(0);
			
			if (_countDown == null) {
				_countDown = currentRoute.stop_duration;
				logInfo('Temporarily paused in ' + currentRoute.stop_duration + ' seconds');
			} else if (_countDown > 0) {
				_countDown -= duration;
			} else {
				_countDown = null;

				if (beginRoute() == false)
					beStopped = true;
			}

		} else {
			movableObject.move(duration);
			
			// Check if start new route item
			var distanceFromBeginRoute = movableObject.distanceTo(currentRoute.from_location.longitude, currentRoute.from_location.latitude);
			if (distanceFromBeginRoute >= currentRoute.distance) {
				if (beginRoute() == false)
					beStopped = true;
			}
		}

		if (beStopped) {
			stopObject(callback);
		} else {
			if (callback) callback(movableObject.position, false, movableObject, currentRouteIndex);
		}
	}
	// -- Logic


	var _intervalId = null;

	this.start = function(callback) {
		logInfo('Start moving');

		movableObject = new mo.MovableObject();

		currentRouteIndex = null;

		beginRoute(callback);

		_intervalId = setInterval(function() {

			moveObject(_interval / 1000, callback);

		}, _interval / fastFoward);
	}

	function stopObject(callback) {
		logInfo('Stop moving');
		if (_intervalId) {
			clearInterval(_intervalId);
		}

		if (callback) callback(movableObject.position, true, movableObject, currentRouteIndex);
	}
	
	this.stop = function(callback) {
		stopObject(callback);
	}

}
