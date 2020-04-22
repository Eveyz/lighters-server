/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const _ = require('lodash');
const router = express.Router();
const User = require('../models/user');
const Book = require('../models/book');
const Course = require('../models/course');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Paycheck = require('../models/paycheck');
const Audit = require('../models/audit');
const jwt = require('jsonwebtoken');
const config = require('../config');
const utils = require('../utils');

function getRequestIpAddress(request) {
  const requestIpAddress = request.headers['X-Forwarded-For'] || request.connection.remoteAddress
  if (!requestIpAddress) return null

  const ipv4 = new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)")

  const [ipAddress] = requestIpAddress.match(ipv4)

  return ipAddress
}

router.post('/authenticate', (req, res) => {
  if(req.body.username && req.body.password) {
    // audit user ip
    let ip = getRequestIpAddress(req)
    Audit.create({
      username: req.body.username,
      remote_ip: ip
    }, function(err, book) {
      if(err) {
        console.error(err);
      }
    });
    
    User.findOne({ username: req.body.username }, async function(err, user) {
      if(err) console.error(err);
      if(!user) {
        return res.status(404).json({
          error: true,
          status: 'error',
          msg: '用户不存在'
        });
      } else {
        // User found, Don't include sensitive information in the token
        const userTokenData = {
          id: user.id, 
          username: user.username, 
          email: user.email, 
          identity: user.identity, 
          status: user.status
        };
        await user.validPassword(req.body.password, function(err, isMatch) {
          if(err) console.error(err);
          console.log('Password:', isMatch);
          if(!isMatch) {
            return res.status(404).json({
              success: false,
              status: 'error',
              msg: '密码错误'
            });
          } else {
            // password is right
            const _expiredIn = req.body.remember_me ? '7d' : '48h';
            jwt.sign({userTokenData}, config.jwtSecret, { expiresIn: _expiredIn}, (err, token) => {
              if(err) console.error(err);
              if(user.identity === "teacher") {
                Teacher.findOne({ user_id: user._id }, (err, teacher) => {
                  if(err) console.error(err);
    
                  if(!teacher) {
                    return res.status(301).json({
                      token: token,
                      teacher: ""
                    });
                  }
                  res.json({
                    token: token,
                    teacher: teacher
                  });
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
              } else if (user.identity === "student") {
                Student.findOne({ user_id: user._id }, (err, student) => {
                  if(err) console.error(err);
    
                  if(!student) {
                    return res.status(301).json({
                      token: token,
                      student: ""
                    });
                  }
    
                  res.json({
                    token: token,
                    student: student
                  });
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
                    path: 'teachers',
                    model: 'Teacher'
                  }
                }).populate('teachers');
              } else {
                res.json({
                  token
                })
              }
              // response to login successfully => reducer => res.data.token
            });
          }
        });
      }
    });
  } else {
    res.status(400).json({
      error: true,
      status: 'error',
      msg: '邮箱或密码不能为空'
    });
  }
});

/* Signup User */
router.post('/', (req, res) => {
	if(req.body.email && req.body.password && req.body.passwordCon) {
    const newUser = new User({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      status: req.body.status,
      identity: req.body.identity,
			password: req.body.password,
			passwordCon: req.body.passwordCon
    });

    newUser.save((err) => {
      if(err) console.error(err);
      const userTokenData = {
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        identity: newUser.identity, 
        status: newUser.status
      };
      jwt.sign({userTokenData}, config.jwtSecret, { expiresIn: '48h'}, (err, token) => {
        res.json({
          token
        })
      });
    });
	} else {
    res.status(300).json({'error': 'Missing information'});
  }

});

/* Activate User */
router.post('/:_id/activate', (req, res) => {
	if(req.body.id && req.body.email && req.body.password && req.body.passwordCon) {
    User.findOne({ _id: req.body.id }, function(err, user) {
      if(err) console.error(err);
      user.email = req.body.email;
      user.password = req.body.password;
      user.passwordCon = req.body.passwordCon;
      user.status = "active";

      user.save(function(err){
        if(err) return console.error(err);
        //user has been updated
        res.status(200).json({'msg': 'User activated!'});
      });

    })
	} else {
    res.status(300).json({'error': 'Missing information'});
  }

});

// //get current user from token
router.get('/from/token', utils.verifyToken, (req, res) => {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({msg: 'Must pass token'});
  }
  jwt.verify(token, config.jwtSecret, (err, tokenData) => {
    if(err) {
      if(err.name === "TokenExpiredError") {
        console.log("it's expired");
      }
      res.sendStatus(401).json({msg: "it's expired"});
    } else {
      User.findById({'_id': tokenData.userTokenData.id}, function(err, user) {
        if(err) console.error(err);
      })
      res.json({
        user: tokenData,
        token: token
      });
    }
  });
});

router.get('/admin/init', utils.verifyAdmin, async (req, res) => {
  var _books, _courses, _students, _teachers, _paychecks;

  _books = await Book.estimatedDocumentCount({})
  _courses = await Course.estimatedDocumentCount({})
  _students = await Student.estimatedDocumentCount({})
  _teachers = await Teacher.estimatedDocumentCount({})
  _paychecks = await Paycheck.find({"paid": false})

  res.json({
    books: _books,
    courses: _courses,
    students: _students,
    teachers: _teachers,
    paychecks: _paychecks.length
  })
});

// // routes that need to be authenticated

// router.get('/authenticated', verifyToken, (req, res) => {
//   // check header or url parameters or post parameters for token
//   var token = req.headers['authorization'];
//   if (!token) return next();
//   jwt.verify(token, 'eveyzznz', (err, user) => {
//     if(err) {
//       res.sendStatus(403).json({
//         success: false,
//         msg: 'Please register or login in.'
//       });
//     } else {
//       req.user = user; //set the user to req so other routes can use it
//       next();
//     }
//   });
// });

module.exports = router;