/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Book = require('../models/book');
const Keyword = require('../models/keyword');
const jwt = require('jsonwebtoken');
const config = require('../config');
const multer  = require('multer');
import authenticate from '../middlewares/authenticate';

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/books')
  },
  filename: (req, file, callback) => {
    let ext = file.originalname.split('.').pop();
    callback(null, file.originalname + '-' + Date.now() + '.' + ext)
  }
});
var upload = multer({storage: storage});


/* Get Books */
router.get('/', authenticate, (req, res) => {
  // console.log(req.currentUser);
	Book.find((err, books) => {
		if(err) {
			throw err;
		}
		res.json(books);
	}).populate('keywords');
});

/* Get Book by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	Book.findOne(query, (err, book) => {
		if(err) {
			throw err;
		}
		res.json(book);
	}).populate('keywords');
});

/* Create Books */
router.post('/', upload.single("file"), authenticate, (req, res) => {
	let _book = JSON.parse(req.body.book);
	const file = req.file;
	if(file) {
		_book.file = {
			originalname: file.originalname,
      filename: file.filename,
      path: file.path
		}
	}

	Book.create(_book, function(err, book) {
		if(err) {
			throw err;
		}
		res.json(book);
	});
});

/* Delete Book */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Book.findOneAndRemove(query, (err, book) => {
		if (err) {
			return res.json({success: false, msg: 'Cannot remove Book'});
		}
		if (!book) {
			return res.status(404).json({success: false, msg: 'Book not found'});
		}
    res.json({success: true, msg: 'Book deleted.'});
  });
});

/* Update Book */
router.use('/:_id', (req, res) => {
	var book = req.body;
	var query = req.params._id;
	// if the field doesn't exist $set will set a new field
	var update = {
		'$set': {
			title: book.title,
			description: book.description,
			author: book.author
		}
	};

	var options = { new: true }; // newly updated record

	Book.findOneAndUpdate(query, update, options, (err, book) =>{
		if(err) {
			throw err;
		}
		res.json(book);
	}).populate('keywords');
});

module.exports = router;