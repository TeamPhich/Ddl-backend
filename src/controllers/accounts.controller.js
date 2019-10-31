const dbPool = require("../db");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const responseUtil = require("../utils/response.util");

async function getAccounts(req, res) {
    try {
        const [rows, fields] = await dbPool.query("select * from accounts");
        res.send(responseUtil.success({data: rows}));
    } catch (err) {
        res.send(responseUtil.fail({reason: err.message}))
    }
}

async function login(req, res) {
    const {
        user_name,
        password
    } = req.body;

    try {
        let [user] = await dbPool.query(`select * from accounts where user_name = "${user_name}"`);

        if (!user.length) throw new Error("user_name or password is incorrect");
        user = user[0];
        const hashPassword = user.password;
        const checkPass = bcrypt.compareSync(password, hashPassword);

        if(!checkPass) throw new Error("user_name or password is incorrect");

        const twentyFourHours = 24 * 60 * 60 * 30;

        const token = jwt.sign({
                id: user.id,
                email: user.email
            },
            config.get('SECRET_KEY'), {
                expiresIn: twentyFourHours
            }
        );

        res.json(responseUtil.success({data: {token}}));

    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}));
    }
}

async function register(req, res) {
    const {
        user_name,
        password,
        email,
        full_name
    } = req.body;

    try {
        if (user_name.length < 8) throw new Error("user_name must greater than 8 characters");
        if (password.length < 8) throw new Error("password must greater than 8 characters");
        if (!full_name) throw new Error("fullname attribute is missing");

        const [existUsers] = await dbPool.query(`select * from accounts where user_name = "${user_name}"`);
        const [existEmail] = await dbPool.query(`select * from accounts where email = "${email}"`);
        if (existUsers.length) throw new Error("user_name existed");
        if (existEmail.length) throw new Error("email existed");
        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);
        await dbPool.query(`insert into accounts (user_name, password, email, full_name) values ("${user_name}", "${hashPassword}", "${email}", "${full_name}")`);

        res.json(responseUtil.success({data: {}}))

    } catch (err) {
        res.json(responseUtil.fail({reason: err.message}))
    }
}

module.exports = {
    getAccounts,
    register,
    login
};