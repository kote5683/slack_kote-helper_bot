//
const axios = require("axios");




require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});


//KOTE-PING
app.command("/kote-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();


//KOTE-HELP
app.command("/kote-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:

GENERAL:
/kote-help - List available commands
/kote-ping - Check bot latency

OTHER:
/kote-joke - Get a joke
/kote-home_weather - Get the current weather at kote's home`
  });
});


//KOTE-JOKE
app.command("/kote-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

//KOTE-WEATHER
//it doesn't work and idk whyyyy; something with the API i guess? likely I just didn't use the correct office/grid_x/grid_y parameters, but i don't know how to fix it. pmo
app.command("/kote-home_weather", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://api.weather.gov/gridpoints/SHV/121,246/forecast");
    await respond({
      text:
`${response.data.properties.periods[0].name}

${response.data.properties.periods[0].detailedForecast}`
    });
  } catch (err) {
    await respond({ text: "Failed to get the weather." });
  }
});