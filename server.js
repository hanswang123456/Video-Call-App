//Create our express and socket.io servers
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

const connected = {};

app.set("view engine", "ejs"); // Tell Express we are using EJS
app.use(express.static("public")); // Tell express to pull the client script from the public folder

// If they join the base link, generate a random UUID and send them to a new room with said UUID
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
// If they join a specific room, then render that room
app.get("/:room", (req, res) => {
  res.render("client", { roomId: req.params.room });
});
// When someone connects to the server
io.on("connection", (socket) => {
  if (!connected[socket.id]) {
    connected[socket.id] = socket.id;
  }

  // When someone attempts to join the room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId); // Join the room
    socket.to(roomId).emit("user-connected", userId); // Tell everyone else in the room that we joined

    // Communicate the disconnection
    socket.on("disconnect", () => {
      delete connected[socket.id];
      socket.broadcast.emit("user-disconnected", userId);
    });
  });

  socket.on("message", ({ message, room, user, time }) => {
    //emit to client
    console.log("asdf");
    io.to(room).emit("message", { message, user, time });
    console.log(
      "message: " + message + " sent to room " + room + " at " + time
    );
  });
});

server.listen(3000); // Run the server on the 3000 port
