const express = require("express");
const router = express.Router();
const token = require("../middleware/token");
const spacesController = require("../controllers/spaces.controller");

router.post("/",token.verify ,spacesController.createSpace);
router.get("/", token.verify, spacesController.getListSpace);

module.exports = router;