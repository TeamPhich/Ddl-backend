const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const config = require("config");

const app = express();

const port = config.get("port");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('combined'));

app.use("/api/v1/accounts/", accountsRoute);


app.listen(port, () => {
    console.log("server is running on port: ", port);
});

module.exports = app;