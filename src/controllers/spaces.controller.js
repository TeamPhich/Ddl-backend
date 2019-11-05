const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const name = req.body.name;
        if (!name) throw new Error("name field is missing");
        const [rows, fields] = await dbPool.query(`SELECT * 
                                                   FROM spaces 
                                                   WHERE name = "${name}"`);
        if (rows.length) throw new Error("name was existed");
        await dbPool.query(`INSERT INTO spaces(user_id, name)
                            VALUES(${id},"${name}")`);
        let [space_id] = await dbPool.query(`SELECT id 
                                             FROM spaces 
                                             WHERE name = "${name}"`);
        space_id = space_id[0].id;
        await dbPool.query(`INSERT INTO spaces_members(user_id, space_id, role_id)
                            VALUES(${id}, ${space_id}, 1)`);
        await dbPool.query(`INSERT INTO groups(space_id, name, couple)
                            VALUES(${space_id}, "everyone", 0)`);
        let [group_id] = await dbPool.query(`SELECT id 
                                             FROM groups 
                                             WHERE name = "everyone" AND space_id = ${space_id}`);
        group_id = group_id[0].id;
        let [member_id] = await dbPool.query(`SELECT id
                                              FROM spaces_members
                                              WHERE user_id = ${id} AND space_id = ${space_id}`);
        member_id = member_id[0].id;
        await dbPool.query(`INSERT INTO groups_members(member_id, group_id)
                            VALUES(${member_id}, ${group_id})`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getListSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const [rows] = await dbPool.query(`SELECT spaces.name, spaces_members.id 
                                           FROM spaces_members
                                           INNER JOIN spaces ON spaces_members.space_id = spaces.id
                                           WHERE spaces_members.user_id = ${id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function addMember(req, res) {
    const id = req.tokenData.id;
    const {user_id, space_id} = req.body;
    try {
        if (!space_id)
            throw new Error("missing space_id!");
        const [user] = await dbPool.query(`SELECT user_id 
                                           FROM spaces_members 
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if (!user_id)
            throw new Error("missing user_id!");

        if (!user.length)
            throw new Error("user is not in space");
        const [member] = await dbPool.query(`SELECT user_id 
                                             FROM spaces_members 
                                             WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        if (member.length)
            throw new Error("user was in space");
        await dbPool.query(`INSERT INTO spaces_members(user_id, space_id, role_id) 
                            VALUES (${user_id}, ${space_id}, 2)`);
        let [group_id] = await dbPool.query(`SELECT id 
                                             FROM groups 
                                             WHERE name = "everyone" AND space_id = ${space_id}`);
        group_id = group_id[0].id;
        let [member_id] = await dbPool.query(`SELECT id 
                                              FROM spaces_members 
                                              WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        member_id = member_id[0].id;
        await dbPool.query(`INSERT INTO groups_members(member_id, group_id)
                            VALUES (${member_id}, ${group_id})`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getListMember(req, res) {
    const id = req.tokenData.id;
    const {space_id} = req.body;
    try {
        if (!space_id)
            throw new Error("missing space_id!");
        const [user] = await dbPool.query(`SELECT user_id 
                                           FROM spaces_members 
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if (!user.length)
            throw new Error("user is not in space");
        const [rows] = await dbPool.query(`SELECT user_id, accounts.user_name, accounts.full_name 
                                           FROM spaces_members 
                                           INNER JOIN accounts ON user_id = accounts.id 
                                           WHERE space_id = ${space_id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function removeMember(req, res){
    const id = req.tokenData.id;
    const {
        user_id,
        space_id
    } = req.body;
    // const privilege = req.privilegeData.id;
    try{
        if(!space_id)
            throw new Error("space_id field is missing");
        const [user] = await dbPool.query(`SELECT user_id
                                           FROM spaces_members
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if(!user.length)
            throw new Error("user is not in space");
        if(!user_id)
            throw new Error("user_id field is missing");
        let [member_id] = await dbPool.query(`SELECT user_id 
                                              FROM spaces_members
                                              WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        if(!member_id.length)
            throw new Error("user account is not in space!");
        // let [member_role] = await dbPool.query(`SELECT role_id
        //                                         FROM spaces_members
        //                                         WHERE user_id = ${id} AND space_id = ${space_id}`);
        // member_role = member_role[0].role_id;
        // if(member_role == 2)
        //     throw new Error("user account does not have permission to delete this member!");
        let [member] = await dbPool.query(`SELECT group_id,member_id 
                                          FROM groups_members 
                                          INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                          WHERE spaces_members.user_id = ${user_id} AND spaces_members.space_id = ${space_id}`);
        for(let i = 0; i < member.length; i++){
            await dbPool.query(`DELETE FROM groups_members 
                                WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
        }
        await dbPool.query(`DELETE FROM spaces_members
                            WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}
async function leaveSpace (req, res){
    //Admin muon roi khoi space
    const id = req.tokenData.id;
    const space_id = req.body;
    try{
        if(!space_id)
            throw new Error("space_id fields is missing");
        let [user] = await dbPool.query(`SELECT user_id
                                         FROM spaces_members
                                         WHERE user_id = ${id} AND space_id = ${space_id}`);
        if(!user.length)
            throw new Error("user account is not in space");
        // let [member_role] = await dbPool.query(`SELECT role_id
        //                                         FROM spaces_members
        //                                         WHERE user_id = ${id} AND space_id = ${space_id}`);
        // member_role = member_role[0].role_id;
        // if(member_role == 2)
        //     throw new Error("user account does not have permission to delete this member!");
        let [member] = await dbPool.query(`SELECT group_id, member_id 
                                          FROM groups_members 
                                          INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                          WHERE spaces_members.user_id = ${id} AND spaces_members.space_id = ${space_id}`);
        for(let i = 0; i < member.length; i++){
            await dbPool.query(`DELETE FROM groups_members 
                                WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
        }
        await dbPool.query(`DELETE FROM spaces_members
                            WHERE user_id = ${id} AND space_id = ${space_id}`);
        res.json(responseUtil.success({data: {}}));
    } catch (err){
        res.json(responseUtil.fail({reason: err.message}));
    }
};
module.exports = {
    createSpace,
    getListSpace,
    addMember,
    getListMember,
    removeMember,
    leaveSpace
};