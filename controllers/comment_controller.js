var models = require("../models");
var Sequelize = require("sequelize");



/*
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

*/



//GET  /quizes/:quizId/comments/new)
exports.new=function(req,res,next){

	var comment = models.Comment.build({text:""});
	res.render('comments/new',{comment:comment, quiz: req.quiz});
	

};

//POST /quizzes/:quizId/comments
exports.create=function(req,res,next){
	var comment = models.Comment.build({text:req.body.comment.text,QuizId:req.quiz.id});

	//Guardarlo en la Base de Datos;
	comment.save()
		.then(function(comment){
			req.flash("success","Commentario creado con Éxito.")
			res.redirect("/quizzes/"+req.quiz.id);		//Si exito, servidor dice al cliente "Ahora pideme un get /quizzes/id"
		})
		.catch(Sequelize.ValidationError,function(error){
				req.flash("error","Errores en el formulario:");

				for(var i in error.errors){
					req.flash("error",error.errors[i].value);
				};
				res.render("comments/new",{comment:comment, quiz: req.quiz});
		})

		.catch(function(error){
			req.flash("error","Error al crear un Comentario: "+error.message);
			next(error);
		});

};




/*


//TEMA 15 Editar Quizzes
exports.edit=function(req,res,next){
	var quiz = req.quiz; //utiliza el autoload.
	res.render("quizzes/edit",{quiz:quiz});
}

// PUT /quizzes/:id
exports.update = function(req, res, next) {

  req.quiz.question = req.body.quiz.question;
  req.quiz.answer   = req.body.quiz.answer;

  req.quiz.save({fields: ["question", "answer"]})
    .then(function(quiz) {
	  req.flash('success', 'Quiz editado con éxito.');
      res.redirect('/quizzes'); // Redirección HTTP a lista de preguntas.
    })
    .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };

      res.render('quizzes/edit', {quiz: req.quiz});
    })
    .catch(function(error) {
	  req.flash('error', 'Error al editar el Quiz: '+error.message);
      next(error);
    });
};


//Tema 16: borrar pregunta:
// DELETE /quizzes/:id
exports.destroy = function(req, res, next) {
  req.quiz.destroy()
    .then( function() {
	  req.flash('success', 'Quiz borrado con éxito.');
      res.redirect('/quizzes');
    })
    .catch(function(error){
	  req.flash('error', 'Error al editar el Quiz: '+error.message);
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

*/