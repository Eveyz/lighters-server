/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Teacher = require('../models/teacher');
import authenticate from '../middlewares/authenticate';

/* Get Teachers */
router.get('/', authenticate, (req, res) => {
	Teacher.find(req.query, (err, teachers) => {
		if(err) {
			throw err;
		}
		res.json(teachers);
	})
});

/* Get Teacher by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Teacher.findOne(query, (err, teacher) => {
    if(err) throw err;
    res.json(teacher);
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
      path: 'students',
      model: 'Student'
    }
  }).populate('students');
});

/* Create Teacher */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
	Teacher.create(body, function(err, teacher) {
		if(err) {
			throw err;
		}
		res.json(teacher);
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
			throw err;
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

/* Delete Teacher */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Teacher.remove(query, (err, teachers) => {
		if(err) {
			throw err;
		}
		res.json(teachers);
	})
});


module.exports = router;