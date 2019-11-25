const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function getGroups(req, res) {
    try {
        const id = req.tokenData.id;
        const space_id = req.tokenData.space_id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members                                            
                                                WHERE spaces_members.user_id = "${id}"
                                                AND spaces_members.space_id = "${space_id}"`);
        if (!temp_id.length) throw  new Error("you are not in space");
        const [rows1] = await dbPool.query(`    SELECT groups.id,groups.name FROM groups 
                                                INNER JOIN groups_members ON groups.id = groups_members.group_id
                                                INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id
                                                WHERE groups.space_id = "${space_id}"
                                                AND spaces_members.user_id = "${id}"
                                                AND groups.couple = 0`);
        const [rows2] = await dbPool.query(` SELECT user_name FROM accounts 
                                            INNER JOIN spaces_members ON accounts.id = spaces_members.user_id
                                            INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                            WHERE groups_members.group_id IN    (SELECT groups.id FROM groups 
                                                                                INNER JOIN groups_members ON groups.id = groups_members.group_id
                                                                                INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id
                                                                                WHERE groups.space_id = "${space_id}"
                                                                                AND spaces_members.user_id = "${id}"
                                                                                AND groups.couple = 1)
                                            AND groups_members.member_id <> "${id}"`);
        res.json(responseUtil.success({data: {rows1,rows2}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function createGroup(req, res) {
    const {
        name,
        couple
    } = req.body;
    try {
        const space_id = req.tokenData.space_id;
        if (!name) throw new Error("name field is missing");
        if (!couple) throw new Error("couple field is missing");
        const id = req.tokenData.id;
        const [existGroups] = await dbPool.query(`  SELECT * FROM spaces 
                                                    INNER JOIN groups ON spaces.id = groups.space_id 
                                                    WHERE groups.name = "${name}" AND groups.space_id = ${space_id}`);
        if (existGroups.length) throw new Error("group_name existed");
        const [temp1] = await dbPool.query(`INSERT INTO groups (space_id,name,couple) VALUES (${space_id},"${name}",${couple})`);
        const group_id = temp1.insertId;
        const [temp2] = await dbPool.query(`   SELECT id FROM spaces_members 
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
        member_ids,
        group_id
    } = req.body;
    try {
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"
                                                AND groups_members.group_id = "${group_id}"`);
        if (!temp_id.length) throw  new Error("you are not in group");
        if (!member_ids) throw new Error("member_ids field is missing");
        if (!group_id) throw new Error("group_id field is missing");
        for (let i = member_ids.length - 1; i >= 0; i--) {
            const [temp1] = await dbPool.query(`    SELECT * FROM groups_members
                                                    WHERE groups_members.member_id = "${member_ids[i]}" AND groups_members.group_id = "${group_id}"`);
            if (temp1.length) throw new Error("user was in group");
            const [temp2] = await dbPool.query(`    SELECT * FROM spaces_members 
                                                    WHERE spaces_members.id = "${member_ids[i]}"
                                                    AND spaces_members.space_id = ( SELECT space_id FROM groups 
                                                                                    INNER JOIN spaces ON groups.space_id = spaces.id
                                                                                    WHERE groups.id = "${group_id}")`);
            if (!temp2.length) throw new Error("user not in space")
            const [temp] = await dbPool.query(`INSERT INTO groups_members (member_id, group_id) VALUES ("${member_ids_filtered[i]}","${group_id}")`);
        }
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function removeMembers(req, res) {
    const {
        member_id,
        group_id
    } = req.body
    try {
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"
                                                AND groups_members.group_id = "${group_id}"`);
        if (!temp_id.length) throw  new Error("you are not in group");
        if (!member_id) throw new Error("member_id field is missing");
        if (!group_id) throw new Error("group_id field is missing");
        const temp = await dbPool.query(`   DELETE FROM groups_members 
                                            WHERE groups_members.member_id = "${member_id}" 
                                            AND groups_members.group_id = "${group_id}"`);
        res.json(responseUtil.success({data: {}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function getMembers(req, res) {
    const {
        group_id
    } = req.body
    try {
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"
                                                AND groups_members.group_id = "${group_id}"`);
        if (!temp_id.length) throw  new Error("you are not in group");
        if (!group_id) throw new Error("group_id field is missing");
        const [rows] = await dbPool.query(` SELECT user_name,email,full_name FROM groups_members 
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