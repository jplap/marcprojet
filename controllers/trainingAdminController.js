var Athlete = require('../models/athlete');
var AthleteObjectif = require('../models/athlete_objectif');

var async = require('async');

 


exports.athlete_admin_mainpage = function(req, res) {
   
	async.parallel({
		
    		
			athlete_count: function(callback) {  
			  Athlete.count(callback);
				 
			},
	}, function(err, results) {
			 
			var name = "admin";
			res.render('athlete_admin_main_page', { title: 'Athlete Admin Portail', name: name , error: err, data: results });
	});
	 
	  
};
