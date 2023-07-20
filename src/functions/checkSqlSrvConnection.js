const sqlsvr= require ('mssql')

async function checkSqlServerConnection(server, user, password, database) {
    try {
      // Configuration de la connexion à la base de données
      const config = {
        server: "VM12SAGE\\SAGE300ERP",
        user: user,
        password: password,
        database: database,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      };
      await sqlsvr.connect(config);
  
      return true;
    } catch (error) {
      console.log("Une erreur s'est produite :", error);
      return false;
    } finally {
      sqlsvr.close();
    }
  }

  module.exports=checkSqlServerConnection