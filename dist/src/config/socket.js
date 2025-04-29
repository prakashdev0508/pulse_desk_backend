"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
function initSocket(server) {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    exports.io.on("connection", (socket) => {
        console.log(`🔌 New socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });
}
