import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
if (!process.env.DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN");
}

if (!process.env.CLIENT_ID) {
  throw new Error("Missing CLIENT_ID");
}

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY");
}
async function getMarriage(userId) {

  const { data, error } = await supabase
    .from("marriages")
    .select("*")
    .eq("userid", userId)
    .single();

  if (error || !data) {
    console.error("SUPABASE LOAD ERROR:", error);
    return null;
  }

  return {
    partner: data.partner,
    since: data.since,
    kids: data.kids || []
  };
}

async function setMarriage(userId, data) {

  const result = await supabase
    .from("marriages")
    .upsert(
      {
        userid: userId,
        partner: data.partner,
        since: data.since,
        kids: data.kids || []
      },
      {
        onConflict: "userid"
      }
    )
    .select();

  console.log("SUPABASE RESULT:", result);
}

async function deleteMarriage(userId) {
  await supabase
    .from("marriages")
    .delete()
    .eq("userid", userId);
}

const app = express();
const blackteaGames = new Map();
const playerTimers = new Map();
const snipes = new Map();
const cooldowns = new Map();

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
  .setName("propose")
  .setDescription("propose to someone")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("who to propose to")
      .setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("divorce")
  .setDescription("divorce your partner"),

new SlashCommandBuilder()
  .setName("relationship")
  .setDescription("see your relationship status"),

new SlashCommandBuilder()
  .setName("cheat")
  .setDescription("cheat on your partner")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("side piece")
      .setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("adopt")
  .setDescription("adopt a child")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("child to adopt")
      .setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("family")
  .setDescription("view your family") 

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

  await interaction.channel.send({
  content: text,
  allowedMentions: {
    parse: []
  }
});
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
    "Fatass"
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
if (interaction.commandName === "propose") {

  const user =
    interaction.options.getUser("user");

  if (user.id === interaction.user.id) {
    await interaction.reply(
      "you cannot marry yourself dumbass"
    );
    return;
  }

  if (await getMarriage(interaction.user.id)) {
    await interaction.reply(
      "you're already married"
    );
    return;
  }

  if (await getMarriage(user.id)) {
    await interaction.reply(
      "they're already married"
    );
    return;
  }

  await interaction.reply(
    `${user}, ${interaction.user} proposed to you 💍\nreply with "yes" or "no" within 30 seconds`
  );

  const filter = (m) =>
    m.author.id === user.id;

  try {

    const collected =
      await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ["time"]
      });

    const response =
  collected.first().content
    .toLowerCase()
    .trim();

if (response === "no" || response === "n") {
  await interaction.channel.send(
    `💔 ${user} rejected the proposal`
  );
  return;
}

