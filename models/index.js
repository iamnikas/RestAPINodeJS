// В данную папку уже выгружены все модели на 17.11.2017, но всё-таки рекомендуем перепроверить.
// Если вы добавляете новую модель, то добавлять её нужно по аналогии с User
// Если эта модель используется для CRUD контроллера, далее советую идти в controllers/api/index.js
// UPD 15.01.2018 - от Versions до Heatmaps были обновлены и скорректированы.
let Sequelize = require('sequelize');
let serviceLocator = require('../controllers/serviceLocator');
let usersModel = require('./users'); // тут мы подключаем дополнительную модель для таблицы. Файл находится в этой же папке.
let locationsModel = require('./locations');
let versionsModel = require('./version');
let sublocationModel = require('./sublocations');
let actionsModel = require('./action');
let beaconsModel = require('./beacon');
let actionBeaconModel = require('./actionbeacon');
let userLocationRelationsModel = require('./user_location_relations');
let filesModel = require('./files');
let versionMethodDescriptionModel = require('./version_method_description');
let appSettingsModel = require('./app_settings');
let beaconBatteryLevelsModel = require('./beacon_battery_levels');
let heatmapsModel = require('./heatmaps');
let locationUserSortModel = require('./location_user_sort');
let sublocationUserSortModel = require('./sublocation_user_sort');

let models = {
  Users: usersModel(serviceLocator.DB, Sequelize), // здесь Users - имя, по которому будет доступ к этой модели через serviceLocator.Models.Users или serviceLocator.Models['Users'] Переменные в конструктор всегда вставляйте такие же
  Locations: locationsModel(serviceLocator.DB, Sequelize),
  Versions: versionsModel(serviceLocator.DB, Sequelize),
  Actions: actionsModel(serviceLocator.DB, Sequelize),
  Sublocations: sublocationModel(serviceLocator.DB, Sequelize),
  Beacons: beaconsModel(serviceLocator.DB, Sequelize),
  UserLocationRelations: userLocationRelationsModel(serviceLocator.DB, Sequelize),
  ActionBeacons: actionBeaconModel(serviceLocator.DB, Sequelize),
  Files: filesModel(serviceLocator.DB, Sequelize),
  VersionMethodDescription: versionMethodDescriptionModel(serviceLocator.DB, Sequelize),
  AppSettings: appSettingsModel(serviceLocator.DB, Sequelize),
  BeaconBatteryLevels: beaconBatteryLevelsModel(serviceLocator.DB, Sequelize),
  Heatmaps: heatmapsModel(serviceLocator.DB, Sequelize),
  LocationUserSort: locationUserSortModel(serviceLocator.DB, Sequelize),
  SublocationUserSort: sublocationUserSortModel(serviceLocator.DB, Sequelize)

};

module.exports = models;
