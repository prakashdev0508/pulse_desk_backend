"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const socket_1 = require("./config/socket");
const PORT = process.env.PORT || 5000;
const server = (0, http_1.createServer)(app_1.app);
// Initialize Socket.IO
(0, socket_1.initSocket)(server);
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
