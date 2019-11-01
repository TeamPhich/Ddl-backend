const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accounts.controller");

router.get("/", accountController.getAccounts);

module.exports = router;