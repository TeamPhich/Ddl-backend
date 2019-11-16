const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const name = req.body.name;
        if (!name) throw new Error("name field is missing");
        const [rows] = await dbPool.query(`SELECT * 
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
                            VALUES(${id}, ${space_id}, 4)`);
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

async function getSpaceList(req, res) {
    try {
        const id = req.tokenData.id;
        const [rows] = await dbPool.query(`SELECT spaces.name, spaces.id 
                                           FROM spaces_members
                                           INNER JOIN spaces ON spaces_members.space_id = spaces.id
                                           WHERE spaces_members.user_id = ${id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function addMember(req, res) {
    const space_id = req.tokenData.space_id;
    const {member_id} = req.body;
    try {
        if (!member_id)
            throw new Error("user_id field is missing!");
        const [member] = await dbPool.query(`SELECT user_id 
                                             FROM spaces_members 
                                             WHERE user_id = ${member_id} AND space_id = ${space_id}`);
        if (member.length)
            throw new Error("user has been in this space");
        await dbPool.query(`INSERT INTO spaces_members(user_id, space_id, role_id) 
                            VALUES (${member_id}, ${space_id}, 2)`);
        let [group_id] = await dbPool.query(`SELECT id 
                                             FROM groups 
                                             WHERE name = "everyone" AND space_id = ${space_id}`);
        group_id = group_id[0].id;
        let [participant_id] = await dbPool.query(`SELECT id 
                                              FROM spaces_members 
                                              WHERE user_id = ${member_id} AND space_id = ${space_id}`);
        participant_id = participant_id[0].id;
        await dbPool.query(`INSERT INTO groups_members(member_id, group_id)
                            VALUES (${participant_id}, ${group_id})`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getMemberList(req, res) {
    const id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    try {
        const [user] = await dbPool.query(`SELECT user_id
                                           FROM spaces_members
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if (!user.length)
            throw new Error("user is not in this space");
        const [rows] = await dbPool.query(`SELECT  spaces_members.id, user_id, accounts.user_name, accounts.full_name
                                           FROM spaces_members 
                                           INNER JOIN accounts ON user_id = accounts.id 
                                           WHERE space_id = ${space_id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}));
    }
}

async function removeMember(req, res) {
    const space_id = req.tokenData.space_id;
    const {
        member_id
    } = req.body;
    try {
        let [member] = await dbPool.query(`SELECT group_id,member_id 
                                           FROM groups_members 
                                           INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                           WHERE groups_members.member_id = ${member_id} AND spaces_members.space_id = ${space_id}`);
        for (let i = 0; i < member.length; i++) {
            await dbPool.query(`DELETE FROM groups_members 
                                WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
        }

        await dbPool.query(`DELETE FROM spaces_members
                            WHERE id = ${member_id} AND space_id = ${space_id}`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function leaveSpace(req, res) {
    const id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    try {
        let [member] = await dbPool.query(`SELECT group_id, member_id 
                                           FROM groups_members 
                                           INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                           WHERE spaces_members.user_id = ${id} AND spaces_members.space_id = ${space_id}`);
        for (let i = 0; i < member.length; i++) {
            await dbPool.query(`DELETE FROM groups_members 
                                WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
        }
        await dbPool.query(`DELETE FROM spaces_members
                            WHERE user_id = ${id} AND space_id = ${space_id}`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
};

async function authorizeAdmin(req, res) {
    const space_id = req.tokenData.space_id;
    const {
        member_id
    } = req.body;
    try {
        await dbPool.query(`UPDATE spaces_members
                            SET role_id = 1
                            WHERE id = ${member_id} AND space_id = ${space_id}`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

module.exports = {
    createSpace,
    getSpaceList,
    addMember,
    getMemberList,
    removeMember,
    leaveSpace,
    authorizeAdmin
};