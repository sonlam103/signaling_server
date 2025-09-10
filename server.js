const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io')

const port = process.env.PORT || 3000

const app = express();

app.use(cors());
app.get('/', (req, res) => {
    res.send('hello, word!');
})

const server = app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})

const io = socketIo(server, {
    cors: {
        origin: `http://localhost:${port}`,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: "*",
        credentials: true
    },
});

let rooms = [];
let socketToRoom = [];
let roomDemo = "roomDemo";

io.on("connection", socket => {
    socket.on("message", data => {
        let type = data.type
        if (!!type) {
            switch (type) {
                // case "signal":
                //     const user = rooms[roomDemo].filter(user => user.id === socket.id);
                //     if (!user) {
                //         rooms[roomDemo].push({id: socket.id, name: data.name});
                //     }
                //     break;
                case "offer":
                    socket.broadcast.emit("offer", data);
                    break;
                case "answer":
                    socket.broadcast.emit("answer", data);
                    break;
                case "candidate":
                    socket.broadcast.emit("candidate", data);
                    break;
                default:
                    break;
            }
        }
    })

    // socket.on("join", data => {
    //     // let a new user join to the room
    //     const roomId = data.roomId
    //     socket.join(roomId);
    //     socketToRoom[socket.id] = roomId;

    //     // persist the new user in the room
    //     if (rooms[roomId]) {
    //         rooms[roomId].push({id: socket.id, name: data.name});
    //     } else {
    //         rooms[roomId] = [{id: socket.id, name: data.name}];
    //     }

    //     // sends a list of joined users to a new user
    //     const users = rooms[data.roomId].filter(user => user.id !== socket.id);
    //     io.sockets.to(socket.id).emit("room_users", users);
    //     console.log("[joined] room:" + data.roomId + " name: " + data.name);
    // });

    // socket.on("offer", sdp => {
    //     socket.broadcast.emit("getOffer", sdp);
    //     console.log("offer: " + socket.id);
    // });

    // socket.on("answer", sdp => {
    //     socket.broadcast.emit("getAnswer", sdp);
    //     console.log("answer: " + socket.id);
    // });

    // socket.on("candidate", candidate => {
    //     socket.broadcast.emit("getCandidate", candidate);
    //     console.log("candidate: " + socket.id);
    // });

    socket.on("disconnect", () => {
        const roomId = socketToRoom[socket.id];
        let room = rooms[roomId];
        if (room) {
            room = room.filter(user => user.id !== socket.id);
            rooms[roomId] = room;
        }
        socket.broadcast.to(room).emit("user_exit", {id: socket.id});
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
    });

    console.log("Sẵn sàng kết nối!")

    // // Gửi offer tới một user cụ thể
    // socket.on("offer", ({ to, sdp }) => {
    //     io.to(to).emit("getOffer", { from: socket.id, sdp });
    // });

    // socket.on("answer", ({ to, sdp }) => {
    //     io.to(to).emit("getAnswer", { from: socket.id, sdp });
    // });

    // socket.on("candidate", ({ to, candidate }) => {
    //     io.to(to).emit("getCandidate", { from: socket.id, candidate });
    // });
});