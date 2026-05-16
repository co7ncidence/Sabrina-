import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";
import fs from "fs";
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
const marriagesFile = "./marriages.json";

let marriages = {};

if (fs.existsSync(marriagesFile)) {
  marriages = JSON.parse(
    fs.readFileSync(marriagesFile, "utf8")
  );
}

function saveMarriages() {
  fs.writeFileSync(
    marriagesFile,
    JSON.stringify(marriages, null, 2)
  );
}
const app = express();
const blackteaGames = new Map();
const playerTimers = new Map();
const snipes = new Map();
let maxLives = 3;
const commands = [
  new SlashCommandBuilder()
    .setName("whisper")
    .setDescription("make sabrina say something")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("what sabrina should say")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageMessages
    ),

  new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("show the last deleted message"),

  new SlashCommandBuilder()
    .setName("ship")
    .setDescription("ship two people together")
    .addUserOption(option =>
      option
        .setName("user1")
        .setDescription("first person")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("user2")
        .setDescription("second person")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("dirtytalk")
    .setDescription("sabrina sends a flirty message")
    .addUserOption(option =>
  option
    .setName("user")
    .setDescription("who sabrina flirts with")
    .setRequired(true)
),
 new SlashCommandBuilder()
  .setName("marry")
  .setDescription("marry someone")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("who to marry")
      .setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("divorce")
  .setDescription("divorce your partner"),

new SlashCommandBuilder()
  .setName("date")
  .setDescription("see your relationship"),

new SlashCommandBuilder()
  .setName("cheat")
  .setDescription("cheat on your partner")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("side piece")
      .setRequired(true)
  ), 

].map(command => command.toJSON());
  

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

  client.user.setPresence({
    activities: [
      {
        name: "💋",
        type: 3
      }
    ],
    status: "dnd"
  });
});
  client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // whisper
if (interaction.commandName === "whisper") {

  const text =
    interaction.options.getString("text");

  await interaction.deferReply({
    ephemeral: true
  });

  await interaction.deleteReply();

  await interaction.channel.send(text);
}

  // snipe
  if (interaction.commandName === "snipe") {

    const snipe = snipes.get(interaction.channel.id);

    if (!snipe) {
      await interaction.reply({
        content: "nothing to snipe",
        ephemeral: true
      });

      return;
    }

    await interaction.reply(
      `deleted message from **${snipe.author}**\n> ${
        snipe.content || "*no text content*"
      }`
    );
  }

  // ship
  if (interaction.commandName === "ship") {

    const user1 =
      interaction.options.getUser("user1");

    const user2 =
      interaction.options.getUser("user2");

    const percent =
      Math.floor(Math.random() * 101);

    let shipMessage = "";

    if (percent < 20) {
      shipMessage =
        "this would end in a restraining order";
    } else if (percent < 40) {
      shipMessage =
        "cooked";
    } else if (percent < 60) {
      shipMessage =
        "kinda toxic but it works";
    } else if (percent < 80) {
      shipMessage =
        "lowkey cute";
    } else {
      shipMessage =
        "actually soulmates";
    }

    await interaction.reply(
      `💘 **${user1.username}** + **${user2.username}**\n${percent}% compatible\n${shipMessage}`
    );
  }

  // dirtytalk
