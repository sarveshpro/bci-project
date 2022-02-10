var thinkgear = require("node-thinkgear-sockets");
var client = thinkgear.createClient({ enableRawOutput: false });
const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("frontend connected");
  socket.on("disconnect", () => {
    console.log("frontend disconnected");
  });
});

io.listen(8000);

client.on("data", function (data) {
  //magical and wonderful things
  if (data.eSense) {
    // console.log('meditation',data.eSense.meditation)
    // console.log('attention',data.eSense.attention)
    console.log("eegData", data);
    io.emit("eegData", data); // This will emit the event to all connected sockets
  } else {
    console.log("scanning", data.poorSignalLevel);
    io.emit("scanning", { scanning: true });
    // console.log((new Date).toISOString() + ': ' +JSON.stringify(data));
  }
});

client.on("blink_data", function (data) {
  console.log("blinked", data.blinkStrength);
  io.emit("action", data);
});

client.connect();
