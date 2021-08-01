/* 
 * @author: znz
*/

const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const Evaluation = require('../models/evaluation');
const authenticate = require('../middlewares/authenticate');

/* Get Evaluations */
router.get('/', authenticate, (req, res) => {
	let { skip, limit, query } = req.query
	if(skip || limit) {
		Evaluation.find(query, (err, evaluations) => {
			if(err) {
				console.error(err);
			}
			res.json(evaluations);
		}).skip(parseInt(skip) * parseInt(limit)).limit(parseInt(limit));
	} else {
		Evaluation.find(query, (err, evaluations) => {
			if(err) {
				console.error(err);
			}
			res.json(evaluations);
		});
	}
});

/* Get Evaluation */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	Evaluation.findOne(query, (err, evaluation) => {
		if(err) {
			console.error(err);
		}
		res.json(evaluation);
	})
});

/* Create Evaluation with all evaluations */
router.post('/all', authenticate, (req, res) => {
	var body = req.body;
  const _student_id = mongoose.Types.ObjectId(body.student_id);
  body.student_id = _student_id;

	Evaluation.create(body, function(err, evaluation) {
		if(err) {
			console.error(err);
    }

		Evaluation.find({student_id: _student_id}, (err, evaluations) => {
			if(err) {
				console.error(err);
			}
			res.json(evaluations);
		});

	})
});

/* Create Evaluation */
router.post('/', authenticate, (req, res) => {
	// var body = req.body;
	let _evaluation = JSON.parse(req.body);
  const _student_id = mongoose.Types.ObjectId(_evaluation.student_id);
  _evaluation.student_id = _student_id;

	Evaluation.create(_evaluation, function(err, evaluation) {
		if(err) {
			console.error(err);
    }
    res.json(evaluation);
	})
});

/* Update Evaluation */
router.put('/:_id', authenticate, (req, res) => {
  let _evaluation = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _evaluation
	};

  var options = { new: true }; // newly updated record

	Evaluation.findOneAndUpdate(query, update, options, (err, evaluation) =>{
		if(err) {
			console.error(err);
		}
		if(!evaluation) {
      return res.status(404).json({
        error: true,
        msg: 'Evaluation not found'
      });
    }
    
		Evaluation.find({student_id: req.body.student_id}, (err, evaluations) => {
			if(err) {
				console.error(err);
			}
			res.json(evaluations);
		});

	});
});

/* Delete Evaluation */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Evaluation.remove(query, (err, evaluations) => {
		if(err) {
			console.error(err);
			return res.status(404).json({
        error: true,
        msg: 'Evaluation not found'
      });
		}

		Evaluation.find(req.query, (err, evaluations) => {
			if(err) {
				console.error(err);
			}
			res.json(evaluations);
		});
	})
});


module.exports = router;