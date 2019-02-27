/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const TeacherRate = require('../models/teacher_rate');
const authenticate = require('../middlewares/authenticate');

/* Get tuition */
router.get('/', authenticate, (req, res) => {
	TeacherRate.find(req.query, (err, teacher_rates) => {
		if(err) {
			console.error(err);
		}
		res.json(teacher_rates);
	}).populate('teacher_id', 'englishname firstname lastname level');
});

/* Get tuition by id */
router.get('/:_id', (req, res) => {
	let query = {_id: req.params._id};
  
  TeacherRate.findOne(query, (err, tuition) => {
    if(err) console.error(err);
    res.json(tuition);
  }).populate('teacher_id', 'englishname firstname lastname level');
});

/* Create Tuition */
router.post('/', authenticate, (req, res) => {
  let body = req.body;
  
	TeacherRate.create(body, (err, teacher_rate) => {
		if(err) {
			console.error(err);
    }

    TeacherRate.
    findOne({_id: teacher_rate._id}).
    populate({ path: 'teacher_id', select: 'englishname firstname lastname level'}).
    then(function(doc) {
      res.json(doc);
    })
	});
});

/* Update Tuition */
router.put('/:_id', authenticate, (req, res) => {
  let _teacher_rate = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _teacher_rate
	};

  var options = { new: true }; // newly updated record

	TeacherRate.findOneAndUpdate(query, update, options, (err, teacher_rate) =>{
		if(err) {
			console.error(err);
		}
		if(!teacher_rate) {
      return res.status(404).json({
        error: true,
        msg: 'TeacherRate not found'
      });
    }
    res.json(teacher_rate);
	}).populate('teacher_id', 'englishname firstname lastname level');
});

/* Delete Tuition */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	TeacherRate.remove(query, (err, teacher_rates) => {
		if(err) {
			console.error(err);
		}
		res.json(teacher_rates);
	})
});


module.exports = router;