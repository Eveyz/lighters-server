/* 
 * @author: znz
*/

const express = require('express');
const _ = require('lodash');
const router = express.Router();
const Student = require('../models/student');
const Report = require('../models/report');
const Tuition = require('../models/tuition');
const Transaction = require('../models/transaction');
const Evaluation = require('../models/evaluation');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');

/* Get Students */
router.get('/', authenticate, (req, res) => {

	Student.find(req.query, (err, students) => {
		if(err) {
			console.error(err);
		}
		res.json(students);
	})
});

router.get('/low_balance', authenticate, (req, res) => {
	Student.find( {"status": "active"}, (err, students) => {
		if(err) {
			console.error(err);
		}
		var lowBalanceStudents = [];
		students.forEach(student => {
			if(student.tuition_amount <= 300) {
				lowBalanceStudents.push(student)
			}
		})
		res.json({
			students: students,
			lowBalanceStudents: lowBalanceStudents
		});
	})
});

/* Get Student by id */
router.get('/:_id', authenticate, (req, res) => {
	let query = {_id: req.params._id};

	Student.findOne(query, async (err, student) => {
    if(err) console.error(err);

    var _reports = await Report.find({student_id: student._id}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name course_rate');
    _reports = _.sortBy(_reports, ['course_date'], ['desc'])
    student._doc.reports = _reports

    const _tuitions = await Tuition.find({student_id: student._id})
    student._doc.tuitions = _tuitions

    const _evaluations = await Evaluation.find({student_id: student._id})
    student._doc.evaluations = _evaluations

    res.json(student);

  }).populate('courses').populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'books',
			model: 'Book',
			populate: {
				path: 'keywords',
				model: 'Keyword'
			}
    }
  }).populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'teachers',
      model: 'Teacher'
    }
  });
});

/* Get Student by id */
router.post('/:_id/recalculate', (req, res) => {
	let query = {_id: req.params._id};

	let _student = req.body;

	let update = {
		'$set': _student
	};

  var options = { new: true }; // newly updated record

	Student.findOneAndUpdate(query, update, options, async (err, student) =>{
		if(err) {
			console.error(err);
    }

    // var all_promises = []
    // var courses = []
    // student.courses.forEach((course) => {
    //   all_promises.push(
    //     new Promise(async (resolve, reject) => {
    //       const _reports = await Report.find({course_id: course._id, student_id: student._id}).populate('teacher_id', 'lastname firstname englishname')
    //       course.reports = _reports
    //       resolve(_reports)
    //       courses.push(course)
    //     })
    //   )
    // })
    // await Promise.all(all_promises)
    // student.courses = courses

    // const _tuitions = await Tuition.find({student_id: student._id})
    // student._doc.tuitions = _tuitions

    var _reports = await Report.find({student_id: student._id}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name course_rate');
    _reports = _.sortBy(_reports, ['course_date'], ['desc'])
    student._doc.reports = _reports

    const _tuitions = await Tuition.find({student_id: student._id})
    student._doc.tuitions = _tuitions

    res.json(student);

  }).populate('courses').populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'books',
			model: 'Book',
			populate: {
				path: 'keywords',
				model: 'Keyword'
			}
    }
  }).populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'teachers',
      model: 'Teacher'
    }
  });
});

/* Get student by id */
router.get('/:_id/reports', (req, res) => {
	// let _id = mongoose.Types.ObjectId(req.params._id);
  let query = {student_id: req.params._id}

	Report.find(query, (err, reports) => {
		if(err) throw(err);

		res.json(reports);
	}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name course_rate');
});

/* Create Student */
router.post('/', authenticate, (req, res) => {
	let student = req.body;

	Student.create(student, (err, student) => {
		if(err) {
			console.error(err);
		}
		res.json(student);
	})
});

/* Delete Student */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Student.remove(query, (err, students) => {
		if(err) {
			console.error(err);
		}
		res.json(students);
	})
});

/* Update Student */
router.put('/:_id', authenticate, (req, res) => {
  let _student = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _student
  };

  var options = { new: true }; // newly updated record

	Student.findOneAndUpdate(query, update, options, (err, student) => {
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

/* Deactivate Student */
router.put('/:_id/deactivate', authenticate, (req, res) => {
  
  let query = {_id: req.params._id};
	let update = {
		'$set': {
      status: "inactive",
      tuition_amount: 0
    }
	};

  var options = { new: true }; // newly updated record
  var _amount = parseInt(req.query.tuition_amount)

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

    if(_amount === 0) {
      res.json(student);
    } else {
      const _transaction = {
        src: 'Lighters',
        dest: student.lastname ? `${student.lastname}${student.firstname}(${student.englishname})` : `${student.englishname}`,
        amount: _amount,
        status: "OUT",
        memo: student.lastname ? `${student.lastname}${student.firstname}(${student.englishname})课程费用退款` : `${student.englishname}课程费用退款`
      }
  
      Transaction.create(_transaction, (err, transaction) => {
        if(err) {
          console.error(err);
          return res.status(404).json({
            error: true,
            msg: 'Fail to create transaction'
          });
        }
        res.json(student);
      });
    }


	});
});

module.exports = router;