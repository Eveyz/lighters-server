/* 
 * @author: znz
*/

const fs = require('fs');
const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const Paycheck = require('../models/paycheck');
const mongoose = require('mongoose');
const multer  = require('multer');
const authenticate = require('../middlewares/authenticate');
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
	}).populate('teacher_id', 'lastname firstname englishname').populate('course_id', 'name').populate('student_id', 'lastname firstname').populate('future_books');
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
      paid: _report.paid || false,
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
          message: 'Report not found'
        });
      }
  
      // add report to paycheck
      const _month = report.course_date.substring(0, 7)
      const paycheck_query = {
        teacher_id: report.teacher_id,
        month: _month,
        paid: false
      }
      Paycheck.findOne(paycheck_query, (err, pc) => {
        if(err) console.error(err);
        if(!pc) {
          const _paycheck = {
            teacher_id: report.teacher_id,
            student_id: report.student_id,
            course_id: report.course_id,
            month: _month,
            reports: [report],
            memo: "老师工资"
          }
          Paycheck.create(_paycheck, (err, paycheck) => {
            if(err) console.error(err);
          })
        } else {
          pc.reports.push(report)
          pc.save()
        }
      })
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
        message: 'Report not found'
      });
    }

    // add report to paycheck
    const _month = report.course_date.substring(0, 7)
    const paycheck_query = {
      teacher_id: _teacher_id,
      month: _month,
      paid: false
    }
    Paycheck.findOne(paycheck_query, (err, pc) => {
      if(err) console.error(err);
      if(!pc) {
        const _paycheck = {
          teacher_id: _teacher_id,
          student_id: _student_id,
          course_id: _course_id,
          month: _month,
          reports: [report],
          memo: "老师工资"
        }
        Paycheck.create(_paycheck, (err, paycheck) => {
          if(err) console.error(err);
        })
      } else {
        pc.reports.push(report)
        pc.save()
      }
    })

    // res
    report.populate('future_books', function(err, r) {
      if(err) {
        console.error(err);
      }

      res.json(r);
    }).populate('future_books');

	});
});

/* Update report */
router.post('/:_id', upload, authenticate, (req, res) => {
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

	Report.findOneAndUpdate(query, update, options, (err, report) =>{
		if(err) {
			console.error(err);
    }
		if(!report) {
      return res.status(404).json({
        error: true,
        message: 'Report not found'
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
        message: 'Report not found'
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
	
	Report.remove(query, (err, reports) => {
		if(err) {
			console.error(err);
    }
    const response = {
      success: true,
      message: "Report successfully deleted"
    };
		res.json(response);
	})
});


module.exports = router;