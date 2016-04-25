var express = require('express');
var router = express.Router();
var quizController= require('../controllers/MyQuiz_Controller');





router.get('/question2', function(req, res, next) {
  res.render('index', { title: 'detecting /question' });
});

/*GET question*/
router.get("/question",quizController.question);

/*GET Check*/
router.get("/check",quizController.check);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MyQuiz' });
});



module.exports = router;
