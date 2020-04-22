/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var tuitionSchema = new mongoose.Schema({
  course_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  transaction_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'},
  course_hour: Number,
  remain: Number,
  amount: Number,
  status: { type: String, default: "" },
  time: { type: Date, default: new Date() },
  created_at: Date,
  updated_at: Date
});

tuitionSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var tuition = mongoose.model('Tuition', tuitionSchema);

module.exports = tuition;