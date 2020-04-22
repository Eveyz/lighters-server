/* 
 * @author: znz
 * 
*/

let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

var auditSchema = new mongoose.Schema({
  username: { type: String, required: false },
  remote_ip: { type: String, required: false },
  created_at: Date,
  updated_at: Date
});

auditSchema.pre("save", function(next){
  var audit = this;
  var currentDate = new Date();
  audit.updated_at = currentDate;
  if ( !audit.created_at ) {
    audit.created_at = currentDate;
  }
  next();
});

var Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;