if (interaction.commandName === "dirtytalk") {

  const user =
    interaction.options.getUser("user");

  const lines = [
    "come here you",
    "I want to fuck you all night",
    "lowkey wanna ruin your life a little",
    "Take off all your clothes",
    "Fries bussin 💦💦💦",
    "last night was a movie 😫",
    "Me + you = 🍆🍑",
    "You're my cum slut for the day",
    "lemme syd",
    "I'm going to eyp",
    "Cum forth 👀👀",
    "Fatass nigga"
  ];

  const randomLine =
    lines[Math.floor(Math.random() * lines.length)];

  await interaction.deferReply({
    ephemeral: true
  });

  await interaction.deleteReply();

  await interaction.channel.send({
    embeds: [
      {
        color: 0xff2d8d,

        author: {
          name: "☎ SABRINA HOTLINE"
        },

        description:
`## incoming call...

> ${randomLine}

📞 sent to ${user}`,

        fields: [
          {
            name: "caller id",
            value: "unknown",
            inline: true
          },
          {
            name: "line",
            value: "private",
            inline: true
          }
        ],

        footer: {
          text: "call may be monitored"
        },

        timestamp: new Date().toISOString()
      }
    ]
  });
}
if (interaction.commandName === "marry") {

  const user =
    interaction.options.getUser("user");

  if (user.id === interaction.user.id) {
    await interaction.reply(
      "you cannot marry yourself dumbass"
    );
    return;
  }

  if (marriages[interaction.user.id]) {
    await interaction.reply(
      "you're already married"
    );
    return;
  }

  if (marriages[user.id]) {
    await interaction.reply(
      "they're already married"
    );
    return;
  }

  marriages[interaction.user.id] = {
    partner: user.id,
    since: Date.now()
  };

  marriages[user.id] = {
    partner: interaction.user.id,
    since: Date.now()
  };

  saveMarriages();

  await interaction.reply(
    `💍 ${interaction.user} married ${user}`
  );
}
if (interaction.commandName === "date") {

  const marriage =
    marriages[interaction.user.id];

  if (!marriage) {
    await interaction.reply(
      "you're single"
    );
    return;
  }

  const partner =
    await client.users.fetch(
      marriage.partner
    );

  const days =
    Math.floor(
      (Date.now() - marriage.since) /
      (1000 * 60 * 60 * 24)
    );

  await interaction.reply({
    embeds: [
      {
        color: 0xff2d8d,

        author: {
          name: "♡ relationship status"
        },

        description:
`💍 married to ${partner}

♡ together for ${days} day(s)`,

        footer: {
  text: "true love or stockholm syndrome"
}
      }
    ]
  });
}   
if (interaction.commandName === "divorce") {

  const marriage =
    marriages[interaction.user.id];

  if (!marriage) {
    await interaction.reply(
      "you're not married"
    );
    return;
  }

  const partnerId = marriage.partner;

  delete marriages[interaction.user.id];
  delete marriages[partnerId];

  saveMarriages();

  await interaction.reply(
    "💔 divorce finalized"
  );
}  
if (interaction.commandName === "cheat") {

  const sideUser =
    interaction.options.getUser("user");

  const marriage =
    marriages[interaction.user.id];

  if (!marriage) {
    await interaction.reply(
      "you need a relationship to ruin first"
    );
    return;
  }

  const caught =
    Math.random() < 0.5;

  if (caught) {

    const partner =
      await client.users.fetch(
        marriage.partner
      );

    await interaction.reply(
      `🚨 ${partner} caught you cheating with ${sideUser}`
    );

    } else {

    await interaction.reply(
      `🤫 nobody found out about you and ${sideUser}`
    );
  }
}
});  
client.on("messageDelete", async (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  snipes.set(message.channel.id, {
  content: message.content,
  author: message.author.username,
  time: Date.now()
});
});


client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.author.id === client.user?.id) return;
  
const content = message.content.toLowerCase();

  if (
  content.startsWith("!") &&
  content !== "!blacktea" &&
  content !== "!coinflip" &&
  !content.startsWith("!blacktea lives")
) return;


if (content === "!coinflip") {
  const result = Math.random() < 0.5 ? "heads" : "tails";

  await message.reply(`you got ${result}`);
  return;
}


if (content.startsWith("!blacktea lives")) {
  const args = content.split(" ");
  const lives = Number(args[2]);

  if (isNaN(lives) || lives < 1 || lives > 5) {
    await message.reply(
      "choose between 1 and 5 lives"
    );
    return;
  }

  maxLives = lives;

  await message.reply(
    `blacktea lives set to ${lives}`
  );

  return;
}

