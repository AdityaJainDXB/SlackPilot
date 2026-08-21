// ============================================================
// SLACKPILOT - ALL-IN-ONE SLACK BOT
// ============================================================

require("dotenv").config();

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { App } = require("@slack/bolt");

// ============================================================
// CONFIGURATION
// ============================================================

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const PORT = process.env.PORT || 3000;

// ============================================================
// SIMPLE PERSISTENT DATABASE
// ============================================================

const DATA_FILE = path.join(__dirname, "slackpilot-data.json");

let db = {
  users: {},
  tasks: [],
  saved: [],
  reminders: []
};

function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      db = JSON.parse(data);
    }
  } catch (error) {
    console.error("Database load error:", error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Database save error:", error);
  }
}

loadDatabase();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getUser(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      xp: 0,
      commands: 0
    };
    saveDatabase();
  }

  return db.users[userId];
}

function addXP(userId, amount) {
  const user = getUser(userId);

  user.xp += amount;

  saveDatabase();

  return user.xp;
}

function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/<@[^>]+>/g, "@user")
    .replace(/<#[^>]+\|([^>]+)>/g, "#$1")
    .replace(/<https?:\/\/[^|>]+\|([^>]+)>/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, "");
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

// ============================================================
// PING
// ============================================================

app.command("/slackpilot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();

  await ack();

  const latency = Date.now() - start;

  addXP(command.user_id, 2);

  await respond({
    text: `🏓 *Pong!*\nLatency: *${latency}ms*`
  });
});

// ============================================================
// HELP
// ============================================================

app.command("/slackpilot-help", async ({ command, ack, respond }) => {
  await ack();

  await respond({
    text:
`🤖 *SlackPilot*

Your personal productivity assistant inside Slack.

━━━━━━━━━━━━━━━━━━

⚡ *Utilities*

\`/slackpilot-ping\`
Check bot latency.

\`/slackpilot-help\`
Show this menu.

━━━━━━━━━━━━━━━━━━

🎉 *Fun*

\`/slackpilot-joke\`
Get a random joke.

\`/slackpilot-catfact\`
Get a random cat fact.

\`/slackpilot-roll\`
Roll 1-100.

\`/slackpilot-coin\`
Flip a coin.

\`/slackpilot-fortune\`
Get a random fortune.

━━━━━━━━━━━━━━━━━━

📋 *Productivity*

\`/slackpilot-task <task>\`
Create a task.

\`/slackpilot-tasks\`
View your tasks.

\`/slackpilot-done <task number>\`
Complete a task.

\`/slackpilot-save <text>\`
Save something.

\`/slackpilot-saved\`
View saved items.

\`/slackpilot-remind <minutes> <text>\`
Create a reminder.

\`/slackpilot-reminders\`
View reminders.

━━━━━━━━━━━━━━━━━━

🧠 *AI*

\`/slackpilot-recap\`
Summarize recent channel messages.

\`/slackpilot-analyze\`
Analyze recent conversation.

━━━━━━━━━━━━━━━━━━

🏆 *Profile*

\`/slackpilot-me\`
View your SlackPilot stats.

\`/slackpilot-leaderboard\`
View the SlackPilot leaderboard.

━━━━━━━━━━━━━━━━━━

💡 *Tip*

Use SlackPilot to turn messy Slack conversations into organized tasks and summaries.`
  });

  addXP(command.user_id, 3);
});

// ============================================================
// JOKE
// ============================================================

app.command("/slackpilot-joke", async ({ command, ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      "https://official-joke-api.appspot.com/random_joke"
    );

    addXP(command.user_id, 5);

    await respond({
      text:
`😂 *SlackPilot Joke*

${response.data.setup}

*${response.data.punchline}*`
    });
  } catch (error) {
    console.error(error);

    await respond({
      text: "❌ Failed to fetch a joke."
    });
  }
});

// ============================================================
// CAT FACT
// ============================================================

