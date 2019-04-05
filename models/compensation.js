/* 
 * @author: znz
*/

var mongoose = require('mongoose');
const Paycheck = require('../models/paycheck');

var compensationSchema = new mongoose.Schema({
  paycheck_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Paycheck'},
  attachments: [],
  type: String,
  amount: Number,
  memo: String,
  created_at: Date,
  updated_at: Date
});

compensationSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

compensationSchema.methods.addToPaycheck = function() {
  mongoose.model('Paycheck').findOne({_id: this.paycheck_id}, (err, pc) => {
    if(err) console.error(err);
    pc.compensatons.push(this)
    pc.save()
  })
};

compensationSchema.methods.removeFromPaycheck = function() {
  mongoose.model('Paycheck').findOne({_id: this.paycheck_id}, (err, pc) => {
    if(err) console.error(err);
    pc.compensatons.push(this)
    pc.save()
  })
};

compensationSchema.methods.removeFromPaycheck = function(callback) {
  mongoose.model('Paycheck').findOne({_id: this.paycheck_id}, (err, pc) => {
    if(err) console.error(err);
    pc.compensatons = pc.compensatons.filter(paycheck_id => paycheck_id.toString() !== this._id.toString())
    pc.save()
  })
  callback()
};

var Compensation = mongoose.model('Compensation', compensationSchema);
module.exports = Compensation;