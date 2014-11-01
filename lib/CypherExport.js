var fs  = require("fs");
var ConfigUtil = require('./ConfigUtil');

var parseConfig = ConfigUtil.parseConfig({
	maximum_lines_per_file: 1000
});

var Class = function CypherExport() {

	if(!this instanceof CypherExport) { return new CypherExport(); }

	var instance = this;

	var cypherWrite;
	var exportId     = 0;
	var fileId       = 0;
	var writeStreams = [];
	var config       = {};

	config = parseConfig(config);

	instance.config = function(_) {
		if(!arguments.length) { return config; }
		config = _;
		config = parseConfig(config);
		return instance;
	};

	instance.initialize = function(asyncReturn) {
		var stream = guaranteeStream(exportId);
		stream.write("START a = node(*) OPTIONAL MATCH (a)-[r]-() DELETE a, r" + "\n");
		asyncReturn();
	};

	instance.push = function(obj, line) {
		exportId++;
		if(exportId % config.maximum_lines_per_file === 0) { fileId++; }
		var stream = guaranteeStream(fileId);
		var tpl = 'MERGE (a#{count}:interesection {id: "#{start_id}"}) MERGE (b#{count}:intersection   {id: "#{end_id}"}) WITH a#{count}, b#{count} CREATE (a#{count})-[:connectsTo {#{json}}]->(b#{count})';
		var kv = Object.keys(obj).map(function(key) { return key + ":" + JSON.stringify(obj[key]); });
		obj.json = kv;
		obj.count = exportId;
		var cypher = template(tpl, obj);
		stream.write(cypher + "\n");
	};

	instance.end = function() {
		writeStreams.forEach(function(stream) { stream.emit("end"); });
	};


	function guaranteeStream(streamId) {
		if(!writeStreams.hasOwnProperty(streamId)) {
			writeStreams[streamId] = fs.createWriteStream("data/cypher/f_" + streamId + ".txt");
		}
		return writeStreams[streamId];
	}

	return instance;
};

module.exports = Class;


function template(tpl, data) {
	var str = tpl.toString();
	(Object.keys(data) || []).forEach(function(key) {
		str = str.replace(RegExp('#{' + key + '}', "gi"), data[key]);
	});
	return str;
}
