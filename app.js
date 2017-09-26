var express = require('express')
var logger = require('morgan'); // Charge le middleware de logging
var fs = require('fs')
var path = require('path')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');

 

var index = require('./routes/index');
//var users = require('./routes/users');
var catalog = require('./routes/catalog');  //Import routes for "catalog" area of site
var athletesessionroutes = require('./routes/athleteSessionRoutes');   

var mongo = require('mongodb');
var mongoose = require('mongoose');



var app = express()



//Set up mongoose connection
var mongoDB = 'mongodb://localhost:27017/MarcDB';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.set('db', db);

 




app.set('mongoose', mongoose);
app.set('mongo', mongo);

// use sessions for tracking logins
app.use(session({
  secret: 'Parc secret',
  resave: true,
  saveUninitialized: false,
   
}));
/*
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

 // make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// create a write stream (in append mode) 
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(logger('combined'))  
.use(logger('combined', {stream: accessLogStream}));

console.log ( "__dirname:" + __dirname );
app.use(express.static(__dirname + '/public'));
 
app.use("/node_modules", express.static(__dirname + '/node_modules'));
//app.use("/ios", express.static(__dirname + '/ios'));

 
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); // Add this after the bodyParser middlewares!
app.use(express.static(path.join(__dirname, 'public')));


// include routes
app.use('/', index);
//app.use('/users', users);
app.use('/catalog', catalog);  // Add catalog routes to middleware chain.
app.use('/catalog', athletesessionroutes);  // Add catalog routes to middleware chain.

 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

 


app.get('/', function (req, res) {
  res.send('Hello World ...!')
})





app.listen(8082, function () {
  console.log('Example app listening on port 8082!')
})