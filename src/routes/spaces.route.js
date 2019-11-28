const express = require("express");
const router = express.Router();
const privilege = require("../middleware/privilege");
const tokenLogin = require("../middleware/tokenLogin");
const tokenCurrentSpace = require("../middleware/tokenCurrentSpace");
const spacesController = require("../controllers/spaces.controller");
const member = require("../middleware/members");
const roleLayer = require("../middleware/roleLayer");

router.post("/", tokenLogin.verify, spacesController.createSpace);
router.get("/", tokenLogin.verify, spacesController.getSpaceList);
router.post("/members", tokenCurrentSpace.verify, spacesController.addMember);
router.get("/members", tokenCurrentSpace.verify, spacesController.getMemberList);
router.delete("/members", tokenCurrentSpace.verify, member.spaceVerify, privilege.verify(2), roleLayer.verify, spacesController.removeMember);
router.delete("/leavings", tokenCurrentSpace.verify, privilege.verify(5), spacesController.leaveSpace);
router.put("/admins", tokenCurrentSpace.verify, member.spaceVerify, privilege.verify(3), roleLayer.verify ,spacesController.authorizeAdmin);
router.delete("/", tokenCurrentSpace.verify, privilege.verify(8), spacesController.deleteSpace);
router.get("/profiles", tokenCurrentSpace.verify, spacesController.getProfile);

module.exports = router;