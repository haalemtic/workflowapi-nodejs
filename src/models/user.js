const checkMySqlConnection = require("../functions/checkMysqlConnection");
const checkSqlServerConnection = require("../functions/checkSqlSrvConnection");
const sqlsvr = require("mssql");
class User {
  constructor(databases) {
    this.table = "WORKFLOWUSERS";
    this.connexion = null;
    this.companyName;
    this.emailAdd;
    this.username;
    this.department;
    this.grade;
    this.password;
    this.maxAmount;

    if (this.connexion === null) {
      this.connexion = databases;
    }
  }
  async login() {
    const response = { code: 3, user: null };

    const selectQuery = `SELECT * FROM ${this.table} WHERE EMAILADD = '${this.emailAdd}'`;

    try {
      const results = await new Promise((resolve, reject) => {
        this.connexion.query(selectQuery, (error, results) => {
          if (error) {
            console.error(
              "Erreur lors de l'exécution de la requête SELECT :",
              error
            );
            resolve(null);
          } else {
            resolve(results);
          }
        });
      });

      if (
        results &&
        (this.companyName == "vision"
          ? results.length
          : results.recordset.length) > 0
      ) {
        if (
          this.password ===
          (this.companyName == "vision"
            ? results[0].PASSWORD
            : results.recordset[0].PASSWORD)
        ) {
          response.code = 1;
          response.user =
            this.companyName == "vision" ? results[0] : results.recordset[0];
        } else {
          // Le mot de passe est incorrect
          response.code = 2;
        }
      } else {
        // Aucun résultat trouvé pour cette adresse e-mail
        response.code = 0;
      }
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête SELECT :", error);
      response.code = 3;
    }

    return response;
  }

  async signup() {
    try {
      // Vérifier si la table "workflowusers" existe déjà
      const checkTableQuery = `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'WORKLOWUSERS'
      `;

      const checkTableResult = await this.connexion.query(checkTableQuery);
      console.log(checkTableResult);
      const tableExists = checkTableResult.recordset.length > 0;

      if (!tableExists) {
        // Créer la table "workflowusers" si elle n'existe pas
        const createTableQuery = `
          CREATE TABLE WORKLOWUSERS (
            COMPANYID VARCHAR(255),
            EMAILADD VARCHAR(255) PRIMARY KEY,
            USERNAME VARCHAR(255),
            DEPARTMENT VARCHAR(255),
            GRADE VARCHAR(255),
            PASSWORD VARCHAR(255),
            MAXAMOUNT VARCHAR(255)
          )
        `;
        this.connexion.query(createTableQuery);
      }

      // Insérer les informations de l'utilisateur dans la table "workflowusers"
      const insertQuery = `
        INSERT INTO WORKLOWUSERS (COMPANYID, EMAILADD, USERNAME, DEPARTMENT, GRADE, PASSWORD, MAXAMOUNT)
        VALUES ('${this.companyName}', '${this.emailAdd}', '${this.username}', '${this.department}', '${this.grade}', '${this.password}', '${this.maxAmount}')
      `;

      return new Promise((resolve, reject) => {
        this.connexion.query(insertQuery, (error) => {
          if (error) {
            console.log(
              "Erreur lors de l'exécution de la requête SELECT :",
              error
            );
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log("Une erreur s'est produite :", error);
      return false; // Erreur lors de l'opération
    }
  }

  async getAllUsers() {
    const query = `SELECT * FROM ${this.table}`;
    return new Promise((resolve, reject) => {
      this.connexion.query(query, async (error, results) => {
        if (error) {
          console.error("Erreur lors de l'exécution de la requête :", error);
          reject(error);
          return;
        }
        const formattedUsers = [];
        if (this.companyName != "vision") {
          for (const user of results.recordset) {
            formattedUsers.push({
              COMPANYID: user.COMPANYID,
              EMAILADD: user.EMAILADD,
              USERNAME: user.USERNAME,
              DEPARTMENT: user.DEPARTMENT,
              GRADE: user.GRADE,
              PASSWORD: user.PASSWORD,
              MAXAMOUNT: user.MAXAMOUNT,
            });
          }
        } else {
          for (const user of results) {
            formattedUsers.push({
              COMPANYID: user.COMPANYID,
              EMAILADD: user.EMAILADD,
              USERNAME: user.USERNAME,
              DEPARTMENT: user.DEPARTMENT,
              GRADE: user.GRADE,
              PASSWORD: user.PASSWORD,
              MAXAMOUNT: user.MAXAMOUNT,
            });
          }
        }
        resolve(formattedUsers);
      });
    })
      .then((formattedUsers) => {
        if (this.companyName == "vision") {
          this.connexion.end();
        }
        return formattedUsers;
      })
      .catch((error) => {
        console.error("Une erreur s'est produite :", error);
        if (this.companyName == "vision") {
          this.connexion.end();
        }
        return error;
      });
  }

  createCompany() {
    // Informations de la nouvelle compagnie (à remplacer par vos entrées)
    const companyInfo = {
      backgroundColor: this.backgroundColor,
      companyName: this.companyName,
      username: this.username,
      databaseName: this.databaseName,
      password: this.password,
      servername: this.servername,
    };
    const query =
      "INSERT INTO Company (backgroundColor, companyName, username, databaseName, password, servername) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [
      companyInfo.backgroundColor,
      companyInfo.companyName,
      companyInfo.username,
      companyInfo.databaseName,
      companyInfo.password,
      companyInfo.servername,
    ];

    this.connexion.query(query, values, (err, result) => {
      this.connexion.end(); // Fermeture de la connexion à la base de données

      if (err) {
        console.error("Erreur lors de la création de la compagnie :", err);
        return {
          status: "error",
          message: "Echec lors de la création d'une nouvelle compagnie",
        };
      }
    });

    return {
      status: "success",
      message: "Nouvelle compagnie ajoutée",
    };
  }
}

module.exports = User;
