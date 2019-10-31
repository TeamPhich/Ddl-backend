const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groups.controller")
const token = require("../middleware/token");

router.get("/" ,token.verify ,groupsController.getGroups)
router.post("/" ,token.verify ,groupsController.createGroup);
router.get("/members" ,token.verify ,groupsController.getMembers)
router.post("/members" ,token.verify ,groupsController.addMembers);
router.put("/members" ,token.verify ,groupsController.removeMembers);


module.exports = router;