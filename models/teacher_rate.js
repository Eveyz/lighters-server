/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var teacherRateSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  rate: Number,
  teacher_level: String,
  course_type: String,
  course_level: String,
  created_at: Date,
  updated_at: Date
});

teacherRateSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var teacherRate = mongoose.model('TeacherRate', teacherRateSchema);

module.exports = teacherRate;