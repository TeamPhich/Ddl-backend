const express = require("express");
const router = express.Router();
const token = require("../middleware/token");
const privileges = require("../middleware/privilege");
const accountsController = require("../controllers/accounts.controller");

router.get("/", token.verify, privileges.verify(1), accountsController.getAccounts);
router.post("/register", accountsController.register);
router.post("/login", accountsController.login);

module.exports = router;