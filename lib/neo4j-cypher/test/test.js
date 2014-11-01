#!/usr/bin/env node

var NeoRestful = require('../lib/neo4j-cypher');
// var neo = NeoRestful().server("http://Gardening:CJprE8GMId4BwyjNmy3S@gardening.sb01.stations.graphenedb.com:24789");
// neo.postCypher('MATCH (m)-[r:tag|measure]-(n) RETURN DISTINCT r.trait, type(r)', function(err,res) { console.log('err', err); console.log('res', res); });

function whenResult(err,res) { console.log('err', err); console.log('res', res); }	
var neo = NeoRestful().server("http://localhost:7474");

neo.postCypher('START a = node(*) OPTIONAL MATCH (a)-[r]-() DELETE a, r', whenResult);
neo.postCypher('MERGE (a:plant {name: "anise"}) MERGE (b:kingdom   {name: "plantae"}) WITH a, b CREATE (a)-[:kingdom {d: "plantae", n: 1, trait: "/kingdom", source: "heirloom"}]->(b)', whenResult);
neo.postCypher('MERGE (a:plant {name: "anise"}) MERGE (b:measure   {name: "plants"}) WITH a, b CREATE (a)-[:kingdom {d: 30, n: 1, trait: "/propagate/space/plants", source: "heirloom"}]->(b)', whenResult);
/*
*/
neo.postCypher('MATCH (a)-[r]->(n) RETURN a.name, r.trait, n.name', whenResult);
