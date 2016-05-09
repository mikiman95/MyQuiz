var express = require('express');
var router = express.Router();
var quizController= require('../controllers/MyQuiz_Controller');



//AutoLoad: de rutas que usan :quizId
router.param("quizId",quizController.autoload);




/*GET quizzes*/
router.get("/quizzes",quizController.index);

//Get quizzes/new  returns the formulario to create a new question
router.get("/quizzes/new",quizController.new);

//POST quizzes/create
router.post("/quizzes",quizController.create);


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



module.exports = router;
