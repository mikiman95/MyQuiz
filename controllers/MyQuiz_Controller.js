//GET /question
exports.question=function(req,res,next){
	var UserInput=req.query.answer||'';
	res.render('quizzes/question', {
		question:'¿Cual es la capital de Italia?',
		answer: UserInput
	});
};


//GET /check
exports.check=function(req,res,next){
	var UserInput =req.query.answer;
	var result = (UserInput ==="Roma"?"Correcta":"Incorrecta");
	res.render('quizzes/result',{
		result:result,
		answer: UserInput
	});
};