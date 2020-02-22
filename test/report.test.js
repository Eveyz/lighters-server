const mocha = require('mocha')
const assert = require('assert')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

const User = require('../models/user')
const Student = require('../models/student')
const Teacher = require('../models/teacher')
const Course = require('../models/course')
const Report = require('../models/report')
const LevelSalary = require('../models/level_salary')
const Paycheck = require('../models/paycheck')

chai.use(chaiHttp)

describe('Report API test', () => {
  var user_student, user_teacher, teacher, student, ls, course, report, copied_report

  before(async () => {
    user_teacher = new User({
      username: "T19010",
      identity: "teacher",
      password: "123456",
      passwordCon: '123456',
      email: 'test1@gmail.com'
    })
    await user_teacher.save()
    assert(user_teacher.isNew === false)

    user_student = new User({
      username: "S19019",
      identity: "student",
      password: "123456",
      passwordCon: '123456',
      email: 'test2@gmail.com'
    })
    await user_student.save()
    assert(user_student.isNew === false)

    teacher = new Teacher({
      user_id: user_teacher._id,
      level: 10
    })
    await teacher.save()
    assert(teacher.isNew === false)

    student = new Student({
      user_id: user_student._id,
      tuition_amount: 1000
    })
    await student.save()
    assert(student.isNew === false)

    ls = new LevelSalary({
      level: "10级",
      rate: 200,
      type: "一对一",
      course_level: "启蒙",
    })
    await ls.save()
    assert(ls.isNew === false)

    course = new Course({
      teachers: [user_teacher._id],
      students: [user_student._id],
      level: "启蒙",
      type: "一对一",
      course_rate: 100
    })
    await course.save()
    assert(course.isNew === false)
  })

  describe('/GET teachers', () => {
    it('it should GET all the teachers', (done) => {
      chai.request(server)
          .get('/teachers')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(1)
            done()
          })
    })
  })

  describe('/GET reports', () => {
    it('it should GET all the reports', (done) => {
      chai.request(server)
          .get('/reports')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
    })
  })

  describe('/POST reports', () => {
    it('it should post a new report', (done) => {
      const _report = {
        report: JSON.stringify({
          teacher_id: teacher._id,
          student_id: student._id,
          course_id: course._id,
          situation: "正常上课",
          course_date: "2019-04-28",
          start_time: "08:40 PM",
          end_time: "09:45 PM",
          course_content: [ 
            {
              "keywords" : "详见pdf课件: 高亮蓝色方框里是要记住掌握的词汇，红色为重要的生词，绿色为背景词汇了解。",
              "ratio" : "30",
              "type" : "翻译",
              "serialName" : "Dinosaurs Before Dark 百科46-59页",
              "category" : "MTH百科"
            }
          ],
          tutor_comment: "<p>copy content here should also be working why not</p>",
          homework: "<p>homework not yet specified</p>"
        })
      }
  
      chai.request(server)
          .post('/reports')
          .send(_report)
          .end(async (err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')

            report = res.body
            // check report credit and amount
            assert(report.credit === 1)
            assert(report.amount === 200)

            const updated_student = await Student.findOne({_id: report.student_id})
            // check if student tuition amount is decreased
            assert(updated_student.tuition_amount === 900)

            // create paycheck and add report to paycheck
            const paycheck = await Paycheck.findOne({
              teacher_id: report.teacher_id,
              student_id: report.student_id,
              course_id: report.course_id,
              month: report.course_date.substring(0, 7)
            })
            assert(paycheck !== null)
            assert(!paycheck.isNew)
            // report is in paycheck reports
            assert.notEqual(-1, paycheck.reports.indexOf(report._id))

            done()
          })
    })
  })

  describe('/COPY reports', () => {
    it('it should copy a previous report', (done) => {
      chai.request(server)
          .get(`/reports/copy_report?report_id=${report._id}&course_id=${course._id}&student_id=${student._id}&teacher_id=${teacher._id}`)
          .end(async (err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')

            copied_report = res.body
            assert(copied_report.credit === 1)
            assert(copied_report.amount === 200)
            assert.equal(copied_report.tutor_comment, report.tutor_comment)
            assert.equal(copied_report.homework, report.homework)
            assert(copied_report !== null)
            assert(!copied_report.isNew)
            assert(copied_report !== report._id)

            const updated_student = await Student.findOne({_id: copied_report.student_id})
            // check if student tuition amount is decreased
            assert.equal(updated_student.tuition_amount, 800)

            // create paycheck and add report to paycheck
            const paycheck = await Paycheck.findOne({
              teacher_id: copied_report.teacher_id,
              student_id: copied_report.student_id,
              course_id: copied_report.course_id,
              month: copied_report.course_date.substring(0, 7)
            })
            assert(paycheck !== null)
            assert(!paycheck.isNew)
            // report is in paycheck reports
            assert.notEqual(-1, paycheck.reports.indexOf(copied_report._id))

            done()
          })
    })
  })

  describe('/UPDATE report', () => {
    it('update report with same month', (done) => {
      const _report = {
        report: JSON.stringify({
          teacher_id: teacher._id,
          student_id: student._id,
          course_id: course._id,
          situation: "正常上课",
          course_date: "2019-04-30",
          start_time: "08:40 PM",
          end_time: "09:45 PM",
          course_content: [ 
            {
              "keywords" : "详见pdf课件: 高亮蓝色方框里是要记住掌握的词汇，红色为重要的生词，绿色为背景词汇了解。",
              "ratio" : "30",
              "type" : "翻译",
              "serialName" : "Dinosaurs Before Dark 百科46-59页",
              "category" : "MTH百科"
            }
          ],
          tutor_comment: "<p>copy content here should also be working why not, yep its not the same</p>",
          homework: "<p>homework not yet specified not the same</p>"
        })
      }

      chai.request(server)
          .post(`/reports/${copied_report._id}`)
          .send(_report)
          .end(async (err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')

            const _r = res.body
            assert(_r.credit === 1)
            assert(_r.amount === 200)
            assert.notEqual(_r.tutor_comment, copied_report.tutor_comment)
            assert.notEqual(_r.homework, copied_report.homework)
            assert(_r !== null)
            assert(!_r.isNew)
            assert.equal(_r._id, copied_report._id)

            const updated_student = await Student.findOne({_id: _r.student_id})
            // check if student tuition amount is decreased
            assert.equal(updated_student.tuition_amount, 800)

            // create paycheck and add report to paycheck
            const paycheck = await Paycheck.findOne({
              teacher_id: _r.teacher_id,
              student_id: _r.student_id,
              course_id: _r.course_id,
              month: _r.course_date.substring(0, 7)
            })

            assert(paycheck !== null)
            assert(!paycheck.isNew)
            assert.equal(paycheck.month, report.course_date.substring(0, 7))
            // report is in paycheck reports
            assert.equal(2, paycheck.reports.length)
            assert.notEqual(-1, paycheck.reports.indexOf(_r._id))

            done()
          })
    })
    it('update report with different month', (done) => {
      const _report = {
        report: JSON.stringify({
          teacher_id: teacher._id,
          student_id: student._id,
          course_id: course._id,
          situation: "正常上课",
          course_date: "2019-05-1",
          start_time: "08:40 PM",
          end_time: "09:45 PM",
          course_content: [ 
            {
              "keywords" : "详见pdf课件: 高亮蓝色方框里是要记住掌握的词汇，红色为重要的生词，绿色为背景词汇了解。",
              "ratio" : "30",
              "type" : "翻译",
              "serialName" : "Dinosaurs Before Dark 百科46-59页",
              "category" : "MTH百科"
            }
          ],
          tutor_comment: "<p>copy content here should also be working why not, yep its not the same</p>",
          homework: "<p>homework not yet specified not the same</p>"
        })
      }

      chai.request(server)
          .post(`/reports/${copied_report._id}`)
          .send(_report)
          .end(async (err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')

            const _r = res.body
            assert(_r.credit === 1)
            assert(_r.amount === 200)
            assert.notEqual(_r.tutor_comment, copied_report.tutor_comment)
            assert.notEqual(_r.homework, copied_report.homework)
            assert(_r !== null)
            assert(!_r.isNew)
            assert.equal(_r._id, copied_report._id)

            const updated_student = await Student.findOne({_id: _r.student_id})
            // check if student tuition amount is decreased
            assert.equal(updated_student.tuition_amount, 800)

            // create paycheck and add report to paycheck
            const prev_paycheck = await Paycheck.findOne({
              teacher_id: report.teacher_id,
              student_id: report.student_id,
              course_id: report.course_id,
              month: report.course_date.substring(0, 7)
            })

            const new_paycheck = await Paycheck.findOne({
              teacher_id: _r.teacher_id,
              student_id: _r.student_id,
              course_id: _r.course_id,
              month: _r.course_date.substring(0, 7)
            })

            assert(new_paycheck !== null)
            assert(!new_paycheck.isNew)
            assert.notEqual(new_paycheck.month, report.course_date.substring(0, 7))
            // report is in paycheck reports
            assert.equal(-1, prev_paycheck.reports.indexOf(_r._id))
            assert.notEqual(-1, new_paycheck.reports.indexOf(_r._id))

            done()
          })
    })
  })

  describe('/DELETE report', () => {
    it('it should delete a report', (done) => {
      const id = copied_report._id
      chai.request(server)
          .del(`/reports/${id}`)
          .end(async (err, res) => {
            res.should.have.status(200)

            const _r = await Report.findOne({_id: id})
            assert.equal(_r, null)

            const updated_student = await Student.findOne({_id: copied_report.student_id})
            // check if student tuition amount is decreased
            assert.equal(updated_student.tuition_amount, 900)

            // create paycheck and add report to paycheck
            const paycheck = await Paycheck.findOne({
              teacher_id: copied_report.teacher_id,
              student_id: copied_report.student_id,
              course_id: copied_report.course_id,
              month: copied_report.course_date.substring(0, 7)
            })
            assert(paycheck !== null)
            assert(!paycheck.isNew)
            // report is in paycheck reports
            assert.equal(-1, paycheck.reports.indexOf(copied_report._id))

            done()
          })
    })
  })

  after(() => {
    // mongoose.connection.close()
  })
})