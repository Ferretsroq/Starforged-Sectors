const {SlashCommandBuilder} = require('@discordjs/builders');
const { ActionRow, ButtonComponent, SelectMenuComponent, Embed, Util } = require('discord.js');
const fs = require('fs');
const {Planet} = require('../sector.js');


module.exports = 
{
	data: new SlashCommandBuilder()
	.setName('planet')
	.setDescription('Generate a planet!'),
	async execute(interaction, oracles)
	{
		let planet = Planet.GeneratePlanet(oracles);
		let [embed, imname] = planet.toEmbed();
		await interaction.reply({embeds: [embed], files: [imname]});
		//await interaction.reply({embeds: [planet.toEmbed()]});
	},
}