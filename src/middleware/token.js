const jwt = require('jsonwebtoken');
const secretKey = require('config').get("SECRET_KEY");

function verify(req, res, next) {
    const token = req.headers['token'];

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "token is invalid"
                });
            } else {
                req.tokenData = decoded;
                next();
            }
        })
    } else {
        return res.status(403).json({
            message: "please send a token"
        })
    }
}

module.exports = {verify};