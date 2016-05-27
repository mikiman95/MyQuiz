var models = require("../models");
var Sequelize = require("sequelize");
//Tema 27 Cloudinary Attachment
var cloudinary = require('cloudinary');
var fs = require('fs');
// Opciones para imagenes subidas a Cloudinary
var cloudinary_image_options = { crop: 'limit', width: 200, height: 200, radius: 5, 
                                 border: "3px_solid_blue", tags: ['core', 'quiz-2016'] };





exports.autoload =function(req,res,next,quizId){
	
	//models.Quiz.findById(quizId}) //alternativa previa: findOne() busca la primera
		models.Quiz.findById(quizId, { include: [ models.Comment, models.Attachment ] }) //the include helps in the views/quizzes/show.ejs
		.then(function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			}else{
				next(new Error("No Existe quizId="+quizId));
			}
		}).catch(function(error){next(error);});
};


exports.MyFormatMW=function(req,res,next,format){
	if(format==="json"){ 
		req.format= "json";
		console.log("Should be JSON format");
	}
	next();
	
}





//GET  /quizes?search=texto_a_buscar   con el query opcional
exports.index=function(req,res,next){
	console.log("Entering get index");

	var search = req.query.search||"";
	if(search!==""){
		search= ModifyString(search); //url encoded creo.
		models.Quiz.findAll({include:[models.Attachment], where:["question like ?",search],order:[["question","ASC"]]}) // o podría haber usado "DESC" para descendente
			.then(function(quizzes){
				res.render('quizzes/index.ejs',{quizzes:quizzes});
			}).catch(function(error){next(error);});
	}else{
		models.Quiz.findAll()
			.then(function(quizzes){
				/*
				if(req.format){
					console.log("Should have Rendered JSON format");
				
					res.render('quizzes/index.ejs',{format:req.format,quizzes:quizzes});

				}else{
					res.render('quizzes/index.ejs',{quizzes:quizzes});
				}
				*/

				res.render('quizzes/index.ejs',{quizzes:quizzes});

			}).catch(function(error) {
				next(error);
			});
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
	var authorId = req.session.user && req.session.user.id || 0;

	var quiz = models.Quiz.build(
		{
			question:req.body.quiz.question,
			answer:req.body.quiz.answer,
			AuthorId: authorId
		}
	);

	//Guardarlo en la Base de Datos;
	quiz.save({fields:["question","answer","AuthorId"]})
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







// MW que comprueba si el usuario autenticado es el propietario del quiz(quizAuthorId===loggedUserId)
//o es admin (campo isAdmin de la tabla User es True
exports.ownershipRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var quizAuthorId = req.quiz.AuthorId;
    var loggedUserId = req.session.user.id;

    if (isAdmin || quizAuthorId===loggedUserId) {
        next();
    } else {
      console.log('Operación prohibida: el usuario logeado no es el autor del quiz, ni un administrador.');
      res.send(403);    }
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