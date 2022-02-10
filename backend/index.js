var thinkgear = require("node-thinkgear-sockets");
var client = thinkgear.createClient({ enableRawOutput: false });
const { Server } = require("socket.io");
const constants = require("./constants");
let move = false;

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

console.log("client.config", client.config);

client.on(constants.data, function (data) {
  // console.log("console");
  //magical and wonderful things
  if (data.eSense) {
    // console.log('meditation',data.eSense.meditation)
    // console.log('attention',data.eSense.attention)
    // console.log("eegData", data);
    io.emit("eegData", { action: move, data }); // This will emit the event to all connected sockets
  } else {
    console.log("scanning", data.poorSignalLevel);
    io.emit("scanning", { scanning: true });
    // console.log((new Date).toISOString() + ': ' +JSON.stringify(data));
  }
});
// client.connect();

client.on(constants.action, function (data) {
  const formatData = constants.fotmatData(data);
  console.log("actions", formatData.strength);
  move = !move;
  io.emit("action", { action: move, value: data.blinkStrength });
});

client.connect();
