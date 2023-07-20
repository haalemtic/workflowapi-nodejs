const express = require("express");
const bodyParser = require("body-parser");
const Database = require("./src/configurations/database"); // Assurez-vous d'avoir le fichier Database.js pour la connexion à la base de données.
const Administrator = require("./src/models/administrator"); // Assurez-vous d'avoir le fichier Administrator.js pour la classe Administrator.
const { loginAsAdmin } = require("./src/controllers/loginAsAdmin");
const Company = require("./src/models/company");
const { allCompanies } = require("./src/controllers/allCompanies");
const { createCompany } = require("./src/controllers/createCompany");
const { updateCompany } = require("./src/controllers/updateCompany");
const { signup } = require("./src/controllers/signup");
const { login } = require("./src/controllers/login");
const { getAllUsers } = require("./src/controllers/getAllUsers");
const { getCompanyByName } = require("./src/controllers/getCompanyByName");
const { getRequisitions } = require("./src/controllers/getRequisitions");
const { validateRequisition } = require("./src/controllers/validateRequisition");
const app = express();


app.use(bodyParser.json());
app.use((req, res) => {
  res.json({ message: "UPDATE !" }); 
});
//Se connecter à la plateforme d'administration
app.post("/loginAsAdmin", async (req, res) => {
  const databases = new Database();
  const connexion = databases.connectToWorkflowDB();
  const administratorInstance = new Administrator(connexion);
  const administrators = await administratorInstance.getAll();
  loginAsAdmin(req, res, administrators);
});
//Reccupérer toutes les entreprises
app.get("/allCompanies", async (req, res) => {
  const databases = new Database();
  const connexion = databases.connectToWorkflowDB();
  const companyInstance = new Company(connexion);
  const companies = await companyInstance.getCompanies();
  allCompanies(req, res, companies);
});

//Créer une entreprise
app.post("/newCompany", async (req, res) => {
  const databases = new Database();
  const connexion = databases.connectToWorkflowDB();

  createCompany(req, res, connexion);
});

//Mettre à jour une entreprise
app.post("/updateCompany", async (req, res) => {
  const databases = new Database();
  const connexion = databases.connectToWorkflowDB();

  updateCompany(req, res, connexion);
});

//S'enregistrer
app.post("/signUp", async (req, res) => {
  const databases = new Database();
  databases.companyName = req.body.companyName;
  const connexion = await databases.connectToCompanyDB();

  signup(req, res, connexion);
});

//Se connecter en tant qu'utilisateur d'une entreprise
app.post("/login", async (req, res) => {
  const databases = new Database();
  databases.companyName = req.body.companyName;
  const connexion = await databases.connectToCompanyDB();

  await login(req, res, connexion);
});

//Reccupération de tous les utilisateurs
app.post("/companyAllUsers", async (req, res) => {
  const databases = new Database();
  databases.companyName = req.body.companyName;
  const connexion = await databases.connectToCompanyDB();

  await getAllUsers(req, res, connexion);
});

//Reccupération des informations d'une entreprise
app.post("/companyData", async (req, res) => {
  const databases = new Database();
  const connexion = databases.connectToWorkflowDB();

  await getCompanyByName(req, res, connexion);
});

//Reccupération toutes les réquisitions
app.post("/requisitions", async (req, res) => {
  const databases = new Database();
  databases.companyName = req.body.companyName;
  const connexion = await databases.connectToCompanyDB();

  await getRequisitions(req, res, connexion);
});

//Valider une réquisition
app.post("/validateRequisition", async (req, res) => {
  const databases = new Database();
  databases.companyName = req.body.companyName;
  const connexion = await databases.connectToCompanyDB();

  await validateRequisition(req, res, connexion);
});


module.exports = app;
