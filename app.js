var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var auth = require('./routes/auth');


// require node modules here
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const models = require('./models/models');
const User = models.User;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// cross origin stuff - needed for req.headers.origin
const cors = require('cors');
app.use(cors());


// Passport stuff here
app.use(session({secret: 'crimsonjade'}));

passport.serializeUser(function(user, done){
  done(null, user._id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(error, user){
    done(error, user);
  });
});

passport.use(new LocalStrategy({usernameField: "email", passwordField:"password"}, function(username, password, done){
  User.findOne({email: username}, function(error, user){
    if (error) {
        return done(error);
    }
    if (!user) {
        return done(null, false);
    }
    if (user.password !== password){
        return done(null, false);
    }
    return done(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(error, req, res, next) {
    res.status(error.status || 500);
    var result = {
      message: error.message,
      error: error
    };
    res.send(result);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  var result = {
    message: error.message,
    error: {}
  };
  res.send(result);
});


module.exports = app;
