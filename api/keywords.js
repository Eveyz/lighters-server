/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Keyword = require('../models/keyword');
const jwt = require('jsonwebtoken');
const config = require('../config');
import authenticate from '../middlewares/authenticate';

/* Get Keywords */
router.get('/', authenticate, (req, res) => {
  // console.log(req.currentUser);
	Keyword.find((err, keywords) => {
		if(err) {
			throw err;
		}
		res.json(keywords);
	});
});

/* Get Keyword by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	Keyword.findOne(query, (err, keyword) => {
		if(err) {
			throw err;
		}
		res.json(keyword);
	});
});

/* Create Keyword */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
  // console.log(req.currentUser);
	Keyword.create(body, function(err, keyword) {
		if(err) {
			throw err;
		}
		res.json(keyword);
	});
});

/* Delete Keyword */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Keyword.remove(query, (err, keywords) => {
		if(err) {
			throw err;
		}
		res.json(keywords);
	});
});

/* Update Book */
router.use('/:_id', (req, res) => {
	var book = req.body;
	var query = req.params._id;
	// if the field doesn't exist $set will set a new field
	var update = {
		'$set': body
	};

	var options = { new: true }; // newly updated record

	Keyword.findOneAndUpdate(query, update, options, (err, keyword) =>{
		if(err) {
			throw err;
		}
		res.json(keyword);
	});
});

module.exports = router;