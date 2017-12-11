var https = require('https');  
var express = require('express')
var logger = require('morgan'); // Charge le middleware de logging
var fs = require('fs')
var path = require('path')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var cors = require('cors')

 

var index = require('./routes/index');
var options = {  
  key: fs.readFileSync('hostkey.pem'),  
  cert: fs.readFileSync('hostcert.pem')  
};  
//var users = require('./routes/users');
var catalog = require('./routes/catalog');  //Import routes for "catalog" area of site
var athletesessionroutes = require('./routes/athleteSessionRoutes');   
var persistenceroutes = require('./routes/persistenceRoutes');   
var videoroutes = require('./routes/videoRoutes');
var pubsubroutes = require('./routes/pubsubRoutes');

var mongo = require('mongodb');
var mongoose = require('mongoose');



var app = express();
app.use(cors({
  credentials: true,
}));



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

var redis = require('redis');
var clientRedis = redis.createClient(); //creates a new client

clientRedis.on('connect', function() {
    console.log('clientRedis Client connected');
});
app.set('clientRedis', clientRedis );



var RedisTagging = require("redis-tagging");
var redisTagging = new RedisTagging({host: "127.0.0.1", port: 6379, nsprefix: "rt"} );
app.set('redisTagging', redisTagging );

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/viewsvideo'), path.join(__dirname, 'views/viewspubsub')]);

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


app.use("/viewsjavascripts", express.static("./viewsjavascripts"));


// include routes
app.use('/', index);
//app.use('/users', users);
app.use('/catalog', catalog);  // Add catalog routes to middleware chain.
app.use('/catalog', athletesessionroutes);  // Add catalog routes to middleware chain.
app.use('/persistency', persistenceroutes);  // Add catalog routes to middleware chain.

app.use('/persistency', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/video', videoroutes);  // Add catalog routes to middleware chain.

app.use('/pubsub', pubsubroutes);  // Add catalog routes to middleware chain.


 
 

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




/*
app.listen(8082, function () {
  console.log('Example app listening on port 8082!')
  //require('./document')(app._router.stack, 'app');
})
*/

var httpsServer = https.createServer(options, app);

 
httpsServer.listen(8082,'0.0.0.0', function () {
  console.log('Server app https listening on port 8082!')
  
})

var io = require('socket.io')(httpsServer);
var redis = require('socket.io-redis');
io.adapter(redis({ host: '127.0.0.1', port: 6379 }));

io.sockets.on('connection', function(socket) {
    console.log("socket io connection");
    socket.on('message', function(data) {
        console.log("socket io on");
        socket.broadcast.emit('message', data);
    });

});
app.set('io', io );