/* 
 * @author: znz
*/

var mongoose = require('mongoose');

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

var Compensation = mongoose.model('Compensation', compensationSchema);
module.exports = Compensation;