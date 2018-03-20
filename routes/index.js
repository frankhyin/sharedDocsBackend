var express = require('express');
var router = express.Router();
var models = require('../models/models');
const User = models.User;



router.use(function(req, res, next){

  // console.log(req.body);
  if (!req.user) {
    var result = {
      success: false,
      message: "Not Authorized"
    };
    return res.status(401).send(result);
  }
  next();
});



module.exports = router;