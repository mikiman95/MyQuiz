//GET /question
exports.question=function(req,res,next){
	res.render('quizzes/question', {question:'¿Cual es la capital de Italia?'});
};


//GET /check
exports.check=function(req,res,next){
	var result = req.query.answer ==="Roma"?"Correcta":"Incorrecta";
	res.render('quizzes/result',{result:result});
};