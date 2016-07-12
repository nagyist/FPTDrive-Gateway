// var file = '/dev/cu.usbserial';
// var file = '/dev/ttyUSB0';//on Rasberry PI
var file = '/dev/tty.usbserial';//on MacOS
//var file = '/dev/tty.usbmodem1411';

var SerialPort = require('serialport');
var port = new SerialPort.SerialPort(file, {
	baudrate : 4800,
	parser : SerialPort.parsers.readline('\r\n')
});

console.log(JSON.stringify(port));

var GPS = require('./node_modules/gps/gps.js');
var gps = new GPS;

// Port where we'll run the websocket server
var webSocketsServerPort = 8001;
var ws = require("nodejs-websocket");
var clients = [ ];



function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	console.log(lat1, lon1, lat2, lon2, unit,dist);
	if (unit=="K") { dist = dist * 1.609344; }
	if (unit=="N") { dist = dist * 0.8684; }
	return dist;
}

var laststate = null;
var dis = -1;

gps.on('data', function() {
	//io.emit('state', gps.state);
	var json = JSON.stringify(gps.state);
	if (gps.state.lat !== null) {
		if (laststate !== null) {
			dis = distance(laststate.lat, laststate.lon, gps.state.lat, gps.state.lon, "K");
		}
		laststate = {lat:gps.state.lat,lon : gps.state.lon};
		console.log(gps.state.lat + " - " + gps.state.speed + " - " + dis);
	} else {
		console.log(new Date() + ": Location unavailable");
	}
	
	try {
		for (var i=0; i < clients.length; i++)
			if (clients[i]) {
                    clients[i].sendText(json);
			}
	} catch (err) {
		console.log(err);
	}
});

port.on('data', function(data) {
	//console.log("port on data");
	gps.update(data);
});

var server = ws.createServer(function(conn) {
	console.log("New connection");
	var index = clients.push(conn) - 1;
	
	conn.on("text", function(str) {
		console.log("GPS Text Received " + str);
		//conn.sendText(str.toUpperCase()+"!!!");
	});
	conn.on("close", function(code, reason) {
		clients.splice(index, 1);
		console.log("GPS Connection closed");
		conn = null;
		
	});
}).listen(webSocketsServerPort);

