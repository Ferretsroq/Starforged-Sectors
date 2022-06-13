const {SlashCommandBuilder} = require('@discordjs/builders');
const { ActionRow, ButtonComponent, SelectMenuComponent } = require('discord.js');
const fs = require('fs');
const {RollOnOracle} = require('../oracle.js');


module.exports = 
{
	data: new SlashCommandBuilder()
	.setName('oracle')
	.setDescription('Roll on an oracle!')
	.addStringOption(option =>
		option.setName('type')
		.setDescription('The oracle\'s type')
		.setRequired(true))
	.addStringOption(option =>
		option.setName('name')
		.setDescription('The oracle\'s name')
		.setRequired(true)),
	async execute(interaction, oracles)
	{
		let name = interaction.options.getString('name');
		let type = interaction.options.getString('type');
		let oracle = oracles[type][name];
		let roll = Math.floor(Math.random()*100)+1;
		//let valid = oracle.filter((element) => element.Chance <= roll);
		//let result = valid[valid.length-1]['Description'];
		let result = RollOnOracle(oracle, roll)[0];
		await interaction.reply(`Roll: ${roll}\n${result}`);
	},
}