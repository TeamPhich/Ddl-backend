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
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function addMembers(req, res) {
    const {
        user_ids,
        group_id
    } = req.body
    try{
        user_ids.forEach(async function (user_id){
            const temp = await dbPool.query(`INSERT INTO groups_members (user_id,group_id) VALUES ("${user_id}","${group_id}")`);
        });
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async  function removeMembers(req, res) {
    const {
        user_ids,
        group_id
    } = req.body
    try{
        user_ids.forEach(async function (user_id){
            const temp = await dbPool.query(`DELETE FROM groups_members WHERE user_id = "${user_id}" AND group_id = "${group_id}"`);
        });
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createGroup,
    addMembers,
    removeMembers,
};