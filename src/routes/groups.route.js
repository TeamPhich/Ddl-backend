const express = require("express");
const router = express.Router();
const groupsController = require("../controllers/groups.controller");
const spaceToken = require("../middleware/tokenCurrentSpace");

router.get("/", spaceToken.verify, groupsController.getGroups);
router.post("/", spaceToken.verify, groupsController.createGroup);
router.get("/members/:group_id", spaceToken.verify, groupsController.getMembers);
router.post("/members", spaceToken.verify, groupsController.addMembers);
router.put("/members", spaceToken.verify, groupsController.removeMembers);


module.exports = router;