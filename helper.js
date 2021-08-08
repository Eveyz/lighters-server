const mongoose = require('mongoose')
const Teacher = require('./models/teacher');
const Notification = require('./models/notification');
const Report = require('./models/report');

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

function aggregateReports(teacher_id, callback) {
	Report.aggregate([
		{
			'$match': {
				'teacher_id': mongoose.Types.ObjectId(teacher_id)
			}
		}, {
			'$group': {
				'_id': {
					'course_date': '$course_date', 
					'course_id': '$course_id'
				}, 
				'count': {
					'$sum': 1
				}
			}
		}, {
			'$group': {
				'_id': null,
				'sum': {
					'$sum': '$count'
				}
			}
		}
	]).exec((err, cnt) => {
		if (err) throw err;
		return callback(cnt)
	})
}

function findOrCreateNotification(tid, cnt) {
	Notification.findOne({teacher_id: tid, count: cnt}, (err, not) => {
		if(err) console.log(err)
		if(!not) {
			Notification.create({teacher_id: tid, count: cnt})
		}
	})
}

async function calculateTeacherCourseNum() {
	let teachers = await Teacher.find({});
	teachers.forEach((teacher) => {
		aggregateReports(teacher._id, (res) => {
			let tid = mongoose.Types.ObjectId(teacher._id)
			if(res.length > 0) {
				let cnt = res[0].sum
				if(cnt >= 5) {
					findOrCreateNotification(tid, 5)
				}
				if(cnt >= 10) {
					findOrCreateNotification(tid, 10)
				}
				if(cnt >= 30) {
					findOrCreateNotification(tid, 30)
				}
				if(cnt >= 100) {
					findOrCreateNotification(tid, 100)
				}
			}
		})
	})
}

module.exports = {
	asyncForEach: asyncForEach,
	calculateTeacherCourseNum: calculateTeacherCourseNum
}