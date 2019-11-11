const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createTask(req, res){
    const creator_id = req.tokenData.id;
    const space_id = req.tokenData.space_id;
    const {
        member_id,
        title,
        description,
        deadline,
        status
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
        if (!status)
            throw new Error("status field is missing!");
        const [rows] = await dbPool.query(`SELECT *
                                           FROM jobs
                                           WHERE title = "${title}" AND space_id = ${space_id} AND member_id = ${member_id}`);
        if(rows.length)
            throw new Error("task has been already existed!");
        await dbPool.query(`INSERT INTO jobs(creator_id, member_id, title, description, deadline, status)
                            VALUES (${creator_id}, ${member_id}, "${title}", "${description}", "${deadline}", "todo")`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createTask
};