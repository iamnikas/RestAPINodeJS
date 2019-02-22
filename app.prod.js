var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var serviceLocator = require('./controllers/serviceLocator');
var jwt = require('express-jwt');
// var Raven = require('raven');
var	config = require('./config');
var index = require('./routes/index');
var logger = require('./helpers/logger');
let api = require('./controllers/api');
let operatorsAliases = require('./helpers/operatorsAliases');

serviceLocator.Logger = logger(config.debug);


serviceLocator.DB = new Sequelize(config.db.name, config.db.username, config.db.password, {
	host: config.db.options.host,
	dialect: config.db.options.dialect,
	operatorsAliases: operatorsAliases
});
serviceLocator.DB.authenticate().then( () => {
	serviceLocator.Logger.verbose('vse ok');
})
.catch(err => {
	serviceLocator.Logger.verbose('vse ne ok', err);
})

var models = require('./models');
serviceLocator.Models = models;
var app = express();




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Raven.config(`${config.sentryUrl}`).install(function (err, sendErr, eventId) {
//     if (!sendErr) {
//         console.log('Successfully sent fatal error with eventId ' + eventId + ' to Sentry');
//     }
// });

//app.use(jwt( {secret: 'secret token'} ).unless({path :
//    ['/', '/users/2'] // Here put routes that do not need JWT auth
//}));

app.use(function (err, req, res, next) {
    if (err && err.name === 'UnauthorizedError') {
        return res.status(401).send('invalid token');
    }
    next(req, res);
});

app.use('/api', api());

// The request handler must be the first middleware on the app
// app.use(Raven.requestHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
    if (err) {
        serviceLocator.Logger.error(err)
    }

    // render the error page
    res.status(err.status || 500);
    res.json('{error: true}');
});

module.exports = app;
