const app = require("./app.express");
const server = require("http").createServer(app);
const config = require("config");
const jwt = require("jsonwebtoken");
const dbPool = require("./db");

const port = config.get("port");
const spaceSecretKey = config.get("SPACE_SECRET_KEY");

const io = require("socket.io")(server);
const chatNsp = io.of("/chat");

async function getMessages(offset, socket, group_id) {
    try {
        const [messagesRows] = await dbPool.query(`SELECT m.user_id, a.user_name, m.message, m.time, sm.imagesUrl
                                            FROM messages m
                                            join accounts a on a.id = m.user_id
                                            join groups g on g.id = m.group_id
                                            join spaces_members sm on sm.user_id = m.user_id and sm.space_id = g.space_id
                                            WHERE m.group_id = ?
                                            ORDER by time ASC
                                            limit 15
                                            offset ?`, [group_id, offset]);
        for (let i in messagesRows) {
            messagesRows[i].isUserMessages = messagesRows[i].user_id === socket.tokenData.id;
        }
        return messagesRows;
    } catch (err) {
        socket.emit("err", {message: err.message})
    }
}

chatNsp.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.spaceToken) {
        const {spaceToken, group_id} = socket.handshake.query;
        if(!group_id) return next(new Error('missing group_id'));
        jwt.verify(spaceToken, spaceSecretKey, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.tokenData = decoded;
            socket.group_id = group_id;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
}).on('connection', (socket) => {
    const group_id = socket.group_id;
    socket.join(group_id);

    socket.on("messages.get", async (data) => {
        const messages = await getMessages(data.offset, socket, group_id);
        socket.emit("currentMessages.get", {messages});
    });

    socket.on("new_messages.post", async (data) => {
        try {
            const {message} = data;
            if (!message) throw new Error("messages fields is missing or empty");
            const date = Date.now();
            await dbPool.query(`INSERT INTO messages (user_id, group_id, message, time) 
                                VALUES (${socket.tokenData.id}, ${group_id}, "${message}", ${date})`);
            socket.emit("new_messages.get");
            socket.to(group_id).emit("new_messages.get");
        } catch (err) {
            socket.emit('err', {messages: err.message})
        }
    })
});

server.listen(port, () => {
    console.log("server is running on port: ", port);
});

module.exports = server;