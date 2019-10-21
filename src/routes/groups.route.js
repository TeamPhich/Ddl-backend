const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groups.controller")
const token = require("../middleware/token");

router.post("/create",token.verify ,groupsController.createGroup);

module.exports = router;