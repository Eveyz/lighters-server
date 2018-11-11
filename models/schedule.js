/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var scheduleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  id: { type: String, required: true, default: "1" },
  calendarId: { type: String, required: true, default: "1" },
  title: String,
  category: { type: String, required: true, default: "time" },
  dueDateClass: String,
  start: { type: String, required: true },
  end: { type: String, required: true },
  isReadOnly: { type: Boolean, default: true },
  created_at: Date,
  updated_at: Date
});

scheduleSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;