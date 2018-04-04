const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const auth = require('./routes/auth');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const models = require('./models/models');
const User = models.User;

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const jwt = require('passport-jwt');
const JwtStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

//Verifies that there is a user session before starting the app.
passport.use('jwt', new JwtStrategy(opts, (jwt_payload, done) => {
  console.log('jwtpayload', jwt_payload);
  User.findOne({email: jwt_payload.email}, (error, user) => {
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

// View engine setup.
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Cross origin stuff - needed for req.headers.origin.
const cors = require('cors');
app.use(cors());


// Passport stuff here.
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  console.log('serialize', JSON.stringify(user, 0, 2))
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', JSON.stringify(id, 0, 2))
  User.findById(id, (error, user) => {
    console.log('findById', JSON.stringify(user, 0, 2))
    done(error, user);
  });
});

app.use('/', auth(passport));
app.use('/', routes);

// Catch 404 and forward to error handler.
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handlers

// Development error handler will print stacktrace.
if (app.get('env') === 'development') {
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    const result = {
      message: error.message,
      error: error
    };
    res.send(result);
  });
}

//Production error handler. No stacktraces leaked to user.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const result = {
    message: error.message,
    error: {}
  };
  res.send(result);
});

//The salt to hash the user identity from the env.sh. 
const SALT = process.env.SALT;
if (!SALT){throw "Salt not defined.";}

const sharedDocs = {}
const currentState = {}

//Web sockets.
io.on('connection', (socket) => {
  socket.on('sendToServer', (raw) => {
    io.sockets.emit('sendToClient', raw);
  });
});

server.listen(3000);
console.log("Server listening on port 3000");
