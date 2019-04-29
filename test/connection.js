const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/lighters_test', {
  useNewUrlParser: true,
  useCreateIndex: true
})
mongoose.connection
  .once('open', () => { 
    console.log('testing db connected') 
    console.log("about to drop")
    mongoose.connection.dropDatabase()
  })
  .on('error', (error) => {
    console.warn('Error: ', error)
  })