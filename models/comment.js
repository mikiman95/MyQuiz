

//Definicion del modelo Comment		UNA FILA de la Tabla
module.exports=function(sequelize,DataTypes){

	return sequelize.define("Comment",
							{
								text:{
									type: DataTypes.STRING,
									validate: {notEmpty:{msg:"Falta Comentario"}}	
								},
								accepted:{type:DataTypes.BOOLEAN,
									defaultValue: false
								}

							}

	);

};