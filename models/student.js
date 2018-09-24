/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
  pphone: String,
  pemail: String,
  pwechat: String,
  pqq: String,
  firstname: String,
  lastname: String,
  englishname: String,
  birthday: String,
  gender: String,
  city: String,
  schoolname: String,
  schoolstatus: String,
  level: String,
  time: String,
  estimate: String,
  expectation: String,
  paragraph: String,
  dailyreading: String,
  currentreadingstatus: String,
  penglishlevel: String,
  custody: String,
  way: String,
  reason: String,
  status: String,
  age: Number,
  status: { type: String, default: "pending" },
  recording: [],
  teachers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } ],
  courses: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Course' } ],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

studentSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Student = mongoose.model('Student', studentSchema);
module.exports = Student;