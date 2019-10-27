const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function getGroups(req, res) {
    const {
        space_id
    } = req.body;
    try {
        const id = req.tokenData.id;
        const  [rows] = await  dbPool.query(` SELECT * FROM groups_members 
                                            INNER JOIN groups ON groups_members.group_id = groups.id 
                                            WHERE groups.space_id = "${space_id}"
                                            AND groups_members.user_id = "${id}"`);
        res.json(responseUtil.success({data: {rows}}))
    } catch (err) {
        res.json(responseUtil.fail({reason : err.message}))
    }
}

async function createGroup(req, res) {
    const {
        space_id,
        name,
        couple
    } = req.body;
    try{
        const id = req.tokenData.id;
        const [existGroups] = await dbPool.query(`  SELECT * FROM spaces 
                                                    INNER JOIN groups ON spaces.id = groups.space_id 
                                                    AND groups.name = "${name}"`);
        if (existGroups.length) throw new Error("group_name existed");
        const [temp1] = await dbPool.query(`INSERT INTO groups (space_id,name,couple) VALUES (${space_id},"${name}",${couple})`);
        const group_id = temp1.insertId;
        const temp2 = await dbPool.query(`INSERT INTO groups_members (user_id,group_id) VALUES (${id},${group_id})`);
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
        for (let i = 0 ; i < user_ids.length ; i++ ) {
            const [temp1] = await dbPool.query(`  SELECT * FROM groups_members 
                                                WHERE user_id = ${user_ids[i]} AND group_id = ${group_id}`);
            if (!temp1.length) {
                const temp2 = await dbPool.query(`   INSERT INTO groups_members 
                                                (user_id,group_id) VALUES ("${user_ids[i]}","${group_id}")`);
            }
            else throw new Error("The user is already in the group");
        }
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
        for (let i = 0 ; i < user_ids.length ; i++ ) {
            const temp = await dbPool.query(`   DELETE FROM groups_members 
                                                WHERE user_id = "${user_ids[i]}" 
                                                AND group_id = "${group_id}"`);
        }
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async  function getMembers(req, res) {
    const {
        group_id
    } = req.body
    try{
        const [rows] = await dbPool.query(` SELECT user_id,user_name,email FROM groups_members 
                                            INNER JOIN accounts ON groups_members.user_id = accounts.id 
                                            WHERE group_id = "${group_id}"`);
        res.json(responseUtil.success({data: {rows}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    getGroups,
    createGroup,
    addMembers,
    removeMembers,
    getMembers
};