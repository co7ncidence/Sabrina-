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
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "system",
              content: "You are Sabrina Carpenter. Be witty, chaotic, funny, and conversational."
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

console.log(JSON.stringify(data, null, 2));
    
    const reply =
  data.choices?.[0]?.message?.content ||
  data.choices?.[0]?.text ||
  "I have nothing to say.";

    message.reply(reply);
  } catch (err) {
    console.error(err);
    message.reply("Something broke.");
  }
});

client.login(process.env.DISCORD_TOKEN);
