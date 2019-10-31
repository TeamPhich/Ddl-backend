const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function getGroups(req, res) {
    const {
        space_id
    } = req.body;
    try {
        const id = req.tokenData.id;
        if(!space_id) throw new Error("space_id field is missing");
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members                                            
                                                WHERE spaces_members.user_id = "${id}"
                                                AND spaces_members.space_id = "${space_id}"`);
        if (!temp_id.length) throw  new Error("you are not in space");
        const  [rows] = await  dbPool.query(`   SELECT * FROM groups 
                                                INNER JOIN groups_members ON groups.id = groups_members.group_id
                                                INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id
                                                WHERE groups.space_id = "${space_id}"
                                                AND spaces_members.user_id = "${id}"`);
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
        if(!space_id) throw new Error("space_id field is missing");
        if(!name) throw new Error("name field is missing");
        if(!couple) throw new Error("couple field is missing");
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
        member_ids,
        group_id
    } = req.body
    try{
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"`);
        if (!temp_id.length) throw  new Error("you are not in group");
        if(!member_ids) throw new Error("member_ids field is missing");
        if(!group_id) throw new Error("group_id field is missing");
        var member_ids_filtered = member_ids;
        var users_not_in_space = [];
        var users_in_group = [];
        for (let i = member_ids.length - 1 ; i >= 0 ; i--) {
            const [temp1] = await dbPool.query(`    SELECT * FROM groups_members
                                                    WHERE groups_members.member_id = "${member_ids[i]}" AND groups_members.group_id = "${group_id}"`);
            console.log(temp1);
            if (temp1.length) {
                users_in_group.push(member_ids[i]);
                member_ids_filtered = member_ids_filtered.filter(function (value , index , arr) {
                    return value = member_ids[i];
                });
                delete member_ids_filtered[i];
                continue;
            }
            const [temp2] = await dbPool.query(`    SELECT * FROM spaces_members 
                                                    WHERE spaces_members.id = "${member_ids[i]}"
                                                    AND spaces_members.space_id = ( SELECT space_id FROM groups 
                                                                                    INNER JOIN spaces ON groups.space_id = spaces.id
                                                                                    WHERE groups.id = "${group_id}")`);
            console.log(temp2);
            if (!temp2.length) {
                users_not_in_space.push(member_ids[i]);
                member_ids_filtered = member_ids_filtered.filter(function (value , index , arr) {
                    return value = member_ids[i];
                });
                delete member_ids_filtered[i];
                continue;
            }
        }
        console.log(users_not_in_space);
        console.log(users_in_group);
        console.log(member_ids_filtered);
        for (let i = 0 ; i < member_ids_filtered.length ; i++){
            if ( member_ids_filtered[i] != null) {
                const [temp] = await  dbPool.query(`INSERT INTO groups_members (member_id, group_id) VALUES ("${member_ids_filtered[i]}","${group_id}")`);
            }
        }
        res.json(responseUtil.success({data: {users_not_in_space, users_in_group, member_ids_filtered}}))
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async  function removeMembers(req, res) {
    const {
        member_id,
        group_id
    } = req.body
    try{
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"`);
        console.log(temp_id);
        if (!temp_id.length) throw  new Error("you are not in group");
        if(!member_id) throw new Error("member_id field is missing");
        if(!group_id) throw new Error("group_id field is missing");
        const temp = await dbPool.query(`   DELETE FROM groups_members 
                                            WHERE groups_members.member_id = "${member_id}" 
                                            AND groups_members.group_id = "${group_id}"`);
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
        const id = req.tokenData.id;
        const [temp_id] = await dbPool.query(`  SELECT * FROM spaces_members
                                                INNER JOIN groups_members ON spaces_members.id = groups_members.member_id
                                                WHERE spaces_members.user_id = "${id}"`);
        if (!temp_id.length) throw  new Error("you are not in group");
        if(!group_id) throw new Error("group_id field is missing");
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