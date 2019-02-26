/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Transaction = require('../models/transaction');
const authenticate = require('../middlewares/authenticate');

/* Get Transactions */
router.get('/', authenticate, (req, res) => {
	Transaction.find(req.query, (err, transactions) => {
		if(err) {
			console.error(err);
		}
		res.json(transactions);
	});
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