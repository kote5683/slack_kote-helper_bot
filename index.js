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

ORGANIZATION:
/kote-todo - Display your to-do list
/kote-todo [task] - Add a task to your to-do list
/kote-remind [time] [message] - Set a reminder with a custom message (not implemented yet)
/kote-reminders - List your active reminders (not implemented yet)
/kote-remind-clear - Clear all your reminders (not implemented yet)
/kote-remind [@someone] or [#channel] [time] [message] - Set a reminder for someone else or a channel (not implemented yet)

OTHER:
/kote-joke - Get a joke
/kote-weather - Get the current weather at your location`
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
app.command("/kote-weather", async ({ ack, respond }) => {
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

//KOTE-TODO: display a to do list for the user, stored in memory (not persistent)
//KOTE-TODO [TASK]: add a task to the user's to do list, stored in memory (not persistent)
//handled in the command below; just checks if there's text after the command and adds it to the list if there is
const userTodos = {};

app.command("/kote-todo", async ({ command, ack, respond }) => { 
  await ack();

  const userId = command.user_id;
  const text = command.text.trim();

  if (!userTodos[userId]) {
    userTodos[userId] = [];
  } 
  if (text) {
    userTodos[userId].push(text);
    await respond({ text: `Added to your to-do list: ${text}` });
  } 
  else {
    const todos = userTodos[userId];
    if (todos.length === 0) {
      await respond({ text: "Your to-do list is empty." });
    } else {
      await respond({ text: `Your to-do list:\n${todos.map((item, index) => `${index + 1}. ${item}`).join("\n")}` });
    } 
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//KOTE-REMIND [TIME] [MESSAGE]: set a reminder with a custom message (not implemented yet); for now, just store it in memory; this is where the reminder would be set; for now, just store it in memory
const userReminders = {};

app.command("/kote-remind", async ({ command, ack, respond }) => {
  await ack();
  const userId = command.user_id;
  const text = command.text.trim();
  const [time, ...messageParts] = text.split(" ");
  const message = messageParts.join(" ");
  if (!userReminders[userId]) {
    userReminders[userId] = [];
  }
  function parseTimeToMs(timeStr) {
    const match = timeStr.match(/(\d+)([smhd])/);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s": return value * 1000;
      case "m": return value * 60 * 1000;
      case "h": return value * 60 * 60 * 1000;
      case "d": return value * 24 * 60 * 60 * 1000;
      default: return null;
    }
  }
  const delay = parseTimeToMs(time);
  if (!delay) {
    await respond({ text: "Invalid time format. Use something like '10s', '5m', '2h', or '1d'." });
    return;
  }
  if (!userReminders[userId]) {
    userReminders[userId] = [];
  }
 
      userReminders[userId].push({ time, message });
  await respond({ text: `Reminder set for ${time}: ${message}` });

  setTimeout(async () => {
    await app.client.chat.postMessage({
      channel: userId,
      text: `Reminder: ${message}`
    });
}, delay);

   await respond({ text: `Reminder set for ${time}: ${message}` });
});


//KOTE-REMIND [@SOMEONE] or [#CHANNEL] [TIME] [MESSAGE]: set a reminder for someone else or a channel (not implemented yet)
function parseTimeToMs(timeStr) {
    const match = timeStr.match(/(\d+)([smhd])/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s": return value * 1000;
      case "m": return value * 60 * 1000;
      case "h": return value * 60 * 60 * 1000;
      case "d": return value * 24 * 60 * 60 * 1000;
      default: return null;
    }

const channelReminders = {};

app.command("/kote-remind-channel", async ({ command, ack, respond }) => {
  await ack();
  const text = command.text.trim();
  const [target, time, ...messageParts] = text.split(" ");
  const message = messageParts.join(" ");

  const delay = parseTimeToMs(time);
  if (!delay) {
    await respond({ text: "Invalid time format. Use something like '10s', '5m', '2h', or '1d'." });
    return;
  }

  if (!channelReminders[target]) {
    channelReminders[target] = [];
  }

  channelReminders[target].push({ time, message });
  await respond({ text: `Reminder set for ${target} at ${time}: ${message}` });
});
  setTimeout(async () => {
    await app.client.chat.postMessage({
      channel: target,
      text: 'Reminder: ${message}'
    });
    }, delay);


//KOTE-REMINDERS: list the user's active reminders (not implemented yet)
const listReminders = async ({ command, ack, respond }) => {
  await ack();
  const userId = command.user_id;
  const reminders = userReminders[userId] || [];
  if (reminders.length === 0) {
    await respond({ text: "You have no active reminders." });
  } else {
    await respond({ text: `Your active reminders:\n${reminders.map((reminder, index) => `${index + 1}. ${reminder.time}: ${reminder.message}`).join("\n")}` });
  } 
};

app.command("/kote-reminders", listReminders);


//KOTE-REMIND-CLEAR: clear all the user's reminders (not implemented yet)
const clearReminders = async ({ command, ack, respond }) => {
  await ack();
  const userId = command.user_id;
  userReminders[userId] = [];
  await respond({ text: "All your reminders have been cleared." });
};

app.command("/kote-remind-clear", clearReminders);}
