const calculateTotalAmount = require("../functions/calculateAmount");
const getAdminConnexion = require("../functions/getAdminConnexion");
const getStartAmount = require("../functions/getAmount");

class Requisition {
  constructor(databases) {
    this.workflow_host = "www.vbs-solutions.com";
    this.workflow_dbname = "u833159023_workflow_admin";
    this.workflow_username = "u833159023_kinda";
    this.workflow_password = "Kind@1404";
    this.headerTable = "PORQNH1";
    this.lineTable = "PORQNL";
    this.connexion = null;

    this.RQNHSEQ;
    this.RQNNUMBER;
    this.VDNAME;
    this.REQUESTBY;
    this.EXPARRIVAL;
    this.ONHOLD;
    this.DESCRIPTIO;
    this.REFERENCE;
    this.RequisitionLine;
    this.TOTALAMOUNT;
    this.department;
    this.companyName;
    this.maxAmount;

    if (this.connexion === null) {
      this.connexion = databases;
    }
  }

  async getRequisitions() {
    const dbAdmin = getAdminConnexion();

    // Récupérer les données des en-têtes des réquisitions
    const reqForHeader = `SELECT RQNHSEQ, RQNNUMBER, VDNAME, REQUESTBY, EXPARRIVAL, ONHOLD, DESCRIPTIO, REFERENCE FROM ${this.headerTable} WHERE ONHOLD = 1`;

    return new Promise((resolve, reject) => {
      this.connexion.query(
        reqForHeader,
        (error, resultsOfRequisitionsHeader) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            const requisitionsHeader =
              this.companyName != "vision"
                ? resultsOfRequisitionsHeader.recordset
                : resultsOfRequisitionsHeader;

            // Récupérer les données des lignes des réquisitions
            const reqForLine = `SELECT RQNHSEQ, RQNLREV, OQORDERED, ORDERUNIT, ITEMNO, EXPARRIVAL, ITEMDESC, MANITEMNO, OEONUMBER, EXTENDED FROM ${this.lineTable}`;
            this.connexion.query(
              reqForLine,
              (error, resultsOfRequisitionsLines) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  const requisitionsLines =
                    this.companyName != "vision"
                      ? resultsOfRequisitionsLines.recordset
                      : resultsOfRequisitionsLines;

                  const mappingQuery = `SELECT RQNNUMBER FROM MAPPING WHERE DEPART = '${this.department}'`;

                  this.connexion.query(
                    mappingQuery,
                    (error, resultOfRqNumber) => {
                      if (error) {
                        console.log(error);

                        reject(error);
                      } else {
                        const mappedRqNumbers = resultOfRqNumber.map(
                          (row) => row.RQNNUMBER
                        );

                        // Filtrer les réquisitions en fonction des RQNNUMBER correspondants dans la table "Mapping"
                        const filteredRequisitions = requisitionsHeader.filter(
                          (header) => mappedRqNumbers.includes(header.RQNNUMBER)
                        );

                        // Obtenir les données des grades
                        const gradeQuery = `SELECT * FROM Grade G JOIN Company C ON G.companyId = C.id WHERE C.companyName = '${this.companyName}'`;
                        dbAdmin.query(gradeQuery, (error, resultsOfGrade) => {
                          if (error) {
                            console.error(error);
                            reject(error);
                          } else {
                            const gradeResult =
                              this.companyName != "vision"
                                ? resultsOfGrade.recordset
                                : resultsOfGrade;
                            const minTotalAmount = getStartAmount(
                              gradeResult,
                              this.maxAmount
                            );

                            const maxTotalAmount = parseFloat(this.maxAmount);

                            // Filtrer les réquisitions en fonction de la plage de totalAmount
                            const requisitions = [];

                            for (const requisition of filteredRequisitions) {
                              const rqnhseq = requisition.RQNHSEQ;
                              const requisitionLiness =
                                requisitionsLines.filter(
                                  (line) => line.RQNHSEQ === rqnhseq
                                );

                              const totalAmount = parseFloat(
                                calculateTotalAmount(requisitionLiness)
                              );

                              requisition.RequisitionLine = requisitionLiness;
                              requisition.TOTALAMOUNT = totalAmount.toString();

                              if (
                                totalAmount <= maxTotalAmount &&
                                totalAmount >= minTotalAmount
                              ) {
                                console.log(
                                  "totalAmount: " +
                                    totalAmount +
                                    "\nminTotalAmount: " +
                                    minTotalAmount +
                                    "\nmaxTotalAmount: " +
                                    maxTotalAmount
                                );
                                requisitions.push(requisition);
                              }
                            }

                            resolve(requisitions);
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  }

  async validateRequisition() {
    try {
      // Requête de mise à jour
      const updateQuery = `UPDATE ${this.headerTable} SET ONHOLD = ${this.ONHOLD} WHERE RQNNUMBER = '${this.RQNNUMBER}'`;

      return new Promise((resolve, reject) => {
        this.connexion.query(updateQuery, (error, results) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            const rowCount =
              this.companyName != "vision"
                ? results.recordset.affectedRows
                : results.affectedRows;

            // Vérifier si la mise à jour a été effectuée avec succès
            if (rowCount > 0) {
              // Mise à jour réussie
              resolve(1);
            } else {
              // Aucune requête correspondante trouvée
              resolve(0);
            }
          }
        });
      });
    } catch (error) {
      console.error("Erreur lors de la validation de la réquisition :", error);
      throw error;
    }
  }
}

module.exports = Requisition;
