const jwt = require('jsonwebtoken');
const secretKey = require('config').get("SPACE_SECRET_KEY");

function verify(req, res, next) {
    const space_token = req.headers['space-token'];

    if (space_token) {
        jwt.verify(space_token, secretKey, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    status: 202,
                    reason: "space_token is invalid"
                });
            } else {
                req.tokenData = decoded;
                next();
            }
        })
    } else {
        return res.status(403).json({
            success: false,
            reason: "space_token is invalid",
        })
    }
}

module.exports = {verify};