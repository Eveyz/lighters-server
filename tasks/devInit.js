/* 
 * @author: znz
 * 
 * for developement test only
*/

const config = require("../config");
var Book = require("../models/book");
var User = require("../models/user");
var Teacher = require("../models/teacher");
var Student = require("../models/student");
var Keyword = require("../models/keyword");

var db = config.db;

var serials = ["Reading", "Writing", "Speaking", "Listening", "Nature", "Science", "Fiction"];
var words = ["lock", "icky", "jumbled", "lively", "scarecrow", "proud", "throat", "apparatus", "greasy", "wave", "nasty", "song", "strip", "talk", "aunt", "pocket", "tempt", "finicky", "branch", "foamy", "phone", "ants", "stranger", "lovely", "stay", "trick", "flash", "overt", "wrist", "shirt", "childlike", "land", "guarded", "blow", "addicted", "teeny-tiny", "statuesque", "toy", "mysterious", "clover"];
var categories = ["主流分级绘本", "名家绘本", "自然拼读", "科普读物", "动画教程", "写作教程", "学生自读"];

function createAdmin() {
  User.create({
    email: 'admin@lighters.com',
    admin: true,
    username: "admin",
    identity: "admin",
    status: "admin",
    password: 'saiop147',
    passwordCon: 'saiop147'
  });
}

const findKy = async function(c) {
  let ky = Keyword.findOne({content: c}, function(err, doc) {
    if(err) console.error(err);
  })
  return ky;
}

const createWords = async function() {
  let keywords = [];
  let wn = Math.floor(Math.random() * 20);
  for(let j = 0; j < wn; j++) {
    let idx = Math.floor(Math.random() * 40);
    let c = words[idx];
    let ky = await findKy(c);
    if(!ky) {
      let ky = new Keyword({
        content: words[idx]
      });
      ky.save(function(err) {
        if(err) console.error(err);
        // console.log("new ky", ky._id);
        keywords.push(ky._id);
      })
    } else {
      // console.log("old ky", ky._id);
      keywords.push(ky._id);
    }
  };
  return keywords;
}

const createBooks = async function() {
  for(let i = 0; i < 100; i++) {
    let keywords = await createWords();
    let cn = Math.floor(Math.random() * 7);
    let sn = Math.floor(Math.random() * 7);
    let b = new Book({
      rlevel: "RAX",
      lslevel: "9 - 10",
      age: 13,
      category: categories[cn],
      serials: serials[sn],
      name: "I love " + serials[sn],
      keywords: keywords
    });
    b.save(function(err) {
      if(err) console.error(err);
    });
  }
  console.log("Books created");
}


function createStudent() {
  for(let i = 0; i < 10; i++) {
    var email = 'student' + i + '@lighters.com';
    let u = new User({
      email: email,
      username: `student${i}`,
      identity: 'student',
      password: 'saiop147',
      passwordCon: 'saiop147'
    });
    u.save().then(function() {
      Student.create({
        user_id: u._id,
        lastname: "曾",
        firstname: "小贤" + i,
        englishname: "Eve" + i,
        gender: "男",
        age: 10
      });
    });
  }
  console.log("Students created");
}

function createTeacher() {
  for(let i = 0; i < 10; i++) {
    var email = 'teacher' + i + '@lighters.com';
    let u = new User({
      email: email,
      username: `teacher${i}`,
      identity: 'teacher',
      password: 'saiop147',
      passwordCon: 'saiop147'
    });
    u.save().then(function() {
      Teacher.create({
        user_id: u._id,
        lastname: "曾",
        firstname: "老师" + i,
        englishname: "Eve" + i,
        gender: "女",
        age: 10
      });
    });
  }
  console.log("Teachers created");
}

const init = async function() {
  createAdmin();
  createBooks();
  createStudent();
  createTeacher();
}

init();

// process.exit();