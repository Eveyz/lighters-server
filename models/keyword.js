/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var keywordSchema = new mongoose.Schema({
  content: String,
  created_at: Date,
  updated_at: Date
});

keywordSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Keyword = mongoose.model('Keyword', keywordSchema);
module.exports = Keyword;