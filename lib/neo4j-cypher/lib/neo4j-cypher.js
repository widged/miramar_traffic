/*
 * NEO4J RESTFUL API
 *
 * Copyright (c) 2013 Marielle Lange
 */

var FN = {};

var request = require('request');

Class = function CypherGraph() {

	if(!(this instanceof CypherGraph)) { return new CypherGraph(); }

	var instance = this,
		state = {server: 'http://localhost:7474', endpoint: '/db/data'};

    instance.server = function(_) {
		if (!arguments.length) { return state.server; }
		state.server = _;
		return instance;
    };

    instance.endpoint = function(server) {
		if (!arguments.length) { return state.endpoint; }
		state.endpoint = _;
		return instance;
    };


	instance.postCypher = function(query, asyncReturn) {
		var operation = cypherOperation('POST', query);
		connectGraph(state.server, state.endpoint, operation, asyncReturn);
	};



	function cypherOperation(method, query, params) {
		return {
			method: method,
			to: 'cypher',
			body: {
				query: query,
				params: params || null
			}
		};
	}

	/**
	 * Function to call an HTTP request to the rest service.
	 * 
	 * Requires an operation object of form:
	 *   { method: 'PUT'|'POST'|'GET'|'DELETE'
	 *   , to    : 'cypher',
	 *   , body  : {query: '[query]', params: null }
	 *
	 * Adapted from Seraph https://github.com/brikteknologier/seraph/blob/master/lib/seraph.js, function Seraph.prototype.call
	 */
	function connectGraph(server, endpoint, operation, asyncReturn) {
		// Ensure callback is callable. Throw instead of calling back if none.
		if (typeof asyncReturn !== 'function') {
			asyncReturn = function(err) {
				if (err) throw err;
			};
		}

		var requestOpts = {
			uri: server + endpoint + '/' + operation.to,
			method: operation.method,
			headers: { 'Accept': 'application/json' }
		};

		if (operation.body) requestOpts.json = operation.body;

		request(requestOpts, function(err, response, body) {
			if (err) {
				asyncReturn(err);
			} else if (response.statusCode < 200 || response.statusCode >= 300) {
				if (typeof body == 'string') {
					try {
						body = JSON.parse(body);
					} catch (_) {}
				}
				// Pass on neo4j error
				var error;
				if (typeof body == "object" && body.exception) {
					error = new Error(body.message);
					error.neo4jError = body;
					error.neo4jException = body.exception;
					error.neo4jStacktrace = body.stacktrace;
					if (body.cause) error.neo4jCause = body.cause;
				} else {
					// Can't understand this as a neo4j error
					error = new Error(body || response.statusCode);
				}
				error.statusCode = response.statusCode;
				asyncReturn(error);
			} else {
				if (body === '') body = null;
				else if (typeof body === 'string') {
				try {
					body = JSON.parse(body);
				} catch (e) {
					return asyncReturn(e);
				}
				}
				asyncReturn(null, body, response.headers.location);
			}
		});
	

	}

	return instance;

};

module.exports = Class.cypherGraph = Class.CypherGraph = Class;