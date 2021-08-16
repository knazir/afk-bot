require("dotenv").config();

/* ------------ Imports ------------ */

const { Client, Collection, Intents } = require("discord.js");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const path = require("path");

const { registerDevCommands } = require("./register");

/* ------------ Parameters ------------ */

const DEFAULT_DB_NAME = "afkbot";
const COLLECTION_NAMES = {
  guilds: "guilds",
  users: "users",
};

/* ------------ Global ------------ */

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
let db = null;
let guilds = null;
let users = null;

/* ------------ Event Handlers ------------ */

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName, guild: iGuild, user: iUser } = interaction;
  if (!client.commands.has(commandName)) return;

  try {
    const guild = (await guilds.findOneAndUpdate(
      { id: iGuild.id },
      { $set: { lastName: iGuild.name }, $setOnInsert: { id: iGuild.id, bets: {} } },
      { upsert: true },
    )).value;
    const user = (await users.findOneAndUpdate(
      { id: iUser.id },
      { $set: { lastUsername: iUser.username }, $setOnInsert: { id: iUser.id, points: 0 } },
      { upsert: true },
    )).value;
    await client.commands.get(commandName).execute(interaction, { db, guilds, users, guild, user });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
  }
});

client.on("ready", async () => {
  console.log("Successfully logged in.");
});

/* ------------ Setup ------------ */

MongoClient.connect(process.env.MONGO_URI, async (connectionError, dbClient) => {
  if (connectionError) throw connectionError;
  console.log("Successfully connected to database.");

  // Setup database
  db = dbClient.db(process.env.DB_NAME || DEFAULT_DB_NAME);
  guilds = db.collection(COLLECTION_NAMES.guilds);
  users = db.collection(COLLECTION_NAMES.users);

  // Setup commands
  client.commands = new Collection();
  fs.readdirSync("./commands").filter(file => file.endsWith(".js")).forEach(file => {
    const command = require(path.join(__dirname, "commands", file));
    client.commands.set(command.data.name, command);
  });

  // Only start the bot once the database is ready
  await registerDevCommands();
  return client.login(process.env.DISCORD_TOKEN);
});
