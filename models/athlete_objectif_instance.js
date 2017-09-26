var mongoose = require('mongoose');

var Schema = mongoose.Schema;
 ObjectId = Schema.ObjectId;

var ObjectiveInstanceSchema = Schema({
		  obj_title: {type: String, required: true},
		  createdByAthlete: {type: Schema.ObjectId, ref: 'Athlete', required: true},
		  createdBySession: {type: Schema.ObjectId, ref: 'AthleteSession', required: true},
		  obj_detail: {type: String, required: true},
		  status: {type: String, required: true, enum: ['In Progress', 'Finished'], default: 'In Progress'},
		  date_of_begin:  {type: Date},
		  date_of_end:  {type: Date},
		  created_at: {type: Date, default: Date.now},
		  updated_at: {type: Date, default: Date.now},
		  scoretraining: {type: Number},
		  scoretrainer: {type: Number},
		  physicallevelbefore: {type: Number},
		  physicallevelafter: {type: Number},
		  technicallevel: {type: Number},
		  mentallevel: {type: Number},
		  comment: {type: String},
		  data: [{ type : ObjectId }]
		   
		},
			{
				timestamps: true
		});

// Virtual for objective's URL
ObjectiveInstanceSchema.virtual('url').get(function () {
  return '/catalog/training/athlete/' + this.createdByAthlete + '/session/' + this.createdBySession + '/objective/' + this._id;
});

ObjectiveInstanceSchema.statics.create = function(data, callback) {
        // do whatever with incoming data here
		/*
        data = modifyDataInSomeWay(data);
        var newUser = new User(data);
        newUser.save(function(err, savedUser) {
            // some logic here
            callback(err, savedUser); 
        });
		*/
		console.log('ObjectiveInstanceSchema create data:' + data );
		var newObjectiveInstance = new this(data);
		newObjectiveInstance.save(function(err, savedObjectiveInstance) {
			console.log('ObjectiveInstanceSchema save data'  );
            // some logic here
            callback(err, savedObjectiveInstance); 
        });
}

//Export model
module.exports = mongoose.model('ObjectiveInstance', ObjectiveInstanceSchema);
