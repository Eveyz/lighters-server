/* 
 * @author: znz

  report n-1 tuition  
  report n-1 paycheck  
  添加反馈表 要减去对应学生的tuition 增加相应老师的paycheck
  删除反馈表 要增加对应学生的tuition 减去相应老师的paycheck 如果老师paycheck反馈表数目为0 则此paycheck也要被删除
*/

var mongoose = require('mongoose');
var Tuition = require('./tuition');
var Paycheck = require('./paycheck');
var Teacher = require('./teacher');
var Course = require('./course');
var Student = require('./student');
var TeacherRate = require('./teacher_rate');
var LevelSalary = require('./level_salary');
const utils = require('../utils');

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
  credit: { type: Number, default: 1 },
  teacher_rate: { type: Number, default: 0 },
  status: { type: String, default: "active" },
  amount: { type: Number, default: 0 },   // 每个反馈表 老师得到的钱
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

reportSchema.pre("save", async function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  await this.calculate()

  next();
});

// reportSchema.post("init", function(doc){
//   if(doc.teacher_rate === 0) {
//     console.log("doc id: ", doc._id)
//     this.db.model('Report').findOne({_id: doc._id}, (err, report) => {
//       report.save()
//     })
//   }
// });

reportSchema.methods.decreaseStudentBalance = async function() {
  let course = await Course.findOne({_id: this.course_id})
  let student = await Student.findOne({_id: this.student_id})
  const _coruse_rate = utils.getStudentReportCredit(this.situation) * course.course_rate
  student.tuition_amount -= _coruse_rate
  await student.save()
};

reportSchema.methods.increaseStudentBalance = async function() {
  let course = await Course.findOne({_id: this.course_id})
  let student = await Student.findOne({_id: this.student_id})
  const _coruse_rate = utils.getStudentReportCredit(this.situation) * course.course_rate
  student.tuition_amount += _coruse_rate
  await student.save()
};

reportSchema.methods.addToPaycheck = function() {
  const _month = this.course_date.substring(0, 7)
  const paycheck_query = {
    teacher_id: this.teacher_id,
    month: _month,
    paid: false
  }
  mongoose.model('Paycheck').findOne(paycheck_query, (err, pc) => {
    if(err) console.error(err);
    if(!pc) {
      const _paycheck = {
        teacher_id: this.teacher_id,
        student_id: this.student_id,
        course_id: this.course_id,
        month: _month,
        reports: [this],
        memo: "老师工资",
        amount: this.amount
      }
      mongoose.model('Paycheck').create(_paycheck, (err, paycheck) => {
        if(err) console.error(err);
      })
    } else {
      pc.amount += this.amount
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
  mongoose.model('Paycheck').findOne(paycheck_query, (err, pc) => {
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
    if(pc.reports.length == 0) {
      // remove paycheck if no reprot exists
      pc.remove()
    } else {
      // otherwise reduce paycheck amount 
      pc.amount -= this.amount
      pc.save()
    }
  })
  callback()
};

reportSchema.methods.calculate = async function() {
  // get report credit according to report situation
  const reportCredit = utils.getReportCredit(this.situation)
  console.log("credit: ", reportCredit)
  this.credit = reportCredit  // update report credit
  // check if teacher have specified rates
  let reportPrice = 0
  const teacher = await Teacher.findOne({_id: this.teacher_id})
  const course = await Course.findOne({_id: this.course_id})
  const _teacher_rates = await TeacherRate.find({teacher_id: this.teacher_id})
  if(_teacher_rates.length > 0) {
    _teacher_rates.forEach(tr => {
      // match the specified rates
      if(tr.course_type === course.type && tr.course_level === course.level) {
        reportPrice = tr.rate
        this.teacher_rate = reportPrice
        console.log("specified found: ", reportPrice)
        return
      }
    })
  }
  // not specified rates found, refer to the standard rates
  if(reportPrice === 0) {
    if(teacher && course) {
      const _ls = await LevelSalary.findOne({course_level: course.level, type: course.type, level: `${teacher.level}级`})
      reportPrice = _ls ? _ls.rate : 0 // if standard rate not setup, then set to 0
    }
    this.teacher_rate = reportPrice // => update report teacher rate
    console.log("reportPrice: ", reportPrice)
  }

  // return final amount
  this.amount = (reportPrice * reportCredit).toFixed(2)
};

reportSchema.methods.recalculatePaycheck = async function() {
  const _month = this.course_date.substring(0, 7)
  const paycheck_query = {
    teacher_id: this.teacher_id,
    month: _month,
    paid: false
  }
  let _amount = 0
  let pc = await mongoose.model('Paycheck').findOne(paycheck_query)
  let reports = await Report.find({_id: {$in: pc.reports}})
  reports.forEach(report => {
    _amount += report.amount 
  })
  pc.amount = _amount
  await pc.save()
}

var Report = mongoose.model('Report', reportSchema);

module.exports = Report;