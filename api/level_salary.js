/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const LevelSalary = require('../models/level_salary');
const jwt = require('jsonwebtoken');
const config = require('../config');
const multer  = require('multer');
import authenticate from '../middlewares/authenticate';

/* Get all entry */
router.get('/', authenticate, (req, res) => {
  // console.log(req.currentUser);
	LevelSalary.find((err, entries) => {
		if(err) {
			console.error(err);
		}
		res.json(entries);
	});
});

/* Get LevelSalary by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	LevelSalary.findOne(query, (err, entry) => {
		if(err) {
			console.error(err);
		}
		res.json(entry);
	});
});

/* Create LevelSalary */
router.post('/', authenticate, (req, res) => {
  let _entry = req.body;

	LevelSalary.create(_entry, function(err, entry) {
		if(err) {
			console.error(err);
		}
		res.json(entry);
	});
});

/* Delete LevelSalary */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	LevelSalary.findOneAndRemove(query, (err, entry) => {
		if (err) {
			return res.json({success: false, msg: 'Cannot remove Entry'});
		}
		if (!entry) {
			return res.status(404).json({success: false, msg: 'Entry not found'});
		}
    res.json({success: true, msg: 'Entry deleted.'});
  });
});

/* Update Entry */
router.use('/:_id', (req, res) => {
	let _entry = req.body;
  let query = {_id: req.params._id};
  
	let update = {
		'$set': _entry
	};

	let options = { new: true }; // newly updated record

	LevelSalary.findOneAndUpdate(query, update, options, (err, entry) => {
    console.log(entry)
		if(err) {
			console.error(err);
		}
		res.json(entry);
	});
});

module.exports = router;