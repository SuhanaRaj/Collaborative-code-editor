import express from "express";
import http from "http";
import { Server } from "socket.io";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const rooms = new Map();
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    let currentRoom = null;
    let currentUser = null;

    socket.on("join_room", ({ roomId, username }) => {
        if(currentRoom) {
            socket.leave(currentRoom);
            rooms.get(currentRoom).delete(socket.id);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
        }

        currentRoom = roomId;
        currentUser = username;

        socket.join(roomId);

        if(!rooms.has(roomId)){
            rooms.set(roomId, new Set());
        }

        rooms.get(roomId).add(userName);
        io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
    });

    socket.on("codeChange", ({ roomId, code }) => {
        socket.to(roomId).emit("codeUpdated", code);
    });

    socket.on("leaveRoom", () => {
        if(currentRoom && currentUser){
            rooms.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
            socket.leave(currentRoom);
            currentRoom = null;
            currentUser = null;
        }
    });

    socket.on("typing", ({ roomId, userName }) => {
        socket.io(roomId).emit("userTyping", userName);
    });

    socket.on("languageChange", ({ roomId, language }) => {
        socket.io(roomId).emit("languageUpdated", language);
    });

    socket.on("chat-message", ({ roomId, userName, message }) => {
        io.to(roomId).emit("chatMessage", { userName, message });
    });

    socket.on("join-call", ({ roomId, userName }) => {
        socket.join(roomId + "-call");
        socket.to(roomId + "-call").emit("user-joined-call", { userName, socketId: socket.id });
    });

    socket.on("signal", ({ roomId }) => {
        socket.leave(roomId + "-call");
        socket.to(roomId + "-call").emit("user-left-call", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
        if(currentRoom && currentUser){
            rooms.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
        }
        console.log("A user disconnected", socket.id);
    });
});

const PORT = 3000;
const _filename = fireURLToPath(import.meta.url);
const _dirname = dirname(_filename);
app.use(express.static(path.join(_dirname, "../Frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "../Frontend/vite-project/dist/index.html"));
});

server.listen(prototype, () => {
    console.log(`Server is running on port ${port}`);
});