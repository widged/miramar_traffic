var ConfigUtil = require('./ConfigUtil');

var parseConfig = ConfigUtil.parseConfig({
	maximum_lines_per_file: 1000,
	forceType: {},
	ignore: []
});

var Class = function ColumnsManager() {

	if(!this instanceof ColumnsManager) { return new ColumnsManager(); }

	var instance = this;
	var names    = [];
	var columns  = [];
	var config;


	function splitItems(data) { return data.split(","); }

	instance.split = splitItems;

	config = parseConfig(config);

	instance.config = function(_) {
		if(!arguments.length) { return config; }
		config = _;
		config = parseConfig(config);
		return instance;
	};


	instance.name = function(i) {
		return names[i];
	};

	instance.extractHeaders = function(data) {
		names = splitItems(data);
		names.forEach(function(item, i) {
			var col = columns[i] = {name: item, index: i};
			if(config.ignore.indexOf(item) !== -1) { col.status = "[ignore data]"; }
		});
	};

	instance.toObject = function(line) {
		var obj = {};
		splitItems(line).forEach(function(item, i) {
			var col = columns[i];
			if(config.ignore.indexOf(col.name) !== -1) { return; }
			var type = col.type;
			var data = item;
			if(type === "int") {
				data = parseInt(item, 10);
				if(isNaN(data)) {  data = "NA-" + item; }
			} else if(type === "float") {
				data = parseFloat(item) ;
				if(isNaN(data)) {  data = "NA-" + item; }
			}
			obj[names[i]] = data;
		});
		return obj;
	};


	instance.guessType = function(data) {
		splitItems(data).forEach(function(item, i) {
			if((col = columns[i])) {
				type = "string";
				var forceType = config.forceType;
				if(forceType && forceType.hasOwnProperty(col.name)) {
					type = forceType[col.name];
				} else if(item === parseInt(item, 10).toString()) {
					type = "int";
				} else if(item === parseFloat(item).toString()) {
					type = "float";
				} else if(item.match(/^(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/)) {
					type = "date";
				}
				col.type = type;
			}
		});
	};

	instance.push = function(line) {
		var obj = instance.toObject(line);
		Object.keys(obj).forEach(function(key) {
			var item = obj[key];
			var idx = names.indexOf(key);
			var col = columns[idx];
			if(!col.uniques) { col.uniques = []; }
			var uniqueList = col.uniques;
			if(uniqueList.indexOf(item) === -1) { uniqueList.push(item); }
		});
		return obj;
	};

	instance.sorted = function() {
		Object.keys(columns).forEach(function(key) {
			var type = columns[key].type;
			var fn = ("int,float".split(",").indexOf(type) !== -1) ? sortNumber : null;
			(columns[key].uniques || []).sort(fn);
		});

		return columns;
	};


	return instance;
};

function sortNumber(a,b) {
    return a - b;
}

module.exports = Class;

