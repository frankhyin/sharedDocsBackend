//Constructing Mongoose models and schemas. Handles document creation and retrieval from the database.
const mongoose = require('mongoose');
const connect = process.env.MONGODB_URI;
const Schema = mongoose.Schema;

mongoose.connect(connect);

//What gets passed in an instance of a user.
const userSchema = Schema({
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

//What gets passed in an instance of a document.
const documentSchema = Schema({
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

//For exporting.
const User = mongoose.model('User', userSchema);
const Document = mongoose.model('Document', documentSchema);


User.findOrCreate = (searchObj, createObj, callback) => {
    User.findOne(searchObj, (err, user) => {
        console.log(err, user);
        if (!user){
            let new_user = new User(createObj);
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
