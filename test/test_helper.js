// const mongoose = require('mongoose')

// mongoose.Promise = global.Promise

// mongoose.connect('mongodb://localhost/lighters_test', { useNewUrlParser: true, useCreateIndex: true })
// mongoose.connection
//         .once('open', () => console.log("Connected!"))
//         .on('error', (error) => {
//           console.warn('Error: ', error)
//         })

// beforeEach((done) => {
//   mongoose.connection.collections.users.drop()
//   mongoose.connection.collections.teachers.drop()
//   mongoose.connection.collections.students.drop()
//   mongoose.connection.collections.courses.drop()
//   mongoose.connection.collections.reports.drop(() => {
//     done()
//   })
// })