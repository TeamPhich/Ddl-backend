const mysql = require('mysql2');
const config = require("config");

const database = config.get("DATABASE");
const {HOST, USER, NAME, PASSWORD} = database;

let dbPool = mysql.createPool({
    host: HOST,
    user: USER,
    database: NAME,
    password: PASSWORD,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
});

dbPool = dbPool.promise();

module.exports = dbPool;