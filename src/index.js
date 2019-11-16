const app = require("./app.express");
const server = require("http").createServer(app);
const config = require("config");
const jwt = require("jsonwebtoken");
const dbPool = require("./db");

const port = config.get("port");
const spaceSecretKey = config.get("SPACE_SECRET_KEY");

const io = require("socket.io")(server);
const chatNsp = io.of("/chat");

chatNsp.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.spaceToken) {
        const {spaceToken} = socket.handshake.query;
        jwt.verify(spaceToken, spaceSecretKey, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.tokenData = decoded;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
}).on('connection', (socket) => {
    socket.on("test", (data) => {console.log(data)});
});

server.listen(port, () => {
    console.log("server is running on port: ", port);
});

module.exports = server;