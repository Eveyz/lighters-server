let {task, desc} = require('jake')
const Student = require('../models/student')


desc('Curate student course fee.');
task('curate_student_course_fee', function () {
  var mongoose = require('mongoose');
  var url = 'mongodb://localhost:27017/lighters';
  var options = { useNewUrlParser: true, useCreateIndex: true };
  mongoose.connect(url, options)

  var connection = mongoose.connection

  connection.once("open", () => {
    var students = []
    var reports = []
    connection.db.collection("students", (err, coll) => {
      coll.find({}).toArray((err, _students) => {
        students = _students
        students.forEach(s => {
          console.log(s._id)

          connection.db.collection("reports", (err, coll) => {
            coll.find({student_id: s._id}).toArray((err, _reports) => {
              _reports.forEach(r => {
                console.log(r.tutor_comment)
                
              })
            })
          })

        })
      })
    })


  })

  mongoose.connection.close()
  // console.log('This is the default task.');
  // console.log('Jake will run this task if you run `jake` with no task specified.');
});

desc('This is some other task. It depends on the default task');
task('otherTask', ['default'], function () {
  console.log('Some other task');
});