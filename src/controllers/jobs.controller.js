const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createTask(req, res) {
    const creator_id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    const {
        member_id,
        title,
        description,
        deadline
    } = req.body;
    try {
        if (!member_id)
            throw new Error("member_id field is missing!");
        if (!title)
            throw new Error("title field is missing!");
        if (!description)
            throw new Error("description field is missing!");
        if (!deadline)
            throw new Error("deadline field is missing!");
        let [creator] = await dbPool.query(`SELECT *
                                            FROM spaces_members
                                            WHERE user_id = ${creator_id} AND space_id = ${space_id}`);
        let creator_role = creator[0].role_id;
        let admin_id = creator[0].id;
        let [member] = await dbPool.query(`SELECT *
                                           FROM spaces_members
                                           WHERE user_id = ${member_id} AND space_id = ${space_id}`);
        let member_role = member[0].role_id;
        let user_id = member[0].id;
        const [rows] = await dbPool.query(`SELECT *
                                           FROM jobs
                                           WHERE title = "${title}" AND member_id = ${user_id}`);
        if (rows.length)
            throw new Error("task has been already existed!");
        if (creator_role === 4 && (member_role === 1 || member_role === 2)) {
            await dbPool.query(`INSERT INTO jobs(creator_id, member_id, title, description, deadline, status)
                                VALUES (${admin_id}, ${user_id}, "${title}", "${description}", "${deadline}", "todo")`);
        } else if (creator_role === 1 && member_role === 2) {
            await dbPool.query(`INSERT INTO jobs(creator_id, member_id, title, description, deadline, status)
                                VALUES (${admin_id}, ${user_id}, "${title}", "${description}", "${deadline}", "todo")`);
        } else
            throw new Error("user account has not been permitted to create task");
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}
async function getTaskList (req, res) {

}
module.exports = {
    createTask
};