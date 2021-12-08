import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`connection: ${socket.id}`);

  // 切断時の処理
  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
  });

  // signalingデータの受信時の処理
  socket.on("signaling", (data) => {
    console.log(`signaling: ${socket.id}`);
    console.log(`- type: ${data.type}`);

    // 送信元以外の全員に送信
    socket.broadcast.emit("signaling", data);
  });
});

const POST = 3000;
const staticPath = `${process.cwd()}/dist`;

// ビルドしたフロントエンドのアプリを静的に配信する
app.use(express.static(staticPath));

// サーバーを起動する
server.listen(POST, () => {
  console.log(`Server on port ${POST}`);
  console.log(`http://localhost:${POST}`);
  console.log("=============================");
  console.log(`Static Path: ${staticPath}`);
});
