/* 
 * @author: znz
*/

const express = require('express');
const router = express.Router();
const TeacherLevel = require('../models/teacher_level');
const jwt = require('jsonwebtoken');
const config = require('../config');
const authenticate = require('../middlewares/authenticate');

/* Get TeacherLevels */
router.get('/', authenticate, (req, res) => {
  // console.log(req.currentUser);
	TeacherLevel.find((err, teacher_levels) => {
		if(err) {
			console.error(err);
		}
		res.json(teacher_levels);
	});
});

/* Get TeacherLevel by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	TeacherLevel.findOne(query, (err, teacher_level) => {
		if(err) {
			console.error(err);
		}
		res.json(teacher_level);
	});
});

/* Create TeacherLevel */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
  // console.log(req.currentUser);
	TeacherLevel.create(body, function(err, teacher_level) {
		if(err) {
			console.error(err);
		}
		res.json(teacher_level);
	});
});

/* Delete TeacherLevel */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	TeacherLevel.remove(query, (err, teacher_levels) => {
		if(err) {
			console.error(err);
		}
		res.json(teacher_levels);
	});
});

/* Update Book */
router.put('/:_id', (req, res) => {
	var book = req.body;
	var query = req.params._id;
	// if the field doesn't exist $set will set a new field
	var update = {
		'$set': body
	};

	var options = { new: true }; // newly updated record

	TeacherLevel.findOneAndUpdate(query, update, options, (err, teacher_level) =>{
		if(err) {
			console.error(err);
		}
		res.json(teacher_level);
	});
});

module.exports = router;