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

//Exporta definicion de tabla Quiz
exports.Quiz=Quiz;


//Tema 18: Comentarios:
//Importar la definicion de la tabla de Comments de models/comment.js
var Comment = sequelize.import(path.join(__dirname,"comment"));

//Relaciones entre odulos Quiz y Comment
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);  //1-N

//Exporta definicion de tabla Comment
exports.Comment=Comment;

/*	A   B
	1 a 1:   B.belongsTo(A)		and A.hasOne(B)				ejeplo: una pregunta tiene un fichero asociado
	1 a N: 	 B.belongsTo(A)		and A.hasMany(B)			ejemplo: una pregunta puede tener varios comentarios asociados
	M a N: 	 B.BelongsToMany(A) and A.belongsToMany(B)		ejemplo: N preguntas gustan (se asocian) a N usuarios
*/



//Tema 19: Tabla de usuarios:
var User = sequelize.import(path.join(__dirname,"user"));

//Tema 22 Autores de Quizzes
User.hasMany(Quiz,{foreignKey:"AuthorId"});
Quiz.belongsTo(User,{as:"Author",foreignKey:"AuthorId"});

//Exporta definicion de tabla User
exports.User =User; 






/*
THIS SECTION IS USED UNTIL Tema 17. 
After tema 17, sequelize-cli takes care od syncronization and inicialization of the BBDD

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize
.sync()
.then(function(){
		return Quiz.count()
			.then(function (c){
				if(c===0){
					return Quiz
					.bulkCreate([
						{question:'Capital de Italia',answer:'Roma'},
						{question:'Capital de España',answer:'Madrid'},
						{question:'Y uno y dos',answer:'y tres'},
						{question:'Mi Edad',answer:'20'}

						])
					.then(function(){
						console.log("Base de datos inicializada con datos");
					});
				}
				
					//else{
					//return Quiz.destroy({
					//	where:{
					//		question : "/Capital de España/"
					//	},
					//	truncate:true				
					//});
				//}
				

			});

}).catch(function(error){
	console.log("Error Sincronizando las tablas de la BBDD:",error);
	process.exit;
});





*/

