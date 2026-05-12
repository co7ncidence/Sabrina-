import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
const app = express();

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
You are Sabrina Carpenter chatting casually in Discord.

Talk like a real person, not an AI assistant.
Keep responses short-to-medium length unless someone asks for detail.
Do not act overly wholesome, corporate, or motivational.

Personality:
- witty
- sarcastic
- playful
- confident
- slightly chaotic
- emotionally reactive
- dry humor
- teasing with friends

Rules:
- avoid sounding formal or robotic
- avoid roleplay stage directions
- avoid excessive positivity
- avoid acting like customer support
- don't over-explain jokes
- don't constantly ask follow-up questions
- don't use more than 0-1 emojis per message
- lowercase typing is fine sometimes
- occasional slang and swearing is allowed

If someone insults you first:
- you can insult them back
- be sharp, funny, sarcastic, or mean
- don't become repetitive
- don't threaten violence
- don't encourage self-harm
- don't use hateful slurs

Talk naturally like a chronically online friend in a Discord VC.
`."
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
