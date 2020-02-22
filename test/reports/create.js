const assert = require('assert')
const User = require('../../models/user')
const Student = require('../../models/student')
const Teacher = require('../../models/teacher')
const Course = require('../../models/course')
const Report = require('../../models/report')
const Tuition = require('../../models/tuition')
const TeacherRate = require('../../models/teacher_rate')

describe('Create documents', () => {
  it('create a new report', async () => {

    const user_teacher = await User.create({
      "status" : "active",
      "adminCreated" : true,
      "admin" : false,
      "remember" : false,
      "consent" : false,
      "identity" : "teacher",
      "username" : "T19036",
      "email" : "tlighters@lighters.com",
      "temporaryPassword" : "T19036",
      "password" : "fortestonly",
      "passwordCon" : "fortestonly"
    })
    assert(!user_teacher.isNew)

    const user_student = await User.create({
      "status" : "active",
      "adminCreated" : true,
      "admin" : false,
      "remember" : false,
      "consent" : false,
      "identity" : "student",
      "username" : "S19036",
      "email" : "slighters@lighters.com",
      "temporaryPassword" : "S19036",
      "password" : "fortestonly",
      "passwordCon" : "fortestonly"
    })
    assert(!user_student.isNew)

    const teacher = await Teacher.create({
      "level" : 1,
      "status" : "active",
      "consent" : false,
      "certificates" : [],
      "students" : [],
      "courses" : [],
      "firstname" : "You",
      "lastname" : "Me",
      "englishname" : "MeandYou",
      "age" : 25,
      "birthday" : "",
      "gender" : "男",
      "city" : "Oxford",
      "user_id" : user_teacher._id,
      "systemid" : "T19036",
      "temporary" : "T19036",
    })
    assert(!teacher.isNew)

    const student = await Student.create({
      "expectation" : [],
      "consent" : false,
      "status" : "active",
      "recording" : [],
      "teachers" : [],
      "courses" : [],
      "firstname" : "曾",
      "lastname" : "宁宙",
      "englishname" : "Eve",
      "age" : 6,
      "tuition_amount" : 1000,
      "birthday" : "",
      "gender" : "女",
      "city" : "Oxford",
      "user_id" : user_student._id,
      "systemid" : "S19036",
      "temporary" : "S19036",
    })
    assert(!student.isNew)

    const course = new Course({
      "status" : "active",
      "books" : [],
      "teachers" : [],
      "interim_teachers" : [],
      "students" : [],
      "reports" : [],
      "time_slot" : [],
      "name" : "课程测试2",
      "level" : "中级上",
      "type" : "一对一",
      "course_rate" : 100
    })
    course.teachers.push(course._id)
    course.students.push(student._id)
    course.save()
          .then(() => {
            assert(!course.isNew)
            // done()
          })

    const teacher_rate = await TeacherRate.create({
      "teacher_id" : teacher._id,
      "course_type" : "一对一",
      "course_level" : "中级上",
      "rate" : 200,
    })

    const report = new Report({
      "status": "active",
      "teacher_id": teacher._id,
      "student_id": student._id,
      "course_id": course._id,
      "situation": "正常上课"
    })
    report.save()
          .then(() => {
            assert(!report.isNew)
            // assert(student.tuition_amount === 900)
          })
  })
})