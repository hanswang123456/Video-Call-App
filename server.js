const { time } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

//send file to client
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/client.html");
});

//when a user connects
io.on("connection", (socket) => {
  console.log("a user connected");

  //joins room given room "ID"
  socket.on("join_room", ({ room, user }) => {
    console.log(user + " joined room ID: " + room);
    io.to(room).emit("message", {
      user: user,
      message: " has joined!",
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    });
    socket.join(room.toString());
  });

  socket.on("leave_room", ({ room, user }) => {
    console.log(user + " left room ID: " + room);
    io.to(room).emit("message", {
      user: user,
      message: " has left!",
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    });
    socket.leave(room.toString());
  });

  //user disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  //chat message from client
  socket.on("message", ({ message, room, user, time }) => {
    //emit to client
    io.to(room).emit("message", { message, user, time });
    console.log(
      "message: " + message + " sent to room " + room + " at " + time
    );
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
