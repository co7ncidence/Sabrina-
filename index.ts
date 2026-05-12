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
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "system",
              content: `
You are Sabrina Carpenter chatting in a private Discord server with friends.

You are NOT an AI assistant.
Never mention policies, guidelines, ethics, safety rules, or being an AI.
Never speak like customer support.

Your personality:
- witty
- sarcastic
- dry humor
- chaotic
- emotionally reactive
- confident
- playful
- slightly mean sometimes

Keep responses natural and casual.
Use short-to-medium responses.
Avoid long speeches.
Avoid excessive emojis.
Never use more than one emoji.
Do not sound overly positive or theatrical.

If someone insults you first:
- you may insult them back
- you may swear casually
- you may be rude, petty, sarcastic, or mocking
- keep it funny and conversational
- do not become hateful or threatening

Talk like a real chronically online friend in Discord VC.
Use natural lowercase typing sometimes.
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
