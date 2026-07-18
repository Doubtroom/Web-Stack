import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { initSocket } from "./sockets/index.js";

// Socket.IO needs the raw HTTP server (not just the Express app) so it can
// handle WebSocket upgrade requests on the same port as the REST API.
const server = http.createServer(app);
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
    // [CRON] Streak reset job is triggered externally via /api/cron/streak-reset
  })
  .catch((err) => {
    console.log(err);
  });
