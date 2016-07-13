/**
 The MIT License (MIT)

 Copyright (c) 2015 FPT Software

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

module.exports = function(RED) {
	"use strict";
	var fs = require('fs');
	var q = require('q');
	var Device = require('azure-iot-device');
	var Client = Device.Client;
	var Message = Device.Message;
	var Http = Device.Http;

	/**
	 * Create Azure-IoT-Hub HTTP Input (cloud-to-device) node
	 */
	function azureIoTHubHttpNodeIn(n) {
		RED.nodes.createNode(this, n);
		this.deviceId = n.deviceId;
		var node = this;

		node.on("input", function(message) {
			node.deviceId = message.deviceId || node.deviceId;
			if (node.deviceId) {
				var contextGlobal = RED.settings.get('functionGlobalContext');
				console.log("FILE", contextGlobal.safeStorage + '/' + node.deviceId + "/device.json");
				fs.readFile(contextGlobal.safeStorage + '/' + node.deviceId + "/device.json", 'utf8', function(err, data) {
					if (err) {
						node.status({
							fill : "red",
							shape : "dot",
							text : "Read configuration file error."
						});
					} else {
						if (data && data != "") {
							node.status({
								fill : "blue",
								shape : "dot",
								text : "httpin.status.receiving"
							});
							data = JSON.parse(data);
							var connectionString = 'HostName=' + data.HostName + ';DeviceId=' + data.DeviceId + ';SharedAccessKey=' + data.PrimaryKey + '';
							console.log("< RECV-FROM", node.deviceId, connectionString);
							node.device = new Client.fromConnectionString(connectionString);
							if (node.device) {
								node.device.receive(function(err, msg, res) {
									console.log("RECV-DEBUG", err, msg.getData());
									if (!err) {
										if (msg.getData().length) {
											node.send({
												error : err,
												payload : JSON.parse(msg.getData())
											});
											node.device.complete(msg, function(error) {
												if (error) {
													node.status({
														fill : "red",
														shape : "dot",
														text : "Notifying completed fail."
													});
													node.device = null;
												} else {
													node.status({});
												}
											});
										} else {
											node.status({});
										}
									} else {
										node.status({
											fill : "red",
											shape : "dot",
											text : err.Error
										});
										console.log(err);
										node.device = null;
									}
								});
							} else {
								console.log("ERROR", "Device is not created.");
							}
						} else {
							node.status({
								fill : "red",
								shape : "dot",
								text : "Configuration file is empty"
							});
						}
					}
				});
			} else {
				node.status({
					fill : "red",
					shape : "dot",
					text : "DeviceID is not set in the configuration settings."
				});
			}
		});
	}


	RED.nodes.registerType("azure-https in", azureIoTHubHttpNodeIn);

	/**
	 * Create Azure-IoT-Hub HTTP Output (device-to-cloud) node
	 */
	function azureIoTHubHttpNodeOut(n) {
		RED.nodes.createNode(this, n);
		this.deviceId = n.deviceId;
		var node = this;

		node.on("input", function(msg) {
			node.deviceId = msg.deviceId || node.deviceId;
			if (node.deviceId) {
				var contextGlobal = RED.settings.get('functionGlobalContext');
				console.log("FILE", contextGlobal.safeStorage + '/' + node.deviceId + "/device.json");
				fs.readFile(contextGlobal.safeStorage + '/' + node.deviceId + "/device.json", 'utf8', function(err, data) {
					if (err) {
						node.status({
							fill : "red",
							shape : "dot",
							text : "Read configuration file error."
						});
					} else {
						if (data && data != "") {
							node.status({
								fill : "blue",
								shape : "dot",
								text : "httpin.status.requesting"
							});
							data = JSON.parse(data);
							var connectionString = 'HostName=' + data.HostName + ';DeviceId=' + data.DeviceId + ';SharedAccessKeyName=' + data.SharedAccessKeyName + ';SharedAccessKey=' + data.PrimaryKey + '';
							console.log("> SEND-TO", node.deviceId, connectionString);
							node.device = new Client.fromConnectionString(connectionString);
							if (!Buffer.isBuffer(msg.payload)) {
								if ( typeof msg.payload === "object") {
									msg.payload = JSON.stringify(msg.payload);
								} else if ( typeof msg.payload !== "string") {
									msg.payload = "" + msg.payload;
								}
							}
							var message = new Message(msg.payload);
							node.device.sendEvent(message, function(err, res) {
								node.send({
									error : err
								});
								node.status({});
							});
						} else {
							node.status({
								fill : "red",
								shape : "dot",
								text : "Configuration file is empty"
							});
						}
					}
				});
			} else {
				node.status({
					fill : "red",
					shape : "dot",
					text : "DeviceID is not set in the configuration settings."
				});
			}
		});
	}


	RED.nodes.registerType("azure-https out", azureIoTHubHttpNodeOut);

};
