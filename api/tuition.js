/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const _ = require('lodash');
const router = express.Router();
const Tuition = require('../models/tuition');
const Transaction = require('../models/transaction');
const Student = require('../models/student');
const Course = require('../models/course');
const authenticate = require('../middlewares/authenticate');

/* Get tuition */
router.get('/', authenticate, (req, res) => {
	Tuition.find(req.query, (err, tuitions) => {
		if(err) {
			console.error(err);
		}
		res.json(tuitions);
	}).populate('student_id', 'englishname firstname lastname');
});

/* Get tuition by id */
router.get('/:_id', (req, res) => {
	let query = {_id: req.params._id};
  
  Tuition.findOne(query, (err, tuition) => {
    if(err) console.error(err);
    res.json(tuition);
  }).populate('student_id', 'englishname firstname lastname');
});

/* Create Tuition */
router.post('/', authenticate, (req, res) => {
  let body = req.body;
  
	Tuition.create(body, (err, tuition) => {
		if(err) {
			console.error(err);
    }

    Student.findOne({_id: tuition.student_id}, (err, student) => {
      if(err) {
        console.error(err);
      }
      const _transaction = {
        status: "IN",
        src: `${student.englishname}`,
        dest: "Lighters",
        amount: tuition.amount,
        memo: `${student.englishname}课时费`
      }
  
      Transaction.create(_transaction, (err, transaction) => {
        if(err) {
          console.error(err);
        }
        tuition.transaction_id = transaction.id
        tuition.save().then(doc => {
          student.tuition_amount += tuition.amount
          student.save()
        })
      });
    })

    Tuition.
    findOne({_id: tuition._id}).
    populate({ path: 'student_id', select: 'englishname firstname lastname'}).
    then(function(doc) {
      res.json(doc);
    })
	});
});

/* Update Tuition */
router.put('/:_id', authenticate, (req, res) => {
  let _tuition = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _tuition
	};

  var options = { new: true }; // newly updated record

	Tuition.findOneAndUpdate(query, update, options, (err, tuition) =>{
		if(err) {
			console.error(err);
		}
		if(!tuition) {
      return res.status(404).json({
        error: true,
        msg: 'Tuition not found'
      });
    }
    Student.findOne({_id: tuition.student_id}, (err, student) => {
      if(err) {
        console.error(err);
      }
      if(!student) {
        return res.status(404).json({
          error: true,
          msg: 'Student not found'
        });
      }

      const _transaction = {
        status: "IN",
        src: `${student.englishname}`,
        dest: "Lighters",
        amount: tuition.amount,
        memo: `${student.englishname}课时费`
      }

      let _query = {_id: tuition.transaction_id};
      let _update = {
        '$set': _transaction
      };

      var _options = { new: true }; // newly updated record
  
      Transaction.findOneAndUpdate(_query, _update, _options, (err, transaction) => {
        if(err) {
          console.error(err);
        }
        student.tuition_amount += tuition.amount
        student.save()
      });
    })
    res.json(tuition);
	}).populate('student_id', 'englishname firstname lastname');
});

/* Delete Tuition */
router.delete('/:_id', (req, res) => {
  var query = {_id: req.params._id};

  Tuition.findOne(query, (err, tuition) => {
    if(err) console.error(err);

    if(!tuition) {
      res.status(400).json({
        success: false,
        msg: 'Tuition not found!'
      });
    }

    var finished = _.after(2, function() {
      tuition.remove(err => {
        if(err) console.error(err);

        res.status(200).json({
          success: true,
          msg: 'Tuition deleted!'
        });
      })
    });

    Student.findOne({_id: tuition.student_id}, (err, student) => {
      if(err) console.error(err);
      if(!student) {
        res.status(400).json({
          success: false,
          msg: 'Student not found!'
        });
      }
      student.tuition_amount -= tuition.amount
      student.save().then(doc => {
        finished()
      })
    })

    Transaction.findOneAndDelete({_id: tuition.transaction_id}, (err) => {
      if(err) console.error(err);
      finished()
    });

  });

});


module.exports = router;