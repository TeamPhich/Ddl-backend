const express = require("express");
const router = express.Router();
const privilege = require("../middleware/privilege");
const tokenLogin = require("../middleware/tokenLogin");
const tokenCurrentSpace = require("../middleware/tokenCurrentSpace");
const spacesController = require("../controllers/spaces.controller");

router.post("/",tokenLogin.verify ,spacesController.createSpace);
router.get("/", tokenLogin.verify, spacesController.getSpaceList);
router.post("/members", tokenCurrentSpace.verify, spacesController.addMember);
router.get("/members", tokenCurrentSpace.verify, spacesController.getMemberList);
router.delete("/members", tokenCurrentSpace.verify, privilege.verify(2), spacesController.removeMember);
router.delete("/leavings", tokenCurrentSpace.verify, spacesController.leaveSpace);
router.put("/admins", tokenCurrentSpace.verify, privilege.verify(3), spacesController.authorizeAdmin);

module.exports = router;