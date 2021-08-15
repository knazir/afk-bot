const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with pong")

async function execute(interaction) {
  return interaction.reply("Pong!");
}

module.exports = { data, execute };
