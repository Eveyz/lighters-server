const express = require("express");
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const MongoClient = require("mongodb").MongoClient;

const config = require("./config");

const usersAPI = require("./api/users");
const booksAPI = require("./api/books");
const teachersAPI = require("./api/teachers");

const server = express();

// Express Middleware
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());


/* API 
 * @author: znz
*/
server.use('/users', usersAPI);
server.use('/books', booksAPI);


/* MongoDB connection 
 * @author: znz
*/
var db = config.db;

server.listen(config.port, () => {
  console.info('Express listenning on port ', config.port);
});