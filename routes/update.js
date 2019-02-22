var express = require('express')
var serviceLocator = require('../controllers/serviceLocator')

var router = express.Router()


router.get('/', async function (req, res, next) {
  
  let locations = await serviceLocator.Models.Locations.findAll({order: ["title"], raw: true})
  res.render('refresh.jade', {locations: locations})

})

router.post('/', async function (req, res, next) {
  
  res.json(req.body)

})

module.exports = router
