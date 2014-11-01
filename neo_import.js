#!/usr/bin/env node

var fs         = require("fs");
var es         = require("event-stream");
var map        = require('map-stream');
var vinyl      = require('vinyl-fs');

var NeoRestful = require('lib/neo4j-cypher');

var neo = NeoRestful().server("http://localhost:7474");
function neoLogError(err,res) {
	if(err) { console.log('[ERROR]', err); }
}

var exportId = 0;
var files = [];

vinyl.src('./data/cypher/*.txt', { buffer: false })
	.pipe(map(pushFile))
	.on('end', function() {
		nextFile();
	});

function pushFile(file, asyncReturn) {
	files.push(file.path);
	return asyncReturn();
}

function nextFile() {
	var file = files.shift();
	if(file === undefined) { return; }
	processFile(file, function() {
		nextFile();
	});
}


function processFile(file, asyncReturn) {
	var list = [];
	var input =	fs	.createReadStream(file)
					.pipe(es.split("\n"))
					// Parse CSV as Object
					.pipe(map(processLine))
					.on('end', function() {
						processList(list);
						console.log('[COMPLETE]', file);
					});

	function processList(list) {
		next();
		function next() {
			var line = list.shift();
			if(line === undefined) { return asyncReturn(); }
			neo.postCypher(line, function(err, res) {
				next();
			});
		}
	}

	function processLine(line, asyncReturn) {
		list.push(line);
		asyncReturn(null, line);
	}

}
