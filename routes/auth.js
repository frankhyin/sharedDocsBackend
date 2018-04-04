//Authenticating the user on the back end.
const express = require('express');
const router = express.Router();
const models = require('../models/models');

module.exports = (passport) => {
    //User must be registered before he/she can login and interact with the app.
  router.post('/register', (req, res) => {

    const result = {};
    result.success = false;
    result.message = "";

    // Error Handling - should scan for valid email & matching passwords,
    // otherwise respond with 500 error message.
    if (!req.body.email) {
      result.message = "Invalid Email";
      return res.status(500).send(result);
    }
    if (!req.body.password) {
      result.message = "Invalid Password";
      return res.status(500).send(result);
    }
    if (req.body.password !== req.body.password2) {
      result.message = "Passwords do not match";
      return res.status(500).send(result);
    }
    if (!req.body.displayName) {
        result.message = "Invalid display name";
        return res.status(500).send(result);
    }

    // Creating and saving a new user in the database.
    const new_user = new models.User({
      email: req.body.email,
      password: req.body.password,
      displayName: req.body.displayName
    });
    new_user.save((error, user) => {
      //Error in database registration.
      if (error) {
        result.message = "Account Creation Failed";
        result.error = error;
        return res.status(500).send(result);
      }

      // Successful database registration.
      result.success = true;
      result.message = "Account Created Successfully";
      res.send(result);
    });
  });

    //After user has successfully registered, he/she can log in.
  router.post('/login', passport.authenticate('jwt'), (req, res) => {

    // This code will only hit after Passport has successfully
    // authenticated the user and will respond with a success message.
    var result = {};
    result.success = true;
    result.email = req.user.email;
    result.displayName = req.user.displayName;
    result.message = "Logged In";
    result.cookie = req.cookies;
    res.send(result);
  });

    //Standard log out route. Will remove the req.user property and clear the login session.
  router.get('/logout', function(req, res) {
    req.logout();
    res.send({message: 'logged out', success: true})
  });

    //Runs if Passport cannot authenticate the user. 
  router.use(passport.authenticate('jwt', { session: false }), function(req, res, next){
    if (!req.user) {
      var result = {
        success: false,
        message: "Not Authorized"
      };
      return res.status(401).send(result);
    }
    next();
  });
  return router;
}
