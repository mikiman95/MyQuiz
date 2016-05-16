'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable(
           'Quizzes', 
           { id:        { type: Sequelize.INTEGER,  allowNull: false,
                          primaryKey: true,         autoIncrement: true,  
                          unique: true },
             question:  { type: Sequelize.STRING,
                          validate: { notEmpty: {msg: "Falta Pregunta"} } },
             answer:    { type: Sequelize.STRING,
                          validate: { notEmpty: {msg: "Falta Respuesta"} } },
             createdAt: { type: Sequelize.DATE,     allowNull: false },
             updatedAt: { type: Sequelize.DATE,     allowNull: false }
           },
           { sync: {force: true}
           }
      );
  },
  down: function (queryInterface, Sequelize) {
        return queryInterface.dropTable('Quizzes');
  }
};



/*
Notes:

Up: com hacer los cambios en la base de datos.
Down: Como deshacer los cambios 

Up has to have the structure of the Quizzes Table

sync:{force:trur}  indica que los cabios deben forzarse al arrancar la aplicacion si hay alguna incopatibilidad o error.

*/