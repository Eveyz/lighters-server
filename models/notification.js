/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var notificationSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  course_date: String,
  read: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
  created_at: Date,
  updated_at: Date
});

notificationSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;