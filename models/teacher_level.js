/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var teacherLevelSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  englishname: String,
  level: String,
  old_level: String,
  status: String,
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  created_at: Date,
  updated_at: Date
});

teacherLevelSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var TeacherLevel = mongoose.model('TeacherLevel', teacherLevelSchema);
module.exports = TeacherLevel;