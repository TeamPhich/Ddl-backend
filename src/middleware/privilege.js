const db = require("../db");
const responseUtil = require("../utils/response.util");

function verify(privilege) {
    return async (req, res, next) => {
        try {
            const {space_member_id} = req.tokenData;
            if (!space_member_id) throw new Error("user have been not access to space");
            const [rowMember] = await db.query(`select role_id 
                                                from spaces_members 
                                                where id = ${space_member_id}`);
            if (!rowMember.length) throw new Error("space member isn't exist");
            const role_id = rowMember[0].role_id;
            const [rolePrivileges] = await db.query(`select * 
                                               from roles_privileges 
                                               where privilege_id = ${privilege}
                                               and role_id = ${role_id}`);
            if (!rolePrivileges.length) throw new Error("You haven't been granted privilege for this function");
            next();
        } catch (err) {
            res.json(responseUtil.fail({reason: err.message}))
        }
    }
}

module.exports = {
    verify
};