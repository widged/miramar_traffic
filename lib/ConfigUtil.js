var Class = function ConfigUtil() {};

Class.parseConfig = function(defaults) {
	return function(settings) {
		var config = {};
		Object.keys(defaults).forEach(function(key) {
			config[key] = (settings && settings.hasOwnProperty(key)) ? settings[key] : defaults[key];
		});
		return config;
	};
};

module.exports = Class;

