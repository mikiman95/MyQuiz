var path = require("path");

//Cargar el modelo ORM;
var Sequelize = require("sequelize");  //ojo con mayusculas=constructor, minusculas=otra cosa


/*
	Usando Entorno de Desarrollo local: BBDD con SQlilte
		DATABASE_URL = squlite:///
		DATABASE_STORAGE= quiz.sqlite (fichero con la BBDD)
	Usando Entorno de Produccion en Heroku: BBDD con Postgress
		DATABASE_URL = postgres://user:passwd@host:port/database@host:port/database
 		DATABASE_STORAGE no se utiliza en Heroku
*/
var url, storage;
if(!process.env.DATABASE_URL){
	url = "sqlite:///";
	storage="quiz.sqlite";
}else{
	url = process.env.DATABASE_URL;
	storage= process.env.DATABASE_STORAGE | "";
}


//usar la Base de Datos
var sequelize = new Sequelize(url,
							{
								storage:storage,
								omitNull:true
							}
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