const jwt = require("jsonwebtoken");
const config = require("config");

const port = config.get("port");
const spaceSecretKey = config.get("SPACE_SECRET_KEY");
const dbPool = require("./db");

async function authenticate( spaceToken) {
    jwt.verify(spaceToken, spaceSecretKey, (err, decoded) => {
        if (!err) return {success: true, decoded};
        else return {success: false};
    });
}

module.exports = {
    authenticate
};