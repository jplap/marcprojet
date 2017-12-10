 

var async = require('async');


exports.pubsub_panel = function(req, res) {

    console.log( "video add panel get"  );
    var athleteId = req.params.athleteid;
    var appliName = req.params.appliname;
    var name = req.params.name;
    var key = athleteId + ":" + appliName + ":" + name;

    var userIdentity = req.session.first_name + ' ' + req.session.family_name;

    var key = athleteId + ":" + appliName;


    console.log( "pubsub publish appliName:" +appliName + " athleteId:" + athleteId +" key:" + key  + " userIdentity: " );


    res.render('pubsub_panel', { title: userIdentity, athleteId: athleteId.toString(), appliName: appliName.toString() , title1:"Chat", key:key.toString() });



};
 


exports.pubsub_publish = function(req, res) {
	


    var appliname = req.params.appliname;
    var athleteid = req.params.athleteid;
    var name = req.params.name;
    var key = athleteid + ":" + appliname + ":" + name;

    var message = req.params.message;
    console.log( "pubsub publish appliname:" +appliname + " athleteid:" + athleteid +" key:" + key + " message:" + message );

	var clientRedis = req.app.get('clientRedis');

  	clientRedis.publish( key, message, function( err, reply ) {
	  console.log( "pubsub response" + reply );
	  if ( err ){
			res.status(500).send(err);
	  }else{
		  	var reply = { "message": "message published", "code" : 0}
			res.json(reply);
	  }
	});
	 
	  
};

exports.pubsub_subscribe = function(req, res) {
	
	 
 
	var appliname = req.params.appliname;
	var athleteid = req.params.athleteid;
    var name = req.params.name;
    var key = athleteid + ":" + appliname + ":" + name;
    console.log( "pubsub subscribe athleteid:" + athleteid + " appliname:" + appliname + " key:" + key );
   
	var clientRedis = req.app.get('clientRedis');


    clientRedis.on( key, function(channel, message) {
        console.log("Message '" + message + "' on channel '" + channel + "' arrived!");
        if ( err ){
            res.status(500).send(err);
        }else{

            res.json(message);
        }
    });

    clientRedis.subscribe(key);


	  
};

