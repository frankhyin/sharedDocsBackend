var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var Schema = mongoose.Schema;

mongoose.connect(connect);

var userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    }
});

var documentSchema = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    dateCreated: {
        type: Date,
        required: true
    },
    lastModified: {
        type: Date,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User'        
    }]
});


var User = mongoose.model('User', userSchema);
var Document = mongoose.model('Document', documentSchema);


User.findOrCreate = function (searchObj, createObj, callback){
    User.findOne(searchObj, function(err, user){
        console.log(err, user);
        if (!user){
            var new_user = new User(createObj);
            new_user.save(callback);
        }
        else {
            callback(null, user);
        }
    });
}

module.exports = {
    User: User,
    Document: Document
  };
  