const express = require("express");
const router = express.Router();
const token = require("../middleware/tokenLogin");
const spacesController = require("../controllers/spaces.controller");

router.post("/",token.verify ,spacesController.createSpace);
router.get("/", token.verify, spacesController.getListSpace);
router.post("/members", token.verify, spacesController.addMember);
router.get("/members", token.verify, spacesController.getListMember);

module.exports = router;