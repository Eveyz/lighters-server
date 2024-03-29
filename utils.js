const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./models/user');

// Format of token
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers['authorization'];
  // check if bearer is undefined
  if(typeof(bearerHeader) !== "undefined") {
    // split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token to req
    req.body.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

function verifyAdmin(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  let token;
  if(authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
  }

  if(token) {
    jwt.verify(token, config.jwtSecret, (err, tokenData) => {
      if(err) { 
        res.status(401).json({error: 'Failed to authenticate token'}); 
      } else {
        User.findById({'_id': tokenData.userTokenData.id}, function(err, user) {
          if(err) console.error(err);

          if(!user) {
            res.status(404).json({error: 'No such user'});
          }
          if(!user.isAdmin) {
            res.status(401).json({error: 'Unauthorized!'});
          }

          req.currentUser = user;
          next();
        });
      }
    });
  } else {
    next();
  }
}

function getStudyID(number) {
  let res;
  let sum = parseInt(number) + 10;
  switch(true) {
    case (sum < 100):
      res = "0" + sum;
      break;
    case (sum < 1000):
      res = sum.toString();
      break;
    default:
      res = `${sum}`;
      break;
  }
  return res;
}

function getReportCredit(situation) {
  let res;
  switch(situation) {
    case ("正常上课"):
    case ("平台赠课或一对一学员特殊情况首次缺课"):
    case ("学员上课时间后才请假或无故缺课(1个课时费)"):
    case ("学员迟到(不必补全课时, 可按时下课, 1个课时费)"):
    case ("老师迟到早退10分钟以内(需免费于当堂或下堂课补全课时才可得1个课时费, 但会影响薪资晋级)"):
    case ("代课(1个课时费)"):
    case ("小组课单个学员首次请假(学员付0.5课时费观看上课录屏, 老师照旧获1课时费)"):
    case ("小组课单个学员非首次请假(学员付1课时费观看上课录屏, 老师获1课时费)"):
      res = 1;
      break;
    case ("学员开课前2小时内才请假(0.5个课时费)"):
    case ("老师无故迟到10分钟以上20分钟以内并且课程依旧进行(0.5个课时费)"):
      res = 0.5;
      break;
    case ("老师无故迟到并且取消课程(0个课时费, 需免费补课一节)"):
    case ("免费补课(0个课时费)"):
    case ("试课"):
      res = 0;
      break;
    default:
      res = 0;
      break;
  }
  return res;
}

function getStudentReportCredit(situation) {
  let res;
  switch(situation) {
    case ("正常上课"):
    case ("学员上课时间后才请假或无故缺课(1个课时费)"):
    case ("学员迟到(不必补全课时, 可按时下课, 1个课时费)"):
    case ("老师迟到早退10分钟以内(需免费于当堂或下堂课补全课时才可得1个课时费, 但会影响薪资晋级)"):
    case ("代课(1个课时费)"):
    case ("小组课单个学员非首次请假(学员付1课时费观看上课录屏, 老师获1课时费)"):
      res = 1;
      break;
    case ("学员开课前2小时内才请假(0.5个课时费)"):
    case ("老师无故迟到10分钟以上20分钟以内并且课程依旧进行(0.5个课时费)"):
    case ("小组课单个学员首次请假(学员付0.5课时费观看上课录屏, 老师照旧获1课时费)"):
      res = 0.5;
      break;
    case ("老师无故迟到并且取消课程(0个课时费, 需免费补课一节)"):
    case ("免费补课(0个课时费)"):
    case ("试课"):
    case ("平台赠课或一对一学员特殊情况首次缺课"):
      res = 0;
      break;
    default:
      res = 0;
      break;
  }
  return res;
}

module.exports = {
  verifyToken: verifyToken,
  verifyAdmin: verifyAdmin,
  getStudyID: getStudyID,
  getReportCredit: getReportCredit,
  getStudentReportCredit: getStudentReportCredit,
}