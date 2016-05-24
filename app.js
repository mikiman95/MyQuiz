var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require("express-partials");

//Para Mensajes Flash y gestion de sessoin
var session = require("express-session");
var flash = require("express-flash");

//Para editar quizzes:
var methodOverride=require("method-override");


var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(partials());
app.use(flash());


app.use(session({secret:"My Quiz 2016",resave:false,saveUninitialized:true}));
app.use(methodOverride("_method",{methods:["POST","GET"]}));
app.use(express.static(path.join(__dirname, 'public')));





//helper dinámico: 
app.use(function(req,res,next){
  //hace visible req.session en las vistas view/layout.ejs
  res.locals.session = req.session;     //res.locals.session lets me write:  if(session.user){...} in layout.
  next();
});



app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// en produccion, en heroku, redirijo las peticiones http a https
//Documentacion en http://jaketrent.com/post/https-redirect-node-heroku/
// will print stacktrace
if (app.get('env') === 'production') {                                //Determina que estamos ejecutando en entorne de production
  app.use(function(err, req, res, next) {
        if(req.headers["x-forwarded-proto"]!=="https"){
          res.redirect("https://"+req.get("Host")+req.url);           //si el protocolo de transaccion no es HTTPS, redirija a HTTPS.
        }else{
          next(); //continue to other routes if not redirecting
        }
  });
}







// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
