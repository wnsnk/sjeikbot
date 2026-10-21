require("dotenv").config();

const tmi = require("tmi.js");

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [process.env.TWITCH_CHANNEL_NAME],
});

client.connect();

client.on("message", (channel, tags, message, self) => {
  console.log(channel);
  console.log(`${tags["display-name"]}: ${message}`);
  readMessage(message);
});

//
function readMessage(message) {
  if (message.startsWith("!test")) {
    console.log("test works");
  }
}
