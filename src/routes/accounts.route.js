const express = require("express");
const router = express.Router();
const token = require("../middleware/tokenLogin");
const privileges = require("../middleware/privilege");
const accountsController = require("../controllers/accounts.controller");
const space_token = require("../middleware/tokenCurrentSpace");
const members = require("../middleware/members");

router.get("/", space_token.verify, privileges.verify(1), members.spaceVerify, accountsController.getAccounts);
router.post("/register", accountsController.register);
router.post("/login", accountsController.login);
router.get("/spaces/:space_id", token.verify, accountsController.getCurrentSpaceToken);

module.exports = router;