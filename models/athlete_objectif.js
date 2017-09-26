var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ObjectiveSchema = Schema({
  obj_title: {type: String, required: true},
  createdByAthlete: {type: Schema.ObjectId, ref: 'Athlete', required: true},
  obj_detail: {type: String, required: true},
  status: {type: String, required: true, enum: ['In Progress', 'Finished'], default: 'In Progress'},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
   
});

// Virtual for book's URL
ObjectiveSchema.virtual('url').get(function () {
  return '/catalog/training/athlete/' + this.createdByAthlete + '/training/objective/' + this._id;
});

//Export model
module.exports = mongoose.model('AthleteObjective', ObjectiveSchema);
