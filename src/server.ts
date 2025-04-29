import { createServer } from "http";
import { app } from "./app";
import { initSocket } from "./config/socket";

const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
