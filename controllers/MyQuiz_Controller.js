var models = require("../models");
var Sequelize = require("sequelize");




exports.autoload =function(req,res,next,quizId){
	models.Quiz.findById(quizId) //alternativa previa: findOne() busca la primera
		.then(function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			}else{
				next(new Error("No Existe quizId="+quizId));
			}
		}).catch(function(error){next(error);});
};




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
	var answer=req.query.answer||'';
	res.render('quizzes/show',{quiz:req.quiz,answer:answer});
		

};


//GET /quizzes/:id/check
exports.check=function(req,res,next){
	var answer=req.query.answer||"";
	var result = answer===req.quiz.answer? "Correcta":"Incorrecta";
	res.render("quizzes/result",{quiz:req.quiz,result:result,answer:answer});


};


//Get /quizzes/new
exports.new=function(req,res,next){
	var quizVacio = models.Quiz.build({question:"",answer:""});		//crea un quiz vacío
	res.render("quizzes/new",{quiz:quizVacio});
}

//POST /quizzes/create
exports.create=function(req,res,next){
	var quiz = models.Quiz.build({question:req.body.quiz.question,answer:req.body.quiz.answer});

	//Guardarlo en la Base de Datos;
	quiz.save({fields:["question","answer"]})
		.then(function(quiz){
			req.flash("success","Quiz creado con Éxito.")
			res.redirect("/quizzes");		//Si exito, servidor dice al cliente "Ahora pideme un get /quizzes"
		})
		.catch(Sequelize.ValidationError,function(error){
				req.flash("error","Errores en el formulario:");

				for(var i in error.errors){
					req.flash("error",error.errors[i].value);
				};
				res.render("quizzes/new",{quiz:quiz});
		})

		.catch(function(error){
			req.flash("error","Error al crear un Quiz: "+error.message);
			next(error);
		});

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