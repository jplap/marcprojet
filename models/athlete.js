var mongoose = require('mongoose');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var AthleteSchema = Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
	photo: { type : ObjectId }

     
  }
);

// Virtual for athlete's full name
AthleteSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for athlete's URL
AthleteSchema.virtual('url').get(function () {
  return '/catalog/training/athlete/index/' + this._id;
});

// find input against database documents
AthleteSchema.statics.authenticate = function(family_name, first_name, callback) {
  Athlete.findOne({ family_name: family_name })
      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }

      });
}

AthleteSchema.statics.checkUser = function(family_name, first_name, cb) {
  Athlete.find({family_name : family_name}).exec(function(err, docs) {
    if (docs.length){
      //cb('Name exists already', null);
	  var query = Athlete.find({first_name : first_name})
	  
	  query.exec(function(err, docs) {
		  if (docs.length){
			  console.log ("name:" + first_name + " id:" + docs[0]._id);
			  cb('First Name and family name exists already', docs[0]._id);
		  } else {
				
			  cb( null, family_name);
		  }
	  });
    } else {
		
	  cb( null, family_name);
    }
  });
}
AthleteSchema.statics.create = function(data, callback) {
        // do whatever with incoming data here
		/*
        data = modifyDataInSomeWay(data);
        var newUser = new User(data);
        newUser.save(function(err, savedUser) {
            // some logic here
            callback(err, savedUser); 
        });
		*/
		
		var newAthlete = new Athlete(data);
		newAthlete.save(function(err, savedUser) {
            // some logic here
            callback(err, savedUser); 
        });
}

//Export model
//module.exports = mongoose.model('Athlete', AthleteSchema);

var Athlete = mongoose.model('Athlete', AthleteSchema);
module.exports = Athlete;