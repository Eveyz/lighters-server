/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var evaluationSchema = new mongoose.Schema({
	student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
	date: Date,
	level: String,
	name: String,
	content: String,
  created_at: Date,
  updated_at: Date
});

evaluationSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Evaluation = mongoose.model('Evaluation', evaluationSchema);
module.exports = Evaluation;