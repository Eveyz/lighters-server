const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');

export default (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  let token;
  if(authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
  }

  if(token) {
    jwt.verify(token, config.jwtSecret, (err, tokenData) => {
      if(err) { 
        res.status(401).json({error: 'Failed to authenticate'}); 
      } else {
        User.findById({'_id': tokenData.userTokenData.id}, function(err, user) {
          if(err) throw err;

          if(!user) {
            res.status(404).json({error: 'No such user'});
          }

          // req.currentUser = user;
          next();
        });
      }
    });
  } else {
    // res.status(403).json({
    //   error: 'No token provided'
    // });
    next();
  }
}