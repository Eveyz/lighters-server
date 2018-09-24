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
server.use('/users', usersAPI);
server.use('/books', booksAPI);

// Express Middleware
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());

/* MongoDB connection 
 * @author: znz
*/
var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/lighters';
var options = { useNewUrlParser: true };
mongoose.connect(url, options).then(
  () => {
    console.log('MongoDB connected.');
  },
  err => {
    console.error('App starting error:', err.stack);
    process.exit(1);
  }
);

server.listen(config.port, () => {
  console.info('Express listenning on port ', config.port);
});