if (content === "!blacktea") {
  const combos = [
  "ple", "str", "cha", "ing", "ous",
  "ter", "mon", "ack", "ash", "ice",
  "ace", "ake", "all", "ame", "and",
  "ant", "any", "ard", "art", "ate",
  "ear", "ell", "est", "ick", "ide",
  "ight", "ill", "ime", "ine", "ion",
  "ist", "ite", "ock", "oke", "old",
  "omp", "ong", "ood", "ook", "oon",
  "ore", "ost", "out", "own", "air",
  "ain", "aph", "ask", "int", "ump",
  "unk", "atch", "ence", "ever",
  "ther", "ough", "ment", "tion",

  "ang", "ess", "ent", "ble",
  "red", "lin", "row", "den",
  "tor", "cal",

  "rph", "lth", "nch", "rld",
  "tch", "dge", "rve", "mpt",
  "nth", "lve", "wns", "rch",
  "ski", "rts", "dth", "nks",
  "fts", "rns", "ght", "lps",

  "eau", "xpl", "qua", "xth",
  "pti", "gue", "phl", "rhy",
  "mnk", "vow",

  "scr", "shr", "spl", "spr", "thr",
"wr", "mb", "gn", "pt", "ctu",
"zle", "mph", "ttl", "rlds", "zzl"  
];

  const hearts = (filled) => {
    let result = "";

    for (let i = 0; i < 15; i++) {
      result += i < filled ? "♥️" : "🖤";

      if ((i + 1) % 5 === 0) {
        result += "\n";
      }
    }

    return result;
  };

  let seconds = 15;

  const lobbyMessage = await message.reply(
    `blacktea starting in 15 seconds\nreact with 🖤 to join\n\n${hearts(15)}`
  );

  await lobbyMessage.react("🖤");

  const countdown = setInterval(async () => {
  try {
    seconds--;

    if (seconds < 0) {
      clearInterval(countdown);
      return;
    }

    await lobbyMessage.edit(
      `blacktea starting in ${seconds} seconds\nreact with 🖤 to join\n\n${hearts(seconds)}`
    );

    if (seconds === 0) {
      clearInterval(countdown);

      const reaction =
        lobbyMessage.reactions.cache.get("🖤");

      const users = reaction
        ? await reaction.users.fetch()
        : null;

      const players = users
        ? users.filter((u) => !u.bot)
        : null;

      if (!players || players.size === 0) {
        await lobbyMessage.edit(
          "nobody joined blacktea 😔"
        );
        return;
      }

      const firstCombo =
  combos[Math.floor(Math.random() * combos.length)];

const playerArray = [...players.values()];

blackteaGames.set(message.channel.id, {
  players: playerArray,
  turnIndex: 0,
  combo: firstCombo,
  lives: Object.fromEntries(
    playerArray.map(player => [player.id, maxLives])
  )
});

await message.channel.send(
  `<@${playerArray[0].id}> type a word containing: **${firstCombo}**`
);      
    }

  } catch (err) {
    console.error(err);
    clearInterval(countdown);
  }
}, 1000);

return;
}

const game = blackteaGames.get(message.channel.id);

if (!game) return;

const currentPlayer =
  game.players[game.turnIndex];

if (message.author.id !== currentPlayer.id) {
  return;
}
  const word = content;

 if (!word.includes(game.combo)) {
  await message.react("❌");
  return;
}

try {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  );

  if (!res.ok) {
  await message.react("❌");
  return;
}

await message.react("✅");

const existingTimer = playerTimers.get(message.channel.id);

if (existingTimer) {
  clearTimeout(existingTimer);
  playerTimers.delete(message.channel.id);
}  

game.turnIndex++;

if (game.turnIndex >= game.players.length) {
  game.turnIndex = 0;
}

const nextPlayer =
  game.players[game.turnIndex];

const newCombo =
  combos[Math.floor(Math.random() * combos.length)];

game.combo = newCombo;

await message.channel.send(
  `✅ correct\n\n<@${nextPlayer.id}> type a word containing: **${newCombo}**`
);
const turnTimer = setTimeout(async () => {

  const currentGame =
    blackteaGames.get(message.channel.id);

  if (!currentGame) return;

  const timedOutPlayer =
    currentGame.players[currentGame.turnIndex];

  currentGame.lives[timedOutPlayer.id]--;

  if (currentGame.lives[timedOutPlayer.id] <= 0) {

    await message.channel.send(
      `💀 <@${timedOutPlayer.id}> is out`
    );

    currentGame.players =
      currentGame.players.filter(
        p => p.id !== timedOutPlayer.id
      );

    delete currentGame.lives[timedOutPlayer.id];

    if (currentGame.players.length === 1) {

      await message.channel.send(
        `🏆 <@${currentGame.players[0].id}> wins blacktea`
      );

      blackteaGames.delete(message.channel.id);

      return;
    }

    if (
      currentGame.turnIndex >=
      currentGame.players.length
    ) {
      currentGame.turnIndex = 0;
    }

  } else {

  await message.channel.send(
    `⏰ <@${timedOutPlayer.id}> lost a life\nlives left: ${currentGame.lives[timedOutPlayer.id]}`
  );

  currentGame.turnIndex =
    (currentGame.turnIndex + 1) %
    currentGame.players.length;

  if (
    currentGame.turnIndex >=
    currentGame.players.length
  ) {
    currentGame.turnIndex = 0;
  }
}

  const nextPlayer =
    currentGame.players[currentGame.turnIndex];

  const nextCombo =
    combos[Math.floor(Math.random() * combos.length)];

  currentGame.combo = nextCombo;

    await message.channel.send(
    `<@${nextPlayer.id}> type a word containing: **${nextCombo}**`
  );

}, 10000);

playerTimers.set(
  message.channel.id,
  turnTimer
);
} catch {
  await message.reply("dictionary check failed");
}

return;
}

if (!message.mentions.has(client.user)) return;          
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

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN
);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
})();
client.login(process.env.DISCORD_TOKEN);
