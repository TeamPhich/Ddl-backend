const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createSpace(req, res) {
    try {
        const id = req.tokenData.id; // xem xet
        const name = req.body.name;
        if(!name) throw new Error ("name field is missing");
        const [rows, fields] = await dbPool.query(`select * from spaces where name = "${name}"`);
        if(rows.length) throw new Error ("name was existed");
        await dbPool.query(`INSERT INTO spaces(user_id, name)
                            VALUES(${id},"${name}")`);
        res.json(responseUtil.success({data: {}}));
    } catch (err){
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getListSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const [rows] = await dbPool.query(`select name, id from spaces where user_id = ${id}`);
        res.json(responseUtil.success({data: {rows}}));
    }
    catch(err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createSpace,
    getListSpace,

};