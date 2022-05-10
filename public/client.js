var socket = io();

var landingPage = document.getElementById("landingPage");
var chatPage = document.getElementById("chatPage");
var userName = document.getElementById("nameField");
var messages = document.getElementById("messages");
var chatField = document.getElementById("writeMessage");
var joinRoomField = document.getElementById("joinRoomForm");
var leaveRoom = document.getElementById("leaveRoom");
var createRoom = document.getElementById("newRoomForm");
var input = document.getElementById("input");

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

createRoom.addEventListener("submit", function (e) {
  e.preventDefault();
  if (userName.value) {
    var roomID = document.getElementById("roomField").value;
    var generatedID = makeid(12);

    window.sessionStorage.setItem("currentPage", "chat");
    window.sessionStorage.setItem("broadcast", generatedID.toString());
    window.sessionStorage.setItem("user", userName.value.toString());

    socket.emit("join_room", { room: generatedID, user: userName.value });
    updatePage();
  }
});

joinRoomField.addEventListener("submit", function (e) {
  e.preventDefault();
  var roomID = document.getElementById("roomField").value;

  if (roomID != null && userName.value) {
    window.sessionStorage.setItem("currentPage", "chat");
    window.sessionStorage.setItem("broadcast", roomID.toString());
    window.sessionStorage.setItem("user", userName.value.toString());

    socket.emit("join_room", { room: roomID, user: userName.value });
    updatePage();
  }
});
leaveRoom.addEventListener("click", function (e) {
  var roomID = window.sessionStorage.getItem("broadcast");
  e.preventDefault();
  window.sessionStorage.setItem("currentPage", "landingPage");
  window.sessionStorage.setItem("broadcast", "none");
  window.sessionStorage.setItem("user", userName.value.toString());

  socket.emit("leave_room", { room: roomID, user: userName.value });
  updatePage();
});

//when user clicks send button, the client sends message to server
chatField.addEventListener("submit", function (e) {
  e.preventDefault();
  //if client has message in the input field
  if (input.value) {
    socket.emit("message", {
      message: input.value,
      room: window.sessionStorage.getItem("broadcast"),
      user: window.sessionStorage.getItem("user"),
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    });
    input.value = "";
  }
});

//recieves chat messages from server
socket.on("message", ({ message, user, time }) => {
  //style time so that minutes like :04 has 0
  var styledTime = time.split(":");
  if (styledTime[1].length == 1) {
    styledTime[1] = "0" + styledTime[1];
    styledTime = styledTime[0] + ":" + styledTime[1];
  } else {
    styledTime = time;
  }

  //create a table that houses each output
  var messageBox = document.createElement("table");
  messageBox.className = "message";

  //1st row of table is the user info and the
  var generalInfo = document.createElement("tr");
  generalInfo.className = "generalInfo";
  //check who sends it
  if (user == window.sessionStorage.getItem("user")) {
    generalInfo.innerHTML =
      "<td>" + "You" + "</td>" + "<td>" + styledTime + "</td>";
    messageBox.style.float = "right";
  } else {
    messageBox.style.float = "left";
    generalInfo.innerHTML =
      "<td>" + user + "</td>" + "<td>" + styledTime + "</td>";
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

//this is not working rn
function updatePage() {
  if (window.sessionStorage.getItem("currentPage") == "chat") {
    landingPage.style.visibility = "hidden";
    chatPage.style.visibility = "visible";
  } else {
    landingPage.style.visibility = "visible";
    chatPage.style.visibility = "hidden";
  }
}
