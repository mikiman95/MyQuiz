var express = require('express');
var router = express.Router();

var quizController = require('../controllers/MyQuiz_Controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');			//tema 20
var sessionController = require('../controllers/session_controller');	//Tema 21: Autentificacion:



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


//GET author
router.get("/author",function(req,res,next){
	res.render("author");
});


// Autoload de parametros
router.param('quizId', quizController.load);  		  // autoload :quizId
router.param('userId', userController.load);  		  // autoload :userId
router.param("format",quizController.MyFormatMW);	  //Entrega 11



//Entrega 11:
//router.get("/quizzes.:format?",quizController.MyFormatMW,quizController.index);


/*
Tema 21: Autentificacion:
	Definición de rutas de sesion
*/ 
router.get('/session',    sessionController.new);     // formulario login
router.post('/session',   sessionController.create);  // crear sesión
router.delete('/session', sessionController.destroy); // destruir sesión

//Tema 20: gestion de Usuarios
// Definición de rutas de cuenta
router.get('/users',                    userController.index);   // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);    // ver un usuario
router.get('/users/new',                userController.new);     // formulario sign un
router.post('/users',                   userController.create);  // registrar usuario
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, userController.edit);     // editar información de cuenta
router.put('/users/:userId(\\d+)',      sessionController.loginRequired, userController.update);   // actualizar información de cuenta
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired, userController.destroy);  // borrar cuenta


// Definición de rutas de /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);	/*GET quiz 23*/
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);  /*GET Check del quiz 23*/
router.get('/quizzes/new',                 sessionController.loginRequired, quizController.new);
router.post('/quizzes',                    sessionController.loginRequired, quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  sessionController.loginRequired, quizController.edit);		//Get edit quiz X    Tema 15: editar Preguntas
router.put('/quizzes/:quizId(\\d+)',       sessionController.loginRequired, quizController.update);
//Tema 16 Borrar Quiz
router.delete('/quizzes/:quizId(\\d+)',    sessionController.loginRequired, quizController.destroy); 


//Tema 18: Crear Comentario:
router.get('/quizzes/:quizId(\\d+)/comments/new',  sessionController.loginRequired, commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments',     sessionController.loginRequired, commentController.create);


module.exports = router;
