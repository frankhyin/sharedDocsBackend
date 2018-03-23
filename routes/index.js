var express = require('express');
var router = express.Router();
var models = require('../models/models');
const User = models.User;
const Document = models.Document;


// POST /doc/:id/share
// receives a list of users by email and invites them to collaborate on
// this document provided that they have an account
router.post('/doc/:id/share', function(req, res, next){
  // req.body.emails - a list of email strings to invite to doc

  // optional - send an email to each recipient with an invite link

  // search for id of each email
  var promises = [];
  req.body.emails.forEach(function(email){
    promises.push(User.findOne({email: email})).exec();
  });

  // after all the promises have completed, update database with new
  // contributors
  Promise.all(promises)
  .then(function(data){
    res.send(data);
  });

});

// POST /doc/new
// creates a new document and resonds with the resulting id
router.post('/doc/new', function(req, res, next){
  var new_doc = new models.Document({
    title: req.body.title || "Untitled",
    content: "",
    author: req.user._id,
    dateCreated: Date(),
    lastModified: Date(),
    collaborators: [req.user._id]
  });
  new_doc.save(function(error, doc) {
    var result = {success:true};
    result.doc = doc;    
    if (error){
      result.success = false;
      result.error = error;
    }
    res.send(result);
  });
});

// GET /doc/:id
// given an document id, retrieves all data for that doc
// to be displayed on client side
router.get('/doc/:id', function(req, res, next){
  Document.findById(req.params.id)
  .then(function(doc, error){
    // If error, notify user that doc doesn't exist

    // otherwise, send back the doc data
    res.send({
      doc: doc,
      error: error
    });
  });
});

// POST /doc/:id
// updates the database for a document
router.post('/doc/:id', function(req, res, next){
  Document.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    lastModified: Date()
    // add collaborators too
  }).then(function(error){
    // do something?
    res.send({
      success: !error,
      error: error
    });
  });
});



router.delete('/doc/:id', function(req, res, next){
  Document.findByIdAndRemove(id)
  .then(function(result){
    res.send(result);
  });
});


router.get('/home', function(req, res, next){
  Document.find({author: req.user._id}).exec()
  .then(function(result){
    res.send({
      success: true,
      documents: result
    });
  })
  .catch(function(error){
    res.send({
      success: false,
      error: error
    });
  });
});


module.exports = router;
