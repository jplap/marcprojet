 
var AthleteObjectifInstance = require('../models/athlete_objectif_instance');
var AthleteSession = require('../models/athlete_session');
var AthleteObjectif = require('../models/athlete_objectif');

var async = require('async');

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var moment = require('moment');
var csv=require('csvtojson');
//var formidable = require('formidable');
//var multer  = require('multer')

var _this = this;
 
 
exports.session_list = function(req, res, next) {
	 
  console.log("controller session_list athleteid:" + req.params.athleteid);
  var athleteId = req.params.athleteid;
  var name = req.session.first_name + ' ' + req.session.family_name; 
  
  AthleteSession.find({ createdByAthlete: req.params.athleteid }, 'name createdByAthlete')
    .populate('createdByAthlete')
    .exec(function (err, session_list) {
      if (err) { 
	     console.log("controller session error detected:" + err);
	     return next(err); 
	  }
	  var name = req.session.first_name + ' ' + req.session.family_name; 
      //Successful, so render
	  console.log("controller session_list  render athleteId:" + athleteId);
	  if ( session_list ){
		console.log("controller session_list  render _id:" + session_list[0]._id);  
        res.render('athlete_training_session_list', { title: name, title1: 'Session List', athleteId: athleteId.toString() , session_list: session_list, sessionId: session_list[0]._id });
	  }
    });
	
	
	 
}; 
exports.session_detail = function(req, res, next) {
	 

	  var name = req.session.first_name + ' ' + req.session.family_name; 
	 
	 res.send('detail session not implemented');
	 
}; 





