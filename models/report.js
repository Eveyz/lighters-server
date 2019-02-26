/* 
 * @author: znz

 report n-1 tuition  
 report n-1 paycheck  
*/

var mongoose = require('mongoose');
var Tuition = require('../models/tuition');
var Paycheck = require('../models/paycheck');

var reportSchema = new mongoose.Schema({
  teacher_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
  course_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Course'},
  student_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
  situation: String,
  reason: String,
  course_date: String,
  duration: Number,
  report_number: Number,
  focus: Number,
  type: String,
  course_content: [],
  tutor_comment: String,
  homework: String,
  start_time: String,
  end_time: String,
  external_link: String,
  review_books: [],
  new_books: [],
  future_books: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Book'} ],
  audios: [],
  audios_files: [],
  paid: { type: Boolean, default: false },
  credit: { type: Boolean, default: 1 },
  status: { type: String, default: "active" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

reportSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

reportSchema.methods.decreaseTuitionCourseHour = function() {
  let _query = {course_id: this.course_id, student_id: this.student_id}
  this.db.model('Report').find(_query, (err, reports) => {
    if(err) {
      return res.status(404).json({
        success: false,
        msg: 'Tuitions not found'
      });
    }
    let reportNumber = reports.length
    Tuition.findOne(_query, (err, tuition) => {
      if(err) {
        return res.status(404).json({
          success: false,
          msg: 'Tuition not found'
        });
      }
      tuition.remain = tuition.course_hour - reportNumber
      tuition.save()
    })
  })
};

reportSchema.methods.increaseTuitionCourseHour = function() {
  let _query = {course_id: this.course_id, student_id: this.student_id}
  Tuition.findOne(_query, (err, tuition) => {
    if(err) {
      return res.status(404).json({
        success: false,
        msg: 'Tuition not found'
      });
    }
    tuition.remain = tuition.remain + 1
    tuition.save()
  })
};

reportSchema.methods.addToPaycheck = function() {
  const _month = this.course_date.substring(0, 7)
  const paycheck_query = {
    teacher_id: this.teacher_id,
    month: _month,
    paid: false
  }
  Paycheck.findOne(paycheck_query, (err, pc) => {
    if(err) console.error(err);
    if(!pc) {
      const _paycheck = {
        teacher_id: this.teacher_id,
        student_id: this.student_id,
        course_id: this.course_id,
        month: _month,
        reports: [this],
        memo: "老师工资"
      }
      Paycheck.create(_paycheck, (err, paycheck) => {
        if(err) console.error(err);
      })
    } else {
      pc.reports.push(this)
      pc.save()
    }
  })
};

reportSchema.methods.removeFromPaycheck = function(callback) {
  const _month = this.course_date.substring(0, 7)
  const paycheck_query = {
    teacher_id: this.teacher_id,
    month: _month,
    paid: false
  }
  Paycheck.findOne(paycheck_query, (err, pc) => {
    if(err) {
      console.error(err)
    }
    if(!pc) {
      return res.status(404).json({
        success: false,
        msg: 'Paycheck not found'
      });
    }
    pc.reports = pc.reports.filter(report_id => report_id.toString() !== this._id.toString())
    pc.save()
  })
  callback()
};

var Report = mongoose.model('Report', reportSchema);
module.exports = Report;