if (
  response !== "yes" &&
  response !== "y"
) {
  await interaction.channel.send(
    "reply with yes or no"
  );
  return;
}

                await setMarriage(interaction.user.id, {
  partner: user.id,
  since: Date.now(),
  kids: []
});

            await setMarriage(user.id, {
  partner: interaction.user.id,
  since: Date.now(),
  kids: []
});

    await interaction.channel.send(
      `💍 ${interaction.user} and ${user} are now married`
    );

  } catch {

    await interaction.channel.send(
      "proposal expired"
    );
  }
}
if (interaction.commandName === "relationship") {

  const marriage =
                await getMarriage(interaction.user.id);

  if (!marriage) {
    await interaction.reply(
      "you're single"
    );
    return;
  }

  const partner =
  await client.users.fetch(
    marriage.partner
  ).catch(() => null);
  const days =
    Math.floor(
      (Date.now() - marriage.since) /
      (1000 * 60 * 60 * 24)
    );

  let kidsText = "none";

  if (
    marriage.kids &&
    marriage.kids.length > 0
  ) {
    kidsText =
      marriage.kids
        .map(id => `<@${id}>`)
        .join(", ");
  }

  await interaction.reply({
    embeds: [
      {
        color: 0xff2d8d,

        author: {
          name: "♡ relationship status"
        },

description:
`💍 married to ${partner ? `<@${partner.id}>` : "unknown user"}

♡ together for ${days} day(s)

👶 kids: ${kidsText}`,

        footer: {
          text:
            "true love or stockholm syndrome"
        }
      }
    ]
  });
}   
if (interaction.commandName === "divorce") {

  const marriage =
                await getMarriage(interaction.user.id);

  if (!marriage) {
    await interaction.reply(
      "you're not married"
    );
    return;
  }

  const partnerId = marriage.partner;

  await deleteMarriage(interaction.user.id);
await deleteMarriage(partnerId);


  await interaction.reply(
    "💔 divorce finalized"
  );
}  
if (interaction.commandName === "cheat") {

  const sideUser =
    interaction.options.getUser("user");

  const marriage =
    await getMarriage(interaction.user.id);

  if (!marriage) {
    await interaction.reply({
      content:
        "you need a relationship to ruin first",
      ephemeral: true
    });
    return;
  }

  const partner =
    await client.users.fetch(
      marriage.partner
    );

  const badOptions = [
    "gaslight",
    "deny it",
    "lie",
    "delete messages",
    "blame friend"
  ]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const buttons =
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("delete messages")
          .setLabel("delete messages")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("lie")
          .setLabel("lie")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("gaslight")
          .setLabel("gaslight")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("blame friend")
          .setLabel("blame friend")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("deny it")
          .setLabel("deny it")
          .setStyle(ButtonStyle.Secondary)
      );

  await interaction.reply({
    content:
`How do you cover it up?`,
    components: [buttons],
    ephemeral: true
  });

  try {

    const buttonInteraction =
      await interaction.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
        filter: i =>
          i.user.id === interaction.user.id
      });

    const choice =
      buttonInteraction.customId;

    const caught =
      badOptions.includes(choice);

    if (caught) {

      await buttonInteraction.update({
        content:
          `you chose: **${choice}**\n\nyou got caught 💀`,
        components: []
      });

      await interaction.channel.send(
        `🚨 ${partner} caught ${interaction.user} cheating with ${sideUser}`
      );

      await partner.send(
        `🚨 your partner ${interaction.user} had an affair with ${sideUser}`
      ).catch(() => null);

    } else {

      await buttonInteraction.update({
        content:
          `you chose: **${choice}**\n\nnobody found out 🤫`,
        components: []
      });

      const secretMessage =
        `🤫 nobody found out about you and ${sideUser}`;

      await interaction.user.send(
        secretMessage
      ).catch(() => null);

      await sideUser.send(
        secretMessage
      ).catch(() => null);
    }

  } catch {

    await interaction.editReply({
      content:
        "too slow. the affair window closed",
      components: []
    });
  }
}
if (interaction.commandName === "adopt") {

  const child =
    interaction.options.getUser("user");

  const marriage =
                await getMarriage(interaction.user.id);

  if (!marriage) {
    await interaction.reply(
      "you need to be married first"
    );
    return;
  }

  if (child.id === interaction.user.id) {
    await interaction.reply(
      "you cannot adopt yourself"
    );
    return;
  }

  const partner =
    await client.users.fetch(
      marriage.partner
    );

  if (!marriage.kids) {
    marriage.kids = [];
  }
if (child.bot) {
  await interaction.reply(
    "you cannot adopt a bot"
  );
  return;
}

if (child.id === partner.id){
  await interaction.reply(
    "you cannot adopt your partner 😭"
  );
  return;
}

if (marriage.kids.includes(child.id)) {
  await interaction.reply(
    "that child is already adopted"
  );
  return;
}
marriage.kids.push(child.id);

            await setMarriage(interaction.user.id, {
  partner: marriage.partner,
  since: marriage.since,
  kids: marriage.kids
});

const partnerMarriage =
              await getMarriage(marriage.partner);

if (!partnerMarriage) {
  await interaction.reply(
    "partner data missing"
  );
  return;
}

partnerMarriage.kids = marriage.kids;

            await setMarriage(marriage.partner, {
  partner: partnerMarriage.partner,
  since: partnerMarriage.since,
  kids: partnerMarriage.kids
});

  await interaction.reply(
    `👶 ${interaction.user} and ${partner} adopted ${child}`
  );
}  
if (interaction.commandName === "family") {

  const marriage =
              await getMarriage(interaction.user.id);

  if (!marriage) {
    await interaction.reply(
      "you dont have a family"
    );
    return;
  }

  const partner =
  await client.users.fetch(
    marriage.partner
  ).catch(() => null);
  let kidsText = "none";

  if (
    marriage.kids &&
    marriage.kids.length > 0
  ) {
    kidsText =
      marriage.kids
        .map(id => `<@${id}>`)
        .join("\n");
  }

  await interaction.reply({
    embeds: [
      {
        color: 0xff2d8d,

        author: {
          name: "♡ family"
        },

description:
`💍 partner: ${partner ? `<@${partner.id}>` : "unknown user"}

👶 children:
${kidsText}`
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

async function startTurn(channel, game) {

  const oldTimer = playerTimers.get(channel.id);

  if (oldTimer) {
    clearInterval(oldTimer);
    playerTimers.delete(channel.id);
  }

  if (game.players.length === 1) {

  const winner = game.players[0];

  const activeTimer =
    playerTimers.get(channel.id);

  if (activeTimer) {
    clearInterval(activeTimer);
    playerTimers.delete(channel.id);
  }

  blackteaGames.delete(channel.id);

  await channel.send(
    `🏆 <@${winner.id}> wins blacktea`
  );

  return;
}
if (!game.players.length) {
  blackteaGames.delete(channel.id);
  return;
}
  const player =
    game.players[game.turnIndex];

  const combo =
    combos[Math.floor(Math.random() * combos.length)];

  game.combo = combo;

  let timeLeft = 10;

  const timerMessage = await channel.send(
    `⏰ <@${player.id}> has **10** seconds\nword: **${combo}**`
  );

  const interval = setInterval(async () => {

    timeLeft--;

    if (timeLeft <= 0) {

      clearInterval(interval);

      game.lives[player.id]--;

      if (game.lives[player.id] <= 0) {

        await channel.send(
          `💀 <@${player.id}> is out`
        );

        game.players =
          game.players.filter(
            p => p.id !== player.id
          );

        delete game.lives[player.id];

        if (
          game.turnIndex >= game.players.length
        ) {
          game.turnIndex = 0;
        }

      } else {

        await channel.send(
          `⏰ <@${player.id}> lost a life\nlives left: ${game.lives[player.id]}`
        );

        game.turnIndex =
          (game.turnIndex + 1) %
          game.players.length;
      }

      startTurn(channel, game);

      return;
    }

    try {

      await timerMessage.edit(
        `⏰ <@${player.id}> has **${timeLeft}** seconds\nword: **${combo}**`
      );

    } catch {}

  }, 1000);

  playerTimers.set(channel.id, interval);
}
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.author.id === client.user?.id) return;
  
const content = message.content;
const lowered = content.toLowerCase();

if (
  lowered.startsWith("!") &&
  lowered !== "!blacktea" &&
  lowered !== "!coinflip" &&
  !lowered.startsWith("!blacktea lives")
) return;


if (lowered === "!coinflip") {
  const result = Math.random() < 0.5 ? "heads" : "tails";

  await message.reply(`you got ${result}`);
  return;
}


if (lowered.startsWith("!blacktea lives")) {
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

if (lowered === "!blacktea") {
if (blackteaGames.has(message.channel.id)) {
  await message.reply(
    "a blacktea game is already running"
  );
  return;
}  
  
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

const playerArray = [...players.values()];

blackteaGames.set(message.channel.id, {
  players: playerArray,
  turnIndex: 0,
  combo: "",
  lives: Object.fromEntries(
    playerArray.map(player => [player.id, maxLives])
  )
});

startTurn(
  message.channel,
  blackteaGames.get(message.channel.id)
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

if (game) {

if (!game.players[game.turnIndex]) {
  game.turnIndex = 0;
}
  
  const currentPlayer =
    game.players[game.turnIndex];

  // ignore everyone except current player
  if (message.author.id !== currentPlayer.id) {
    return;
  }

  const word = lowered.replace(/[^a-z]/g, "");

  if (
    !word.includes(game.combo) ||
    word.length < game.combo.length + 1
  ) {

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

    const existingTimer =
      playerTimers.get(message.channel.id);

    if (existingTimer) {
      clearInterval(existingTimer);
      playerTimers.delete(message.channel.id);
    }

    game.turnIndex =
      (game.turnIndex + 1) %
      game.players.length;

    await message.channel.send(
      `✅ correct`
    );

    startTurn(message.channel, game);

  } catch (err) {

    console.error(err);

    await message.reply(
      "dictionary check failed"
    );
  }

  return;
}
if (!message.mentions.has(client.user)) return;

const now = Date.now();

if (cooldowns.has(message.author.id)) {
  const expiration = cooldowns.get(message.author.id);

  if (now < expiration) {
    return;
  }
}

cooldowns.set(message.author.id, now + 5000);

setTimeout(() => {
  cooldowns.delete(message.author.id);
}, 5000);
  
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
            content: 
          `You are Sabrina Carpenter in a private Discord server.

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

  if (!response.ok) {
    console.log(await response.text());
    return;
  }

  const data = await response.json();

  const reply =
    data.choices?.[0]?.message?.content;

  if (!reply) return;

  await message.reply(reply);

} catch (err) {

  console.error(err);

  await message.reply(
    "Something broke."
  );
}
  
return;
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
