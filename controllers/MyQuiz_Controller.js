var models = require("../models");




//GET  /quizes?search=texto_a_buscar   con el query opcional
exports.index=function(req,res,next){

	var search = req.query.search||"";
	if(search!==""){
		search= ModifyString(search); //url encoded creo.
		models.Quiz.findAll({where:["question like ?",search],order:[["question","ASC"]]}) // o podría haber usado "DESC" para descendente
			.then(function(quizzes){
				//console.log(search);
				res.render('quizzes/index.ejs',{quizzes:quizzes});
			}).catch(function(error){next(error);});
	}else{
		models.Quiz.findAll()
			.then(function(quizzes){
					
					res.render('quizzes/index.ejs',{quizzes:quizzes});
				
			}).catch(function(error){next(error);});
	}
	

};

//GET /quizzes/:id
exports.show=function(req,res,next){

	models.Quiz.findById(req.params.quizId) //alternativa previa: findOne() busca la primera
	.then(function(quiz){
		if(quiz){
			var answer=req.query.answer||'';
			res.render('quizzes/show',{quiz:quiz,answer:answer});
		}
		else{
			throw new Error("No hay preguntas en la BBDD.");
		}
	}).catch(function(error){next(error);});

};


//GET /quizzes/:id/check
exports.check=function(req,res,next){

	models.Quiz.findById(req.params.quizId)
	.then(function(quiz){
		if(quiz){
			var answer=req.query.answer||"";
			var result = answer===quiz.answer? "Correcta":"Incorrecta";
			res.render("quizzes/result",{quiz:quiz,result:result,answer:answer});
		}else{
			throw new Error("no hay preguntas en la BBDD");
		}
	
	}).catch(function(error){next(error);});


};


/*
	Este método cumple la transformacion de un string requerido por el 
	findAll({where:["pregunta like ?",search"]})
	de la practica 10.
	
	Este era el enunciado:
	Para realizar la búsqueda de las preguntas en la base de datos, 
	use la función findAll de sequelize. Debe usar el operador LIKE y el comodín % en la condición WHERE. 
	Debe usar un formato como este: findAll({where: ["pregunta like ?", search]}]
	
	No olvide delimitar el string contenido en search con el comodín % antes y después 
	y cambie también los espacios en blanco por %. De esta forma, si busca "uno dos" ("%uno%dos%"), 
	mostrará todas las preguntas que tengan "uno" seguido de "dos", 
	independientemente de lo que haya entre "uno" y "dos". 
	Mas información en: http://docs.sequelizejs.com/en/latest/docs/querying/.
*/
ModifyString=function(string){
	
	console.log("search antes: ZZZ"+string+"ZZZ")	

	//Dos formas de sustituir los espacios por %
	//string = string.replace(/\s+/g,"%");  
	string = string.split(' ').join("%");


	//luego añadir % al principio y al final del string. 
	string = "%"+string+"%";

	console.log("search despues: ZZZ"+string+"ZZZ");
	return string;
}