app.command("/slackpilot-catfact", async ({ command, ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      "https://catfact.ninja/fact"
    );

    addXP(command.user_id, 5);

    await respond({
      text:
`🐱 *Random Cat Fact*

${response.data.fact}`
    });
  } catch (error) {
    console.error(error);

    await respond({
      text: "❌ Failed to fetch a cat fact."
    });
  }
});

// ============================================================
// ROLL
// ============================================================

app.command("/slackpilot-roll", async ({ command, ack, respond }) => {
  await ack();

  const number = Math.floor(Math.random() * 100) + 1;

  addXP(command.user_id, 3);

  await respond({
    text: `🎲 You rolled *${number}*!`
  });
});

// ============================================================
// COIN
// ============================================================

app.command("/slackpilot-coin", async ({ command, ack, respond }) => {
  await ack();

  const result =
    Math.random() < 0.5
      ? "Heads 🪙"
      : "Tails 🪙";

  addXP(command.user_id, 3);

  await respond({
    text: `🪙 *${result}*`
  });
});

// ============================================================
// FORTUNE
// ============================================================

app.command("/slackpilot-fortune", async ({ command, ack, respond }) => {
  await ack();

  const fortunes = [
    "Today is a good day to start something new. 🚀",
    "You will solve a problem that has been annoying you. 🧠",
    "Something unexpectedly good is coming your way. 🍀",
    "Your next idea might be your best one yet. 💡",
    "Avoid unnecessary meetings today. 🫡",
    "A small decision today will save you time tomorrow. ⏱️",
    "You are closer to finishing that project than you think. ✅",
    "Someone will send you useful information today. 📩"
  ];

  const fortune =
    fortunes[Math.floor(Math.random() * fortunes.length)];

  addXP(command.user_id, 5);

  await respond({
    text:
`🔮 *SlackPilot Fortune*

${fortune}`
  });
});

// ============================================================
// CREATE TASK
// ============================================================

app.command("/slackpilot-task", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text.trim();

  if (!text) {
    await respond({
      text: "Usage: `/slackpilot-task Finish the F1 presentation`"
    });
    return;
  }

  const task = {
    id: Date.now(),
    userId: command.user_id,
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  db.tasks.push(task);

  addXP(command.user_id, 10);

  saveDatabase();

  await respond({
    text:
`📋 *Task Created*

> ${text}

Task ID: \`${task.id}\`

Use \`/slackpilot-tasks\` to view your tasks.`
  });
});

// ============================================================
// VIEW TASKS
// ============================================================

app.command("/slackpilot-tasks", async ({ command, ack, respond }) => {
  await ack();

  const userTasks = db.tasks.filter(
    task =>
      task.userId === command.user_id &&
      !task.completed
  );

  if (userTasks.length === 0) {
    await respond({
      text:
`📋 *Your Tasks*

You don't have any active tasks.

Create one with:

\`/slackpilot-task <task>\``
    });

    return;
  }

  let message = "📋 *Your Active Tasks*\n\n";

  userTasks.forEach((task, index) => {
    message += `${index + 1}. ⬜ ${task.text}\n`;
  });

  message +=
`\nUse \`/slackpilot-done <number>\` to complete a task.`;

  await respond({
    text: message
  });
});

// ============================================================
// COMPLETE TASK
// ============================================================

app.command("/slackpilot-done", async ({ command, ack, respond }) => {
  await ack();

  const number = parseInt(command.text.trim());

  if (isNaN(number)) {
    await respond({
      text: "Usage: `/slackpilot-done 1`"
    });
    return;
  }

  const userTasks = db.tasks.filter(
    task =>
      task.userId === command.user_id &&
      !task.completed
  );

  const task = userTasks[number - 1];

  if (!task) {
    await respond({
      text: "❌ Task not found."
    });
    return;
  }

  task.completed = true;
  task.completedAt = new Date().toISOString();

  addXP(command.user_id, 20);

  saveDatabase();

  await respond({
    text:
`✅ *Task Completed!*

> ${task.text}

+20 XP 🏆`
  });
});

