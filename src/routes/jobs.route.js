const express = require("express");
const router = express.Router();
const privilege = require("../middleware/privilege");
const tokenLogin = require("../middleware/tokenLogin");
const tokenCurrentSpace = require("../middleware/tokenCurrentSpace");
const jobsController = require("../controllers/jobs.controller");

router.post("/", tokenCurrentSpace.verify, privilege.verify(4), jobsController.createTask);

module.exports = router;