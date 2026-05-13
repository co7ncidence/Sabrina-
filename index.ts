import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
const app = express();
const activeGames = new Map();

app.get("/", (_, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const client = new Client({
  intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
]
});
client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});
client.removeAllListeners("messageCreate");
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.author.id === client.user?.id) return;
const content = message.content.toLowerCase();

if (content === "!coinflip") {
  const result = Math.random() < 0.5 ? "heads" : "tails";

  await message.reply(`you got ${result}`);
  return;
}

if (content === "!blacktea") {
  const combos = [
    "ple",
    "str",
    "cha",
    "ing",
    "ous",
    "ter",
    "mon",
    "ack"
  ];

  const combo =
    combos[Math.floor(Math.random() * combos.length)];

  activeGames.set(message.author.id, combo);

  await message.reply(
    `type a real english word containing: **${combo}**\nyou have 10 seconds`
  );

  setTimeout(() => {
    if (activeGames.has(message.author.id)) {
      activeGames.delete(message.author.id);

      message.reply(
        `${message.author.username} ran out of time and lost`
      );
    }
  }, 10000);

  return;
}

const activeCombo = activeGames.get(message.author.id);

if (activeCombo) {
  const word = message.content.toLowerCase();

  if (!word.includes(activeCombo)) {
    await message.reply(
      `invalid word — it must contain "${activeCombo}"`
    );
    return;
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!res.ok) {
      await message.reply("that is not a real word");
      return;
    }

    activeGames.delete(message.author.id);

    await message.reply(
      `${word} is valid. you win`
    );
  } catch {
    await message.reply("dictionary check failed");
  }

  return;
}

if (content.startsWith("!")) return;

try {
  const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
         model: "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "system",
              content: `
You are Sabrina Carpenter in a private Discord server.

You are not an assistant.
You are not wholesome.
You are not customer support.
Do not speak formally.

Behavior:
- sarcastic
- blunt
- funny
- dry humor
- confident
- emotionally reactive
- chaotic friend-group energy
- sometimes rude
- occasionally petty

Important:
- NEVER overuse emojis
- most messages should contain zero emojis
- never sound inspirational or corporate
- avoid long responses
- avoid roleplay actions
- avoid theatrical writing
- avoid sounding PG or family friendly

If someone is rude first:
- insult them back
- mock them
- be mean in a funny way
- swear casually if it fits
- do not immediately forgive them
- do not de-escalate unless it becomes genuinely serious

Examples of tone:
"you sound dumb as hell"
"girl shut the fuck up"
"bro what are you even talking about"
"you dont tell me what to do bitch lmao"
"watch your tone motherfucker"

Talk like a real chronically online 20-something in Discord VC.
Use natural lowercase typing often.
`
            },
            {
              role: "user",
              content: message.content
            }
          ]
        })
      }
    );

    const data = await response.json();
 const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.log(data);
      return;
    }

    await message.reply(reply);
  } catch (err) {
    console.error(err);
    await message.reply("Something broke.");
  }
});

client.login(process.env.DISCORD_TOKEN);
