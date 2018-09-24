/* 
 * @author: znz
*/

var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
  rlevel: String,
  lslevel: String,
  age: String,
  category: String,
  serials: String,
  name: String,
  audio: String,
  file: String,
  cover: String,
  rcomments: String,
  bcomments: String,
  quantity: Number,
  files: [],
  keywords: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Keyword'} ],
  created_at: Date,
  updated_at: Date
});

bookSchema.pre("save", function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if ( !this.created_at ) {
    this.created_at = currentDate;
  }
  next();
});

var Book = mongoose.model('Book', bookSchema);
module.exports = Book;