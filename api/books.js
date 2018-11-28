/* 
 * @author: znz
*/

const fs = require('fs');
const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const multer  = require('multer');
import authenticate from '../middlewares/authenticate';

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/books/uploads')
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
			console.error(err);
		}
		res.json(books);
	}).populate('keywords');
});

/* Get Book by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	Book.findOne(query, (err, book) => {
		if(err) {
			console.error(err);
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
			console.error(err);
		}
		res.json(book);
	});
});

/* Update Book */
router.put('/:_id', upload.single("file"), authenticate, (req, res) => {
  let _book = JSON.parse(req.body.book);
  let prev_book = _book.prevFile
	const file = req.file;
	if(file) {
		_book.file = {
			originalname: file.originalname,
      filename: file.filename,
      path: file.path
    }
    
    if(prev_book) {
      fs.unlink(prev_book.path, (err) => {
        if(err) console.error(err);
        console.log(`${prev_book.filename} was deleted`);
      });
    }
	}
	let query = {_id: req.params._id};

	let update = {
		'$set': _book
	};

	let options = { new: true };

	Book.findOneAndUpdate(query, update, options, (err, book) => {
		if(err) {
			console.error(err);
		}
		res.json(book);
	}).populate('keywords');
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

module.exports = router;