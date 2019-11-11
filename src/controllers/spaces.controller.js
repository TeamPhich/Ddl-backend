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
    const space_id = req.tokenData.space_id;
    const {user_id} = req.body;
    try {
        const [user] = await dbPool.query(`SELECT user_id 
                                           FROM spaces_members 
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if (!user_id)
            throw new Error("user_id field is missing!");
        if (!user.length)
            throw new Error("user is not in this space");
        const [member] = await dbPool.query(`SELECT user_id 
                                             FROM spaces_members 
                                             WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        if (member.length)
            throw new Error("user has been in this space");
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

async function getMemberList(req, res) {
    const id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    try {
        const [user] = await dbPool.query(`SELECT user_id 
                                           FROM spaces_members 
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        if (!user.length)
            throw new Error("user is not in this space");
        const [rows] = await dbPool.query(`SELECT user_id, accounts.user_name, accounts.full_name 
                                           FROM spaces_members 
                                           INNER JOIN accounts ON user_id = accounts.id 
                                           WHERE space_id = ${space_id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function removeMember(req, res) {
    const id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    const {
        user_id
    } = req.body;
    try {
        if (!user_id)
            throw new Error("user_id field is missing");
        const [user] = await dbPool.query(`SELECT user_id, role_id
                                           FROM spaces_members
                                           WHERE user_id = ${id} AND space_id = ${space_id}`);
        const user_role = user[0].role_id;
        let [member_id] = await dbPool.query(`SELECT * 
                                              FROM spaces_members
                                              WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        if (!member_id.length)
            throw new Error("user account is not in this space!");
        let [member] = await dbPool.query(`SELECT group_id,member_id 
                                           FROM groups_members 
                                           INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                           WHERE spaces_members.user_id = ${user_id} AND spaces_members.space_id = ${space_id}`);
        const member_role = member[0].role_id;
        if (user_role == 1) {
            if (member_role == 2) {
                for (let i = 0; i < member.length; i++) {
                    await dbPool.query(`DELETE FROM groups_members 
                                        WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
                }
                await dbPool.query(`DELETE FROM spaces_members
                                    WHERE user_id = ${user_id} AND space_id = ${space_id}`);
            } else
                throw new Error("you can not remove this user account!");
        }
        if (user_role == 4) {
            if (member_role == 2 || member_role == 1) {
                for (let i = 0; i < member.length; i++) {
                    await dbPool.query(`DELETE FROM groups_members 
                                        WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
                }
                await dbPool.query(`DELETE FROM spaces_members
                                    WHERE user_id = ${user_id} AND space_id = ${space_id}`);
            } else
                throw new Error("you can not remove this user account!");
        }
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function leaveSpace(req, res) {
    const id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    try {
        let [user] = await dbPool.query(`SELECT *
                                         FROM spaces_members
                                         WHERE user_id = ${id} AND space_id = ${space_id}`);
        const user_role = user[0].role_id;
        let [member] = await dbPool.query(`SELECT group_id, member_id 
                                          FROM groups_members 
                                          INNER JOIN spaces_members ON groups_members.member_id = spaces_members.id 
                                          WHERE spaces_members.user_id = ${id} AND spaces_members.space_id = ${space_id}`);
        if (user_role == 1 || user_role == 2) {
            for (let i = 0; i < member.length; i++) {
                await dbPool.query(`DELETE FROM groups_members 
                                    WHERE member_id = ${member[i].member_id} AND group_id = ${member[i].group_id}`);
            }
            await dbPool.query(`DELETE FROM spaces_members
                                WHERE user_id = ${id} AND space_id = ${space_id}`);
        } else
            throw new Error("super admin can not leave this space!");
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
};

async function authorizeAdmin(req, res) {
    const space_id = req.tokenData.space_id;
    const {
        user_id
    } = req.body;
    try {
        if (!user_id)
            throw new Error("user_id field is missing!");
        let [member_id] = await dbPool.query(`SELECT * 
                                              FROM spaces_members
                                              WHERE user_id = ${user_id} AND space_id = ${space_id}`);
        if (!member_id.length)
            throw new Error("user account is not in this space!");
        const member_role = member_id[0].role_id;
        if (member_role == 2) {
            await dbPool.query(`UPDATE spaces_members
                                SET role_id = 1
                                WHERE id = ${member_id[0].id}`);
        } else
            throw new Error("user account has been granted in this space");
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