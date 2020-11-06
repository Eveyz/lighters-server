/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const Teacher = require('../models/teacher');
const Report = require('../models/report');
const TeacherLevel = require('../models/teacher_level');
const _ = require("lodash")
const authenticate = require('../middlewares/authenticate');

/* Get Teachers */
router.get('/', authenticate, (req, res) => {
	if(req.query.group_by) {
		Teacher.find({}, (err, teachers) => {
			if(err) {
				console.error(err);
			}
			var data = {
				"pending": [], 
				"active": [],
				"system": []
			}
			teachers.forEach((teacher) => {
				if(teacher.status === "pending") data["pending"].push(teacher);
				else if(teacher.status === "active" || teacher.status === "RESET_REQUIRED") data["active"].push(teacher);
				if(teacher.temporary) data["system"].push(teacher);
			});
			res.json(data);
		})
	} else {
		Teacher.find(req.query, (err, teachers) => {
			if(err) {
				console.error(err);
			}
			res.json(teachers);
		})
	}
});

/* Get Teacher profile */
router.get('/:_id/profile', (req, res) => {
	var query = {_id: req.params._id};
  
  Teacher.findOne(query, (err, teacher) => {
		if(err) console.error(err);
		Report.find({"teacher_id": req.params._id}, (e, _reports) => {
			if(e) {
				res.json({
					error: true,
					msg: 'Reports not found'
				})
				console.log(e)
			}
			_reports = _.orderBy(_reports, ['course_date'],['desc'])
			var reports = {}
			_reports.forEach(r => {
				let month = r["course_date"].substring(0, 7);
				if(_.isEmpty(reports[month])) {
					reports[month] = [r];
				} else {
					reports[month].push(r);
				}
			})
			TeacherLevel.find({"teacher_id": req.params._id}, (er, ts) => {
				if(er) {
					res.json({
						error: true,
						msg: 'teacher level not found'
					})
					console.log(er)
				}
				res.json({
					"teacher": teacher,
					"reports": reports,
					"teacher_level": ts.length > 0 ? ts[ts.length - 1] : null
				});
			})
		}).populate('course_id', 'name')
  }).populate('courses').populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'books',
			model: 'Book',
			populate: {
				path: 'keywords',
				model: 'Keyword'
			}
    }
  }).populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'students',
      model: 'Student'
    }
  }).populate('students');
});


/* Get Teacher by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Teacher.findOne(query, (err, teacher) => {
    if(err) console.error(err);
    res.json(teacher);
  }).populate('courses').populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'books',
			model: 'Book',
			populate: {
				path: 'keywords',
				model: 'Keyword'
			}
    }
  }).populate({
    path: 'courses',
    model: 'Course',
    populate: {
      path: 'students',
      model: 'Student'
    }
  }).populate('students');
});

/* Create Teacher */
router.post('/', authenticate, (req, res) => {
	var body = req.body;
	Teacher.create(body, function(err, teacher) {
		if(err) {
			console.error(err);
		}
		res.json(teacher);
	})
});

/* Update Teacher */
router.put('/:_id', authenticate, (req, res) => {
  let _teacher = req.body;

  let query = {_id: req.params._id};
	let update = {
		'$set': _teacher
	};

	var options = { new: true }; // newly updated record
	
	let _level = null
	Teacher.findOne(query, (err, teacher) => {
    if(err) console.error(err);
    _level = teacher.level
  })

	Teacher.findOneAndUpdate(query, update, options, (err, teacher) =>{
		if(err) {
			console.error(err);
    }
		if(!teacher) {
      return res.status(404).json({
        error: true,
        msg: 'Teacher not found'
      })
		}
		// record teacher level
		if('level' in _teacher) {
			TeacherLevel.create({
				"firstname": teacher.firstname,
				"lastname": teacher.lastname,
				"englishname": teacher.englishname,
				"level": _teacher['level'],
				"old_level": _level,
				"teacher_id": teacher._id,
				"status": _teacher['level'] > _level ? "UP" : "DOWN"
			}, function(e, tl) {
				if(e) {
					console.error(e)
				}
			})
		}

    res.json(teacher);
	});
});

/* Delete Teacher */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Teacher.remove(query, (err, teachers) => {
		if(err) {
			console.error(err);
		}
		res.json(teachers);
	})
});


module.exports = router;