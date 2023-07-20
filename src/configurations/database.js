const mysql = require("mysql");
const sqlsrv = require("mssql");

class Database {
  constructor(companyName) {
    this.companyName = companyName;
  }
  connectToWorkflowDB() {
    try {
      const config = {
        host: "vbs-solutions.com",
        user: "u833159023_kinda",
        password: "Kind@1404",
        database: "u833159023_workflow_admin",
      };
      const connection = mysql.createConnection(config);

      // Connecter à la base de données
      connection.connect((error) => {
        if (error) {
          console.error(
            "Erreur de connexion à la base de données administrateur :",
            error
          );
          connection.end(); // Fermer la connexion en cas d'erreur
        } else {
          console.log("Connexion à la base de données établie.");
        }
      });

      return connection;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async connectToCompanyDB() {
    const workflowConfig = {
      host: "vbs-solutions.com",
      user: "u833159023_kinda",
      password: "Kind@1404",
      database: "u833159023_workflow_admin",
    };

    try {
      const workflowConnection = mysql.createConnection(workflowConfig);

      return new Promise((resolve, reject) => {
        workflowConnection.connect((error) => {
          if (error) {
            console.error(
              "Erreur de connexion à la base de données workflow :",
              error
            );
            workflowConnection.end();

            reject(error);
          } else {
            const selectQuery = `SELECT * FROM Company WHERE companyName = "${this.companyName}"`;

            workflowConnection.query(selectQuery, (error, results) => {
              if (error) {
                console.error(
                  "Erreur lors de l'exécution de la requête SELECT :",
                  error
                );
                workflowConnection.end();
              } else {
                if (results.length === 0) {
                  workflowConnection.end();
                  reject(null); // Aucune entreprise trouvée
                } else {
                  const company = results[0];
                  const { databaseName, servername, username, password } =
                    company;

                  if (servername != "vbs-solutions.com") {
                    // Connexion spécifique à un autre serveur de base de données (pilote sqlsrv)
                    const otherDBConfig = {
                      server: servername,
                      user: username,
                      password: password,
                      database: databaseName,
                      options: {
                        encrypt: true,
                        trustServerCertificate: true,
                      },
                    };

                    const companyConnection = sqlsrv.connect(otherDBConfig);

                    resolve(companyConnection);
                  } else {
                    // Connexion spécifique à MySQL
                    const mysqlDBConfig = {
                      host: servername,
                      user: username,
                      password: password,
                      database: databaseName,
                    };
                    const companyConnection =
                      mysql.createConnection(mysqlDBConfig);

                    companyConnection.connect((error) => {
                      if (error) {
                        console.error(
                          "Erreur de connexion à la base de données de l'entreprise :",
                          error
                        );
                        companyConnection.end();
                        return error;
                      }
                    });

                    resolve(companyConnection);
                  }
                }
              }
            });
          }
        });
      });
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

module.exports = Database;
