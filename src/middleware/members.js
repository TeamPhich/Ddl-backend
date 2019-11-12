const responseUtil = require("../utils/response.util");
const dbPool = require("../db");

async function spaceVerify(req, res , next) {
    try {
        const {member_id} = req.body;
        const {space_id} = req.tokenData;
        if (!member_id) throw new Error("member_id fields is missing");
        const [memberIsInSpace] = await dbPool.query(`SELECT * FROM spaces_members WHERE id = ${member_id} and space_id = ${space_id}`);
        if(!memberIsInSpace.length) throw new Error("Member who you sent isn't in this space.");
        next();
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    spaceVerify
};