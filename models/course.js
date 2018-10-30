/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
  teacher_id: Number,
  student_id: Number,
  capacity: Number,
  course_hours: Number,
  name: String,
  level: String,
  code: String,
  type: String,
  status: { type: String, default: "active" },
  books: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Book'} ],
  teachers: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'} ],
  students: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Student'} ],
  reports: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Report'} ],
  time_slot: [],
  created_at: Date,
  updated_at: Date
});

courseSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Course = mongoose.model('Course', courseSchema);
module.exports = Course;