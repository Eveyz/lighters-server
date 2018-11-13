/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Student = require('../models/student');
import authenticate from '../middlewares/authenticate';

/* Get Students */
router.get('/', authenticate, (req, res) => {

	Student.find((err, students) => {
		if(err) {
			throw err;
		}
		res.json(students);
	})
});

/* Get Student by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Student.find(query, (err, student) => {
		if(err) {
			throw err;
		}
		res.json(student);
	})
});

/* Create Student */
router.post('/', authenticate, (req, res) => {
	var body = req.body;

	Student.create(body, (err, student) => {
		if(err) {
			throw err;
		}
		res.json(student);
	})
});

/* Delete Student */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Student.remove(query, (err, students) => {
		if(err) {
			throw err;
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
			throw err;
    }
		if(!student) {
      return res.status(404).json({
        error: true,
        message: 'Student not found'
      });
    }
    res.json(student);
	});
});

module.exports = router;