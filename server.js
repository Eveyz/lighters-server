const express = require("express");
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const MongoClient = require("mongodb").MongoClient;

const config = require("./config");

const usersAPI = require("./api/users");
const booksAPI = require("./api/books");
const coursesAPI = require("./api/courses");
const teachersAPI = require("./api/teachers");
const studentsAPI = require("./api/students");
const reportsAPI = require("./api/reports");
const keywordsAPI = require("./api/keywords");
const schedulesAPI = require("./api/schedule");
const levelSalaryAPI = require("./api/level_salary");

const server = express();

// Express Middleware
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
// server.use('/public', express.static(__dirname + '/public'));

/* API 
 * @author: znz
*/
server.use('/users', usersAPI);
server.use('/books', booksAPI);
server.use('/courses', coursesAPI);
server.use('/teachers', teachersAPI);
server.use('/students', studentsAPI);
server.use('/reports', reportsAPI);
server.use('/keywords', keywordsAPI);
server.use('/schedules', schedulesAPI);
server.use('/level_salaries', levelSalaryAPI);

/* MongoDB connection 
 * @author: znz
*/
var db = config.db;

if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, '/build')));

  server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
  });
}

const PORT = process.env.PORT || config.port;

server.listen(PORT, () => {
  console.info('Express listenning on port ', PORT);
});