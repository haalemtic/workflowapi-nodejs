const checkMySqlConnection = require("../functions/checkMysqlConnection");
const checkSqlServerConnection = require("../functions/checkSqlSrvConnection");

class Company {
  constructor(databases) {
    this.table = "Company";
    this.connexion = null;
    this.id;
    this.backgroundColor;
    this.companyName;
    this.username;
    this.databaseName;
    this.password;
    this.servername;

    if (this.connexion === null) {
      this.connexion = databases;
    }
  }

  async getCompanies() {
    const query = `SELECT * FROM ${this.table}`;
    return new Promise((resolve, reject) => {
      this.connexion.query(query, async (error, results) => {
        if (error) {
          console.error("Erreur lors de l'exécution de la requête :", error);
          reject(error);
          return;
        } else {
          const queryGrade = `SELECT * FROM Grade`;

          this.connexion.query(queryGrade, async (error, gradeResults) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              const grades = gradeResults;

              const queryDepartment = `SELECT * FROM Department`;

              this.connexion.query(
                queryDepartment,
                async (error, departmentResults) => {
                  if (error) {
                    console.error(error);
                    reject(error);
                  } else {
                    const departments = departmentResults;

                    const formattedCompanies = [];
                    for (const company of results) {
                      const companyId = company.id;
                      const gradeFiltered = [];
                      const departmentFiltered = [];

                      for (const grade of grades) {
                        if (grade.companyId == companyId) {
                          gradeFiltered.push({
                            id: grade.id,
                            companyId: grade.companyId,
                            word: grade.word,
                            maxAmount: grade.maxAmount,
                          });
                        }
                      }

                      for (const department of departments) {
                        if (department.companyId == companyId) {
                          departmentFiltered.push({
                            id: department.id,
                            companyId: department.companyId,
                            departmentName: department.departmentName,
                          });
                        }
                      }

                      const connectionStatus =
                        company.servername == "vbs-solutions.com"
                          ? await checkMySqlConnection(
                              company.servername,
                              company.username,
                              company.password,
                              company.databaseName
                            )
                          : await checkSqlServerConnection(
                              company.servername,
                              company.username,
                              company.password,
                              company.databaseName
                            );
                      formattedCompanies.push({
                        id: companyId,
                        backgroundColor: company.backgroundColor,
                        companyName: company.companyName,
                        username: company.username,
                        databaseName: company.databaseName,
                        password: company.password,
                        servername: company.servername,
                        statut: connectionStatus,
                        grades: gradeFiltered,
                        departments: departmentFiltered,
                      });
                    }
                    resolve(formattedCompanies);
                  }
                }
              );
            }
          });
        }
      });
    })
      .then((formattedCompanies) => {
        this.connexion.end();
        return formattedCompanies;
      })
      .catch((error) => {
        console.error("Une erreur s'est produite :", error);
        this.connexion.end();
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

  updateCompany() {
    try {
      // Requête pour mettre à jour la compagnie
      const query = `UPDATE ${this.table} SET databaseName = "${this.databaseName}", servername = "${this.servername}", username = "${this.username}", password = "${this.password}" WHERE id = ${this.id}`;

      this.connexion.query(query, (erreur, resultats) => {
        if (erreur) {
          console.log("Erreur lors de la mise à jour des champs :", erreur);
          return false;
        } else {
          console.log("Champs mis à jour avec succès !");
          return true;
        }
      });

      this.connexion.end();

      return true;
    } catch (error) {
      console.error(error);
      this.connexion.end();
      return false;
    }
  }

  async getCompanyByName() {
    const response = {
      status: "error",
      message:
        "Erreur lors de la récupération des informations de la compagnie.",
    };

    try {
      // Requête pour récupérer les informations de la compagnie avec le nom spécifié
      const queryCompany = `SELECT * FROM ${this.table} WHERE companyName = '${this.companyName}'`;

      return new Promise((resolve, reject) => {
        const statementCompany = this.connexion.query(
          queryCompany,
          (error, results) => {
            if (error) {
              reject(error);
              console.error(error);
            } else {
              const company = results[0];

              if (!company) {
                // La compagnie n'existe pas
                response.message =
                  "La compagnie avec le nom spécifié n'existe pas.";

                resolve({
                  status: "error",
                  message: "La compagnie avec le nom spécifié n'existe pas.",
                });
              } else {
                // Requête pour récupérer les grades de la compagnie
                const queryGrades = `SELECT * FROM Grade WHERE companyId = '${company.id}'`;
                const statementGrades = this.connexion.query(
                  queryGrades,
                  (error, results) => {
                    if (error) {
                      console.error(error);
                      reject(error);
                    } else {
                      const grades = results;

                      // Requête pour récupérer les départements de la compagnie
                      const queryDepartments = `SELECT * FROM Department WHERE companyId = '${company.id}'`;
                      const statementDepartments = this.connexion.query(
                        queryDepartments,
                        (error, results) => {
                          if (error) {
                            console.error(error);
                            reject(error);
                          } else {
                            const departments = results;

                            // Ajouter les grades et les départements à la compagnie
                            company.grades = grades;
                            company.departments = departments;

                            response.status = "success";
                            response.message =
                              "Informations de la compagnie récupérées avec succès.";
                            response.data = company;

                            resolve({
                              status: "success",
                              message:
                                "Informations de la compagnie récupérées avec succès.",
                              data: company,
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          }
        );
      });
    } catch (error) {
      // Gérer les erreurs de connexion à la base de données ou autres erreurs éventuelles
      console.error(error);
      return {
        status: "error",
        message:
          "Erreur lors de la récupération des informations de la compagnie : " +
          error.message,
      };
    }
    // Retourner les résultats au format JSON
    return response;
  }
}

module.exports = Company;
