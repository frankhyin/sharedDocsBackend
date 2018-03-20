var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;

mongoose.connect(connect);

var userSchema = mongoose.Schema({
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



var User = mongoose.model('User', userSchema);


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
  };
  