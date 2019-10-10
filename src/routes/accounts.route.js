const express = require("express");
const router = express.Router();
const token = require("../middleware/token");
const accountController = require("../controllers/accounts.controller");

router.get("/",token.verify ,accountController.getAccounts);
router.post("/register", accountController.register);
router.post("/login", accountController.login);

module.exports = router;