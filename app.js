var express = require('express');
var path = require('path');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var auth = require('./routes/auth');

// require node modules here
const passport = require('passport');
// const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const models = require('./models/models');
const User = models.User;

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Passport JWT
const jwt = require('passport-jwt');
const JwtStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done){
  console.log('jwtpayload', jwt_payload);
  User.findOne({email: jwt_payload.email}, function(error, user){
    if (error) {
        return done(error);
    }
    if (!user) {
        return done(null, false);
    }
    if (user.password !== jwt_payload.password){
        return done(null, false);
    }
    return done(null, user);
  });
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// cross origin stuff - needed for req.headers.origin
const cors = require('cors');
app.use(cors());


// Passport stuff here
// app.use(session({secret: process.env.JWT_SECRET}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  console.log('serialize', JSON.stringify(user, 0, 2))
  done(null, user._id);
});
passport.deserializeUser(function(id, done){
  console.log('deserializeUser', JSON.stringify(id, 0, 2))
  User.findById(id, function(error, user){
    console.log('findById', JSON.stringify(user, 0, 2))
    done(error, user);
  });
});

// passport.use(new LocalStrategy({usernameField: "email", passwordField:"password"}, function(username, password, done){
//   User.findOne({email: username}, function(error, user){
//     if (error) {
//         return done(error);
//     }
//     if (!user) {
//         return done(null, false);
//     }
//     if (user.password !== password){
//         return done(null, false);
//     }
//     return done(null, user);
//   });
// }));

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

// Socket Stuff
const SALT = process.env.SALT;
if (!SALT){throw "Salt not defined. Did you source env.sh Frank?";}

const sharedDocs = {}
const currentState = {}

io.on('connection', function (socket) {
  // socket.on('join-document', function (docAuth, cb) {
  //   const {docId, userToken} = docAuth;

  //   let secretToken = sharedDocs[docId];
  //   if (!secretToken){
  //     secretToken = sharedDocs[docId] = md5(docId + Math.random() + SALT);
  //   }

  //   cb({secretToken, docId, state: currentState[docId]});
  //   socket.join(secretToken);
  // });

  // socket.on('document-save', function (message) {
  //   const {secretToken, state, docId, userToken} = message;
  //   currentState[docId] = state;
  //   io.sockets.in(secretToken).emit('document-update', {state, docId, userToken});
  // });

  socket.on('sendToServer', function(raw){
    io.sockets.emit('sendToClient', raw);
  });


  
});


server.listen(3000);
console.log("Server listening on port 3000");