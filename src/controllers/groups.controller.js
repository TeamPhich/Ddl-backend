const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createGroup(req, res) {
    const {
        space_id,
        name
    } = req.body;
    try{
        const [existGroups] = await dbPool.query(`SELECT * FROM spaces INNER JOIN groups ON spaces.id = groups.space_id AND groups.name = "${name}"`);
        if (existGroups.length) throw new Error("group_name existed");
        const temp = await  dbPool.query(`INSERT INTO groups (space_id,name) VALUES (${space_id},"${name}")`)
        console.log(temp);
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createGroup
};