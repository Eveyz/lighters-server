/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Student = require('../models/student');
const Report = require('../models/report');
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');

/* Get Students */
router.get('/', authenticate, (req, res) => {

	Student.find((err, students) => {
		if(err) {
			console.error(err);
		}
		res.json(students);
	})
});

/* Get Student by id */
router.get('/:_id', (req, res) => {
	let query = {_id: req.params._id};

	Student.findOne(query, (err, student) => {
    if(err) console.error(err);
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
	}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name');
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