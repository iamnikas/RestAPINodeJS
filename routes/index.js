var express = require('express')

var serviceLocator = require('../controllers/serviceLocator')
let actions = require('./actions')
let update = require('./update')


let makeRouter = () => {
	var router = express.Router()
	/* GET home page. */
	router.use('/actions', actions);
	router.use('/update', update);
	return router;
}

module.exports = makeRouter;

