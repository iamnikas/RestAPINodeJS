var express = require('express');
let url = require('url');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize, sanitizeParam } = require('express-validator/filter');
const xml = require('easyxml');
var serviceLocator = require('../controllers/serviceLocator');

var router = express.Router();

const availableFields = check(['userHash', 'locationId', 'format']); // разрешенные поля
const mustBeFields = [check('userHash').exists(), check('locationId').exists()];


/* Actions - получение всех пуш уведомлений 
 *
 * разрешенные поля - userHash, locationId, format
 */
router.get('/', availableFields, mustBeFields, function(req, res, next) {
    let validation = validationResult(req).array()
    if (validation.length > 0) {
        res.status(500);
        return res.json({ error: validation })
    }
    let query = matchedData(req, { locations: ['query'] })

    serviceLocator.Models.Users.find({ where: { hash: query.userHash } }).then(user => {
        return serviceLocator.Models.UserMapRelations.find({ attributes: ['map_id'], where: { user_id: user.id, map_id: Number(query.locationId) } })
    }).then(location => {
        if (!location || !location.map_id)
            return Promise.reject({ message: 'No location or access denied' });
        return serviceLocator.Models.Zones.findAll({ attributes: ['id'], where: { map_id: Number(location.map_id) } });
    }).then(sublocations => {

        let sublocationIds = sublocations.map(sublocation => Number(sublocation.id));
        return serviceLocator.Models.Beacons.findAll({
            attributes: ['id', 'zone_id'],
            where: {
                zone_id: {
                    $or: sublocationIds
                },
                is_deleted: false,
                version_id: 0
            }
        })
    }).then(beacons => {
        const beaconIds = beacons.map(beacon => beacon.id);
        return serviceLocator.Models.ActionBeacons.findAll({ 
              where: { 
                beacon_id: { 
                  $or: beaconIds 
                } 
              }, 
              include: [
                {model: serviceLocator.Models.Actions }
              ]})
    }).then( actions => {
        let actionsByZones = new Map(); // объединяем экшены по зонам
        actions.forEach( act => {
          let array = [];
          if (actionsByZones.has(act.beacon_id))
            array = actionsByZones.get(act.beacon_id);
          array.push(act.action);
          actionsByZones.set(act.beacon_id, array);
        })
        let result = [];
        for (var key of actionsByZones.keys()) {
          result.push( {zone_id: key, actions: actionsByZones.get(key)} ) 
        }
        // формируем красивый ответ
        res.json(result);
    }).catch(error => {
        res.status(500);
        res.json({ error: error.message });
    })
});



module.exports = router;