const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const name = req.body.name;
        if (!name) throw new Error("name field is missing");
        const [rows, fields] = await dbPool.query(`select * from spaces where name = "${name}"`);
        if (rows.length) throw new Error("name was existed");
        await dbPool.query(`INSERT INTO spaces(user_id, name)
                            VALUES(${id},"${name}")`);
        let [space_id] = await dbPool.query(`select id from spaces where name = "${name}"`);
        space_id = space_id[0].id;
        await dbPool.query(`INSERT INTO spaces_members(user_id, space_id, role_id)
                            VALUES(${id}, ${space_id}, 1)`);
        await dbPool.query(`INSERT INTO groups(space_id, name, couple)
                            VALUES(${space_id}, "everyone", 0)`);
        let [group_id] = await dbPool.query(`select id from groups where name = "everyone" and space_id = ${space_id}`);
        group_id = group_id[0].id;
        console.log(group_id);
        await dbPool.query(`INSERT INTO groups_members(user_id, group_id)
                            VALUES(${id}, ${group_id})`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getListSpace(req, res) {
    try {
        const id = req.tokenData.id;
        const [rows] = await dbPool.query(`select name, id from spaces where user_id = ${id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function addMember(req, res) {
    const id = req.tokenData.id;
    const {user_id, space_id} = req.body;
    const [user, fields] = await dbPool.query(`select user_id from spaces_members where (user_id = ${id} and space_id = ${space_id})`);
    try {
        if (!user.length)
            throw new Error("user is not in space");
        const [member, fields] = await dbPool.query(`select user_id from spaces_members where user_id = ${user_id} and space_id = ${space_id}`);
        if (member.length)
            throw new Error("user was in space");
        await dbPool.query(`INSERT INTO spaces_members(user_id, space_id, role_id) 
                            VALUES (${user_id}, ${space_id}, 2)`);
        let [group_id] = await dbPool.query(`select id from groups where name = "everyone" and space_id = ${space_id}`);
        group_id = group_id[0].id;
        await dbPool.query(`INSERT INTO groups_members(user_id, group_id)
                            VALUES (${user_id}, ${group_id})`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function getListMember(req, res) {
    const id = req.tokenData.id;
    const {space_id} = req.body;
    const [user, fields] = await dbPool.query(`select user_id from spaces_members where user_id = ${id} and space_id = ${space_id}`);
    try {
        if (!user.length)
            throw new Error("user is not in space");
        const [rows, fields] = await dbPool.query(`select user_id, accounts.user_name from spaces_members inner join accounts on user_id = accounts.id where space_id = ${space_id}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createSpace,
    getListSpace,
    addMember,
    getListMember
};