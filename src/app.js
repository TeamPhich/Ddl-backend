const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const config = require("config");

const accountsRoute = require("./routes/accounts.route");
const spacesRoute = require("./routes/spaces.route");
const groupsRoute= require("./routes/groups.route");
const tasksRoute = require("./routes/tasks.route");

const app = express();

const port = config.get("port");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('combined'));

app.use("/api/v1/accounts/", accountsRoute);
app.use("/api/v1/spaces/", spacesRoute);
app.use("/api/v1/groups", groupsRoute);
app.use("/api/v1/tasks", tasksRoute);

app.use("/api/v1", (req, res) => {
    res.send("ddl-backend");
});


app.listen(port, () => {
    console.log("server is running on port: ", port);
});

module.exports = app;