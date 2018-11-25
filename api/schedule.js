/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Schedule = require('../models/schedule');
const jwt = require('jsonwebtoken');
const config = require('../config');
import authenticate from '../middlewares/authenticate';

/* Get Schedules */
router.post('/query_courses', authenticate, (req, res) => {
	const query = {
		course_id: { "$in": req.body.courses_ids	}
	};

	Schedule.find(query, (err, schedules) => {
		if(err) {
			console.error(err);
		}
		res.json(schedules);
	});
});

/* Get Schedule by id */
router.get('/:_id', authenticate, (req, res) => {
	const query = {_id: req.params._id};
	
	Schedule.findOne(query, (err, schedule) => {
		if(err) {
			console.error(err);
		}
		res.json(schedule);
	});
});

/* Create Schedule */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
  // console.log(req.currentUser);
	Schedule.create(body, function(err, schedule) {
		if(err) {
			console.error(err);
		}
		res.json(schedule);
	});
});

/* Delete Schedule */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Schedule.findOneAndRemove(query, (err, schedule) => {
		if(err) {
			res.json({success: false, msg: 'Cannot remove schedule'});
		}
		if (!schedule) {
			return res.status(404).json({success: false, msg: 'Schedule not found'});
		}
    res.json({success: true, msg: 'Schedule deleted.'});
	})
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

	Schedule.findOneAndUpdate(query, update, options, (err, scheudle) =>{
		if(err) {
			console.error(err);
		}
		res.json(scheudle);
	});
});

module.exports = router;