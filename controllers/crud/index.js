// В этом файле мы создаем объект класса CRUD. Класс Crud можно посмотреть в controllers/Controller
// Там уже декларативно объявлены практически все необходимые методы, такие как проверка полей, список возвращаемых полей
// Валидация данных и создание дополнительных методов. В данном файле приведены примеры того, как можно изменить 
// некоторые стандартные методы класса, а именно сделать контроллер read_only (только на чтение)
// и поменять список возвращаемых полей путем изменения findAllAttributes
let serviceLocator = require('../serviceLocator');
let CRUD = require('../Controller');
let express = require('express');

var makeController = function() {
	let router = express.Router();

	// Вот так выглядит подключение одного нашего контроллера, который создан на основе CRUD
	let userController = new CRUD(serviceLocator.Models.Users);
	// В качестве примера мы делаем модель read_only и делаем 3 поля, которые будем получать из таблицы
	userController.read_only = true;
	userController.findAllAttributes = ['id', 'name', 'email']; // и увеличиваем тут количество полей, которые возвращаются
	//
	router.use('/users', userController.router); // теперь все методы будут доступны по /api (эта часть пути есть в файле app.js) /users (эту часть пути прописываем тут)
	
	let actionController = new CRUD(serviceLocator.Models.Actions);
	actionController.read_only = true;
	actionController.findAllAttributes = [];

	router.use('/actions', actionController.router);


	// а тут мы возвращаем 
	return router;
}

module.exports = makeController;