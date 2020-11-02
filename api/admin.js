/* 
 * @author: znz
*/

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Report = require('../models/report');
const Compensation = require('../models/compensation');
const Transaction = require('../models/transaction');
const utils = require('../utils');
const authenticate = require('../middlewares/authenticate');

// check reports profit and compensations
router.get('/profit', async (req, res) => {
	let { skip, limit, ...query } = req.query
	skip = parseInt(skip)
	limit = parseInt(limit)
	let reports = await Report.find({}).sort({created_at: -1}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name course_rate').populate('student_id', 'lastname firstname englishname').exec()
  let compensations = await Compensation.find({}).exec()
  let transactions = await Transaction.find({}).exec()
  let sum = 0
	if(reports.length > 0) {
    reports.forEach((report, idx) => {
      const report_credit = utils.getStudentReportCredit(report.situation)
      if(report_credit > 0) {
        sum += (report.course_id.course_rate * report_credit - report.amount)
      }
    })
  }
  if(compensations.length > 0) {
    compensations.forEach((compensation, idx) => {
      if(compensation.type === "罚款") sum += compensation.amount
      else sum -= compensation.amount
    })
  }
  if(transactions.length > 0) {
    transactions.forEach((transaction, idx) => {
      if(transaction.status === "OUT" && !transaction.memo.includes("退")) sum -= transaction.amount
      else if(transaction.status === "IN" && transaction.memo.includes("初始")) {
        sum += transaction.amount
      }
    })
  }
	res.json({
		'profit': sum,
		'reports_length': reports.length,
		'reports': reports.slice(skip * limit, skip * limit + limit),
		'compensations_length': compensations.length,
		'compensations': compensations.slice(skip * limit, skip * limit + limit)
	})
});

/* Create Teacher */
router.post('/createTeacher', utils.verifyAdmin, (req, res) => {
  let data = req.body;
  Teacher.countDocuments({}, function(err, count) {
    if (err) { return handleError(err) }

    let systemID = utils.getStudyID(count);
    let teacherUsername = `T${(new Date()).getFullYear().toString().substr(-2)}${systemID}`;
    const user_data = {
      identity: "teacher",
      username: teacherUsername,
      email: `${teacherUsername}@lighters.com`,
      temporaryPassword: teacherUsername,
      password: teacherUsername,
      passwordCon: teacherUsername,
      adminCreated: true,
      status: "RESET_REQUIRED"
    }
    let teacher = data.teacher;
    if(!teacher) console.err("teacher data not provided")

    User.findOne({ email: `${teacherUsername}@lighters.com`}, (err, user) => {
      if(err) {
        console.log(err)
        res.json({
          error: true,
          msg: "failed to find user"
        })
      }
      if(user) {
        teacher.user_id = user.id;
        // teacher.status = "RESET_REQUIRED";
        teacher.status = "active";
        teacher.systemid = teacherUsername;
        teacher.temporary = teacherUsername;
    
        Teacher.create(teacher, function(err, teacher) {
          if(err) {
            console.error(err);
          }
          res.json(teacher.englishname);
        })
      } else {
        User.create(user_data, (err, user) => {
          if(err) {
            console.log(err);
            res.json({status: 200});
          } else {
            teacher.user_id = user.id;
            // teacher.status = "RESET_REQUIRED";
            teacher.status = "active";
            teacher.systemid = teacherUsername;
            teacher.temporary = teacherUsername;
        
            Teacher.create(teacher, function(err, teacher) {
              if(err) {
                console.error(err);
              }
              res.json(teacher.englishname);
            })
          }
      
        })

      }
    })
  });
});

/* Create Student */
router.post('/createStudent', utils.verifyAdmin, (req, res) => {
  let data = req.body;
  Student.countDocuments({}, function(err, count) {
    if (err) { return handleError(err) }
    
    let systemID = utils.getStudyID(count);
    let studentUsername = `S${(new Date()).getFullYear().toString().substr(-2)}${systemID}`;
    const user_data = {
      identity: "student",
      email: `${studentUsername}@lighters.com`,
      username: studentUsername,
      temporaryPassword: studentUsername,
      password: studentUsername,
      passwordCon: studentUsername,
      adminCreated: true,
      status: "RESET_REQUIRED"
    }
    let student = data.student;

    User.findOne({ email: `${studentUsername}@lighters.com`}, (err, user) => {
      if(err) {
        console.log(err)
        res.json({
          error: true,
          msg: "failed to find user"
        })
      }
      if(user) {
        student.user_id = user.id;
        // student.status = "RESET_REQUIRED";
        student.status = "active";
        student.systemid = studentUsername;
        student.temporary = studentUsername;
    
        Student.create(student, function(err, student) {
          if(err) {
            console.error(err);
          }
          res.json(student.englishname);
        })
      } else {
        User.create(user_data, (err, user) => {
          if(err) console.log(err);
          student.user_id = user.id;
          // student.status = "RESET_REQUIRED";
          student.status = "active";
          student.systemid = studentUsername;
          student.temporary = studentUsername;
      
          Student.create(student, function(err, student) {
            if(err) {
              console.error(err);
            }
            res.json(student.englishname);
          })
      
        })
      }
    })
  
  })
});

/* Update Teacher */
router.put('/updateTeacher', authenticate, (req, res) => {
  let data = req.body;

  let query = {_id: data._id};
	let update = {
		'$set': data.teacher
	};

  var options = { new: true }; // newly updated record

	Teacher.findOneAndUpdate(query, update, options, (err, teacher) =>{
		if(err) {
			console.error(err);
    }
		if(!teacher) {
      return res.status(404).json({
        error: true,
        msg: 'Teacher not found'
      });
    }
    res.json(teacher);
	});
});

/* Update Student */
router.put('/updateStudent', authenticate, (req, res) => {
  let data = req.body;

  let query = {_id: data._id};
	let update = {
		'$set': data.student
	};

  var options = { new: true }; // newly updated record

	Student.findOneAndUpdate(query, update, options, (err, student) =>{
		if(err) {
			console.error(err);
    }
		if(!student) {
      return res.status(404).json({
        error: true,
        msg: 'Student not found'
      });
    }
    res.json(student);
	});
});

module.exports = router;