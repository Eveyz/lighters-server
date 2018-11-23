/* 
 * @author: znz
*/

const fs = require('fs');
const express = require('express');
const path = require('path');
const router = express.Router();
const Report = require('../models/report');
const Keyword = require('../models/keyword');
const Paycheck = require('../models/paycheck');
const mongoose = require('mongoose');
const multer  = require('multer');
import authenticate from '../middlewares/authenticate';
var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/audios/uploads')
  },
  filename: (req, file, callback) => {
    let ext = file.originalname.split('.').pop();
    callback(null, file.fieldname + '-' + Date.now() + '.' + ext)
  }
});
var upload = multer({storage: storage}).array('audios', 10);

/* Get Reports */
router.get('/', authenticate, (req, res) => {
	Report.find(req.query, (err, reports) => {
		if(err) {
			throw err;
		}
		res.json(reports);
	}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name').populate('student_id', 'lastname firstname');
});

/* Get Report by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Report.findOne(query, (err, report) => {
    if(err) throw err;
    res.json(report);
  }).populate('future_books');
});

/* Create Report */
router.post('/', upload, authenticate, (req, res) => {
  let _report = JSON.parse(req.body.report);

  const _teacher_id = mongoose.Types.ObjectId(_report.teacher_id);
  const _course_id = mongoose.Types.ObjectId(_report.course_id);
  const _student_id = mongoose.Types.ObjectId(_report.student_id);
  _report.teacher_id = _teacher_id;
  _report.course_id = _course_id;
  _report.student_id = _student_id;
  _report.audios = [];

  req.files.forEach(file => {
    let _file = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path
    };
    if(_report.audios_files.indexOf(_file) === -1) {
      _report.audios_files.push(_file);
    }
  });
  
	Report.create(_report, function(err, report) {
		if(err) {
			throw err;
		}
    if(!report) {
      return res.status(404).json({
        error: true,
        message: 'Report not found'
      });
    }

    // add report to paycheck
    const _month = report.course_date.substring(0, 7)
    const paycheck_query = {
      teacher_id: _teacher_id,
      student_id: _student_id,
      course_id: _course_id
    }
    Report.findOne(paycheck_query, (err, pc) => {
      if(err) throw err;
      if(!pc) {
        const _paycheck = {
          teacher_id: _teacher_id,
          student_id: _student_id,
          course_id: _course_id,
          month: _month,
          reports: [report]
        }
        Paycheck.create(_paycheck, (err, paycheck) => {
          if(err) console.error(err);
        })
      } else {
        pc.reports.push(report)
      }
    })

    // res
    report.populate('future_books', function(err, r) {
      if(err) {
        throw err;
      }

      res.json(r);
    });

	});
});

/* Update report */
router.post('/:_id', upload, authenticate, (req, res) => {
  let _report = JSON.parse(req.body.report);

  req.files.forEach(file => {
    let _file = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path
    };
    if(_report.audios_files.indexOf(_file) === -1) {
      _report.audios_files.push(_file);
    }
  });
  _report.audios = [];

  _report.removedFiles.forEach(file => {
    fs.unlink(file.path, (err) => {
      if(err) console.error(err);
      console.log(`${file.filename} was deleted`);
    });
  })

  let query = {_id: req.params._id};
	let update = {
		'$set': _report
	};

  var options = { new: true }; // newly updated record

	Report.findOneAndUpdate(query, update, options, (err, report) =>{
		if(err) {
			throw err;
    }
		if(!report) {
      return res.status(404).json({
        error: true,
        message: 'Report not found'
      });
    }
    report.populate('future_books', function(err, r) {
      if(err) {
        throw err;
      }
      res.json(r);
    });
	});
});

/* Upload audios to report */
router.post('/:_id/upload_audios', upload, authenticate, (req, res) => {
  let query = {_id: req.params._id};
  let files = [];
  req.files.forEach(file => {
    files.push({
      originalname: file.originalname,
      filename: file.filename,
      path: file.path
    });
  });

	var update = {
		'$addToSet': {
			"audios": { '$each': files }
		}
	};

	var options = { new: true }; // newly updated record

	Report.findOneAndUpdate(query, update, options, (err, report) =>{
		if(err) {
			throw err;
    }
    if(!report) {
      return res.status(404).json({
        error: true,
        message: 'Report not found'
      });
    }
    report.populate('future_books', function(err, r) {
      if(err) {
        throw err;
      }

      res.json(r);
    });

	});
});

/* Delete Report */
router.delete('/:_id', (req, res) => {
	var query = {_id: req.params._id};
	
	Report.remove(query, (err, reports) => {
		if(err) {
			throw err;
    }
    const response = {
      message: "Report successfully deleted"
    };
		res.json(response);
	})
});


module.exports = router;