FPTDive Javascript library
====================


Install
-------

Run the following command in the root directory of your Node-RED install

    npm install nodes/fptdrive-nodes/fptdrive/


Usage
-----
-Add to fptdrive-settings.js:
	functionGlobalContext : {
		...
		fptdrive:require("fptdrive"),
		...
	}
	
-In function nodes:
	var fpt = context.global.fptdrive;
	var distance = fpt.pDistance(1,2,3,4,5,6);
