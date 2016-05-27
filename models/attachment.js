

//Definicion del modelo Attachment
module.exports=function(sequelize,DataTypes){

	return sequelize.define("Attachment",
							{
								public_id:{
									type: DataTypes.STRING,
									validate: {notEmpty:{msg:"El Campo public_id no puede estar Vacío"}}	
								},
								url:{
									type: DataTypes.STRING,
									validate: {notEmpty:{msg:"El Campo url no puede estar Vacío"}}	
								},
								filename:{
									type: DataTypes.STRING,
									validate: {notEmpty:{msg:"El Campo filename no puede estar Vacío"}}	
								},
							 	mime:{
							 		type: DataTypes.STRING,
							 		validate: {notEmpty:{msg:"El Campo mime no puede estar Vacío"}}	
							 	} 	
							}

	);

};