// ============================================================
// SAVE
// ============================================================

app.command("/slackpilot-save", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text.trim();

  if (!text) {
    await respond({
      text: "Usage: `/slackpilot-save Important information`"
    });
    return;
  }

  const saved = {
    id: Date.now(),
    userId: command.user_id,
    text,
    createdAt: new Date().toISOString()
  };

  db.saved.push(saved);

  addXP(command.user_id, 5);

  saveDatabase();

  await respond({
    text:
`📌 *Saved*

> ${text}

Use \`/slackpilot-saved\` to view your saved items.`
  });
});

// ============================================================
// VIEW SAVED
// ============================================================

app.command("/slackpilot-saved", async ({ command, ack, respond }) => {
  await ack();

  const items = db.saved.filter(
    item => item.userId === command.user_id
  );

  if (items.length === 0) {
    await respond({
      text: "📌 You don't have anything saved yet."
    });
    return;
  }

  let message = "📌 *Your Saved Items*\n\n";

  items.slice(-20).forEach((item, index) => {
    message += `${index + 1}. ${item.text}\n`;
  });

  await respond({
    text: message
  });
});

// ============================================================
// REMINDER
// ============================================================

app.command("/slackpilot-remind", async ({ command, ack, respond }) => {
  await ack();

  const parts = command.text.trim().split(" ");

  if (parts.length < 2) {
    await respond({
      text:
`Usage:

\`/slackpilot-remind 30 Finish the presentation\`

This will remind you in 30 minutes.`
    });

    return;
  }

  const minutes = parseInt(parts[0]);
  const text = parts.slice(1).join(" ");

  if (isNaN(minutes) || minutes <= 0) {
    await respond({
      text: "❌ Please provide a valid number of minutes."
    });
    return;
  }

  const reminder = {
    id: Date.now(),
    userId: command.user_id,
    text,
    remindAt: Date.now() + minutes * 60 * 1000
  };

  db.reminders.push(reminder);

  addXP(command.user_id, 10);

  saveDatabase();

  await respond({
    text:
`⏰ *Reminder Created*

I'll remind you in *${minutes} minutes*:

> ${text}`
  });
});

// ============================================================
// VIEW REMINDERS
// ============================================================

app.command("/slackpilot-reminders", async ({ command, ack, respond }) => {
  await ack();

  const reminders = db.reminders.filter(
    reminder =>
      reminder.userId === command.user_id &&
      reminder.remindAt > Date.now()
  );

  if (reminders.length === 0) {
    await respond({
      text: "⏰ You don't have any upcoming reminders."
    });
    return;
  }

  let message = "⏰ *Your Reminders*\n\n";

  reminders.forEach((reminder, index) => {
    const minutes = Math.ceil(
      (reminder.remindAt - Date.now()) / 60000
    );

    message += `${index + 1}. ${reminder.text} — *${minutes} min*\n`;
  });

  await respond({
    text: message
  });
});

// ============================================================
// REMINDER CHECKER
// ============================================================

setInterval(async () => {
  const now = Date.now();

  const dueReminders = db.reminders.filter(
    reminder => reminder.remindAt <= now
  );

  if (dueReminders.length === 0) {
    return;
  }

  for (const reminder of dueReminders) {
    try {
      await app.client.chat.postMessage({
        channel: reminder.userId,
        text:
`⏰ *SlackPilot Reminder*

${reminder.text}`
      });
    } catch (error) {
      console.error("Reminder error:", error);
    }
  }

  db.reminders = db.reminders.filter(
    reminder => reminder.remindAt > now
  );

  saveDatabase();
}, 30000);

// ============================================================
// USER PROFILE
// ============================================================

