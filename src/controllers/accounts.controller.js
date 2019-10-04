const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function getAccounts(req, res) {
    try {
        const [rows,fields] = await dbPool.query("select * from accounts");
        res.send(responseUtil.success({data: rows}));
    } catch (err) {
        res.send(err.message)
    }
}

module.exports = {
    getAccounts
};