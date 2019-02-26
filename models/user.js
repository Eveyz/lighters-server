/* 
 * @author: znz
 * 
 * user status => RESET_REQUIRED -> UNVERIFIED -> VERIFIED
*/

let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true },
  // firstname: { type: String, required: true, unique: true },
  // lastname: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, 
  wechat: { type: String, require: false },
  identity: { type: String, require: false },  
  status: { type: String, required: true, default: "UNVERIFIED" },
  adminCreated: { type: Boolean, default: false },
  temporaryPassword: { type: String, required: false },
  password: { type: String, required: true },
  passwordCon: { type: String, required: true },
  admin: { type: Boolean, default: false },
  remember: { type: Boolean, default: false },
  consent: { type: Boolean, default: false },
  created_at: Date,
  updated_at: Date
});

userSchema.pre("save", function(next){
  var user = this;
  var currentDate = new Date();
  user.updated_at = currentDate;
  if (!user.isModified('password')) return next();
  user.password = user.generateHash(user.password);
  user.passwordCon = user.generateHash(user.passwordCon);
  if ( !user.created_at ) {
    user.created_at = currentDate;
  }
  next();
});

userSchema.methods.dudify = function() {
  this.username = this.username + '-dude';
  return this.username;
};

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) console.error(err);
    callback(null, isMatch);
  });
};

userSchema.methods.isAdmin = function() {
  return this.identity === "admin";
};

userSchema.methods.isTeacher = function() {
  return this.identity === "teacher";
};

userSchema.methods.isStudent = function() {
  return this.identity === "student";
};

var User = mongoose.model('User', userSchema);

module.exports = User;