/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var levelSalarySchema = new mongoose.Schema({
  level: String,
  rate: Number,
  type: String,
  course_level: String,
  created_at: Date,
  updated_at: Date
});

levelSalarySchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var LevelSalary = mongoose.model('LevelSalary', levelSalarySchema);

module.exports = LevelSalary;