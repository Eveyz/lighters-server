/* 
 * @author: znz
*/

const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/login', (req, res) => {
  if(req.body.email && req.body.password) {
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) throw err;
      if(!user) {
        return res.status(404).json({
          error: true,
          message: 'Email or Password is wrong'
        });
      }

      // Don't include sensitive information in the token
      const userTokenData = {id: user.id, username: user.username, email: user.email};

      user.validPassword(req.body.password, function(err, isMatch) {
        if (err) throw err;
        console.log('Password:', isMatch);
      });

      jwt.sign({userTokenData}, config.jwtSecret, { expiresIn: '2h'}, (err, token) => {
        res.json({
          token
        })
        // response to login successfully => reducer => res.data.token
      });
    });
  }
});

/* Signup User */
router.post('/', (req, res) => {
  console.log(req.body);
	if(req.body.email && req.body.password && req.body.passwordCon) {
    const newUser = new User({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      status: req.body.status,
			password: req.body.password,
			passwordCon: req.body.passwordCon
    });

    newUser.save(function(err) {
      if(err) throw err;
      console.log("User created.")
      const userTokenData = {id: newUser.id, username: newUser.username, email: newUser.email};
      jwt.sign({userTokenData}, config.jwtSecret, { expiresIn: '2h'}, (err, token) => {
        res.json({
          token
        })
      });
    });
	} else {
    res.status(300).json({'fail': 'Missing information'});
  }

});

// Format of token
// Authorization: Bearer <access_token>

// Verify Token
// function verifyToken(req, res, next) {
//   //Get auth header value
//   const bearerHeader = req.headers['authorization'];
//   // check if bearer is undefined
//   if(typeof(bearerHeader) !== "undefined") {
//     // split at the space
//     const bearer = bearerHeader.split(' ');
//     // Get token from array
//     const bearerToken = bearer[1];
//     // Set the token
//     req.token = bearerToken;
//     next();
//   } else {
//     // Forbidden
//     res.sendStatus(403);
//   }
// }

// //get current user from token
// router.get('/user/from/token', verifyToken, (req, res) => {
//   // check header or url parameters or post parameters for token
//   var token = req.body.token || req.query.token;
//   if (!token) {
//     return res.status(401).json({message: 'Must pass token'});
//   }
//   jwt.verify(token, config.jwtSecret, (err, user) => {
//     if(err) {
//       res.sendStatus(403);
//     } else {
//       User.findById({'_id': user.id}, function(err, user) {
//         if(err) throw err;
//       })
//       res.json({
//         user
//       });
//     }
//   });
// });

// // routes that need to be authenticated

// router.get('/authenticated', verifyToken, (req, res) => {
//   // check header or url parameters or post parameters for token
//   var token = req.headers['authorization'];
//   if (!token) return next();
//   jwt.verify(token, 'eveyzznz', (err, user) => {
//     if(err) {
//       res.sendStatus(403).json({
//         success: false,
//         message: 'Please register or login in.'
//       });
//     } else {
//       req.user = user; //set the user to req so other routes can use it
//       next();
//     }
//   });
// });

module.exports = router;