var Athlete = require('../models/athlete');
 
var AthleteObjectif = require('../models/athlete_objectif');
var AthleteSession = require('../models/athlete_session');
var AthleteObjectifInstance = require('../models/athlete_objectif_instance');

var async = require('async');
var d3 = require("d3");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
var Grid = require('gridfs-stream');
var fsextra =require('fs-extra');

var fs = require('fs');
var Converter = require("csvtojson").Converter;

var _this = this;


exports.athlete_mainpage = function(req, res) {
    //res.send('NOT IMPLEMENTED: Genre create GET');
	 //res.render('athlete_main', { title: 'Athlete Main Page' });
	 res.render('athlete_main', { title: 'Athlete Portail', name: req.user });
};
exports.athlete_connect_get = function(req, res) {
     
	  console.log("athlete_connect_get");
	  res.render('athlete_connect', { title: 'Athlete Connection' });
};
// Handle Athlete create on POST 
exports.athlete_connect_post = function(req, res, next) {
	
	req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
     
     
    
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();     
    req.sanitize('family_name').trim();
         

    var errors = req.validationErrors();
	 
	
	Athlete.checkUser( req.body.family_name, req.body.first_name,  function(err, athleteId) {
	  console.log("athlete_connect_post checkUser athleteId:" + athleteId );
	  if( err == "First Name and family name exists already") {
		req.session.family_name = req.body.family_name;
		req.session.first_name = req.body.first_name;
		req.session.athleteid = athleteId;
	  }else{
		req.session.family_name = "";  
		req.session.first_name = "";  
		var error = new Error('Not exists!');
		error.status = 401;
		return next( error );
	  }
	  
	  res.redirect('/catalog/training/athlete/' + athleteId  + '/training/detail');
	  
	  /*
	  athleteId = id;
	  var name = req.body.first_name + ' ' + req.body.family_name;
	   
	  async.parallel({
        
			athleteobjectif_count: function(callback) {
				AthleteObjectif.count(callback);
			},
			athlete: function(callback) {  
			  Athlete.findById(athleteId)
				.exec(callback);
			},
	  }, function(err, results) {
			console.log("athlete_connect_post athleteId:" + athleteId );
			res.render('athlete_main_page', { title: name , athleteId: athleteId ,error: err, athleteobjectif_count: results.athleteobjectif_count, athlete: results.athlete });
	  });
	  */
	  
	  
	});
    
    
};
// Display detail page for a specific Athlete
exports.athlete_detail = function(req, res, next) {
	//res.send('NOT IMPLEMENTED: Athlete detail: ' + req.params.id);
	var athleteId = req.params.athleteid;
	
	
	   
	async.parallel({
		
    		athleteobjectif_count: function(callback) {
				AthleteObjectif.count( { createdByAthlete: athleteId }, callback);
			},
			athletesession_count: function(callback) {
				AthleteSession.count( { createdByAthlete: athleteId }, callback);
			},
			
			athlete: function(callback) {  
			  Athlete.findById(athleteId)
				.exec(callback);
			},
			athleteobjectifinstance_count: function(callback) {
				
				var currentDate = new Date(); 
				AthleteObjectifInstance.count( { $and:[
													  //{ createdBySession: sessionId },
													  { createdByAthlete: athleteId },
											          { date_of_begin: { $lt: currentDate } },
													  { status: 'In Progress' }
													]}, callback);
			},
	}, function(err, results) {
			console.log("athlete_connect_post athleteId:" + athleteId );
			var name = results.athlete.first_name + ' ' + results.athlete.family_name;
			res.render('athlete_main_page', { title: name , athleteId: athleteId ,error: err, athleteobjectif_count: results.athleteobjectif_count, athlete: results.athlete, 
											  athletesession_count: results.athletesession_count, 
			                                  athleteobjectifinstance_count: results.athleteobjectifinstance_count });
	});
	
}
exports.athlete_register_get = function(req, res) {
     
	 res.render('athlete_register', { title: 'Athlete Register' });
};
// Handle Athlete create on POST 
exports.athlete_register_post = function(req, res, next) {
   
    req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate();
     
    
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();     
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    

    var errors = req.validationErrors();
	
	
	async.parallel({
			athlete_count: function(callback) {  
			  Athlete.count( { first_name: req.body.first_name, family_name: req.body.family_name }, callback);
			},
			
	}, function(err, results) {
			console.log("athlete_register_post athlete_count:" + results.athlete_count );
			if ( err ){
				var error = new Error('Error check exists!');
				error.status = 200;
				return next( error );
			}else if ( results.athlete_count > 0 ){
				// Already exist
				console.log("athlete_register_post already exist" );
				var error = new Error('Already exists!');
				error.status = 401;
				return next( error );
				
			}else{
				// New user a creer
				console.log("athlete_register_post creation" );
		
				async.parallel({
					athleteCreate : function (callback) {
					  Athlete.create ( { first_name: req.body.first_name, family_name: req.body.family_name, 	date_of_birth: req.body.date_of_birth }, callback);	
					  
					} 
				},function (errs, resultsAthleteCreation) {
					if (errs) {
					    console.log('athlete_register_post creation Athlete err detected:' + errs);	
					  	var error = new Error('creation failed:' + errs);
						error.status = 200;
						return next( error );
						
					} else {
					    console.log('athlete_register_post creation Athlete Done:' + resultsAthleteCreation.athleteCreate._id);
						
						async.parallel({
							
							athleteSessionCreate : function (callback) {
							  AthleteSession.create({ name: 'default', createdByAthlete: resultsAthleteCreation.athleteCreate._id }, callback);
							} 
						},function (errs, resultsAthleteSession) {
							if (errs) {
							  console.log('athlete_register_post creation err detected:' + errs);	
							  async.each( resultsAthleteSession, rollbackSession, function () {
								console.log('Rollback done.');
								//var error = new Error('creation failed:' + errs);
								//error.status = 200;
								//return next( error );
								//TODO
							  });
							} else {
								console.log('athlete_register_post Athlete session creation Done:' + resultsAthleteCreation.athleteCreate._id);
						
								res.redirect('/catalog/training/athlete/' + resultsAthleteCreation.athleteCreate._id  + '/training/detail');
				  
							  
							}
						});
						
						 
							 
					 
						  
					  
					}
				});
				
				/*
				var athlete = new Athlete(
				  { first_name: req.body.first_name, 
					family_name: req.body.family_name, 
					date_of_birth: req.body.date_of_birth
					
				   });
				athlete.save(function (err) {
					if (err) { 
						return next(err); 
					}
					// Creation d'une session d'entrainement par defaut
					 
					var name = req.body.first_name + ' ' + req.body.family_name;
					res.render('athlete_main_page', { title: name , error: err, athlete: athlete });
					 
			 
				  
				})
				*/
			}
	});
  
};
 


