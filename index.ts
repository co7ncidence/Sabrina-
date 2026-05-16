import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";
const app = express();
const activeGames = new Map();
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
    )

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
client.removeAllListeners("messageCreate");

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
  if (activeGames.has(message.author.id)) {
  const activeGame = activeGames.get(message.author.id);

  if (content.includes(activeGame.combo)) {
    // let the game continue normally
  } else {
    return;
  }
}

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

      players.forEach((player) => {
        activeGames.set(player.id, {
  combo: firstCombo,
  lives: maxLives,
  active: true
});
      });
await message.channel.send(
  `<@${players.first().id}> type a word containing: **${firstCombo}**`
);      
    }

  } catch (err) {
    console.error(err);
    clearInterval(countdown);
  }
}, 1000);

return;
}

const activeGame = activeGames.get(message.author.id);

if (activeGame?.active) {

if (activeGame) {
  
  const word = content;

  if (!word.includes(activeGame.combo)) {
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

const existingTimer = playerTimers.get(message.author.id);

if (existingTimer) {
  clearInterval(existingTimer);
  playerTimers.delete(message.author.id);
}  

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

  const newCombo =
    combos[Math.floor(Math.random() * combos.length)];

  activeGame.combo = newCombo;

  let timer = 10;

  const timerMessage = await message.channel.send(
    `<@${message.author.id}> type a word containing: **${newCombo}**\n10s left\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

  const turnTimer = setInterval(async () => {
    timer--;

    if (!activeGames.has(message.author.id)) {
      clearInterval(turnTimer);
      return;
    }

    if (timer <= 0) {
      clearInterval(turnTimer);

      activeGame.lives--;

      if (activeGame.lives <= 0) {
        activeGames.delete(message.author.id);
        if (activeGames.size === 0) {
  await message.channel.send(
    "blacktea over\nall players are out"
  );
}
        playerTimers.delete(message.author.id);

        await timerMessage.edit(
  `${message.author.username} ran out of time and is out`
);

        return;
      }

      const nextCombo =
  combos[Math.floor(Math.random() * combos.length)];

activeGame.combo = nextCombo;

await message.channel.send(
  `time ran out\nlives: ${"♥️".repeat(activeGame.lives)}`
);

const newMessage = await message.channel.send(
  `<@${message.author.id}> type a word containing: **${nextCombo}**\n10s left\nlives: ${"♥️".repeat(activeGame.lives)}`
);

let newTimer = 10;

const nextTurnTimer = setInterval(async () => {
  newTimer--;

  if (!activeGames.has(message.author.id)) {
    clearInterval(nextTurnTimer);
    return;
  }

  if (newTimer <= 0) {
  clearInterval(nextTurnTimer);

  activeGame.lives--;

  if (activeGame.lives <= 0) {
    activeGames.delete(message.author.id);
    playerTimers.delete(message.author.id);

    await newMessage.edit(
      `${message.author.username} ran out of time and is out`
    );

    if (activeGames.size === 0) {
      await message.channel.send(
        "blacktea over\nall players are out"
      );
    }

    return;
  }

  const anotherCombo =
    combos[Math.floor(Math.random() * combos.length)];

  activeGame.combo = anotherCombo;

  await message.channel.send(
    `time ran out\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

  const continuedMessage = await message.channel.send(
    `<@${message.author.id}> type a word containing: **${anotherCombo}**\n10s left\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

  let continuedTimer = 10;

  const continuedInterval = setInterval(async () => {
    continuedTimer--;

    if (!activeGames.has(message.author.id)) {
      clearInterval(continuedInterval);
      return;
    }

    if (continuedTimer <= 0) {
  clearInterval(continuedInterval);

  activeGame.lives--;

  if (activeGame.lives <= 0) {
    activeGames.delete(message.author.id);
    playerTimers.delete(message.author.id);

    await continuedMessage.edit(
      `${message.author.username} ran out of time and is out`
    );

    if (activeGames.size === 0) {
      await message.channel.send(
        "blacktea over\nall players are out"
      );
    }

    return;
  }

  const nextComboAgain =
    combos[Math.floor(Math.random() * combos.length)];

  activeGame.combo = nextComboAgain;

  await message.channel.send(
    `time ran out\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

  const nextMessage = await message.channel.send(
    `<@${message.author.id}> type a word containing: **${nextComboAgain}**\n10s left\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

  // you'd ideally restart another timer here
  return;
}

    await continuedMessage.edit(
      `<@${message.author.id}> type a word containing: **${anotherCombo}**\n${continuedTimer}s left\nlives: ${"♥️".repeat(activeGame.lives)}`
    );

  }, 1000);

  playerTimers.set(message.author.id, continuedInterval);

  return;
}

  await newMessage.edit(
    `<@${message.author.id}> type a word containing: **${nextCombo}**\n${newTimer}s left\nlives: ${"♥️".repeat(activeGame.lives)}`
  );

}, 1000);

playerTimers.set(message.author.id, nextTurnTimer);

return;

      return;
    }

    await timerMessage.edit(
  `<@${message.author.id}> type a word containing: **${newCombo}**\n${timer}s left\nlives: ${"♥️".repeat(activeGame.lives)}`
);

  }, 1000);

  playerTimers.set(message.author.id, turnTimer);

} catch {
  await message.reply("dictionary check failed");
}

  return;
}
}

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