exports.session_add_objective_get = function(req, res, next) {
	 
	 var athleteId = req.params.athleteid;
	 var sessionId = req.params.sessionId;
	 var name = req.session.first_name + ' ' + req.session.family_name; 
/*	 
	 AthleteSession.find().sort([['name', 'ascending']]).exec(function (err, sessionlist) {
			  if (err) { return next(err); }
			  //Successful, so render
			  //res.render('athlete_list', { title: 'Athlete List', athlete_list: list_athlete });
			  res.render('athlete_training_session_objective_add', { title: name , athleteId: athleteId , sessionId: sessionId, sessions: sessionlist, error: err });
	 });
*/	 
	 async.parallel({
							
		athleteSessionList : function (callback) {
		   AthleteSession.find({ name: 'default', createdByAthlete: athleteId }, 'name createdByAthlete', callback );
		},
		athleteObjectiveList : function (callback) {
		   AthleteObjectif.find({ createdByAthlete: athleteId }, 'obj_title createdByAthlete status', callback );
		}
		
	},function (errs, result) {
		if (errs) {
		  console.log('athlete_session_list err detected:' + errs);	
		   
		} else {
			console.log("controller session_list  render athleteId:" + athleteId);
			res.render('athlete_training_session_objective_add', { title: name, athleteId: athleteId.toString() , title1:"Add a Training", sessions: result.athleteSessionList, sessionId: result.athleteSessionList[0]._id , objectives: result.athleteObjectiveList });

		  
		}
	});
	 
	 
	  
	 
};
exports.session_add_objective_post = function(req, res, next) {
	 
	 var athleteId = req.params.athleteid;
	 var sessionId = req.params.sessionid;
	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 
	 console.log( "sessionId:" + sessionId);   
	 
	 req.checkBody('date_of_begin', 'Date must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
     req.checkBody('date_of_begin', 'Date must be specified.').isDate();
	 req.checkBody('date_of_end', 'Date must be specified.').notEmpty();
	 req.checkBody('date_of_end', 'Date must be specified.').isDate();
	 
	 var objectiveId = req.body.objective;
	 var date_of_end = req.body.date_of_end;
	 var date_of_begin = req.body.date_of_begin;
	 
     console.log( "date_of_begin:" + date_of_begin);    
	 console.log( "date_of_end:" + date_of_end); 
	 console.log( "objective:" + objectiveId); 	
	 
	 var date_of_begin_timestamp = Date.parse(date_of_begin);
     var date_of_end_timestamp = Date.parse(date_of_end);  
	 //Date.parse('1970-01-01T00:00:00Z');      

	 console.log( "date_of_begin_timestamp:" + date_of_begin_timestamp );    
	 console.log( "date_of_end_timestamp:" + date_of_end_timestamp ); 

	 

     var errors = req.validationErrors();
	 if (errors) {
        res.render('athlete_training_session_objective_add', { title: name, athleteId: athleteId.toString() , title1:"Add an objective", sessions: result.athleteSessionList, sessionId: result.athleteSessionList[0]._id , objectives: result.athleteObjectiveList });
		return;
	 } 
	 async.parallel({
		athleteObjectif: function(callback) {  
		  //var _id = mongoose.Types.ObjectId(objectiveId);
		 // var id = objectiveId.toString();
		  //AthleteObjectif.findById( id )
		  
		   
		  var id = objectiveId;
		  console.log(mongoose.Types.ObjectId.isValid(id));
		  console.log("id:" + id);
		  AthleteObjectif.findById( id )
		  //AthleteObjectif.find( {"_id": ObjectId(objectiveId)} )
			.exec(callback);
		},
			
	   
	 }, function(err, results) {
			 if (err) { 
				return next(err);
			 }
			 async.parallel({
							
				athleteObjectifInstanceCreate : function (callback) {
				  AthleteObjectifInstance.create({ obj_title: results.athleteObjectif.obj_title, 
													obj_detail: results.athleteObjectif.obj_detail,
													createdByAthlete: athleteId,
													date_of_begin: date_of_begin,
													date_of_end: date_of_end,													
													createdBySession: sessionId }, callback);

				} 
			 },function (errs, resultsAthleteInstance) {
				if (errs) {
				  console.log('session_add_objective_post creation err detected:' + errs);	
				   
				} else {
					console.log('session_add_objective_post Athlete Objective creation Done:' + resultsAthleteInstance.athleteObjectifInstanceCreate._id);
					res.redirect('/catalog/training/athlete/' + athleteId + '/session/' + sessionId + '/objectives');
					//res.redirect('/catalog/training/athlete/' + athleteId  + '/training/detail');

				  
				}
			 });
		 
	 });
	 
	 
	  
	 
};
exports.session_update_objective_get = function(req, res, next) {
	 

	 console.log("controller objective_update get id:" + req.params.objectiveid + " req.params.athleteid:" + req.params.athleteid );
	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 var athleteId = req.params.athleteid;
	 var sessionId = req.params.sessionid;
	 
	 async.parallel({
        athleteObjectifInstance: function(callback) {     
            AthleteObjectifInstance.findById(req.params.objectiveid).exec(callback);
        },
         
    }, function(err, results) {
        if (err) { return next(err); }
		console.log("controller objective_update get findById:" + results.athleteObjectifInstance._id + " err:" + err);
        //Successful, so render
        res.render('athlete_training_session_objective_update', { title: name, title1: 'Update Objective', athleteId: athleteId, objective_detail: results.athleteObjectifInstance, sessionId: sessionId } );
    });
	 
};

exports.session_update_viewdata_objective_post = function(req, res, next) {
	
	console.log("controller viewdata_objective_post objectiveid:" + req.params.objectiveid + " req.params.athleteid:" + req.params.athleteid  );
	var fileId = req.body.fileid;
	console.log( "fileid:" + fileId );
	var name = req.session.first_name + ' ' + req.session.family_name; 
	var sessionId = req.params.sessionid;
	var athleteId = req.params.athleteid;
	var respmode = req.body.respmode;
	
	var mongoose = req.app.get('mongoose');	
	var gfs = Grid(mongoose.connection.db, mongoose.mongo);
	
	var readstream = gfs.createReadStream({
        _id: fileId
    });
    readstream.on('open', function() {
        //readstream.pipe(res);
    });
	readstream.on('data', function(data) {
		console.log("data:" + data);
		var datastr = data.toString();
		//var datastr = datastr1.replace(/\n|\r|(\n\r)/g,' ');
		
		var  parsed = csvJSON(datastr).replace(/\\n|\\r/g, '');
		 
		console.log("data parsed:" + parsed);
		//drawChart( parsed);
		if ( respmode == "base" ){
			res.send(parsed);
		}else{
			res.render('athlete_training_session_objective_view', { title: name, title1: 'View Data', athleteId: athleteId,  sessionId: sessionId, data:parsed } );
		}
		
/*
		//csv({noheader:true})
		csv().fromString(data).on('csv', function (csvRow){ // this func will be called 3 times 
			console.log("JSON :" + csvRow) // => [1,2,3] , [4,5,6]  , [7,8,9] 
			var data = JSON.Stringify(csvRow);
			res.render('athlete_training_session_objective_view', { title: name, title1: 'View Data', athleteId: athleteId,  sessionId: sessionId, data:data } );
		})
		.on('done',function(){
			//parsing finished 
			
		})
*/		
        //readstream.pipe(res);
		
    });
    readstream.on('error', function (err) {
        res.send(500, err);
    });
    //readstream.pipe(res);
	
	
	//res.send('view data session not implemented');
	
};
function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

exports.session_update_fileupload_objective_post = function(req, res, next) {
	
	 console.log("controller fileupload_objective_post objectiveid:" + req.params.objectiveid + " req.params.athleteid:" + req.params.athleteid  );
	 
	 var objectiveId = req.params.objectiveid;
	/*
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			var uploadDir = __dirname + "\\..\\upload\\";
			cb(null, 'public/uploads/')
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname)
	  }
	})
	 
	var upload = multer({ storage: storage });
	
	upload.single('imageupload');
	*/
	var db = req.app.get('db');	
	var mongoose = req.app.get('mongoose');	
	
	var multiparty = require('multiparty');
	var form = new multiparty.Form();
	var fs = require('fs');

	form.parse(req, function(err, fields, files) {  
		var imgArray = files.imageupload;


		for (var i = 0; i < imgArray.length; i++) {
			var newPath = './public/uploads/'+fields.imgName+'/';
			var singleImg = imgArray[i];
			newPath+= singleImg.originalFilename;
			console.log("readAndWriteFile singleImg:" + singleImg  + " to newPath:" + newPath ); 
			readAndWriteFile(singleImg, newPath, function( err ) { 
		
				   if ( err ){
						res.redirect('back');
				   }
				//db.open(function (err) {
				//  if (err) return handleError(err);
				  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
				  /*
				  gfs.files.find({ filename: singleImg.originalFilename }).toArray(function (err, files) {
					if (err) {
					   console.log( "err:" + files);
					}
					console.log("file content:" + files);
				  })
				  */
				  console.log("file filename:" + singleImg.originalFilename + " content_type" + singleImg.originalFilename.mimetype ); 
				  var writestream = gfs.createWriteStream({
					  //filename: files.file.name
					  filename: singleImg.originalFilename,
					  content_type: singleImg.originalFilename.mimetype
				  });
				  //fs.createReadStream(files.file.path).pipe(writestream);
				  fs.createReadStream(newPath).pipe(writestream);
				  
				  writestream.on('close', function (file) {
					console.log("save file _id:" + file._id);  
					AthleteObjectifInstance.findById(objectiveId, function(err, instance) {
						// handle error
						if ( !err ){
							console.log("findById success. Instance:" + objectiveId + " found save file _id:" + file._id);
							 
							instance.data.push( file._id );
							instance.save(function(err, updatedInstance) {
								if ( !err ){
									console.log("Save id: " + file._id + " in Instance:" + objectiveId + " success");
								}else{
									console.log("Err Objective save Instance error:" + err);
								}
							  // handle error
							  //return res.json(200, updatedUser)
							})
						}else{
							console.log("Err Objective find Instance error:" + err);
						}
					});
					//delete file from temp folder
					fs.unlink(newPath, function() {
					  //res.json(200, file);
					});
				  });
			   
			//})
			})
		}
		//res.send("File uploaded to: " + newPath);
		
		res.redirect('back');

	});

	function readAndWriteFile(singleImg, newPath, callback ) {

			fs.readFile(singleImg.path , function(err,data) {
				if (err) {
					console.log('readAndWriteFileErrror readFile! :'+err);
					callback ( err );
				}	 
				fs.writeFile(newPath,data, function(err) {
					if (err) {
						console.log('readAndWriteFile Errror writeFile!! :'+err);
						callback ( err );
					}
					console.log('readAndWriteFile Fitxer: '+singleImg.originalFilename +' - '+ newPath);
					callback ( err );
				})
			})
	}
};

exports.session_update_objective_post = function(req, res, next) {
	console.log("controller session_update_objective_post id:" + req.params.objectiveid + " objective_status:" + req.body.status + " scoretraining:" + req.body.scoretraining + " scoretrainer:" + req.body.scoretrainer );
    //req.checkBody('authorid', 'Author id must exist').notEmpty();  
	var sessionId = req.params.sessionid;
	
	var params = {};
	params.createdBySession = sessionId;
	params.status = req.body.status;
	params._id = req.params.objectiveid;
	if ( req.body.scoretraining ){
	   params.scoretraining = req.body.scoretraining;
	}
	if ( req.body.scoretrainer ){
	   params.scoretrainer = req.body.scoretrainer;
	}
	if ( req.body.physicallevelbefore ){
	   params.physicallevelbefore = req.body.physicallevelbefore;
	}
	if ( req.body.physicallevelafter ){
	   params.physicallevelafter = req.body.physicallevelafter;
	}
	if ( req.body.technicallevel ){
	   params.technicallevel = req.body.technicallevel;
	}
	if ( req.body.mentallevel ){
	   params.mentallevel = req.body.mentallevel;
	}
	
/*	
	var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + "\\..\\upload";
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
        if (!err) {
          console.log('File uploaded : ' + files.file.path);
		  
          grid.mongo = mongoose.mongo;
          var conn = mongoose.createConnection('..mongo connection string..');
          conn.once('open', function () {
          var gfs = grid(conn.db);
          var writestream = gfs.createWriteStream({
              filename: files.file.name
          });
          fs.createReadStream(files.file.path).pipe(writestream);
		 
       });
	    
     }        
    });
    form.on('end', function() {        
       //res.send('Completed ..... go and check fs.files & fs.chunks in  mongodb');
	   console.log('File uploaded completed ');
    });
*/	
	
	console.log("controller session_update_objective_post params:" + params );
	
	req.sanitize('objective_status').escape();
	req.sanitize('objective_status').trim();
	
	var athleteobjective = new AthleteObjectifInstance(
		params
	/*
      { //obj_title: req.body.obj_title, 
	    //createdByAthlete: createdByAthlete,
		createdBySession: sessionId,
        //obj_detail: req.body.obj_detail
		//created_at: Date.now,
        //updated_at: Date.now,
		status: req.body.status,
		_id:req.params.objectiveid  //This is required, or a new ID will be assigned
         
        
     }
	 */
	);
    
    async.parallel({
        athleteObjectifInstance: function(callback) {     
            AthleteObjectifInstance.findById(req.params.objectiveid).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
			console.log("controller session_update_objective_post findById:" + req.params.objectiveid + " createdByAthlete:" + results.athleteObjectifInstance.createdByAthlete );
            
			/*
			// Data from form is valid. Update the record.
			AthleteObjectif.findByIdAndUpdate(req.params.id, athleteobjective, {}, function (err,theObjective) {
				if (err) { return next(err); }
				//successful - redirect to book detail page.
				res.redirect(athleteobjective.url);
			});
			*/
			//use save if you want validate
			delete results.athleteObjectifInstance._id;
			athleteobjective.created_at = results.athleteObjectifInstance.created_at;
			athleteobjective.createdByAthlete = results.athleteObjectifInstance.createdByAthlete;
			athleteobjective.data = results.athleteObjectifInstance.data;
			AthleteObjectifInstance.update( results.athleteObjectifInstance, athleteobjective, function(err, mod) {
				console.log( "update err:" + err + " athleteobjective.url!" + athleteobjective.url);
				if (err) { return next(err); }
				console.log( "controller session_update_objective_post:" + athleteobjective.url);
				res.redirect(athleteobjective.url);
			}); 

        
    });

};

exports.session_delete_objective = function(req, res, next) {
	 

	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 res.send('delete objectives not implemented');
	 
};
 
 
 
exports.session_create_get = function(req, res, next) {
	 

	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 res.render('athlete_session_create', { title: name , operation: 'Create a new session' });
	 
};
exports.session_create_post = function(req, res, next) {
	 
	 var name = req.session.first_name + ' ' + req.session.family_name; 
     var athleteId = req.params.athleteid; 
	 
	 
	 req.checkBody('name', 'Session name must be specified.').notEmpty();
	 req.sanitize('name').escape();
     req.sanitize('name').trim();     
      
	 var errors = req.validationErrors();
	 
	 var athleteSession = new AthleteSession(
	   { sessionName: req.body.name, 
		 createdByAthlete: athleteId });
	 
	 if (errors) {
        res.render('author_form', { title: 'Create Session', athlete: sessionName, errors: errors});
        return;
     } else {
	  
		 athleteSession.save(function (err) {
			 if (err) { 
				return next(err); 
			 }
					 
			 async.parallel({
				
			 }, function(err, results) {
				console.log("session Creation");
				res.render('athleteseion_create', { title: name  });
				return res.send({url:athleteSession.url, id:results._id});
			 });
		  
		 })
	 
	 }
	  
	 
};
 
 
 
 
 


// Display objective list of session
exports.session_objective_list = function(req, res, next) {
    console.log("controller session_objective_list Objective list athleteid:" + req.params.athleteid);
	
	/*
    var athleteId = req.params.athleteid;
	var sessionId = req.params.sessionid;
    var name = req.session.first_name + ' ' + req.session.family_name; 
	
    async.parallel({
							
		athleteObjectifInstanceList : function (callback) {
			
			AthleteObjectifInstance.find({ createdBySession: req.params.sessionid }, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback );
	 
		} 
	 },function (errs, resultsAthleteInstance) {
		if (errs) {
		  console.log('session_add_objective_post creation err detected:' + errs);	
		   
		} else {
			console.log("controller session_objective_list  render athleteId:" + athleteId);
			res.render('athlete_training_session_objective_list', { title: name, title1: 'Session Objectives List', sessionId: sessionId, athleteId: athleteId.toString() , objectiveIntance_list: resultsAthleteInstance.athleteObjectifInstanceList });

		  
		}
	 });	
    */
	return objectiveList (req, res, next);
};

function objectiveList (req, res, next) {
	
	
    var athleteId = req.params.athleteid;
	var sessionId = req.params.sessionid;
    var name = req.session.first_name + ' ' + req.session.family_name; 
	
	var timeInterval = req.body.timeInterval;
	req.sanitize('timeInterval').escape();
    req.sanitize('timeInterval').trim(); 
    var session = req.session;	
	
	var sesvalue = getSession ( session, "timeInterval" );
	if (  (timeInterval === undefined || timeInterval === null)  && sesvalue!= null ){
		timeInterval = sesvalue;
	}
	
	console.log("controller objectiveList Objective list athleteid:" + athleteId +  " sessionid:" + sessionId + " timeInterval:" + timeInterval );
	
    async.parallel({
							
		athleteObjectifInstanceList : function (callback) {
			
			if ( timeInterval == "day" || typeof timeInterval === "undefined" || timeInterval.trim() == ""   ){
				setSession ( session, "timeInterval", 'day' );			
				var today = moment().startOf('day')
				var tomorrow = moment(today).add(1, 'days')

				AthleteObjectifInstance.find({ createdBySession: req.params.sessionid,  createdByAthlete: athleteId,
				  date_of_begin: {
					$gte: today.toDate(),
					$lt: tomorrow.toDate()
				  }
				}, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback)
				
			}else if ( timeInterval == "week" ){
				setSession ( session, "timeInterval", 'week' );	
				var begin = moment().startOf('isoWeek');
				var end = moment().endOf('isoWeek');
				
				AthleteObjectifInstance.find({ createdBySession: req.params.sessionid,  createdByAthlete: athleteId,
				  date_of_begin: {
					$gte: begin.toDate(),
					$lt: end.toDate()
				  }
				}, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback)
				
			}else if ( timeInterval == "month" ){
				setSession ( session, "timeInterval", 'month' );	 
				var begin = moment().startOf('month').format('YYYY-MM-DD hh:mm');
				var end = moment().endOf('month').format('YYYY-MM-DD hh:mm');
				
				AthleteObjectifInstance.find({ createdBySession: req.params.sessionid,  createdByAthlete: athleteId,
				  date_of_begin: {
					$gte: begin,
					$lt: end
				  }
				}, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback)
	

			
			}else{
			    setSession ( session, "timeInterval", 'year' );
				AthleteObjectifInstance.find({ createdBySession: req.params.sessionid, createdByAthlete: athleteId,

				}, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback );
			}
			
	/*		
			AthleteObjectifInstance.find({ createdBySession: sessionId.toString() })
            .sort({date_of_begin: -1})
            //.limit(PAGESIZING)
            .populate('obj_title createdBySession status')
            .exec(callback);
		*/  
		} 
	 },function (errs, resultsAthleteInstance) {
		if (errs) {
		  console.log('session_add_objective_post creation err detected:' + errs);	
		   
		} else {
			console.log("controller session_objective_list  render athleteId:" + athleteId);
			res.render('athlete_training_session_objective_list', { title: name, title1: 'Calendar', 
			                                                        sessionId: sessionId, athleteId: athleteId.toString() ,
																	objectiveIntance_list: resultsAthleteInstance.athleteObjectifInstanceList, 
																	timeIntervalInput: timeInterval, moment: moment, session: session });

		  
		}
	 });	
   
}

function objectiveListTobeClosed (req, res, next) {
	
	
    var athleteId = req.params.athleteid;
	var sessionId = req.params.sessionid;
    var name = req.session.first_name + ' ' + req.session.family_name; 
	
	 
	
	
	console.log("controller objectiveListTobeClosed Objective list athleteid:" + athleteId +  " sessionid:" + sessionId  );
	
    async.parallel({
							
		athleteObjectifInstanceList : function (callback) {
			
			if ( timeInterval == "day" || typeof timeInterval === "undefined" || timeInterval.trim() == ""   ){
				 		
				var currentDate = new Date(); 
				 

				AthleteObjectifInstance.find({  
											   
											   $and:[
													  { createdBySession: sessionId },
													  { createdByAthlete: athleteId },
											          { date_of_begin: { $lt: currentDate } },
													  { status: 'In Progress' }
				                                    ]

											
											}, 'obj_title createdByAthlete createdBySession status date_of_begin date_of_end', callback)
				
			} 
			
	 
		} 
	 },function (errs, resultsAthleteInstance) {
		if (errs) {
		  console.log('objectiveListTobeClosed creation err detected:' + errs);	
		   
		} else {
			console.log("controller objectiveListTobeClosed  render athleteId:" + athleteId);
			/*
			res.render('athlete_training_session_objective_list', { title: name, title1: 'Calendar', 
			                                                        sessionId: sessionId, athleteId: athleteId.toString() ,
																	objectiveIntance_list: resultsAthleteInstance.athleteObjectifInstanceList, 
																	timeIntervalInput: timeInterval, moment: moment, session: session });
            */
		  
		}
	 });	
   
}



exports.session_objective_get = function(req, res, next) {
	
	  console.log("controller session_objective_get Objective list athleteid:" + req.params.athleteid);
	  var athleteId = req.params.athleteid;
	  var sessionId = req.params.sessionid;
	  var name = req.session.first_name + ' ' + req.session.family_name; 

	 
	   
	  console.log("controller objective_get athleteId:" + athleteId +" id :" + req.params.objectiveid + " sessionId:" + sessionId );
	  async.parallel({
		AthleteObjectifInstance: function(callback) {  
		  AthleteObjectifInstance.findById(req.params.objectiveid)
			.exec(callback);
		},
			
	   
	  }, function(err, results) {
		if (err) { return next(err); }
		//Successful, so render
		res.render('athlete_training_session_objective_detail', { title: name, title1: 'Training Detail', athleteId: athleteId , objective_detail: results.AthleteObjectifInstance, sessionId: sessionId, moment: moment } );
	  });
	
	
};
exports.session_objective_delete_get = function(req, res, next) {
	 console.log("controller objective_delete get id:" + req.params.objectiveid);
	 var athleteId = req.params.athleteid;
	 var sessionId = req.params.sessionid;
	 
	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 async.parallel({
        athleteObjectifInstance: function(callback) {     
            AthleteObjectifInstance.findById(req.params.objectiveid).exec(callback);
        },
         
    }, function(err, results) {
        if (err) { return next(err); }
		console.log("controller objective_delete get findById:" + results.athleteObjectifInstance._id + " err:" + err);
        //Successful, so render
        res.render('athlete_training_session_objective_delete', { title: name, title1: 'Delete Objective', athleteId: athleteId.toString(), objective_detail: results.athleteObjectifInstance, sessionId: sessionId } );
    });
  
    
};

// Handle Objective delete on POST 
exports.session_objective_delete_post = function(req, res, next) {
	console.log("controller objective_delete post id:" + req.params.objectiveid);
    //req.checkBody('authorid', 'Author id must exist').notEmpty();  
    var athleteId = req.params.athleteid;
	var sessionId = req.params.sessionid;
	
    async.parallel({
        athleteObjectifInstance: function(callback) {     
            AthleteObjectifInstance.findById(req.params.objectiveid).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
			console.log("controller objective_delete post findById:" + req.params.objectiveid);
            //Author has no books. Delete object and redirect to the list of authors.
            AthleteObjectifInstance.findByIdAndRemove(req.params.objectiveid, function deleteAuthor(err) {
                if (err) { return next(err); }
				console.log("controller objective_delete post findByIdAndRemove:" + req.params.objectiveid + " err:" + err);
                //Success - got to author list
                res.redirect('/catalog/training/athlete/' + athleteId.toString()  + '/session/' + sessionId + '/objectives');
            });

        
    });

};
function setSession ( session, name, value ){
	
	
	if ( session[name] === "undefined" || session[name] === "null" ){
		session[name] = {};
	}else{
		session[name] = value;
	}		
	
	
}

function getSession ( session, name ){
	
	var value = null;
	if ( session[name] != "undefined" && session[name] != "null" ){
		value = session[name];
		
	}	
    return value; 	
	
	
}
/*
function drawChart( xxx ) {
     
     
     var red="#FA123C", green="#06FD2B", blue="#4C06FD";
      
     var ctx = document.getElementById("chartPic").getContext('2d');
     var xxx = xxx.trim();
	
     //var obj = JSON.parse( '[{ "date":"d1", "value":"30"},{ "date":"d2", "value":"40"}]' );
     
     var obj = JSON.parse( xxx );
     var objnames =[];
     var objvalues =[];
     var objbackgroundcolor=[];
 
     for (var prop in obj) {
        //alert( "==>" + obj[prop].date);
        objnames.push( obj[prop].date );
        objvalues.push( obj[prop].value );
        objbackgroundcolor.push( "blue" );
        
        
     }
     //alert("coucou:" + objnames);
      
      
           var chart = new Chart(ctx,  {
             type: 'bar',
             data: {
                //labels: ["red", "green", "blue"],
                labels: objnames,
                datasets: [{
                    label: 'Number of votes',
                    //data: [1, 1, 1],
                    data: objvalues,
                    //backgroundColor: [red, green, blue],
                    backgroundColor: objbackgroundcolor,
                    //borderColor: [green, blue, red],
                     
                    borderWidth: 1
                }],
                },
             options: {
                title: { 
                    display: true,
                    text: "chart",
                },
                legend: {
                    position: 'bottom'
                },
            }
        });
        //chart();

    };


 */