const app = require("./app.express");
const server = require("http").createServer(app);
const config = require("config");
const jwt = require("jsonwebtoken");

const port = config.get("port");
const spaceSecretKey = config.get("SPACE_SECRET_KEY");

const io = require("socket.io")(server);

io.on('connection', (socket) => {
    socket.auth = false;
    socket.on("authenticate", (data) => {
        jwt.verify(data.token, spaceSecretKey, (err, decoded) => {
            if (!err) {
                socket.tokenData = decoded;
                socket.auth = true;
                socket.emit("authorized")
            }
        });
    });

    socket.on("test", (data) => {
        if(!socket.auth){
            socket.disconnect();
        } else {
            console.log(data)
            socket.broadcast.emit("hello", data)
        }
    })
});

server.listen(port, () => {
    console.log("server is running on port: ", port);
});

module.exports = server;