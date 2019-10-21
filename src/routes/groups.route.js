const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groups.controller")
const token = require("../middleware/token");

router.post("/group",token.verify ,groupsController.createGroup);
router.post("/members" ,token.verify ,groupsController.addMembers);
router.put("/members" ,token.verify ,groupsController.removeMembers);

module.exports = router;