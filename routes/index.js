var express = require('express');
var router = express.Router();
var quizController= require('../controllers/MyQuiz_Controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');	//tema 20
var sessionController = require('../controllers/session_controller');//Tema 21: Autentificacion:


//AutoLoad:
router.param("quizId",quizController.autoload);//AutoLoad: de rutas que usan :quizId
router.param('userId', userController.load);  // autoload :userId
router.param('commentId', commentController.load);  // autoload :commentId
router.param("format",quizController.MyFormatMW);



/*GET quizzes*/
router.get("/quizzes",quizController.index);
//Entrega 11:
//router.get("/quizzes.:format?",quizController.MyFormatMW,quizController.index);






//Get quizzes/new  returns the formulario to create a new question
router.get("/quizzes/new",sessionController.loginRequired, quizController.new);

//POST quizzes/create
router.post("/quizzes", sessionController.loginRequired, quizController.create);

//Get edit quiz X    Tema 15: editar Preguntas
router.get("/quizzes/:quizId(\\d+)/edit", sessionController.loginRequired,quizController.ownershipRequired, quizController.edit);
router.put("/quizzes/:quizId(\\d+)",sessionController.loginRequired, quizController.ownershipRequired, quizController.update);

/*GET quiz 23*/
router.get("/quizzes/:quizId(\\d+)",quizController.show);

/*GET Check del quiz 23*/
router.get("/quizzes/:quizId(\\d+)/check",quizController.check);



//GET author
router.get("/author",function(req,res,next){
	res.render("author");
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


//Tema 16 Borrar Quiz
router.delete("/quizzes/:quizId(\\d+)",sessionController.loginRequired,quizController.ownershipRequired, quizController.destroy);

//Tema 18: Crear Comentario:
router.get("/quizzes/:quizId(\\d+)/comments/new", sessionController.loginRequired, commentController.new);
router.post("/quizzes/:quizId(\\d+)/comments", sessionController.loginRequired, commentController.create);
//Tema 24: Accept comments:
router.put("/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept", sessionController.loginRequired,quizController.ownershipRequired,commentController.accept);


//Tema 20: gestion de Usuarios
// Definición de rutas de cuenta
router.get('/users',                    userController.index);   // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);    // ver un usuario
router.get('/users/new',                userController.new);     // formulario sign un
router.post('/users',                   userController.create);  // registrar usuario
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired,sessionController.adminOrMyselfRequired, userController.edit);     // editar información de cuenta
router.put('/users/:userId(\\d+)',      sessionController.loginRequired,sessionController.adminOrMyselfRequired, userController.update);   // actualizar información de cuenta
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired,sessionController.adminAndNotMyselfRequired, userController.destroy);  // borrar cuenta

//Tema 25: ownership, roles y permisos


//Tema 21: Autentificacion:
// Definición de rutas de sesion
router.get('/session',    sessionController.new);     // formulario login
router.post('/session',   sessionController.create);  // crear sesión
router.delete('/session', sessionController.destroy); // destruir sesión








module.exports = router;









