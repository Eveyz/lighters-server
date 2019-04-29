const env = process.env;

if (process.env.NODE_ENV !== "test") {
  var mongoose = require('mongoose');
  var url = 'mongodb://localhost:27017/lighters';
  var options = { useNewUrlParser: true, useCreateIndex: true };
  var db = mongoose.connect(url, options).then(
    () => {
      console.log('MongoDB connected.');
    },
    err => {
      console.error('App starting error:', err.stack);
      // process.exit(1);
    }
  );
  
  module.exports = {
    port: env.PORT || 8000,
    jwtSecret: 'znz@lighters',
    db: db
  };
}
