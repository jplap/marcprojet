 
 /**
 
 
 
 
 TO BE DELETED
 
 
 
 
 
 
 */
var _partial = require "lodash/partial"
//cfg = require "./config.json"
//RESTPREFIX = cfg.rest_path_prefix

redisns 

//RedisTagging = require "redis-tagging"
//bodyParser = require "body-parser"
//morgan = require "morgan"
//rt = new RedisTagging(cfg.redis)

var rt = require('redisTagging');
 

var  RESTPREFIX = rt.redisns;
 
 
_respond = (res, err, resp) ->
	res.header('Content-Type', "application/json")
	res.removeHeader("X-Powered-By")
	if err
		res.status(500).send(err)
		return
	res.send(resp)
	return

# create an item with tags
app.put '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	tags = JSON.parse(req.query.tags or "[]")
	rt.set {bucket: req.params.bucket, id: req.params.id, score: req.query.score, tags: tags}, _partial(_respond, res)
	return

# delete an id
app.delete '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	rt.remove req.params, _partial(_respond, res)
	return

# get all tags of an id
app.get '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	rt.get req.params, _partial(_respond, res)
	return

# get all ids of a bucket
app.get '/' + RESTPREFIX + '/allids/:bucket', (req, res) ->
	rt.allids req.params, _partial(_respond, res)
	return

# tags: the main query. query items for some tags
app.get '/' + RESTPREFIX + '/tags/:bucket', (req, res) ->
	req.query.bucket = req.params.bucket
	req.query.tags = JSON.parse(req.query.tags or "[]")
	rt.tags req.query, _partial(_respond, res)
	return

# top tags
app.get '/' + RESTPREFIX + '/toptags/:bucket/:amount', (req, res) ->
	rt.toptags req.params, _partial(_respond, res)
	return

# buckets
app.get '/' + RESTPREFIX + '/buckets', (req, res) ->
	rt.buckets _partial(_respond, res)
	return

# removebucket
app.delete '/' + RESTPREFIX + '/bucket/:bucket', (req, res) ->
	rt.removebucket req.params, _partial(_respond, res)
	return

module.exports = app