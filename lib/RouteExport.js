var fs  = require("fs");

var Class = function RouteExport() {
	
	if(!this instanceof RouteExport) { return new RouteExport(); }

	var instance = this;

	var writeStreams = [];


	instance.push = function(obj, line) {
		var stream = guaranteeStream("r_" + obj.start_id + "-" + obj.end_id);
		stream.write(line + "\n");
	};

	instance.end = function() {
		writeStreams.forEach(function(stream) { stream.emit("end"); });
	};

	function guaranteeStream(streamId) {
		if(!writeStreams.hasOwnProperty(streamId)) {
			writeStreams[streamId] = fs.createWriteStream("data/route/" + streamId + ".csv");
		}
		return writeStreams[streamId];
	}
};

module.exports = Class;