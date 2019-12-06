const express = require("express");
const router = express.Router();
const token = require("../middleware/tokenLogin");
const accountsController = require("../controllers/accounts.controller");

router.get("/", token.verify, accountsController.searchAccounts);
router.post("/register", accountsController.register);
router.post("/login", accountsController.login);
router.put("/password", token.verify, accountsController.changeNewPassword);
router.get("/spaces/:space_id", token.verify, accountsController.getCurrentSpaceToken);

module.exports = router;