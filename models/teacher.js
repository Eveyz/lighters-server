/* 
 * @author: znz
*/

// status => adminCreated -> unverified -> verified -> pending <=> active

var mongoose = require('mongoose');

var teacherSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  systemid: String,
  firstname: String,
  lastname: String,
  englishname: String,
  age: Number,
  birthday: String,
  gender: String,
  city: String,
  work: String,
  education: String,
  experience: String,
  otherexperience: String,
  profour: Number,
  proeight: Number,
  levelsix: Number,
  other: String,
  honor: String,
  interaction: String,
  like: String,
  availabletime: Number,
  audio: String,
  comments: String,
  resume: String,
  level: { type: Number, default: 1 },
  status: { type: String, default: "pending" },
  temporary: String,
  consent: { type: Boolean, default: false },
  certificates: [],
  rate: Number,
  students: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Student'} ],
  courses: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Course'} ],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

teacherSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;