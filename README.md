SlackPilot

Bring your productivity tools directly into Slack — no more app-switching.

SlackPilot is a Node.js bot built with Slack Bolt that brings task management, reminders, saved notes, and AI-powered conversation tools straight into Slack. Instead of jumping between Slack, your task manager, your notes app, and a separate AI tool, SlackPilot tries to handle all of it in one place.

Features

Task Management

Create, view, and complete tasks without leaving Slack. Tasks are stored persistently, and SlackPilot can also automatically pick up on tasks mentioned in normal conversation.

Automatic AI Task Detection

SlackPilot listens for messages that sound like tasks and uses OpenAI to figure out:

Whether the message actually contains a task
What the task is
Whether a deadline was mentioned
Who it's assigned to

It only auto-creates a task if someone is explicitly mentioned — no false positives from general chatter.

Example:

@Aditya can you finish the presentation by Friday?

Reminders

Set quick reminders and get pinged when they're due.

/slackpilot-remind 30 Finish the presentation

Saved Information

Save notes, links, ideas, or deadlines for later with /slackpilot-save, and pull them back up with /slackpilot-saved.

AI Recap

/slackpilot-recap pulls recent channel messages and summarizes them into clear sections:

IMPORTANT
TASKS
DECISIONS
NEEDS ATTENTION
SUMMARY
🔍 AI Conversation Analysis

/slackpilot-analyze goes a step further and breaks down a conversation into:

Main topic
Important information
Tasks
Decisions
Unanswered questions
Potential problems
Recommended next actions

XP & Gamification

Using SlackPilot earns you XP, and XP builds into levels. It's a small incentive to actually use the bot instead of forgetting it exists.

Action	XP
Ping	+2
Help	+3
Roll / Coin	+3
Joke / Cat Fact	+5
Fortune	+5
Create task	+10
Create reminder	+10
Complete task	+20
AI recap	+25
AI analysis	+30

Check your stats with /slackpilot-me or see where you rank with /slackpilot-leaderboard.

 Fun Commands

Because not everything in Slack needs to be productive.

/slackpilot-joke
/slackpilot-catfact
/slackpilot-roll
/slackpilot-coin
/slackpilot-fortune
🛠️ Utility Commands
/slackpilot-help
/slackpilot-ping
📋 Command Reference
Command	Description
/slackpilot-task <task>	Create a new task
/slackpilot-tasks	View active tasks
/slackpilot-done <task number>	Mark a task as complete
/slackpilot-remind <minutes> <text>	Set a reminder
/slackpilot-reminders	View active reminders
/slackpilot-save <text>	Save a note, link, or idea
/slackpilot-saved	View saved information
/slackpilot-recap	AI summary of recent messages
/slackpilot-analyze	Deeper AI analysis of a conversation
/slackpilot-me	View your XP and level
/slackpilot-leaderboard	View the XP leaderboard
/slackpilot-joke	Random joke
/slackpilot-catfact	Random cat fact
/slackpilot-roll	Random number (1–100)
/slackpilot-coin	Heads or tails
/slackpilot-fortune	Random fortune
/slackpilot-help	List all commands
/slackpilot-ping	Check if the bot is alive
🧱 Tech Stack
Node.js — runtime
JavaScript — language
Slack Bolt — Slack app framework
Slack Socket Mode — real-time event handling without exposing a public endpoint
Axios — HTTP requests
OpenAI API — powers task detection, recaps, and analysis
GitHub — version control
Render — hosting/deployment
📁 Project Structure
SlackPilot/
├── index.js              # Main bot logic — commands, AI features, XP, reminders, health server
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
└── slackpilot-data.json  # Stores users, XP, tasks, saved items, and reminders

index.js handles everything: command routing, the AI integrations, the task and reminder systems, XP tracking, automatic task detection, and a small health check server.

slackpilot-data.json is where all persistent data lives — users, XP, tasks, saved notes, and reminders.

Environment Variables

Create a .env file in the root of the project:

SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o-mini

Never commit your .env file or any secrets to GitHub. Treat these like passwords — if they leak, anyone can use your Slack bot or rack up charges on your OpenAI account.

Recommended .gitignore:

.env
node_modules/
slackpilot-data.json

Slack App Setup

SlackPilot runs on Socket Mode, so it doesn't need a public URL or webhook endpoint — it connects directly to Slack over a websocket. It uses a mix of slash commands and message events to do its job.

When creating your Slack app, make sure the following bot token scopes are enabled:

Scope	Why it's needed
app_mentions:read	Detect when the bot is mentioned
channels:history	Read messages in public channels (for recap/analyze/task detection)
channels:read	Access public channel info
chat:write	Send messages
commands	Enable slash commands
groups:history	Read messages in private channels
groups:read	Access private channel info
im:history	Read DMs
im:read	Access DM info
mpim:history	Read group DMs
mpim:read	Access group DM info

You'll also need connections:write enabled for Socket Mode to work.

💻 Running Locally
git clone https://github.com/YOUR-USERNAME/SlackPilot.git
cd SlackPilot
npm install
npm start

If everything's set up correctly, you should see something like:


SlackPilot is running!

Deployment

SlackPilot can be deployed on Render or any other Node.js-friendly hosting platform.

Build command:

npm install

Start command:

npm start

Add your environment variables in your hosting provider's dashboard — don't hardcode them anywhere in the repo.

The project also runs a lightweight HTTP health server using the PORT environment variable, so platforms like Render can monitor uptime and confirm the service is alive.

 Security
Never hardcode API keys or Slack tokens directly in the code.
Keep all secrets in environment variables, not in the repo.
If a secret is ever accidentally pushed to GitHub, revoke it immediately and generate a new one. Don't just delete the commit — assume it's compromised the moment it's public.

Limitations

Being upfront about where things currently stand:

Storage is currently just a JSON file, not a real database
Reminders only fire while the bot is online
AI features (recap, analyze, task detection) require a valid OpenAI API key
AI analysis depends on the bot having the right Slack permissions
Automatic task detection can occasionally misread a message
The XP system is intentionally simple for now

Roadmap

Some things I'd like to add down the line:

 Web dashboard
 Calendar integration
 Better AI task detection accuracy
 Meeting summaries
 Searchable saved information
 Achievements
 Productivity streaks
 Productivity statistics
 Cloud database (move off the JSON file)
 User settings
 A proper SlackPilot website

Contributing

Contributions are welcome! To get started:

git checkout -b feature/my-feature
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

Then open a pull request and I'll take a look.

 License

This project is licensed under the MIT License.

Slack is where conversations happen.
SlackPilot is designed to help turn those conversations into actual action.

Plan less. Organize more. Work smarter.
