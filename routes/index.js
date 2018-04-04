const express = require('express');
const router = express.Router();
const models = require('../models/models');
const User = models.User;
const Document = models.Document;

// This route receives a list of users by email and invites them to collaborate on
// this document provided that they have an account.
router.post('/doc/:id/share', (req, res, next) => {
  const results = { errors: [] };

  const promises = []; //An array of potential collaborators. Compiled here before the invite is sent.
  req.body.emails.forEach((email) => { // req.body.emails - Email strings of the collaborator the user wants to invite.
    promises.push(
      User.findOne({email: email}).exec()
    );
  });

  // After all the promises have completed, update the database with new
  // collaborators.
  Promise.all(promises)
  .then((users) => {
    // Find and update the Documents here based on new collaborators.
    Document.findById(req.params.id)
    .then((doc, error) => {
      users.forEach((user) => {
        if (user && !doc.collaborators.includes(user._id)){
          doc.collaborators.push(user._id);
        }
      });
      return doc.save();
    })
    .then(function(result){
      res.send({
        success: true,
        users: users,
        result: result
      });
    });
  })
  .catch(function(error){
    res.send({
      success: false,
      error: error
    })
  });
});

// Creates a new document and responds with the document's ID.
router.post('/doc/new', (req, res, next) => {
  const new_doc = new models.Document({
    title: req.body.title || "Untitled", //Title of document remains "Untitled" if user doesn't specify.
    content: "", //Text body starts off empty.
    author: req.user._id, //Original author is the user who creates the new document.
    dateCreated: Date(),
    lastModified: Date(), //Becomes updated upon change later.
    collaborators: [req.user._id] //First collaborator is always the author.
  });
  //Saves the successfully created document in the database.
  new_doc.save((error, doc) => {
    const result = {success:true};
    result.doc = doc;
    if (error){
      result.success = false;
      result.error = error;
    }
    res.send(result);
  });
});

// Given an document's ID, retrieves all its data
// to be displayed on the app's client side.
router.get('/doc/:id', (req, res, next) => {
  Document.findById(req.params.id)
  .populate('author', '-password')
  .populate('collaborators', '-password')
  .then(function(doc, error){
    // If error, notify user that the document doesn't exist.

    // Otherwise, send back the doc to the client side.
    res.send({
      doc: doc,
      error: error
    });
  });
});

// Updates the database when a document is changed.
router.post('/doc/:id', (req, res, next) => {
  Document.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    lastModified: Date()
    // Add collaborators too?
}).then((result) => {
    res.send({
      success: true,
      result: result
    });
  })
  .catch(function(error){
    res.send({
      success: false,
      error: error
    });
  });
});

//Deletes the document from the database.
router.delete('/doc/:id', function(req, res, next){
  Document.findByIdAndRemove(req.params.id)
  .then(function(result){
    res.send({
      success: true,
      result: result
      });
  })
  .catch(function(error){
    res.send({
      success: false,
      error: error
    })
  });
});

//Provides the information needed to displahy the landing page.
router.get('/home', function(req, res, next){
  Document.find({collaborators: req.user._id})
  .populate('author', '-password')
  .populate('collaborators', '-password').exec()
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

//Finds users by email (when invited to collaborate).
router.get('/user/:email', function(req, res, next){
  User.find({email: req.params.email})
  .then(function(error, user){
    if (user){
      req.send({email: user.email});
    }
    else {
      req.send({email: false});
    }
  });
});

module.exports = router;
