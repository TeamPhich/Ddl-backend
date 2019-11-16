const dbPool = require("../db");
const responseUtil = require("../utils/response.util");

async function createTask(req, res) {
    const creator_id = req.tokenData.space_member_id;
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
        const [rows] = await dbPool.query(`SELECT *
                                           FROM jobs
                                           WHERE title = "${title}" AND member_id = ${member_id}`);
        let create_time = Date.now() / 1000;
        if (rows.length)
            throw new Error("task has been already existed!");
        if (deadline <= create_time)
            throw new Error("deadline must be later than created timestamp");
        await dbPool.query(`INSERT INTO jobs(space_id, creator_id, member_id, title, description, deadline, create_time, status)
                            VALUES (${space_id}, ${creator_id}, ${member_id}, "${title}", "${description}", ${deadline}, ${create_time}, "todo")`);
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function getTaskListOfMember(req, res) {
    const user_id = req.tokenData.id;
    try {
        let [member] = await dbPool.query(`SELECT id, space_id
                                           FROM spaces_members
                                           WHERE user_id = ${user_id}`);
        let rows = [];
        for (let i = 0; i < member.length; i++) {
            let [row] = await dbPool.query(`SELECT id, space_id, creator_id, member_id, title, description, deadline, status
                                            FROM jobs
                                            WHERE member_id = ${member[i].id} AND space_id = ${member[i].space_id}`);
            for (let j = 0; j < row.length; j++) {
                rows.push(row[j]);
            }
        }
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function getTaskListOfCreator(req, res) {
    const user_id = req.tokenData.id;
    try {
        let [admin] = await dbPool.query(`SELECT id, space_id
                                          FROM spaces_members
                                          WHERE user_id = ${user_id}`);
        let rows = [];
        for (let i = 0; i < admin.length; i++) {
            let [row] = await dbPool.query(`SELECT id, space_id, creator_id, member_id, title, description, deadline, status
                                            FROM jobs
                                            WHERE creator_id = ${admin[i].id} AND space_id = ${admin[i].space_id}`);
            for (let j = 0; j < row.length; j++) {
                rows.push(row[j]);
            }
        }
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function getStatusTaskList(req, res) {
    const space_id = req.tokenData.space_id;
    const status = req.body;
    try {
        if (!status)
            throw new Error("status field id missing");
        let rows = [];
        if (status === "todo")
            [rows] = await dbPool.query(`SELECT id, creator_id, member_id, title, description, deadline, status
                                         FROM jobs
                                         WHERE space_id = ${space_id} AND status = ${status}`);
        if (status === "in process")
            [rows] = await dbPool.query(`SELECT id, creator_id, member_id, title, description, deadline, status
                                         FROM jobs
                                         WHERE space_id = ${space_id} AND status = ${status}`);
        if (status === "review")
            [rows] = await dbPool.query(`SELECT id, creator_id, member_id, title, description, deadline, status
                                         FROM jobs
                                         WHERE space_id = ${space_id} AND status = ${status}`);
        if (status === "done")
            [rows] = await dbPool.query(`SELECT id, creator_id, member_id, title, description, deadline, status
                                         FROM jobs
                                         WHERE space_id = ${space_id} AND status = ${status}`);
        res.json(responseUtil.success({data: {rows}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function updateTaskStatus(req, res) {
    const space_member_id = req.tokenData.space_member_id;
    const {
        task_id,
        status
    } = req.body;
    try {
        if (!task_id)
            throw new Error("task_id field is missing!");
        if (!status)
            throw new Error("status field is missing!");
        let [user_id] = await dbPool.query(`SELECT *
                                            FROM jobs
                                            WHERE id = ${task_id}`);
        let member_id = user_id[0].member_id;
        let creator_id = user_id[0].creator_id;
        if (space_member_id === creator_id || space_member_id === member_id)
            await dbPool.query(`UPDATE jobs
                                SET status = "${status}"
                                WHERE id = ${task_id}`);
        else
            throw new Error("You haven't been granted privilege for this function");
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }

}

async function updateTask(req, res) {
    const creator_id = req.tokenData.space_member_id;
    const {
        task_id,
        member_id,
        title,
        description,
        deadline
    } = req.body;
    try {
        let [task] = await dbPool.query(`SELECT *
                                         FROM jobs
                                         WHERE id = ${task_id}`);
        if (!task_id)
            throw new Error("task_id field is missing");
        let creator = task[0].creator_id;
        if (creator !== creator_id)
            throw new Error("You haven't been granted privilege for this function");
        if (member_id) {
            await dbPool.query(`UPDATE jobs
                                INNER JOIN spaces_members ON spaces_members.space_id = jobs.space_id
                                SET jobs.member_id = ${member_id}
                                WHERE jobs.id = ${task_id}`);
            await dbPool.query(`UPDATE jobs
                                SET status = "todo"
                                WHERE id = ${task_id}`);
        }
        if (title)
            await dbPool.query(`UPDATE jobs
                                SET title = "${title}"
                                WHERE id = ${task_id}`);
        if (description)
            await dbPool.query(`UPDATE jobs
                                SET description = "${description}"
                                WHERE id = ${task_id}`);
        if (deadline) {
            let update_time = Date.now() / 1000;
            if (deadline <= update_time)
                throw new Error("deadline must be later than updated timestamp");
            await dbPool.query(`UPDATE jobs
                                SET deadline = ${deadline}
                                WHERE id = ${task_id}`);
        }
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

async function deleteTask(req, res) {
    const admin = req.tokenData.space_member_id;
    const {task_id} = req.body;
    try {
        if (!task_id)
            throw new Error("task_id field is missing!");
        let [creator] = await dbPool.query(`SELECT * 
                                            FROM jobs
                                            WHERE id = ${task_id}`);
        creator = creator[0].creator_id;
        if (admin === creator || admin === 4)
            await dbPool.query(`DELETE FROM jobs
                                WHERE id = ${task_id}`);
        else
            throw new Error("You haven't been granted privilege for this function");
        res.json(responseUtil.success({data: {}}));
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    createTask,
    getTaskListOfMember,
    getTaskListOfCreator,
    getStatusTaskList,
    updateTaskStatus,
    updateTask,
    deleteTask
};