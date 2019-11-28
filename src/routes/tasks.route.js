const express = require("express");
const router = express.Router();
const privilege = require("../middleware/privilege");
const tokenLogin = require("../middleware/tokenLogin");
const tokenCurrentSpace = require("../middleware/tokenCurrentSpace");
const tasksController = require("../controllers/tasks.controller");
const member = require("../middleware/members");
const roleLayer = require("../middleware/roleLayer");

router.post("/", tokenCurrentSpace.verify,member.spaceVerify, privilege.verify(4), roleLayer.verify, tasksController.createTask);
router.get("/members", tokenLogin.verify, tasksController.getTaskListOfMember);
router.get("/creators", tokenLogin.verify, tasksController.getTaskListOfCreator);
router.get("/status", tokenCurrentSpace.verify, tasksController.getStatusTaskList);
router.put("/status", tokenCurrentSpace.verify, tasksController.updateTaskStatus);
router.put("/", tokenCurrentSpace.verify, member.spaceVerify, tasksController.updateTask);
router.delete("/:task_id", tokenCurrentSpace.verify, privilege.verify(6), tasksController.deleteTask);

module.exports = router;