app.command("/slackpilot-me", async ({ command, ack, respond }) => {
  await ack();

  const user = getUser(command.user_id);

  const level = getLevel(user.xp);

  await respond({
    text:
`👤 *Your SlackPilot Profile*

Level: *${level}*
XP: *${user.xp}*

📋 Tasks:
${db.tasks.filter(
  task =>
    task.userId === command.user_id &&
    !task.completed
).length} active

📌 Saved:
${db.saved.filter(
  item => item.userId === command.user_id
).length} items

🏆 Keep using SlackPilot to earn XP!`
  });
});

// ============================================================
// LEADERBOARD
// ============================================================

app.command("/slackpilot-leaderboard", async ({ command, ack, respond }) => {
  await ack();

  const users = Object.entries(db.users)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10);

  if (users.length === 0) {
    await respond({
      text: "🏆 No players yet!"
    });
    return;
  }

  let message = "🏆 *SlackPilot Leaderboard*\n\n";

  for (let i = 0; i < users.length; i++) {
    const [userId, user] = users[i];

    const medals = ["🥇", "🥈", "🥉"];

    const medal = medals[i] || `${i + 1}.`;

    message += `${medal} <@${userId}> — *${user.xp} XP* — Level ${getLevel(user.xp)}\n`;
  }

  await respond({
    text: message
  });
});

// ============================================================
// GET CHANNEL HISTORY
// ============================================================

async function getRecentMessages(channelId, limit = 50) {
  try {
    const result = await app.client.conversations.history({
      channel: channelId,
      limit
    });

    return result.messages || [];
  } catch (error) {
    console.error("History error:", error);
    return [];
  }
}

// ============================================================
// OPENAI AI FUNCTION
// ============================================================

async function askAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are SlackPilot, a concise and professional Slack productivity assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "AI error:",
      error.response?.data || error.message
    );

    return null;
  }
}

// ============================================================
// AI RECAP
// ============================================================

app.command("/slackpilot-recap", async ({ command, ack, respond, client }) => {
  await ack();

  await respond({
    text: "🧠 SlackPilot is analyzing the recent conversation..."
  });

  const messages = await getRecentMessages(command.channel_id, 50);

  if (messages.length === 0) {
    await respond({
      text: "❌ I couldn't retrieve recent messages from this channel."
    });

    return;
  }

  const conversation = messages
    .reverse()
    .map(message => {
      return `${message.user || "Unknown"}: ${cleanText(message.text)}`;
    })
    .join("\n");

  const prompt =
`Analyze this Slack conversation and create a useful recap.

Return exactly these sections:

🔥 IMPORTANT
📋 TASKS
💡 DECISIONS
⚠️ NEEDS ATTENTION
📝 SUMMARY

Be concise.

Conversation:

${conversation}`;

  const aiResponse = await askAI(prompt);

  if (!aiResponse) {
    await respond({
      text:
`⚠️ AI recap is unavailable.

Make sure \`OPENAI_API_KEY\` is configured in your .env file.`
    });

    return;
  }

  addXP(command.user_id, 25);

  await respond({
    text:
`📰 *SlackPilot Recap*

${aiResponse}

+25 XP 🏆`
  });
});

// ============================================================
// AI ANALYZE
// ============================================================

app.command("/slackpilot-analyze", async ({ command, ack, respond }) => {
  await ack();

  await respond({
    text: "🧠 Analyzing the conversation..."
  });

  const messages = await getRecentMessages(command.channel_id, 50);

  if (messages.length === 0) {
    await respond({
      text: "❌ No messages found."
    });

    return;
  }

  const conversation = messages
    .reverse()
    .map(message => {
      return `${message.user || "Unknown"}: ${cleanText(message.text)}`;
    })
    .join("\n");

  const prompt =
`Analyze the following Slack conversation.

Identify:

1. Main topic
2. Important information
3. Tasks
4. Decisions
5. Questions that haven't been answered
6. Potential problems
7. Recommended next actions

Keep the answer concise.

Conversation:

${conversation}`;

  const result = await askAI(prompt);

  if (!result) {
    await respond({
      text: "⚠️ AI is unavailable. Check your OPENAI_API_KEY."
    });

    return;
  }

  addXP(command.user_id, 30);

  await respond({
    text:
`🧠 *SlackPilot Analysis*

${result}

+30 XP 🏆`
  });
});

