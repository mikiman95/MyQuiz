

//Definicion del modelo Quiz		UNA FILA de la Tabla
module.exports=function(sequelize,DataTypes){

	return sequelize.define("Quiz",
							{
								question:{
									type: DataTypes.STRING,
									validate: {notEmpty:{msg:"Falta Pregunta"}}	
								},
							 	answer:{
							 		type: DataTypes.STRING,
							 		validate: {notEmpty:{msg:"Falta Respuesta"}}	
							 	} 	
							}

	);

};