exports.athlete_disconnect = function(req, res) {
     
	 res.render('athlete_disconnect', { title: 'Athlete Disconnection' });
};

// Display list of all athlete
exports.athlete_list = function(req, res, next) {
  console.log("controller athlete_list");
  Athlete.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_athlete) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('athlete_list', { title: 'Athlete List', athlete_list: list_athlete });
    });

};

exports.athlete_training = function(req, res, next) {
	 
	//var name = req.session.first_name + ' ' + req.session.family_name;
	//res.render('athlete_main_training_inprogress', { title: name + ' training page' });
	
	res.redirect('/catalog/training/athlete/' + req.params.athleteid  + '/training/objectives');
	 
	 
};

exports.athlete_objective_create_get = function(req, res, next) {
	 
	var athleteId = req.params.athleteid;  
	console.log("controller athlete_objective_create_get athleteId:" + athleteId  ); 
	var name = req.session.first_name + ' ' + req.session.family_name; 
	res.render('athlete_objective_create', { title: name , athleteId: athleteId.toString(), operation: 'Create a new objective' });
	
	
	 
};

exports.athlete_objective_create_post = function(req, res, next) {

    var athleteId = req.params.athleteid;  
	console.log("controller athlete_objective_create_post athleteId:" + athleteId  ); 
	
	
	req.checkBody('obj_title', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('obj_detail', 'Family name must be specified.').notEmpty();
     
     
    
    req.sanitize('obj_title').escape();
    req.sanitize('obj_detail').escape();
    req.sanitize('obj_title').trim();     
    req.sanitize('obj_detail').trim();
	
	var errors = req.validationErrors();
	
	//var createdByAthlete = req.session.athleteid; 
	//var athleteId = req.params.athleteid;
	
	var athleteobjective = new AthleteObjectif(
      { obj_title: req.body.obj_title, 
	    //createdByAthlete: createdByAthlete,
		createdByAthlete: athleteId,
        obj_detail: req.body.obj_detail
		//created_at: Date.now,
        //updated_at: Date.now
         
        
    });
	   
	if (errors) {
        res.render('author_form', { title: 'Create Athlete', athlete: athleteId, errors: errors});
        return;
    } else {
     
    
        athleteobjective.save(function (err) {
            if (err) { 
			    return next(err); 
			}
            
			var name = req.session.first_name + ' ' + req.session.family_name; 
			 
			async.parallel({
        
				/*
				athleteobjectif_count: function(callback) {
					AthleteObjectif.count(callback);
				},
				*/
				athleteobjectif_count: function(callback) {
					AthleteObjectif.count( { createdByAthlete: athleteId }, callback);
				},
		   }, function(err, results) {
				 
				res.render('athlete_main_training_menu', { title: name , athleteId: athleteId, error: err, data: results });
		   });
			
        });
    }   
   

}
// Display athlete_objective page 
exports.athlete_objective_detail = function(req, res, next) {
  
  
  var name = req.session.first_name + ' ' + req.session.family_name; 
  var athleteId = req.params.athleteid; 
  console.log("controller objective_detail athleteId:" + athleteId +" id :" + req.params.id );
  async.parallel({
    athleteObjectif: function(callback) {  
      AthleteObjectif.findById(req.params.id)
        .exec(callback);
    },
        
   
  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('athlete_training_objective_detail', { title: name, title1: 'Objective Detail', athleteId: athleteId , objective_detail: results.athleteObjectif } );
  });

};

// Display list of all objective
exports.athlete_objective_list_get = function(req, res, next) {
  console.log("controller objective_list_get athleteid:" + req.params.athleteid);
  objectiveList ( req, res, next );
    
};

exports.athlete_objective_list_post = function(req, res, next) {
  console.log("controller objective_list_post athleteid:" + req.params.athleteid);
  objectiveList ( req, res, next );
}

function objectiveList ( req, res, next ){
	
  var athleteId = req.params.athleteid;
  var type = req.body.type;
  
  var params = {};
  params.createdByAthlete = req.params.athleteid;
  
  if ( !type || type == "all" ){
	  
  }else if ( type == "inprogress" ){
	  params.status = 'In Progress';
  }else if ( type == "finished" ){
	  params.status = 'Finished';
  }  
  
  AthleteObjectif.find( params, 'obj_title obj_detail createdByAthlete status')
    .populate('createdByAthlete')
    .exec(function (err, objective_list) {
      if (err) { 
	     console.log("controller objective_list error detected:" + err);
	     return next(err); 
	  }
	  var name = req.session.first_name + ' ' + req.session.family_name; 
      //Successful, so render
	  console.log("controller objective_list  render athleteId:" + athleteId);
      res.render('athlete_training_objective_list', { title: name, title1: 'Objectives List', athleteId: athleteId.toString() , objective_list: objective_list });
    });
	
}
/*
// Display list of all objective
exports.athlete_objective_list_inprogress = function(req, res, next) {
  console.log("controller objective_list in progress");
  var athleteId = req.params.athleteid;
  AthleteObjectif.find({ createdByAthlete: req.params.athleteid, status:'In Progress'}, 'obj_title createdByAthlete status')
      
    .populate('createdByAthlete')
    .exec(function (err, objective_list) {
      if (err) { 
	     console.log("controller objective_list error detected:" + err);
	     return next(err); 
	  }
	  var name = req.session.first_name + ' ' + req.session.family_name; 
      //Successful, so render
	  console.log("controller objective_list inprogress render athleteId:" + athleteId);
      res.render('athlete_training_objective_list', { title: name, title1: 'Objectives List In Progress', athleteId: athleteId.toString(), objective_list: objective_list });
    });
    
};

exports.athlete_objective_list_finished = function(req, res, next) {
  console.log("controller objective_list Finished");
  var athleteId = req.params.athleteid;
  AthleteObjectif.find({ createdByAthlete: req.params.athleteid, status:'Finished'}, 'obj_title createdByAthlete status')
     
    .populate('createdByAthlete')
    .exec(function (err, objective_list) {
      if (err) { 
	     console.log("controller objective_list error detected:" + err);
	     return next(err); 
	  }
	  var name = req.session.first_name + ' ' + req.session.family_name; 
      //Successful, so render
	  console.log("controller objective_list Finished render athleteId:" + athleteId);
      res.render('athlete_training_objective_list', { title: name, title1: 'Objectives List Finished', athleteId: athleteId.toString(), objective_list: objective_list });
    });
    
};
*/
 
exports.athlete_objective_delete_get = function(req, res, next) {
	 console.log("controller objective_delete get id:" + req.params.id);
	 var athleteId = req.params.athleteid;
	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 async.parallel({
        athleteObjectif: function(callback) {     
            AthleteObjectif.findById(req.params.id).exec(callback);
        },
         
    }, function(err, results) {
        if (err) { return next(err); }
		console.log("controller objective_delete get findById:" + results.athleteObjectif._id + " err:" + err);
        //Successful, so render
        res.render('athlete_training_objective_delete', { title: name, title1: 'Delete Objective', athleteId: athleteId.toString(), objective_detail: results.athleteObjectif } );
    });
  
    
};

// Handle Objective delete on POST 
exports.athlete_objective_delete_post = function(req, res, next) {
	console.log("controller objective_delete post id:" + req.params.id);
    //req.checkBody('authorid', 'Author id must exist').notEmpty();  
    var athleteId = req.params.athleteid;
    async.parallel({
        athleteObjectif: function(callback) {     
            AthleteObjectif.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
			console.log("controller objective_delete post findById:" + req.params.id);
            //Author has no books. Delete object and redirect to the list of authors.
            AthleteObjectif.findByIdAndRemove(req.params.id, function deleteAuthor(err) {
                if (err) { return next(err); }
				console.log("controller objective_delete post findByIdAndRemove:" + req.params.id + " err:" + err);
                //Success - got to author list
                res.redirect('/catalog/training/athlete/' + athleteId.toString()  + '/training/objectives');
            });

        
    });

};

exports.athlete_objective_update_get = function(req, res, next) {
   
  console.log("controller objective_update get id:" + req.params.id + " req.params.athleteid:" + req.params.athleteid );
	 var name = req.session.first_name + ' ' + req.session.family_name; 
	 var athleteId = req.params.athleteid;
	 async.parallel({
        athleteObjectif: function(callback) {     
            AthleteObjectif.findById(req.params.id).exec(callback);
        },
         
    }, function(err, results) {
        if (err) { return next(err); }
		console.log("controller objective_delete get findById:" + results.athleteObjectif._id + " err:" + err);
        //Successful, so render
        res.render('athlete_training_objective_update', { title: name, title1: 'Update Objective', athleteId: athleteId, objective_detail: results.athleteObjectif } );
    });
  
    
};
exports.athlete_objective_update_post = function(req, res, next) {
	console.log("controller objective_update post id:" + req.params.id + " objective_status:" + req.body.objective_status );
    //req.checkBody('authorid', 'Author id must exist').notEmpty();  
	
	
	req.sanitize('objective_status').escape();
	req.sanitize('objective_status').trim();
	
	var athleteobjective = new AthleteObjectif(
      { //obj_title: req.body.obj_title, 
	    //createdByAthlete: createdByAthlete,
        //obj_detail: req.body.obj_detail
		//created_at: Date.now,
        //updated_at: Date.now,
		status: req.body.status,
		_id:req.params.id  //This is required, or a new ID will be assigned
         
        
    });
    
    async.parallel({
        athleteObjectif: function(callback) {     
            AthleteObjectif.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
			console.log("controller athlete_objective_update_post findById:" + req.params.id + " createdByAthlete:" + results.athleteObjectif.createdByAthlete );
            
			/*
			// Data from form is valid. Update the record.
			AthleteObjectif.findByIdAndUpdate(req.params.id, athleteobjective, {}, function (err,theObjective) {
				if (err) { return next(err); }
				//successful - redirect to book detail page.
				res.redirect(athleteobjective.url);
			});
			*/
			//use save if you want validate
			delete results.athleteObjectif._id;
			athleteobjective.created_at = results.athleteObjectif.created_at;
			athleteobjective.createdByAthlete = results.athleteObjectif.createdByAthlete;
			AthleteObjectif.update( results.athleteObjectif, athleteobjective, function(err, mod) {
				console.log( "update err:" + err + " athleteobjective.url!" + athleteobjective.url);
				if (err) { return next(err); }
				console.log( "controller athlete_objective_update_post:" + athleteobjective.url);
				res.redirect(athleteobjective.url);
			}); 

        
    });

};

exports.athlete_index = function(req, res) {   
    
    async.parallel({
        
		athlete_count: function(callback) {
            Athlete.count(callback);
        },
		athleteobjectif_count: function(callback) {
            AthleteObjectif.count(callback);
        },
		draw: function(callback) {
			setTimeout(function() {
				
			  const dom = new JSDOM('<!doctype html><html></html>');
			  const document = dom.window.document;
			  
			  
			  width =  300
			  height = 450

			  //###
			  //# draw 2 circles side-by-side
			  //###
			  circleData = [
				{ cx: 20, cy: 25, r: 20, fill: 'blue' },
				{ cx: 60, cy: 25, r: 20, fill: 'green'}
			  ]
			  layoutRoot = d3.select(document.body)
				.append('svg')
			  layoutRoot.attr('width', width)
						.attr('height', height)
						.append('g')
						.selectAll('circle')
						.data(circleData)
						.enter()
						.append('circle')
						.attr("cx", function (d) { 
													console.log( "cx:" + d.cx );
													return d.cx; 
												 })
						.attr("cy", function (d) { 
													console.log( "cy:" + d.y );
													return d.cy; 
												 })
						.attr("r", function (d) { 
													console.log( "r:" + d.r );
													return d.r; 
												})
						.attr("fill", function (d) { 
													console.log( "fill:" + d.fill );
													return d.fill; 
													})

				callback( null, layoutRoot );
			}, 200);
		},
		/*
		draw1: function(callback) {
			setTimeout(function() {
				
				  const dom = new JSDOM('<!doctype html><html></html>');
				  const document = dom.window.document;
				  
				  width =  300
				  height = 450

				  layoutRoot = d3.select(document.body)
				  
				  //=======================
				  var converter = new Converter({});
				  
				  //var	parseDate = d3.time.format("%Y-%m").parse;
				  
				  var layoutRoot = d3.select(document.body).append('svg');
				  
				  converter.fromFile("./data.csv",function(err,data){
			      //d3.csv('E:/nodeproject/marcproject/data.csv', function (error, data) {
				  //fs.readFile('file:///E:/nodeproject/marcproject/data.csv', function read(err, data) {
					  
					    data.forEach(function(d) {
							d.date = d.date;
							d.value = d.value;
						});
						
						layoutRoot.selectAll("bar")
							  .data(data)
							.enter().append("rect")
							  .style("fill", "steelblue")
							  .attr("x", function(d) { return x(d.date); })
							  .attr("width", x.rangeBand())
							  .attr("y", function(d) { return y(d.value); })
							  .attr("height", function(d) { return height - y(d.value); });
						
						
				});

				callback( null, layoutRoot );
			}, 200);
		},
		*/
    }, function(err, results) {
		
		  /* 
		  //console.log("book controller");
		  
		  //d3 = req.app.d3
		  //html = '<!doctype html><html></html>'
		  //# jsdom magic to get d3 to work within a DOM
		  //document = req.app.jsdom.jsdom(html)
		  //document = dom;
		  const dom = new JSDOM('<!doctype html><html></html>');
		  const document = dom.window.document;
          
		  
		  width =  300
		  height = 450

		  //###
		  //# draw 2 circles side-by-side
		  //###
		  circleData = [
			{ cx: 20, cy: 25, r: 20, fill: 'blue' },
			{ cx: 60, cy: 25, r: 20, fill: 'green'}
		  ]
		  layoutRoot = d3.select(document.body)
			.append('svg')
		  layoutRoot.attr('width', width)
					.attr('height', height)
					.append('g')
					.selectAll('circle')
					.data(circleData)
					.enter()
					.append('circle')
					.attr("cx", function (d) { 
												console.log( "cx:" + d.cx );
					                            return d.cx; 
											 })
					.attr("cy", function (d) { 
												console.log( "cy:" + d.y );
					                            return d.cy; 
											 })
					.attr("r", function (d) { 
												console.log( "r:" + d.r );
					                            return d.r; 
											})
					.attr("fill", function (d) { 
												console.log( "fill:" + d.fill );
												return d.fill; 
												})
          res.render('index', { title: 'Main Page', error: err, data: results, svgstuff: layoutRoot.node().outerHTML, draw: results.draw.node().outerHTML });
		  */
		  
          res.render('index', { title: 'Main Page', error: err, data: results, draw: results.draw.node().outerHTML });
    });
};
function rollbackSession (doc, callback) {
  if (!doc) { 
	callback(); 

  }else if ( doc._id ){
	AthleteSession.findByIdAndRemove(doc._id, function (err, doc) {
      console.log('Rolled-back session document: ' + doc._id);
      callback();
    }); 
  }
}
exports.training_controller_fileupload_post = function(req, res, next) {
	
	console.log("controller training_controller_fileupload_post athleteid:" + req.params.athleteid  );
	var athleteId = req.params.athleteid; 
	 
	
	var db = req.app.get('db');	
	var mongoose = req.app.get('mongoose');	
	
	var multiparty = require('multiparty');
	var form = new multiparty.Form();
	var fs = require('fs');

	form.parse(req, function(err, fields, files) {  
		var imgArray = files.exampleInputFile;


		for (var i = 0; i < imgArray.length; i++) {
			var newPath = './public/uploads/'+fields.imgName+'/';
			var singleImg = imgArray[i];
			newPath+= singleImg.originalFilename;
			console.log("readAndWriteFile singleImg to newPath:" + newPath ); 
			readAndWriteFile(singleImg, newPath, function( err ) { 
		
				   if ( err ){
					    console.log("readAndWriteFile error:" + err  );  
						//res.redirect('back');
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
				  console.log("file filename:" + singleImg.originalFilename + " content_type:" + singleImg.originalFilename.mimetype ); 
				  if ( ! singleImg.originalFilename) {
					  return;
				  }
				  var writestream = gfs.createWriteStream({
					  //filename: files.file.name
					  filename: singleImg.originalFilename,
					  content_type: singleImg.originalFilename.mimetype
				  });
				  //fs.createReadStream(files.file.path).pipe(writestream);
				  fs.createReadStream(newPath).pipe(writestream);
				  
				  writestream.on('close', function (file) {
					console.log("save file _id:" + file._id);  
					Athlete.findById(athleteId, function(err, instance) {
						// handle error
						if ( !err ){
							console.log("findById success. Athlete:" + athleteId + " found save file _id:" + file._id);
							 
							instance.photo = file._id;
							instance.save(function(err, updatedInstance) {
								if ( !err ){
									console.log("Save id: " + file._id + " in Instance:" + athleteId + " success");
								}else{
									console.log("Err Athlete save Instance error:" + err);
								}
								
							  // handle error
							  //return res.json(200, updatedUser)
							})
						}else{
							console.log("Err Athlete find Instance error:" + err);
						}
					});
					
					
					//Copy photo in cache
					console.log("Copy photo in cache");
					var dir = './public/cache/photo';
					if (!fs.existsSync(dir)){
						fs.mkdirSync(dir);
					}
					
					var cachePathFile = dir + "/" + athleteId + '.png';
					 console.log("create: " + cachePathFile);
					fsextra.ensureFileSync(cachePathFile);
					fs.createReadStream( newPath).pipe(fs.createWriteStream( cachePathFile )) ;
					
					//delete file from temp folder
					console.log("Delete photo in upload dir:" + newPath);
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

exports.training_controller_viewdata_post = function(req, res, next) {
	
	console.log("controller viewdata post athleteid:" + req.params.athleteid  );
	var fileId = req.body.fileid;
	console.log( "fileid:" + fileId );
	var name = req.session.first_name + ' ' + req.session.family_name; 
	var sessionId = req.params.sessionid;
	var athleteId = req.params.athleteid;
	//var respmode = req.body.respmode;
	
	var mongoose = req.app.get('mongoose');	
	var gfs = Grid(mongoose.connection.db, mongoose.mongo);
	var data = [];
	var readstream = gfs.createReadStream({
        _id: fileId
    });
    readstream.on('open', function() {
        //readstream.pipe(res);
    });
	readstream.on('data', function(chunk) {
		console.log("data: chunk");
		//var datastr = data.toString();
		//var  parsed = csvJSON(datastr).replace(/\\n|\\r/g, '');
		//console.log("data parsed:" + parsed);
		//drawChart( parsed);
		
		//res.setHeader('Content-Type', 'image/jpeg');
		//res.send(data);
		
		 data.push(chunk);

		
    });
    readstream.on('end', function () {
        data = Buffer.concat(data);
        //var img = 'data:image/png;base64,' + Buffer(data).toString('base64');
        //res.end(img);
		var img = Buffer(data).toString('base64');
		console.log("end: image buffering finished" );
		res.setHeader('Content-Type', 'image/png');
		res.send(img);
    });
	readstream.on('error', function (err) {
        res.send(500, err);
    });
    
};
/*
exports.createAthlete = function(data, callback) {
        
		
		var newAthlete = new Athlete(data);
		newAthlete.save(function(err, savedUser) {
            // some logic here
            callback(err, savedUser); 
        });
}
*/
