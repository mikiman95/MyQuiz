var express = require('express');
var router = express.Router();
var quizController= require('../controllers/MyQuiz_Controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');


//AutoLoad:
router.param("quizId",quizController.autoload);//AutoLoad: de rutas que usan :quizId
router.param('userId', userController.load);  // autoload :userId
router.param("format",quizController.MyFormatMW);



/*GET quizzes*/
router.get("/quizzes",quizController.index);
//Entrega 11:
//router.get("/quizzes.:format?",quizController.MyFormatMW,quizController.index);






//Get quizzes/new  returns the formulario to create a new question
router.get("/quizzes/new",quizController.new);

//POST quizzes/create
router.post("/quizzes",quizController.create);

//Get edit quiz X    Tema 15: editar Preguntas
router.get("/quizzes/:quizId(\\d+)/edit",quizController.edit);
router.put("/quizzes/:quizId(\\d+)",quizController.update);

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
router.delete("/quizzes/:quizId(\\d+)",quizController.destroy);

//Tema 18: Crear Comentario:
router.get("/quizzes/:quizId(\\d+)/comments/new",commentController.new);
router.post("/quizzes/:quizId(\\d+)/comments",commentController.create);



//Tema 20: gestion de Usuarios
// Definición de rutas de cuenta
router.get('/users',                    userController.index);   // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);    // ver un usuario
router.get('/users/new',                userController.new);     // formulario sign un
router.post('/users',                   userController.create);  // registrar usuario
router.get('/users/:userId(\\d+)/edit', userController.edit);     // editar información de cuenta
router.put('/users/:userId(\\d+)',      userController.update);   // actualizar información de cuenta
router.delete('/users/:userId(\\d+)',   userController.destroy);  // borrar cuenta






module.exports = router;




