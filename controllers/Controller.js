// empty module for global variables, like database connection etc
let serviceLocator = require('./serviceLocator')
let express = require('express')
const {check, validationResult} = require('express-validator/check')
const {matchedData, sanitizeParam} = require('express-validator/filter')
const Xml = require('easyxml')
var serializer = new Xml({
  singularize: true,
  rootElement: 'response',
  dateFormat: 'ISO',
  manifest: true
})
/**
 * CRUD - основной класс, который позволяет декларативным методом определить какой-нибудь более менее стандартный API КРУД.
 * По умолчанию генерируются 5 url для доступа к методам класса: 
 *
 * GET, POST /api/modelUrl - получение списка данных из модели, по умолчанию сортируются по id. 
 *
 * GET /api/modelUrl/:id - получение конкретного элемента модели по id.
 *
 * POST /api/modelUrl/:id - обновление значений элемента модели с заданным id.
 *
 * DELETE /api/modelUrl/:id - удаление элемента с указанными id из модели.
 *
 * PUT /api/modelUrl - создание элемента для модели
 *
 * 
 * @class CRUD
 * @constructor 

*/
class CRUD {
  constructor (model) {
    this.read_only = false
    this.model = model
    this.classRouter = express.Router()
    // Раздел конструктора, содержайщий все настройки для получения массива записей
    this.findAllAttributes = ['id'] // те атрибуты, которые будут отдавать по умолчанию. Можно переназначить в другом созданном классе.
    this.defaultLimit = 50 // Лимит записей по умолчанию. Возвращает нихрена, если ничего другого не задано явно.
    this.defaultOffset = 0 // Отступ от базовых записей. Изначально возвращаяем все записи от самой первой
    this.defaultOrder = [['id', 'asc']] // сортировки. Если надо сделать несколько - делаем примерно так this.defaultOrder = [['id' , 'asc'], ['name', 'asc']];
    this.availableAllFields = check(['filter', 'limit', 'offset', 'order', 'format']) // какие поля разрешены в запросе, все остальные поля запроса будут игнорироваться
    this.mustBeAllFields = [check('userHash').exists()] // обязательное поле
    this.classRouter.get('/', this.mustBeAllFields, this.availableAllFields, this.callBeforeAll.bind(this), this.callAll.bind(this)) // обработчик для получения всех записей
    this.classRouter.post('/', this.mustBeAllFields, this.availableAllFields, this.callBeforeAll.bind(this), this.callAll.bind(this)) // обработчик для получения всех записей для POST с полноценной поддержкой JSON

    // Раздел, отвечающий за получение единичной записи
    this.singleValidator = sanitizeParam('id').toInt()
    this.mustBeSingleFields = [check('userHash').exists()] // обязательное поле
    this.singleAttributes = {include: ['id'], exclude: ['password']} // include - какие-то добавляемые в вывод поля, например рассчетные. exclude - поля, которые надо исключить
    this.classRouter.get('/:id', this.singleValidator.bind(this), this.callBeforeSingle.bind(this), this.callSingle.bind(this)) //

    // Раздел, отвечающие за изменение единичной записи
    this.classRouter.post('/:id', this.callBeforeUpdate.bind(this), this.callUpdate.bind(this))

    // Раздел, отвечающий за удаление единичной записи
    this.classRouter.delete('/:id', this.callBeforeDelete.bind(this), this.callDelete.bind(this))

    // Раздел, отвечающий за создание единичной записи
    this.classRouter.put('/', this.callBeforeCreate.bind(this), this.callCreate.bind(this))
  }
  // эта функция вызывается перед непосредственным вызовом метода All.
  // Она применяется на случай, если перед непосредственной выборкой надо произвести какие-то действия, будь то проверить право доступа пользователя к методу, таблице или чему-то ещё
  callBeforeAll (req, res, next) {
    this.onBeforeAll(req, res, next)
  }
  /**
 * @method onBeforeAll - этот метод вызывается непосредственно перед методом all
 * @param {Object} req - Стандартный параметр для express запросов
 * @param {Object} res - Стандартный параметр для express запросов
 * @param {Object} next - Стандартный параметр для express запросов
  */
  onBeforeAll (req, res, next) {
    next()
  }
  // вызывает all
  callAll (req, res) {
    this.All(req, res)
  }
  // Непосредственно поиск и возврат таблицы запрошенных данных с суммарным количеством подобных записей в таблице
  All (req, res) {
    let that = this
    let validation = validationResult(req).array()
    if (validation.length > 0) {
      return res.json({error: validation})
    }

    let query = matchedData(req, {locations: ['query']})
    if (req.method === 'POST') { query = matchedData(req, {locations: ['body']}) }
    serviceLocator.Models[this.model].findAndCountAll({
      attributes: (this.findAllAttributes.length) ? this.findAllAttributes : undefined,
      where: query.filter,
      limit: query.limit || that.defaultLimit,
      offset: query.offset || that.defaultOffset,
      order: query.order || that.defaultOrder
    }).then(response => {
      if (query.format && query.format === 'xml') {
        return res.send(serializer.render(JSON.parse(JSON.stringify(response)))) // двойное преобразование JSON -> STRING -> JSON для того, чтобы все значения превратить в строки
      }
      res.json(response)
    }).catch(error => {
      res.status(500)

      res.json({error: error.message})
    })
  }
  callBeforeSingle (req, res, next) {
    this.onBeforeSingle(req, res, next)
  }
  // Тут мы что-то делаем перед тем, как получить одну запись
  onBeforeSingle (req, res, next) {
    next()
  }
  // Получаем одну запись
  callSingle (req, res) {
    this.single(req, res)
  }
  single (req, res) {
    let validation = validationResult(req).array()
    let query = matchedData(req, {locations: ['query']})
    if (validation.length > 0) {
      return res.json({error: validation})
    }
    serviceLocator.Models[this.model].findById(req.params.id, {attributes: this.singleAttributes}).then(single => {
      if (query.format && query.format === 'xml') {
        return res.send(serializer.render(JSON.parse(JSON.stringify(single))))
      }
      res.json(single)
    }).catch(error => {
      res.status(500)
      res.json({error: error.message})
    })
  }
  // Перед тем, как обновить какую-то запись, делаем что-то с чем-то
  callBeforeUpdate (req, res, next) {
    this.onBeforeUpdate(req, res, next)
  }
  onBeforeUpdate (req, res, next) {
    next()
  }
  callUpdate (req, res) {
    this.update(req, res)
  }
  // Делаем непосредственно обновление чего-то

