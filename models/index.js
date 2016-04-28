var path = require("path");

//Cargar el modelo ORM;
var Sequelize = require("sequelize");  //ojo con mayusculas=constructor, minusculas=otra cosa

//usar la Base de Datos SQlite:
var sequelize = new Sequelize(
							null,
							null,
							null,
							{dialect:"sqlite",storage:"quiz.sqlite"}
							);

//Importar la definicion de la tabla !uiz de quiz.js
//QUIZ tendra la forma que defini en models/quiz.js  Es decir, una fila de la tabla
var Quiz = sequelize.import(path.join(__dirname,"quiz"));  


//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize
.sync()
.then(function(){
		return Quiz.count()
			.then(function (c){
				if(c===0){
					return Quiz
					.create({question:'Capital de Italia',answer:'Roma'})
					.then(function(){
						console.log("Base de datos inicializada con datos");
					});
				}
			});

}).catch(function(error){
	console.log("Error Sincronizando las tablas de la BBDD:",error);
	process.exit;
});


//Exporta definicion de tabla Quiz
exports.Quiz=Quiz;