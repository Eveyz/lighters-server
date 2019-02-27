/* 
 * @author: znz
*/

var mongoose = require('mongoose');
const Report = require('./report');
const Teacher = require('./teacher');

var paycheckSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  course_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  month: { type: String, required: true },
  memo: String,
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

paycheckSchema.post('find', function() {
  if(this.amount === 0) {
    this.calculate()
  }
});

paycheckSchema.methods.calculate = async function() {
  let query = {_id: this._id}
  let _amount = 0
  let reports = await Report.find({_id: {$in: this.reports}})
  reports.forEach(report => {
    _amount += report.amount 
  })
  this.amount = _amount
};

var Paycheck = mongoose.model('Paycheck', paycheckSchema);
module.exports = Paycheck;