  update (req, res) {
    if (this.read_only) { return res.json({error: 'access denied'}) }
    serviceLocator.Logger.verbose(req.params.id)
    serviceLocator.Models[this.model].findById(req.params.id).then(single => {
      serviceLocator.Logger.verbose(single)
      let fields = []
      Object.keys(req.body).forEach(key => {
        if (single.key || single.key === 0 || single.key == null) {
          fields.push(key)
          single[key] = req.body[key]
        }
      })
      return single.save({fields: fields})
    }).then(updated => {
      res.json(updated)
    }).catch(error => {
      res.status(500)
      res.json({error: JSON.stringify(error.message)})
    })
  }
  callBeforeDelete (req, res, next) {
    this.onBeforeDelete(req, res, next)
  }
  // Перед тем, как удалить какую-то запись, делаем что-то с запросом
  onBeforeDelete (req, res, next) {
    next()
  }
  callDelete (req, res) {
    this.delete(req, res)
  }
  // Далее удаляем
  delete (req, res) {
    if (this.read_only) { return res.json({error: 'access denied'}) }
    serviceLocator.Models[this.model].findById(req.params.id).then(single => {
      if (!single) {
        res.status(500)
        return res.json({error: 'No data with this id'})
      }
      single.destroy().then(() => {
        res.json({delete: 'ok'})
      })
    }).catch(error => {
      res.status(500)
      res.json({error: error.message})
    })
  }

  callBeforeCreate (req, res, next) {
    this.onBeforeCreate(req, res, next)
  }
  onBeforeCreate (req, res, next) {
    next()
  }
  callCreate (req, res) {
    this.create(req, res)
  }
  create (req, res) {
    serviceLocator.Models[this.model].create(req.body).then(single => {
      res.json(single)
    }).catch(error => {
      res.status(500)
      res.json({error: error.message})
    })
  }

  get router () {
    return this.classRouter
  }
//
};

module.exports = CRUD
