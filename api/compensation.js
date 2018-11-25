/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Compensation = require('../models/compensation');
import authenticate from '../middlewares/authenticate';

/* Get Compensations */
router.get('/', authenticate, (req, res) => {
	Compensation.find(req.query, (err, compensations) => {
		if(err) {
			console.error(err);
		}
		res.json(compensations);
	});
});

/* Get Compensation by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Compensation.findOne(query, (err, paycheck) => {
    if(err) console.error(err);
    res.json(paycheck);
  });
});

/* Create Compensation */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
	Compensation.create(body, function(err, compensation) {
		if(err) {
			console.error(err);
		}
		res.json(compensation);
	})
});

/* Update Compensation */
router.put('/:_id', authenticate, (req, res) => {
  let _compensation = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _compensation
	};

  var options = { new: true }; // newly updated record

	Compensation.findOneAndUpdate(query, update, options, (err, compensation) =>{
		if(err) {
			console.error(err);
    }
		if(!compensation) {
      return res.status(404).json({
        error: true,
        message: 'Compensation not found'
      });
    }
    res.json(compensation);
	});
});

/* Delete Compensation */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Compensation.remove(query, (err, compensations) => {
		if(err) {
			console.error(err);
		}
		res.json(compensations);
	})
});


module.exports = router;