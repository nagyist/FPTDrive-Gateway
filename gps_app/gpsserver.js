// var file = '/dev/cu.usbserial';
// var file = '/dev/ttyUSB0';//on Rasberry PI
var file = '/dev/tty.usbserial';//on MacOS
//var file = '/dev/tty.usbmodem1411';

var SerialPort = require('serialport');
var port = new SerialPort.SerialPort(file, {
	baudrate : 4800,
	parser : SerialPort.parsers.readline('\r\n')
});

var GPS = require('./node_modules/gps/gps.js');
var gps = new GPS;

// Port where we'll run the websocket server
var webSocketsServerPort = 8001;
var ws = require("nodejs-websocket");
var clients = [ ];


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

	gps.on('data', function() {
		//io.emit('state', gps.state);
		var json = JSON.stringify(gps.state);
		//console.log(json);
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

}).listen(webSocketsServerPort);

