/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var reportSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  course_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  situation: String,
  reason: String,
  course_date: String,
  duration: Number,
  report_number: Number,
  focus: Number,
  type: String,
  course_content: [],
  tutor_comment: String,
  homework: String,
  start_time: String,
  end_time: String,
  external_link: String,
  review_books: [],
  new_books: [],
  future_books: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Book'} ],
  audios: [],
  audios_files: [],
  paid: { type: Boolean, default: false },
  credit: { type: Boolean, default: 1 },
  status: { type: String, default: "active" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

reportSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Report = mongoose.model('Report', reportSchema);
module.exports = Report;