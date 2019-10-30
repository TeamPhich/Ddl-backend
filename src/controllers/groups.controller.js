const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function getGroups(req, res) {
    const {
        space_id
    } = req.body;
    try {
        const id = req.tokenData.id;
        const  [rows] = await  dbPool.query(`   SELECT groups.id , groups.space_id , groups.name, groups.couple 
                                                FROM groups 
                                                INNER JOIN spaces ON groups.space_id = spaces.id 
                                                INNER JOIN spaces_members ON spaces.id = spaces_members.space_id 
                                                WHERE spaces_members.user_id = "${id}"
                                                AND groups.space_id = "${space_id}"`);
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
                                                    WHERE groups.name = "${name}" AND groups.space_id = ${space_id}`);
        if (existGroups.length) throw new Error("group_name existed");
        const [temp1] = await dbPool.query(`INSERT INTO groups (space_id,name,couple) VALUES (${space_id},"${name}",${couple})`);
        const group_id = temp1.insertId;
        const  [temp2] = await dbPool.query(`   SELECT id FROM spaces_members 
                                                WHERE spaces_members.user_id = "${id}" 
                                                AND spaces_members.space_id = "${space_id}"`);
        const [temp3] = await dbPool.query(`INSERT INTO groups_members (member_id,group_id) VALUES (${temp2[0]["id"]},${group_id})`);
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function addMembers(req, res) {
    const {
        space_member_ids,
        group_id
    } = req.body
    try{
        for (let i = 0 ; i < space_member_ids.length ; i++ ) {
            const [temp1] = await dbPool.query(`  SELECT * FROM groups_members 
                                                WHERE member_id = ${space_member_ids[i]} AND group_id = ${group_id}`);
            if (!temp1.length) {
                const temp2 = await dbPool.query(`   INSERT INTO groups_members 
                                                (member_id,group_id) VALUES ("${space_member_ids[i]}","${group_id}")`);
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
        member_ids,
        group_id
    } = req.body
    try{
        for (let i = 0 ; i < member_ids.length ; i++ ) {
            const temp = await dbPool.query(`   DELETE FROM groups_members 
                                                WHERE groups_members.member_id = "${member_ids[i]}" 
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
        const [rows] = await dbPool.query(` SELECT * FROM groups_members 
        INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
        INNER JOIN accounts ON spaces_members.user_id = accounts.id 
        WHERE groups_members.group_id = ${group_id}`);
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