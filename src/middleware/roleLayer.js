const responseUtil = require("../utils/response.util");
const dbPool = require("../db");

async function verify(req, res, next) {
    try {
        const {memberAffectRole} = req;
        const {space_member_id} = req.tokenData;
        if (!memberAffectRole) throw new Error("role's member whom user affect to missing memberAffectRole field");
        const [userInformation] = await dbPool.query(`select * from spaces_members 
                                                        where id = ${space_member_id}`);
        const user_role = userInformation[0].role_id;
        if (user_role === 1
            && (memberAffectRole === 1 || memberAffectRole === 4)) throw new Error("you haven't privilege to use this function");
        next();
    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    verify
};