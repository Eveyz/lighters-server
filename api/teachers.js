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
  console.log(req.currentUser);
	Teacher.find((err, teahcers) => {
		if(err) {
			throw err;
		}
		res.json(teachers);
	})
});

/* Get Book by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Teacher.find(query, (err, teacher) => {
		if(err) {
			throw err;
		}
		res.json(teacher);
	})
});

/* Create Book */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
  console.log(req.currentUser);
	Teacher.create(body, function(err, teacher) {
		if(err) {
			throw err;
		}
		res.json(teacher);
	})
});

/* Delete Book */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Teacher.remove(query, (err, teachers) => {
		if(err) {
			throw err;
		}
		res.json(teachers);
	})
});

/* Update Book */
router.use('/:_id', (req, res) => {
	var teacher = req.body;
	var query = req.params._id;
	// if the field doesn't exist $set will set a new field
	var update = {
		'$set': {
			title: book.title,
			description: book.description,
			author: book.author
		}
	};

	var options = { new: true }; // newly updated record

	Teacher.findOneAndUpdate(query, update, options, (err, teacher) =>{
		if(err) {
			throw err;
		}
		res.json(teacher);
	})
});

module.exports = router;