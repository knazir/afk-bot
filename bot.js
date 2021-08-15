const { Client, Collection, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");

const { registerCommands } = require("./register");

/* ------------ Setup ------------ */

require("dotenv").config();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(path.join(__dirname, "commands", file));
  client.commands.set(command.data.name, command);
}

/* ------------ Commands ------------ */

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  if (!client.commands.has(commandName)) return;

  try {
    await client.commands.get(commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
  }
});

/* ------------ Startup ------------ */

client.on("ready", () => {
  console.log("Successfully logged in");
});

(async () => {
  await registerCommands();
  return client.login(process.env.DISCORD_TOKEN);
})();
