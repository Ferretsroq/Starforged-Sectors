const {SlashCommandBuilder} = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, SelectMenuComponent, EmbedBuilder, ButtonStyle, Util } = require('discord.js');
const fs = require('fs');
const {RollOnOracle} = require('../oracle.js');


module.exports = 
{
	data: new SlashCommandBuilder()
	.setName('oracles')
	.setDescription('Show all oracles!'),
	oracles: [],
	currentOracles: [],
	index: 0,
	rows: [],
	async execute(interaction, oracles)
	{
		this.rows = [];
		this.oracles = oracles;
		this.currentOracles = oracles['Character Creation'];
		this.oracleKeys = Object.keys(oracles);
		this.currentOracle = this.GetOracleAsList(this.oracleKeys[0]);
		this.index = 0;

		let buttonRow0 = new ActionRowBuilder();
		let buttonRow1 = new ActionRowBuilder();
		let buttonRow2 = new ActionRowBuilder();
		let buttonRow3 = new ActionRowBuilder();
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`oraclesLeft`).setLabel(`\u2190`).setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`oraclesRight`).setLabel(`\u2192`).setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`oraclesRoll`).setLabel('Roll').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId('oraclesCharacterCreation').setLabel('Character Creation').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId('oraclesCharacters').setLabel('Characters').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId('oraclesCore').setLabel('Core').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId('oraclesCreatures').setLabel('Creatures').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId('oraclesDerelicts').setLabel('Derelicts').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('oraclesFactions').setLabel('Factions').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('oraclesLocationThemes').setLabel('Location Themes').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('oraclesMisc').setLabel('Misc').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('oraclesMoves').setLabel('Moves').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('oraclesPlanets').setLabel('Planets').setStyle(ButtonStyle.Primary));
		buttonRow3.addComponents(new ButtonBuilder().setCustomId('oraclesSettlements').setLabel('Settlements').setStyle(ButtonStyle.Primary));
		buttonRow3.addComponents(new ButtonBuilder().setCustomId('oraclesSpace').setLabel('Space').setStyle(ButtonStyle.Primary));
		buttonRow3.addComponents(new ButtonBuilder().setCustomId('oraclesStarships').setLabel('Starships').setStyle(ButtonStyle.Primary));
		buttonRow3.addComponents(new ButtonBuilder().setCustomId('oraclesVaults').setLabel('Vaults').setStyle(ButtonStyle.Primary));
		buttonRow3.addComponents(new ButtonBuilder().setCustomId('oraclesCustom').setLabel('Custom').setStyle(ButtonStyle.Primary));
		this.rows.push(buttonRow0);
		this.rows.push(buttonRow1);
		this.rows.push(buttonRow2);
		this.rows.push(buttonRow3);
		let embed = this.FormatOracle(this.currentOracle[0]);
		await interaction.reply({embeds: [embed], components: this.rows});
	},
	FormatOracle(oracleData)
	{
		const color = Util.resolveColor('0xababab');
		//const title = name;
		const description = oracleData;
		const embed = new EmbedBuilder().setColor(color).setDescription(description);
		return embed;
	},
	async MoveLeft(interaction)
	{
		this.index -= 1;
		if(this.index < 0)
		{
			this.index = this.currentOracle.length-1;
		}
		await interaction.update({embeds: [this.FormatOracle(this.currentOracle[this.index])], components: this.rows});
	},
	async MoveRight(interaction)
	{
		this.index += 1;
		if(this.index >= this.currentOracle.length)
		{
			this.index = 0;
		}
		await interaction.update({embeds: [this.FormatOracle(this.currentOracle[this.index])], components: this.rows});
	},
	async FilterOracles(interaction, filterID)
	{
		this.index = 0;
		this.currentOracle = this.GetOracleAsList(filterID);
		this.currentOracles = this.oracles[filterID];
		await interaction.update({embeds: [this.FormatOracle(this.currentOracle[this.index])], components: this.rows});
	},
	async ClearFilter(interaction)
	{
		this.index = 0;
		this.currentOracle = this.GetOracleAsList(this.oracleKeys[0]);
		this.currentOracles = this.oracles;
		await interaction.update({embeds: [this.FormatOracle(this.currentOracle[this.index])], components: this.rows});
	},
	GetOracleAsList(oracleKey)
	{
		let oracleAsList = [];
		for(oracle in this.oracles[oracleKey])
		{
			let oracleString = `**${oracleKey}**\n${oracle}\n\`\`\``;
			for(element in this.oracles[oracleKey][oracle])
			{
				if(this.oracles[oracleKey][oracle][element]['Ceiling'] != null)
				{
					oracleString += `\n${this.oracles[oracleKey][oracle][element]['Ceiling'].toString().padStart(3, ' ')}: ${this.oracles[oracleKey][oracle][element]['Result']}`;
				}
				else
				{
					oracleString += `\n---: ${this.oracles[oracleKey][oracle][element]['Result']}`;
				}
			}
			oracleString += '```';
			oracleAsList.push(oracleString);
		}
		return oracleAsList;
	},
	async RollOnCurrentOracle(interaction)
	{
		let key = Object.keys(this.currentOracles)[this.index];
		//let roll = Math.floor(Math.random()*100)+1;
		let [result, roll] = RollOnOracle(this.currentOracles[key]);
		await interaction.reply(`Rolling on table ${key}: ${roll}\n${result}`);
	},
}