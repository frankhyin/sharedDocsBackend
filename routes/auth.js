var express = require('express');
var router = express.Router();
var models = require('../models/models');


module.exports = function(passport) {

  router.post('/signup', function(req, res){

    var result = {};
    result.success = false;
    result.message = "";

    // Error Handling - should scan for valid email & matchiing passwords
    // otherwise respond with 500.
    if (!req.body.email){
      result.message = "Invalid Email";
      return res.status(500).send(result);
    }
    if (!req.body.password){
      result.message = "Invalid Password";
      return res.status(500).send(result);
    }
    if (req.body.password !== req.body.password2){
      result.message = "Passwords do not match";
      return res.status(500).send(result);      
    }

    // Create a new user in the database
    var new_user = new models.User({
      email: req.body.email,
      password: req.body.password,
    });
    new_user.save(function(error, user) {
      if (error) {
        result.message = "Account Creation Failed";
        result.error = error;
        return res.status(500).send(result);
      }
      
      // Successful Database Registration
      result.success = true;
      result.message = "Account Created Successfully";
      res.send(result);
    });
  });

  router.post('/login', passport.authenticate('local'), function(req, res) {
    
    // This code will only hit after passport has successfully
    // authenticated the user -> respond with success message
    var result = {};
    result.success = true;
    result.email = req.user.email;
    result.displayName = req.user.displayName;
    result.message = "Logged In";
    res.send(result);
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.send({message: "Logged Out"});
  });

  return router;
}
