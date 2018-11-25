/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var paycheckSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  course_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  month: { type: String, required: true },
  reports: [{type: mongoose.Schema.Types.ObjectId, ref: 'Report'}],
  attachments: [],
  rate: Number,
  rate_compensaton: Number,
  compensatons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Compensation'}],
  amount: Number,
  paid: { type: Boolean, default: false },
  created_at: Date,
  updated_at: Date
});

paycheckSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Paycheck = mongoose.model('Paycheck', paycheckSchema);
module.exports = Paycheck;