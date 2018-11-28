/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Course = require('../models/course');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const jwt = require('jsonwebtoken');
const config = require('../config');
const utils = require('../utils');
const mongoose = require('mongoose');
import authenticate from '../middlewares/authenticate';

/* Get Books */
router.get('/', utils.verifyAdmin, (req, res) => {
  // console.log(req.currentUser);
	Course.find((err, courses) => {
		if(err) {
			console.error(err);
		}
		res.json(courses);
	}).populate('books').populate('teachers', 'lastname firstname englishname').populate('students');
});

/* Get course by id */
router.get('/:_id', authenticate, (req, res) => {
	var query = {_id: req.params._id};
	
	Course.findOne(query, (err, course) => {
		if(err) {
			console.error(err);
		}
		res.json(course);
	}).populate('books').populate('teachers', 'lastname firstname englishname').populate('students');
});

/* Create courses */
router.post('/', utils.verifyAdmin, (req, res) => {
  var course = req.body;

  if(course.teachers.length > 0) {
    let mongoose_ids = [];
    course.teachers.forEach(id => {
      let _id = mongoose.Types.ObjectId(id);
      mongoose_ids.push(_id);
    });
    course.teachers = mongoose_ids;
  }
  
	Course.create(course, function(err, course) {
		if(err) {
			console.error(err);
    }
    course.populate('books').populate('teachers', 'lastname firstname englishname').populate('students', function(err, c) {
      if(err) {
        console.error(err);
      }
      // append course into assign teacher
      c.teachers.forEach(id => {
        Teacher.findOneAndUpdate(
          {_id: id}, 
          {'$addToSet': { 'courses': c.id } }, 
          { new: true }, 
          (err, teacher) => {
          if(err) console.error(err);
        })
      });
      res.json(c);
    });
	})
});

/* Update course */
router.put('/:_id', utils.verifyAdmin, (req, res) => {
  let _course = req.body;

  // update teacher for course
  if(_course.teachers && _course.teachers.length > 0) {
    let mongoose_ids = [];
    _course.teachers.forEach(id => {
      mongoose_ids.push(mongoose.Types.ObjectId(id));
    });
    _course.teachers = mongoose_ids;
  }

  let query = {_id: req.params._id};
	// if the field doesn't exist $set will set a new field
	let update = {
		'$set': _course
  };
  
  // remove course from previous course
  Course.findOne(query, (err, course) => {
		if(err) {
			console.error(err);
    }
    course.teachers.forEach((t) => {
      Teacher.findOne({_id: t._id}, (err, teacher) => {
        if(err) {
          console.error(err);
        }
        teacher.courses.pull(course._id)
        teacher.save()
      })
    })
  })

	var options = { new: true }; // newly updated record

	Course.findOneAndUpdate(query, update, options, (err, course) =>{
		if(err) {
			console.error(err);
    }

    course.populate('books').populate('teachers', 'lastname firstname englishname').populate('students', function(err, c) {
      if(err) {
        console.error(err);
      }

      if(_course.teachers) {
        // append course into assign teacher
        c.teachers.forEach(id => {
          Teacher.findOneAndUpdate(
            {_id: id}, 
            {'$addToSet': { 'courses': c.id } }, 
            options, 
            (err, teacher) => {
            if(err) console.error(err);
          })
        });
      }

      res.json(c);
    });
	});
});

/* Delete course */
router.delete('/:_id', utils.verifyAdmin, (req, res) => {
  var query = {_id: req.params._id};
	
  Course.findOneAndRemove(query, (err, course) => {
		if (err) {
			return res.json({success: false, msg: 'Cannot remove course'});
		}
		if (!course) {
			return res.status(404).json({success: false, msg: 'Course not found'});
		}
    res.json({success: true, msg: 'Course deleted.'});
  });
});

/* Add student */
router.post('/:_id/post_student', utils.verifyAdmin, (req, res) => {
  let query = {_id: req.params._id};
  let body = req.body;

  let update = {
    '$addToSet': {
      "students": body.studentID
    }
  }

  let options = {new: true};

  Course.findOneAndUpdate(query, update, options, (err, course) => {
    if(err) throw(err);

    course.populate('books').populate('teachers', 'lastname firstname englishname').populate('students', function(err, c) {
      if(err) {
        console.error(err);
      }

      // append course into assign teacher
      c.students.forEach(id => {
        Student.findOneAndUpdate(
          {_id: id}, 
          {'$addToSet': { 'courses': c.id } }, 
          options, 
          (err, student) => {
            if(err) console.error(err);
          }
        )
      });

      res.json(c);
    });
  });
});

/* Delete student */
router.put('/:_id/delete_student', utils.verifyAdmin, (req, res) => {
  let query = {_id: req.params._id};
  let body = req.body;

  let update = {
    '$pull': {
      "students": body.studentID
    }
  }

  let options = {new: true};

  Course.findOneAndUpdate(query, update, options, (err, course) => {
    if(err) throw(err);
    
    course.populate('books').populate('teachers', 'lastname firstname englishname').populate('students', function(err, c) {
      if(err) {
        console.error(err);
      }
      // append course into assign teacher
      c.students.forEach(id => {
        Student.findOneAndUpdate(
          {_id: id}, 
          {'$pull': { 'courses': c.id } }, 
          options, 
          (err, student) => {
          if(err) console.error(err);
        })
      });

      res.json(c);
    });

  });
});

/* Add book */
router.post('/:_id/post_book', utils.verifyAdmin, (req, res) => {
  let query = {_id: req.params._id};
  let body = req.body;

  let update = {
    '$push': {
      "books": body.bookID
    }
  }

  let options = {new: true};

  Course.findOneAndUpdate(query, update, options, (err, course) => {
    if(err) throw(err);
    res.json(course);
  }).populate('books').populate('teachers', 'lastname firstname englishname').populate('students', 'lastname firstname');
});

/* Delete book */
router.put('/:_id/delete_book', utils.verifyAdmin, (req, res) => {
  let query = {_id: req.params._id};
  let body = req.body;

  let update = {
    '$pull': {
      "books": body.bookID
    }
  }

  let options = {new: true};

  Course.findOneAndUpdate(query, update, options, (err, course) => {
    if(err) throw(err);
    res.json(course);
  }).populate('books').populate('teachers', 'lastname firstname englishname').populate('students', 'lastname firstname');
});

module.exports = router;