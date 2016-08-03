var LatLon = require('geodesy').LatLonSpherical;

exports.MovableObject = function() {

	this.velocity = 0;
	
	// ++ Helpers
	function calculateV1(v0, a, t) {
		return v0 + a * t;
	}

	function calculateS(v0, a, t) {
		return v0 * t + a * t * t / 2;
	}
	// -- Helpers

	this.setPosition = function(longitude, latitude) {
		this.position = {
			longitude: longitude,
			latitude: latitude
		}
	}

	this.getPosition = function() {
		return this.position;
	}

	this.setAcceleration = function(acceleration) {
		this.acceleration = acceleration;
		if (this.acceleration == null)
			this.acceleration = 0;
	}

	this.getAcceleration = function() {
		return this.acceleration;
	}

	this.setVelocity = function(velocity) {
		this.velocity = velocity;
		if (this.velocity == null)
			this.velocity = 0;
	}

	this.getVelocity = function() {
		return this.velocity;
	}

	this.setBearing = function(bearing) {
		this.bearing = bearing;
	}

	this.getBearing = function() {
		return this.bearing;
	}

	this.move = function(duration) {
		// Only calculate new velocity if having acceleration
		var lastVelocity = this.velocity;
		if (lastVelocity <= 0 && this.acceleration && this.acceleration < 0) {
			this.acceleration = 0;
			this.velocity = 0.5; // m/s - chuyen dong deu

		} else if (this.acceleration && this.acceleration != 0) {
			this.velocity = calculateV1(lastVelocity, this.acceleration, duration);
		}
		
		// Distance compare with last position
		var distance = 0;
		if (this.acceleration && this.acceleration != 0) {
			distance = calculateS(lastVelocity, this.acceleration, duration);
		} else {
			distance = this.velocity * duration;
		}

		// Based on that distance and bearing
		// to determine new position
		var lastPosition = new LatLon(this.position.latitude, this.position.longitude);
		var newPosition = lastPosition;
		if (distance > 0) {
			newPosition = lastPosition.destinationPoint(distance, this.bearing);
		}
		this.position = {
			longitude: newPosition.lon,
			latitude: newPosition.lat
		}
	}

	this.distanceTo = function(longitude, latitude) {
		var currentPosition = new LatLon(this.position.latitude, this.position.longitude);
		return currentPosition.distanceTo(new LatLon(latitude, longitude));
	}

	this.toString =function() {
		var result = 'Position = { lon: ' + this.position.longitude + ', lat: ' + this.position.latitude + ' }';
		result += ', Acceleration = ' + this.acceleration * 3.6 + ' (km/h)';
		result += ', Velocity = ' + this.velocity * 3.6 + ' (km/h)';
		return result;
	}
}

