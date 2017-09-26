var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SessionSchema = new Schema({
		name: { type: String, required: true, trim: true },
		createdByAthlete: {type: Schema.ObjectId, ref: 'Athlete'}
	},
	{
		timestamps: true
});

// Virtual for book's URL
SessionSchema.virtual('url').get(function () {
  return '/catalog/training/athlete/' + this.createdByAthlete + '/session/' + this._id;
});

SessionSchema.statics.create = function(data, callback) {
        // do whatever with incoming data here
		/*
        data = modifyDataInSomeWay(data);
        var newUser = new User(data);
        newUser.save(function(err, savedUser) {
            // some logic here
            callback(err, savedUser); 
        });
		*/
		console.log('SessionSchema create data:' + data );
		var newSession= new this(data);
		newSession.save(function(err, savedSession) {
			console.log('SessionSchema save data'  );
            // some logic here
            callback(err, savedSession); 
        });
}


//Export model
var AthleteSession = mongoose.model('AthleteSession', SessionSchema);
module.exports = AthleteSession;
