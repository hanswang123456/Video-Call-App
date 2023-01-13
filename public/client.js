const socket = io("/"); // Create our socket
const videoGrid = document.getElementById("video-grid"); // Find the Video-Grid element

const myPeer = new Peer(); // Creating a peer element which represents the current user
const myVideo = document.createElement("video"); // Create a new video tag to show our video
myVideo.muted = true; // Mute ourselves on our end so there is no feedback loop

// Access the user's video and audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    document.getElementById("stopVideo").addEventListener(
      "click",
      (e) => {
        stream.getVideoTracks()[0].enabled =
          !stream.getVideoTracks()[0].enabled;

        if (stream.getVideoTracks()[0].enabled == false) {
          document.getElementsByClassName("nameTag")[0].className = "nameBox";
        } else {
          document.getElementsByClassName("nameBox")[0].className = "nameTag";
        }
      },
      false
    );

    document.getElementById("muteButton").addEventListener(
      "click",
      (e) => {
        stream.getAudioTracks()[0].enabled =
          !stream.getAudioTracks()[0].enabled;
      },
      false
    );

    addVideoStream(myVideo, stream, "Me"); // Display our video to ourselves

    myPeer.on("call", (call) => {
      // When we join someone's room we will receive a call from them
      call.answer(stream); // Stream them our video/audio
      const video = document.createElement("video"); // Create a video tag for them
      call.on("stream", (userVideoStream) => {
        // When we recieve their stream
        addVideoStream(video, userVideoStream, call.metadata.username); // Display their video to ourselves
      });
    });

    socket.on("user-connected", (userId, username) => {
      // If a new user connect
      connectToNewUser(userId, stream, username);
    });
  });

myPeer.on("open", (id) => {
  sessionStorage.setItem("session", ROOM_ID);
  let displayName = prompt("Enter Your Name", "Unknown");
  sessionStorage.setItem("username", displayName);

  //window.localStorage.add("username", displayName);

  // When we first open the app, have us join a room
  socket.emit("join-room", ROOM_ID, id, displayName);
});
function connectToNewUser(userId, stream, username) {
  // This runs when someone joins our room
  const call = myPeer.call(userId, stream, {
    metadata: { username: sessionStorage.getItem("username") },
  }); // Call the user who just joined
  // Add their video
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, username);
  });
  // If they leave, remove their video
  socket.on("user-disconnected", (userId) => {
    video.parentElement.remove();
  });
}

function addVideoStream(video, stream, userId) {
  video.srcObject = stream;
  let container = document.createElement("div");
  container.style.position = "relative";
  let nameTag = document.createElement("div");
  nameTag.className = "nameTag";
  nameTag.innerHTML = userId;
  container.append(video);
  container.append(nameTag);
  video.addEventListener("loadedmetadata", () => {
    // Play the video as it loads
    video.play();
  });
  videoGrid.append(container); // Append video element to videoGrid
}

// myPeer.on("call", (call) => {
//   this.partnerId = call;
//   console.log(this.peer.destroyed);

//   if (this.peer.destroyed) {
//     this.createPeer(this.userId);
//   }
//   // Here client 2 is answering the call
//   // and sending back their stream
//   call.answer(stream);
//   const vid = document.createElement("video");

//   // This event append the user stream.
//   call.on("stream", (userStream) => {
//     addVideo(vid, userStream);
//   });
//   call.on("error", (err) => {
//     alert(err);
//   });
// });

var chatField = document.getElementById("send");
var input = document.getElementById("chat_message");
const messages = document.getElementById("messages");
//chat feature
//when user clicks send button, the client sends message to server
chatField.addEventListener("click", function (e) {
  e.preventDefault();
  //if client has message in the input field
  if (input.value) {
    socket.emit("message", {
      message: input.value,
      room: sessionStorage.getItem("session"),
      username: window.sessionStorage.getItem("username"),
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    });
    input.value = "";
  }
});

//recieves chat messages from server
socket.on("message", ({ message, username, time }) => {
  alert(username);
  //style time so that minutes like :04 has 0
  var styledTime = time.split(":");
  if (styledTime[1].length == 1) {
    styledTime[1] = "0" + styledTime[1];
    styledTime = styledTime[0] + ":" + styledTime[1];
  } else {
    styledTime = time;
  }

  //create a table that houses each output
  var messageBox = document.createElement("div");

  //1st row of table is the user info and the
  var generalInfo = document.createElement("div");

  //check who sends it
  if (username == window.sessionStorage.getItem("username")) {
    messageBox.className = "generalInfo rightside";
    generalInfo.innerHTML =
      "<div>" + "You" + "</div>" + "<div>" + styledTime + "</div>";
  } else {
    messageBox.className = "generalInfo leftside";
    generalInfo.innerHTML =
      "<div>" + username + "</div>" + "<div>" + styledTime + "</div>";
  }

  var text = document.createElement("tr");
  text.className = "messageArea";
  text.innerText = message;

  messageBox.appendChild(generalInfo);
  messageBox.appendChild(text);

  messages.appendChild(messageBox);
  //autoscroll
  messages.scrollTo(0, messages.scrollHeight);
});
