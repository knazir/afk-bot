const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');

/* ------------ Setup ------------ */

require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

const commands = [];
fs.readdirSync('./commands').filter((file) => file.endsWith('.js')).forEach((file) => {
	const command = require(path.join(__dirname, 'commands', file));
	commands.push(command.data.toJSON());
});

module.exports = {
	async registerDevCommands() {
		try {
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
				{ body: commands },
			);
			console.log('Successfully registered / commands.');
		}
		catch (error) {
			console.error(error);
		}
	},
};
