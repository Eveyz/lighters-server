/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  src: String,
  dest: String,
  memo: String,
  amount: Number,
  status: { type: String, default: "IN" },
  attachments: [],
  created_at: Date,
  updated_at: Date
});

transactionSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;