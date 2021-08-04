/* 
 * @author: znz
*/

const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const authenticate = require('../middlewares/authenticate');
const Teacher = require('../models/teacher')

/* Get Transactions */
router.get('/', authenticate, (req, res) => {
	let { skip, limit, query } = req.query
	if(skip || limit) {
		Notification.find(query, (err, notifications) => {
			if(err) {
				console.error(err);
			}
			res.json(notifications);
		}).skip(parseInt(skip) * parseInt(limit)).limit(parseInt(limit));
	} else {
		Notification.find(query, (err, notifications) => {
			if(err) {
				console.error(err);
			}
			res.json(notifications);
		});
	}
});

/* Get Transactions */
router.get('/all', authenticate, async (req, res) => {
	let teachers = await Teacher.find({'status': 'active'})
	Notification.find({teacher_id: {'$in': teachers.map(t => t._id)}, read: false}, (err, notifications) => {
		if(err) {
			console.error(err);
		}
		res.json(notifications);
	}).populate({
    path: 'teacher_id',
    model: 'Teacher',
    select: 'firstname lastname',
  }).sort({count: -1});
});

/* Get Transaction by id */
router.get('/:_id', (req, res) => {
	let query = {_id: req.params._id};
  Notification.findOne(query, (err, notification) => {
    if(err) console.error(err);
    res.json(notification);
  });
});

/* Create Transaction */
router.post('/', authenticate, (req, res) => {
  let body = req.body;
	Notification.create(body, (err, notification) => {
		if(err) {
			console.error(err);
		}
		res.json(notification);
	});
});

/* Update Transaction */
router.put('/:_id', authenticate, (req, res) => {
  let _notification = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _notification
	};

  var options = { new: true }; // newly updated record

	Notification.findOneAndUpdate(query, update, options, async (err, notification) =>{
		if(err) {
			console.error(err);
		}
		if(!notification) {
      return res.status(404).json({
        error: true,
        msg: 'Notification not found'
      });
    }

    let teachers = await Teacher.find({'status': 'active'})
		Notification.find({teacher_id: {'$in': teachers.map(t => t._id)}, read: false}, (err, notifications) => {
			if(err) {
				console.error(err);
			}
			res.json(notifications);
		}).populate({
			path: 'teacher_id',
			model: 'Teacher',
			select: 'firstname lastname',
		}).sort({count: -1});

	});
});

/* Delete Notification */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Notification.remove(query, (err, res) => {
		if(err) {
			console.error(err);
		}
		res.json(res);
	})
});


module.exports = router;