/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var teacherSalarySchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  level: String,
  rate: Number,
  compensation: Number,
  total: Number,
  created_at: Date,
  updated_at: Date
});

teacherSalarySchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var TeacherSalary = mongoose.model('TeacherSalary', teacherSalarySchema);

module.exports = TeacherSalary;