/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  source: String,
  dest: String,
  description: String,
  number: Number,
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