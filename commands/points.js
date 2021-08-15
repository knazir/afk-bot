const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
  .setName("points")
  .setDescription("Shows how many points you have")
  .addUserOption(option => option.setName("user").setDescription("The user you want to see points for"));

async function execute(interaction, { user, users }) {
  const targetUser = interaction.options.getUser("user");
  if (!targetUser) return interaction.reply(`You currently have **${user.points}** points.`);
  const targetUserDoc = (await users.findOneAndUpdate(
    { id: targetUser.id },
    { $set: { lastUsername: targetUser.username }, $setOnInsert: { id: targetUser.id, points: 0 } },
    { upsert: true },
  )).value;
  return interaction.reply(`**${targetUser.username}** currently has ${targetUserDoc.points} points.`);
}

module.exports = { data, execute };
