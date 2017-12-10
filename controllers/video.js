 
var _partial = require ("lodash/partial");
//var _partial = require "lodash"
var async = require('async');
//var rt = require('redisTagging');

var tags = ['match', 'training', 'simple', 'double', 'mixte'];


var _respond = function (res, err, resp){
	res.header('Content-Type', "application/json");
	res.removeHeader("X-Powered-By");
	if ( err ){
		res.status(500).send(err)
		return
	}
	res.send(resp);
	return;
}

 


exports.list = function(req, res) {
	
	console.log( "video list"  );
    var athleteId = req.params.athleteid;

    var name = req.session.first_name + ' ' + req.session.family_name;


    console.log("controller add panel render athleteId:" + athleteId);


    res.render('video_list', { title: name, athleteId: athleteId.toString() , title1:"Video List", allowedTags:JSON.stringify( tags ) });



};
exports.addPanel = function(req, res) {
	
	console.log( "video add panel get"  );
	var athleteId = req.params.athleteid;
	  
	var name = req.session.first_name + ' ' + req.session.family_name; 
 

	console.log("controller add panel render athleteId:" + athleteId);
	
	
	res.render('video_add', { title: name, athleteId: athleteId.toString() , title1:"Add a Video", allowedTags:JSON.stringify( tags ) });

	 
	  
};
exports.queryPanel = function(req, res) {
	
	console.log( "video query panel get"  );
	var athleteId = req.params.athleteid;
	  
	var name = req.session.first_name + ' ' + req.session.family_name; 
 

	console.log("controller query panel render athleteId:" + athleteId);
	res.render('video_query', { title: name, athleteId: athleteId.toString() , title1:"Query a Video", allowedTags:JSON.stringify( tags ) });

	 
	  
};

// create an item with tags
/*
app.put '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	tags = JSON.parse(req.query.tags or "[]")
	rt.set {bucket: req.params.bucket, id: req.params.id, score: req.query.score, tags: tags}, _partial(_respond, res)
	return
*/
	
exports.createItemWithTags = function(req, res) {
	
	console.log( "video createItemWithTags"  );
	
	var rt = req.app.get('redisTagging');	
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	
	var tags = JSON.parse(req.query.tags)
	rt.set ({bucket: req.params.bucket, id: req.params.id, score: req.query.score, tags: tags},function ( err, reply ){ 
		console.log( "video add post return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			res.json(200)
		}
	})
	return
	
};


// delete an id
/*

app.delete '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	rt.remove req.params, _partial(_respond, res)
	return
*/
exports.deleteId = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	
	rt.remove (req.params ,function ( err, reply ){ 
		console.log( "video delete  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			res.json(200)
		}
	})
	return	
	
	
}

// get all tags of an id
/*
app.get '/' + RESTPREFIX + '/id/:bucket/:id', (req, res) ->
	rt.get req.params, _partial(_respond, res)
	return

*/	
	
exports.getAllTagsFromId = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	
	rt.get (req.params ,function ( err, reply ){ 
		console.log( "video get all tags  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
            res.status(200).send(JSON.stringify(reply));
		}
	})
	return	
	
	
}
	
// get all ids of a bucket
/*
app.get '/' + RESTPREFIX + '/allids/:bucket', (req, res) ->
	rt.allids req.params, _partial(_respond, res)
	return
*/

exports.getAllIdsFromBucket = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	
	rt.allids (req.params ,function ( err, reply ){ 
		console.log( "video get all ids  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
            res.status(200).send(JSON.stringify(reply));
		}
	})
	return	
	
	
}





// tags: the main query. query items for some tags
/*
app.get '/' + RESTPREFIX + '/tags/:bucket', (req, res) ->
	req.query.bucket = req.params.bucket
	req.query.tags = JSON.parse(req.query.tags or "[]")
	rt.tags req.query, _partial(_respond, res)
	return
*/
exports.getTags = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	
	//var req.query.tags = JSON.parse(req.query.tags);
	//var req.query.bucket = req.params.bucket;
	//rt.tags (req.query ,function ( err, reply ){ 
	var options = {};
	options.tags = JSON.parse(req.query.tags);
	options.bucket = req.params.bucket;
	options.type = req.query.type;
	rt.tags (options ,function ( err, reply ){ 
		console.log( "video get tags  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			//res.json(200)
			res.status(200).send(JSON.stringify(reply));
		}
	})
	return	
	
	
}



// top tags
/*
app.get '/' + RESTPREFIX + '/toptags/:bucket/:amount', (req, res) ->
	rt.toptags req.params, _partial(_respond, res)
	return
*/
exports.getTopTags = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	 
	rt.toptags (req.params ,function ( err, reply ){ 
		console.log( "video get top tags  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			res.json(200)
		}
	})
	return	
	
	
}




// buckets
/*
app.get '/' + RESTPREFIX + '/buckets', (req, res) ->
	rt.buckets _partial(_respond, res)
	return
*/
exports.getBuckets = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	 
	rt.buckets (function ( err, reply ){ 
		console.log( "video get buckets  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			res.json(200)
		}
	})
	return	
	
	
}



// removebucket
/*
app.delete '/' + RESTPREFIX + '/bucket/:bucket', (req, res) ->
	rt.removebucket req.params, _partial(_respond, res)
	return
*/
exports.deleteBucket = function(req, res) {
	
	var rt = req.app.get('redisTagging');
	var athleteId = req.params.athleteid;
	var name = req.session.first_name + ' ' + req.session.family_name; 
	 
	rt.removebucket ( req.params, function ( err, reply ){ 
		console.log( "video delete bucket  return:" + reply + " err:" + err  );
		if ( err ){
			res.status(500).send(err);
		}else{
			res.json(200)
		}
	})
	return	
	
	
}
