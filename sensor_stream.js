#!/usr/bin/env node

// ########################
//  Dependencies
// ########################

var fs         = require("fs");
var es         = require("event-stream");
var map        = require('map-stream');
var through    = require('through');

var ColumnsManager  = require("./lib/ColumnsManager");
var RouteExport     = require("./lib/RouteExport");
var CypherExport    = require("./lib/CypherExport");

var MAXIMUM_LINES_SAVED = -1;

var columns    = new ColumnsManager();
columns.config({
	forceType: {
		start_id : "string",
		end_id : "string",
		journey_speed: "int",
		journey_time: "int"
	},
	ignore: "date_time,date_time_text".split(",")
});

var cypher     = new CypherExport();
cypher.config({
	maximum_lines_per_file: 10000
});

var routes     = new RouteExport();


var pastFirstLine = false;
var pastSecondLine = false;

var lineCount = 0;

cypher.initialize(main);

function main() {
	fs.createReadStream("data/wellington_sensor_data_October_2014.csv")
		// Split Strings
		.pipe(es.split("\n"))
		// Parse CSV as Object
		.pipe(map(processLine))
		.on("end", function() {
			console.log('end');
			routes.end();
			cypher.end();

			var columnsWrite = fs.createWriteStream("data/columns.txt");
			columnsWrite.write(JSON.stringify(columns.sorted(), null, 2));
		});
}


function processLine(line, asyncReturn) {
	line = line.replace(/\r/, '');

	if(!pastFirstLine)  {
		pastFirstLine =  true;
		columns.extractHeaders(line);
		return asyncReturn();
	}
	if(!pastSecondLine) {
		pastSecondLine = true;
		columns.guessType(line);
		console.log("sorted", columns.sorted());
	}

	lineCount++;
	if(lineCount % 10000 === 0) { console.log(lineCount); }
	if(MAXIMUM_LINES_SAVED > 0 && lineCount > MAXIMUM_LINES_SAVED) { return asyncReturn(); }

	var obj = columns.push(line);
	routes.push(obj, line);
	cypher.push(obj, line);

	asyncReturn(null, line);
}

