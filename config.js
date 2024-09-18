const env = process.env;




if (process.env.NODE_ENV !== "test") {
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI;
  
  const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

  var db;
  
  async function run(db) {
    try {
      // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
      db = await mongoose.connect(uri, clientOptions);
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await mongoose.disconnect();
    }
  }

  run(db).catch(console.dir);
  
  // var mongoose = require('mongoose');
  // var url = process.env.MONGODB_URI;
  // var options = { useNewUrlParser: true, useCreateIndex: true };
  // var db = mongoose.connect(url, options).then(
  //   () => {
  //     console.log('MongoDB connected.');
  //   },
  //   err => {
  //     console.error('App starting error:', err.stack);
  //     // process.exit(1);
  //   }
  // );
  
  module.exports = {
    port: env.PORT || 8000,
    jwtSecret: 'znz@lighters',
    db: db
  };
}
