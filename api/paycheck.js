/* 
 * @author: znz
    paycheck amount 由反馈表 amount 和 compensation amount 组成
    如果反馈表数目为0 则paycheck会被删除 
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Paycheck = require('../models/paycheck');
const Report = require('../models/report');
const authenticate = require('../middlewares/authenticate');
const utils = require('../utils');

/* Get Paychecks */
router.get('/', authenticate, (req, res) => {
	Paycheck.find(req.query, (err, paychecks) => {
		if(err) {
			console.error(err);
    }

    // when paycheck are fetched, calcualte report amount or paycheck amount when needed
    // paychecks.forEach(async pc => {
    //   if(pc.amount === 0) {
    //     await Report.find({_id: {$in: pc.reports}}, async (err, reports) => {
    //       await utils.asyncForEach(reports, async (_report) => {
    //         // if report teacher rate is 0 then calculate first
    //         if(_report.teacher_rate === 0) {
    //           await _report.save().then(() => {
    //             pc.amount += _report.amount
    //             pc.save()
    //           })
    //         // otherwise add all the report amount to the report amount
    //         } else {
    //           pc.amount += _report.amount
    //           pc.save()
    //         }
    //       })
    //     })
    //   }
    //   pc.save()
    // })

    res.json(paychecks);
    
	}).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'course_id',
      model: 'Course',
      select: 'name course_rate type'
    }
  }).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'student_id',
      model: 'Student',
      select: 'firstname lastname'
    }
  }).populate('teacher_id', 'firstname lastname');
});

/* Get Paycheck by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Paycheck.findOne(query, (err, paycheck) => {
    if(err) console.error(err);
    res.json(paycheck);
  }).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'course_id',
      model: 'Course',
      select: 'name'
    }
  }).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'student_id',
      model: 'Student',
      select: 'firstname lastname'
    }
  }).populate('teacher_id', 'firstname lastname');;
});

/* Create Paycheck */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
	Paycheck.create(body, function(err, paycheck) {
		if(err) {
			console.error(err);
    }

    res.json(paycheck);
    
	}).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'course_id',
      model: 'Course',
      select: 'name'
    }
  }).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'student_id',
      model: 'Student',
      select: 'firstname lastname'
    }
  }).populate('teacher_id', 'firstname lastname');
});

/* Update Paycheck */
router.put('/:_id', authenticate, (req, res) => {
  let _paycheck = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _paycheck
	};

  var options = { new: true }; // newly updated record

	Paycheck.findOneAndUpdate(query, update, options, (err, paycheck) =>{
		if(err) {
			console.error(err);
    }
		if(!paycheck) {
      return res.status(404).json({
        error: true,
        msg: 'Paycheck not found'
      });
    }

    res.json(paycheck);
	}).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'course_id',
      model: 'Course',
      select: 'name'
    }
  }).populate({
    path: 'reports',
    model: 'Report',
    select: 'course_date credit teacher_rate amount situation teacher_id',
    populate: {
      path: 'student_id',
      model: 'Student',
      select: 'firstname lastname'
    }
  }).populate('teacher_id', 'firstname lastname');;
});

/* Delete Paycheck */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Paycheck.remove(query, (err, paychecks) => {
		if(err) {
			console.error(err);
		}
		res.json(paychecks);
	})
});

module.exports = router;