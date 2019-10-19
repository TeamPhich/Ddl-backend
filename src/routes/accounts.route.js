const express = require("express");
const router = express.Router();
const token = require("../middleware/token");
const accountsController = require("../controllers/accounts.controller");

router.get("/",token.verify ,accountsController.getAccounts);
router.post("/register", accountsController.register);
router.post("/login", accountsController.login);

module.exports = router;