const express = require("express");
const router = express.Router();
const token = require("../middleware/token");
const privilege = require("../middleware/privilege");
const spacesController = require("../controllers/spaces.controller");

router.post("/",token.verify ,spacesController.createSpace);
router.get("/", token.verify, spacesController.getListSpace);
router.post("/members", token.verify, spacesController.addMember);
router.get("/members", token.verify, spacesController.getListMember);
router.delete("/members", token.verify, privilege.verify(2), spacesController.removeMember);
router.delete("/leavings", token.verify, spacesController.leaveSpace);
module.exports = router;