// ============================================================
// AUTOMATIC TASK EXTRACTION
// ============================================================

app.message(async ({ message, client }) => {
  try {
    if (
      !message.text ||
      message.subtype ||
      message.bot_id
    ) {
      return;
    }

    // Only run if AI is configured
    if (!process.env.OPENAI_API_KEY) {
      return;
    }

    // Don't analyze every message aggressively.
    // Only analyze messages that look like tasks.
    const taskWords = [
      "can you",
      "could you",
      "please",
      "need you to",
      "remind",
      "deadline",
      "by tomorrow",
      "by friday",
      "by monday"
    ];

    const lowerText = message.text.toLowerCase();

    const looksLikeTask = taskWords.some(
      word => lowerText.includes(word)
    );

    if (!looksLikeTask) {
      return;
    }

    const prompt =
`Determine whether this Slack message contains a task assigned to someone.

Message:
"${cleanText(message.text)}"

Respond ONLY with JSON:

{
  "isTask": true or false,
  "task": "short task description",
  "deadline": "deadline if mentioned or null"
}`;

    const result = await askAI(prompt);

    if (!result) {
      return;
    }

    let parsed;

    try {
      const cleaned = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return;
    }

    if (!parsed.isTask || !parsed.task) {
      return;
    }

    // Don't automatically create a task for someone
    // unless they are explicitly mentioned.
    const mentionMatches =
      message.text.match(/<@([A-Z0-9]+)>/g);

    if (!mentionMatches || mentionMatches.length === 0) {
      return;
    }

    const userId = mentionMatches[0]
      .replace("<@", "")
      .replace(">", "");

    const task = {
      id: Date.now(),
      userId,
      text: parsed.task,
      deadline: parsed.deadline,
      channelId: message.channel,
      messageTs: message.ts,
      completed: false,
      automatic: true,
      createdAt: new Date().toISOString()
    };

    db.tasks.push(task);

    saveDatabase();

    await client.chat.postEphemeral({
      channel: message.channel,
      user: userId,
      text:
`📋 *SlackPilot detected a task for you*

> ${parsed.task}

${parsed.deadline ? `📅 Deadline: *${parsed.deadline}*\n` : ""}
Use \`/slackpilot-tasks\` to view your tasks.`
    });

  } catch (error) {
    console.error("Automatic task detection error:", error);
  }
});

// ============================================================
// START
// ============================================================

(async () => {
  try {
    await app.start();

    console.log("");
    console.log("=================================");
    console.log("🚀 SlackPilot is running!");
    console.log("=================================");
    console.log("");
    console.log("Available commands:");
    console.log("/slackpilot-help");
    console.log("/slackpilot-ping");
    console.log("/slackpilot-joke");
    console.log("/slackpilot-catfact");
    console.log("/slackpilot-roll");
    console.log("/slackpilot-coin");
    console.log("/slackpilot-fortune");
    console.log("/slackpilot-task");
    console.log("/slackpilot-tasks");
    console.log("/slackpilot-done");
    console.log("/slackpilot-save");
    console.log("/slackpilot-saved");
    console.log("/slackpilot-remind");
    console.log("/slackpilot-reminders");
    console.log("/slackpilot-recap");
    console.log("/slackpilot-analyze");
    console.log("/slackpilot-me");
    console.log("/slackpilot-leaderboard");
    console.log("");
  } catch (error) {
    console.error("❌ Failed to start SlackPilot:");
    console.error(error);
  }
})();