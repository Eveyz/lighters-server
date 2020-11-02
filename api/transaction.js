/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Transaction = require('../models/transaction');
const authenticate = require('../middlewares/authenticate');
const Paycheck = require('../models/paycheck');

/* Get Transactions */
router.get('/', authenticate, (req, res) => {
	let { skip, limit, query } = req.query
	if(skip || limit) {
		Transaction.find(query, (err, transactions) => {
			if(err) {
				console.error(err);
			}
			res.json(transactions);
		}).skip(parseInt(skip) * parseInt(limit)).limit(parseInt(limit));
	} else {
		Transaction.find(query, (err, transactions) => {
			if(err) {
				console.error(err);
			}
			res.json(transactions);
		});
	}
});

/* Get Transactions and payloads */
router.get('/all', async (req, res) => {
	let { skip, limit, ...query } = req.query
	skip = parseInt(skip)
	limit = parseInt(limit)
	let ts = await Transaction.find(query).exec()
	let paychecks = await Paycheck.find({"paid": true}).exec()
	paychecks.forEach((pc, idx) => {
		if(pc.amount !== 0) {
			ts.push({
				src: 'Lighters',
				dest: pc.teacher_id.lastname + pc.teacher_id.firstname,
				amount: pc.amount ? pc.amount.toFixed(2) : 0,
				created_at: pc.updated_at,
				status: "OUT",
				memo: pc.memo
			})
		}
	})
	ts = ts.sort((b, a) => a.created_at - b.created_at)
	let sum = 0
	if(ts.length > 0) {
		ts.forEach((t, idx) => {
			if(t.status === "IN") sum += t.amount
			else sum -= t.amount
		})
	}
	res.json({
		'transactions': ts.slice(skip * limit, skip * limit + limit),
		'total': ts.length,
		'sum': sum
	})
});

/* Get Transaction by id */
router.get('/:_id', (req, res) => {
	let query = {_id: req.params._id};
  
  Transaction.findOne(query, (err, transaction) => {
    if(err) console.error(err);
    res.json(transaction);
  });
});

/* Create Transaction */
router.post('/', authenticate, (req, res) => {
  let body = req.body;
	Transaction.create(body, (err, transaction) => {
		if(err) {
			console.error(err);
		}
		res.json(transaction);
	});
});

/* Update Transaction */
router.put('/:_id', authenticate, (req, res) => {
  let _transaction = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _transaction
	};

  var options = { new: true }; // newly updated record

	Transaction.findOneAndUpdate(query, update, options, (err, transaction) =>{
		if(err) {
			console.error(err);
		}
		if(!transaction) {
      return res.status(404).json({
        error: true,
        msg: 'Transaction not found'
      });
    }
    res.json(transaction);
	});
});

/* Delete Transaction */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Transaction.remove(query, (err, transactions) => {
		if(err) {
			console.error(err);
		}
		res.json(transactions);
	})
});


module.exports = router;