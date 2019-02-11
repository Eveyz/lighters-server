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
  expectation: [],
  estimate: String,
  estimateOther: String,
  dailyreading: String,
  dailyreadingOther: String,
  currentreadingstatus: String,
  currentreadingstatusOther: String,
  penglishlevel: String,
  custody: String,
  paragraph: String,
  way: String,
  reason: String,
  age: Number,
  consent: { type: Boolean, default: false },
  status: { type: String, default: "pending" },
  temporary: String,
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