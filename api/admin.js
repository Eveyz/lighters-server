/* 
 * @author: znz
*/

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const utils = require('../utils');
const authenticate = require('../middlewares/authenticate');

/* Create Teacher */
router.post('/createTeacher', utils.verifyAdmin, (req, res) => {
  let data = req.body;
  const user = {
    email: data.email,
    identity: "teacher",
    username: data.username,
    password: data.password,
    passwordCon: data.passwordCon,
    adminCreated: true,
    status: "RESET_REQUIRED"
  }
  let teacher = data.teacher;

  User.create(user, (err, user) => {
    if(err) console.log(err);
    teacher.user_id = user.id;
    // teacher.status = "RESET_REQUIRED";
    teacher.status = "active";
    teacher.temporary = data.username;

    Teacher.create(teacher, function(err, teacher) {
      if(err) {
        console.error(err);
      }
      res.json(teacher.email);
    })

  })
});

/* Create Student */
router.post('/createStudent', utils.verifyAdmin, (req, res) => {
  let data = req.body;
  const user = {
    email: data.email,
    identity: "student",
    username: data.username,
    password: data.password,
    passwordCon: data.passwordCon,
    adminCreated: true,
    status: "RESET_REQUIRED"
  }
  let student = data.student;

  User.create(user, (err, user) => {
    if(err) console.log(err);
    student.user_id = user.id;
    // student.status = "RESET_REQUIRED";
    student.status = "active";
    student.temporary = data.username;

    Student.create(student, function(err, student) {
      if(err) {
        console.error(err);
      }
      res.json(student.email);
    })

  })
});

/* Update Teacher */
router.put('/:_id', authenticate, (req, res) => {
  let _teacher = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _teacher
	};

  var options = { new: true }; // newly updated record

	Teacher.findOneAndUpdate(query, update, options, (err, teacher) =>{
		if(err) {
			console.error(err);
    }
		if(!teacher) {
      return res.status(404).json({
        error: true,
        message: 'Teacher not found'
      });
    }
    res.json(teacher);
	});
});


module.exports = router;