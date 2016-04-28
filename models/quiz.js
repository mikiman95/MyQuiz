

//Definicion del modelo Quiz		UNA FILA de la Tabla
module.exports=function(sequelize,DataTypes){

	return sequelize.define("Quiz",
							{question: DataTypes.STRING,
							 answer: DataTypes.STRING	
							}

	);

};