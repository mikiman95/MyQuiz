var models = require("../models");
var Sequelize = require("sequelize");
//Tema 27 Cloudinary Attachment
var cloudinary = require('cloudinary');
var fs = require('fs');
// Opciones para imagenes subidas a Cloudinary
var cloudinary_image_options = { crop: 'limit', width: 200, height: 200, radius: 5, 
                                 border: "3px_solid_blue", tags: ['core', 'quiz-2016'] };
var Promise = require("promise");




exports.autoload =function(req,res,next,quizId){
	
	//models.Quiz.findById(quizId}) //alternativa previa: findOne() busca la primera
		//models.Quiz.findById(quizId, { include: [ models.Comment, models.Attachment ] }) //the include helps in the views/quizzes/show.ejs
		
models.Quiz.findById(quizId, {include: [{model:models.Attachment}, {model:models.Comment, include:[{model:models.User, as:'Author'}]}]})
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







//Usando DRY

//GET  /quizes?search=texto_a_buscar   con el query opcional
exports.index=function(req,res,next){
	console.log("Entering get index");


	//Documentacion: http://docs.sequelizejs.com/en/latest/api/model/#findalloptions-promisearrayinstance
	var options ={};

	//Entrega 11 Formato, no dice nada de Attachments
	if(req.format){
		options.attributes =["id","question","answer"];   //http://stackoverflow.com/questions/8039932/specifying-specific-fields-with-sequelize-nodejs-instead-of
		//options.include = [{model: models.Attachment,attributes:["id","filename","mime"],where:{id:{ne:null}}}];
		
	}else{
		options.include = [models.Attachment];
	}
	 


	//Busqueda de Quizzes
	var search = req.query.search||"";
	if(search!==""){
		search= ModifyString(search); //url encoded creo.

		options.where=["question like ?",search];
		options.order = [["question","ASC"]];
		
	}
	

	models.Quiz.findAll(options)
	.then(function(quizzes){

			//Entrega 11: Formato: Ver views/index para el caso de formato ==="json"
			if(req.format){
				//console.log("Should have a format");
				quizzes.format=req.format;
			}
				

			res.render('quizzes/index.ejs',{quizzes:quizzes});

	})
	.catch(function(error) {
			next(error);
	});
}
	









//GET /quizzes/:id
exports.show=function(req,res,next){
	var answer=req.query.answer||'';
	//Entrega 11: Formato: Ver views/quizzes/show  para el caso de formato ==="json"

	var quiz = req.quiz;
	if(req.format==="json"){
		quiz.format = req.format;
	} 

	res.render('quizzes/show',{quiz:quiz,answer:answer});
		

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
	//Despues de Tema 27

	var authorId = req.session.user && req.session.user.id || 0;

	var quiz = models.Quiz.build(
		{
			question:req.body.quiz.question,
			answer:req.body.quiz.answer,
			AuthorId: authorId
		}
	);

	//Guardarlo en la Base de Datos;
	//models.Quiz.create(quiz) Errata
	quiz.save({fields:["question","answer","AuthorId"]})
	.then(function(quiz){
		req.flash("success","Pregunta y Respuesta guardadas con éxito.");
		if(!req.file){
			req.flash("info", "Es un quiz sin imagen.");
			return; //Sale de promesa y salta al res.redirect("/quizzes")
		}

		//Guarda la imagen en Cloudinary
		return uploadResourceToCloudinary(req)
				.then(function(uploadResult){
					//crear nuevo attachment en la BBDD
					return createAttachment(req,uploadResult,quiz);
				});

	})
	.then(function(){
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



	/*
		PREVIO A TEMA 27
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
	*/

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

		req.flash('success', 'Pregunta y respuesta editadas con éxito.');

		//Sin imagen, Eliminar attachment e imagen viejos:
		if(!req.file){
			req.flash("info","Ahora tenemos un quiz sin imagen, hay que borrar la imagen antigua.");
			if(quiz.Attachment){
				cloudinary.api.delete_resources(quiz.Attachment.public_id);
				return quiz.Attachment.destroy();
			}
			return;
		}

		//Guardar la imagen nuevva en Cloudinay:
		return uploadResourceToCloudinary(req)
		.then(function(uploadResult){
			//actualizar el attachment en la BBDD
			return updateAttachment(req,uploadResult,quiz);
		});

    })
    .then(function(){
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



  /*
	PREVIO A TEMA 27:
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
  */
};


//Tema 16: borrar pregunta:
// DELETE /quizzes/:id
exports.destroy = function(req, res, next) {

	//Borrar la image de Cloudinary (ignoro resultado)
	if(req.quiz.Attachment){
		cloudinary.api.delete_resources(req.quiz.Attachment.public_id);
	}

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


//TEMA 27 Upload image to Cloudinary

/**
 * Crea una promesa para subir una imagen nueva a Cloudinary. 
 * Tambien borra la imagen original.
 * 
 * Si puede subir la imagen la promesa se satisface y devuelve el public_id y 
 * la url del recurso subido. 
 * Si no puede subir la imagen, la promesa tambien se cumple pero devuelve null.
 *
 * @return Devuelve una Promesa. 
 */
function uploadResourceToCloudinary(req) {
    return new Promise(function(resolve,reject) {
        var path = req.file.path;
        cloudinary.uploader.upload(path, function(result) {
                fs.unlink(path); // borrar la imagen subida a ./uploads
                if (! result.error) {
                    resolve({ public_id: result.public_id, url: result.secure_url });
                } else {
                    req.flash('error', 'No se ha podido guardar la nueva imagen: '+result.error.message);
                    resolve(null);
                }
            },
            cloudinary_image_options
        );
    })
}


function createAttachment(req,uploadResult,quiz){
	if(!uploadResult){
		return Promise.resolve();
	}

	return models.Attachment.create({
								public_id:uploadResult.public_id,
								url: uploadResult.url,
								filename: req.file.originalname,
								mime:req.file.mimetype,
								QuizId: quiz.id

							})
	.then(function(attachment){
		req.flash("success","Imagen nueva guardada con éxito");
	})
	.catch(function(error){//ignoro errores de validacion en imagenes.
		req.flash("error","No se ha podido guardar la imagen nueva: "+error.message);
		cloudinary.api.delete_resources(uploadResult.public_id);
	});
}




function updateAttachment(req,uploadResult,quiz){
	if(!uploadResult){
		return Promise.resolve();
	}
	//Recordar public_id de la imagen antigua
	var old_public_id = quiz.Attachment? quiz.Attachment.public_id : null;		//like in C, if A? then B, else C.  a?b:c

	return quiz.getAttachment()
	.then(function(attachment){
		if(!attachment){
			attachment = models.Attachment.build({QuizId:quiz.Id});
		}

		attachment.public_id=uploadResult.public_id;
		attachment.url= uploadResult.url;
		attachment.filename= req.file.originalname;
		attachment.mime=req.file.mimetype;
		return attachment.save();

	})
	.then(function(attachment){
		req.flash("success","Imagen nueva actualizada con éxito");
		if(old_public_id){
			cloudinary.api.delete_resources(old_public_id);
		}
	})
	.catch(function(error){
		req.flash("error","No se ha podido guardar la imagen nueva: "+error.message);
		cloudinary.api.delete_resources(uploadResult.public_id);
	});
}






/* OLD INDEX: Por si lo necesito:


//GET  /quizes?search=texto_a_buscar   con el query opcional
exports.index=function(req,res,next){
	console.log("Entering get index");
	var options ={};
	options.include = [models.Attachment];

	var search = req.query.search||"";
	if(search!==""){
		search= ModifyString(search); //url encoded creo.

		options.where=["question like ?",search];
		options.order = [["question","ASC"]];
		

		//models.Quiz.findAll({include:[models.Attachment], where:["question like ?",search],order:[["question","ASC"]]}) // o podría haber usado "DESC" para descendente
		models.Quiz.findAll(options)		
			.then(function(quizzes){
				res.render('quizzes/index.ejs',{quizzes:quizzes});
			}).catch(function(error){next(error);});
	}else{
		models.Quiz.findAll(options)
			.then(function(quizzes){
				
			//	if(req.format){
			//		console.log("Should have Rendered JSON format");
				
			//		res.render('quizzes/index.ejs',{format:req.format,quizzes:quizzes});

			//	}else{
			//		res.render('quizzes/index.ejs',{quizzes:quizzes});
			//	}
				

				res.render('quizzes/index.ejs',{quizzes:quizzes});

			}).catch(function(error) {
				next(error);
			});
	}
	

};




*/