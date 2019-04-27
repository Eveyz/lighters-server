/* 
 * @author: znz
*/

const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Course = require('../models/course');
const Student = require('../models/student');
const Report = require('../models/report');
const multer  = require('multer');
const authenticate = require('../middlewares/authenticate');
const utils = require('../utils');

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
			console.error(err);
		}
		res.json(reports);
	}).sort({created_at: -1}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name course_rate').populate('student_id', 'lastname firstname englishname')
});

/* Copy Report */
router.get('/copy_report', authenticate, (req, res) => {
  var _query = {_id: req.query.report_id};
	Report.findOne(_query, (err, _report) => {
		if(err) {
			console.error(err);
    }
    if(!_report) {
      console.error("Report not found")
    }
    const copy = {
      teacher_id: req.query.teacher_id,
      course_id: req.query.course_id,
      student_id: req.query.student_id,
      course_date: _report.course_date || "",
      start_time: _report.start_time || "",
      end_time: _report.end_time || "",
      course_content: _report.course_content || [],
      tutor_comment: _report.tutor_comment || "",
      homework: _report.homework || "",
      external_link: _report.external_link || "",
      audios: _report.audios || [],
      audios_files: _report.audios_files || [],
      paid: false,
      credit: _report.credit || 1,
      status: _report.status || "active",
      situation: _report.situation || "",
      focus: _report.focus
    }
    Report.create(copy, function(err, report) {
      if(err) {
        console.error(err);
      }
      if(!report) {
        return res.status(404).json({
          error: true,
          msg: 'Report not found'
        });
      }
      // decrease course hour for student tuition
      report.decreaseStudentBalance()
      
      report.addToPaycheck()

      res.json(report);
    });
	});
});

/* Get Report by id */
router.get('/:_id', (req, res) => {
	var query = {_id: req.params._id};
  
  Report.findOne(query, (err, report) => {
    if(err) console.error(err);
    res.json(report);
  }).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name').populate('student_id', 'lastname firstname englishname');
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
			console.error(err);
		}
    if(!report) {
      return res.status(404).json({
        error: true,
        msg: 'Report not found'
      });
    }

    // decrease course hour for student tuition
    report.decreaseStudentBalance()

    // add report to paycheck
    report.addToPaycheck()

    // res
    res.json(report);

	});
});

/* Update report */
router.post('/:_id', upload, authenticate, async (req, res) => {
  let _report = JSON.parse(req.body.report);

  if(req.files) {
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
    
    if(_report.removedFiles) {
      _report.removedFiles.forEach(file => {
        fs.unlink(file.path, (err) => {
          if(err) console.error(err);
          console.log(`${file.filename} was deleted`);
        });
      })
    }
  }

  let query = {_id: req.params._id};
	let update = {
		'$set': _report
	};

  var options = { new: true }; // newly updated record

  const prev_report = await Report.findOne(query)
  const previousSituation = prev_report.situation
  const prev_course_month = prev_report.course_date.substring(0, 7)
  let course = await Course.findOne({_id: prev_report.course_id})
  let student = await Student.findOne({_id: prev_report.student_id})

	Report.findOneAndUpdate(query, update, options, (err, report) => {
		if(err) {
			console.error(err);
    }
		if(!report) {
      return res.status(404).json({
        error: true,
        msg: 'Report not found'
      });
    }

    // recalculate student balance
    const _credit = utils.getStudentReportCredit(report.situation)
    student.tuition_amount += (utils.getStudentReportCredit(previousSituation) - _credit) * course.course_rate
    student.save()

    // if month changes, remove report from previous month paycheck and add to new month paycheck
    if(prev_course_month !== report.course_date.substring(0, 7)) {
      report.updatePaycheckReports(prev_course_month)
    }

    // save to trigger calculate amount and updated time
    report.save().then(() => {
      // report updated, need to recalculate paycheck amount
      report.recalculatePaycheck()
    })

    res.json(report);
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
			console.error(err);
    }
    if(!report) {
      return res.status(404).json({
        error: true,
        msg: 'Report not found'
      });
    }
    report.populate('future_books', function(err, r) {
      if(err) {
        console.error(err);
      }

      res.json(r);
    });

	});
});

/* Delete Report */
router.delete('/:_id', (req, res) => {
  var query = {_id: req.params._id};
  
  // increase course hour for student tuition
  Report.findOne(query, async (err, report) => {
    if(err) {
      console.error(err)
    }
    if(!report) {
      return res.status(404).json({
        success: false,
        msg: 'Report not found'
      });
    }
    
    report.increaseStudentBalance()

    report.removeFromPaycheck((error) => {
      Report.remove(query, (err, reports) => {
      	if(err) {
      		return res.status(404).json({
            success: false,
            msg: 'Report not found'
          });
        }
    
        const response = {
          success: true,
          msg: "Report successfully deleted"
        };
        console.log("called")
      	res.json(response);
      })
    })
  })
	
});


module.exports = router;