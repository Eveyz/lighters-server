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
router.post('/', authenticate, async (req, res) => {
  let body = req.body;

  let tuition = await Tuition.create(body)
  // console.log("1 tuition created ")

  let student = await Student.findOne({_id: tuition.student_id})
  // console.log("2 student found ")

  const _transaction = {
    status: "IN",
    src: `${student.englishname}`,
    dest: "Lighters",
    amount: tuition.amount,
    memo: `${student.englishname}课时费`
  }
  let transaction = await Transaction.create(_transaction)
  // console.log("3 transaction created ")

  tuition.transaction_id = transaction.id
  let p1 = tuition.save()
  student.tuition_amount += tuition.amount
  let p2 = student.save()
  await Promise.all([p1, p2])
  // console.log("4 tuition student updated ")

  Tuition.
  findOne({_id: tuition._id}).
  populate({ path: 'student_id', select: 'englishname firstname lastname'}).
  then(async function(doc) {
    let students = await Student.find( {tuition_amount: {$lte: 300}})
    // console.log("5 students found ")
    res.json({
      tuition: doc,
      students: students
    });
  })
  
});

/* Update Tuition */
router.put('/:_id', authenticate, async (req, res) => {
  let _tuition = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _tuition
	};

  var options = { new: true };

  // query tuition first to get previous amount
  const pre_tuition = await Tuition.findOne(query);
  const pre_amount = pre_tuition.amount

  // update tuition
  let tuition = await Tuition.findOneAndUpdate(query, update, options).populate('student_id', 'englishname firstname lastname');
  // console.log("1 tuition updated")
  if(!tuition) {
    return res.status(404).json({
      error: true,
      msg: 'Tuition not found'
    });
  }
  // find student for information
  let student = await Student.findOne({_id: tuition.student_id})
  // console.log("2 student found and updated")
  
  // update transaction amount according to new tuition amount
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
  var _options = { new: true };
  await Transaction.findOneAndUpdate(_query, _update, _options)
  // console.log("3 transaction found and updated ")

  // updated student tuition_amount
  student.tuition_amount += (tuition.amount - pre_amount)
  await student.save()
  // console.log("5 student saved: ", student.tuition_amount)

  // wait for add up all tuition amount for student, and then save
  let students = await Student.find( {tuition_amount: {$lte: 300}})
  // console.log("6 students found")
  res.json({
    tuition: tuition,
    students: students
  });
});

/* Delete Tuition */
router.delete('/:_id', async (req, res) => {
  var query = {_id: req.params._id};

  let tuition = await Tuition.findOne(query)
  if(!tuition) {
    res.status(400).json({
      success: false,
      msg: 'Tuition not found!'
    });
  }

  // reuduce student amount
  let student = await Student.findOne({_id: tuition.student_id})
  student.tuition_amount -= tuition.amount
  await student.save()

  // delete transaction related to tuition
  await Transaction.findOneAndDelete({_id: tuition.transaction_id})

  // remove tuition
  await tuition.remove()
  let students = await Student.find( {tuition_amount: {$lte: 300}})
  res.json(students)

});


module.exports = router;