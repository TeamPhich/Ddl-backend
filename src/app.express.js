const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const config = require("config");
const cors = require("cors");

const accountsRoute = require("./routes/accounts.route");
const spacesRoute = require("./routes/spaces.route");
const groupsRoute= require("./routes/groups.route");
const tasksRoute = require("./routes/tasks.route");

const appExpress = express();

appExpress.use(bodyParser.json());
appExpress.use(bodyParser.urlencoded({extended: false}));
appExpress.use(morgan('combined'));
appExpress.use(cors());

appExpress.use("/api/v1/accounts/", accountsRoute);
appExpress.use("/api/v1/spaces/", spacesRoute);
appExpress.use("/api/v1/groups", groupsRoute);
appExpress.use("/api/v1/tasks/", tasksRoute);

appExpress.use("/api/v1", (req, res) => {
    res.send("ddl-backend");
});

module.exports = appExpress;