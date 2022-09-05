const {SlashCommandBuilder} = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, SelectMenuComponent, EmbedBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder, ModalActionRowComponent} = require('discord.js');
const fs = require('fs');
const {Sector} = require('../sector.js');


module.exports = 
{
	data: new SlashCommandBuilder()
	.setName('sector')
	.setDescription('Generate a sector!')
	.addStringOption(option =>
		option.setName('region')
		.setRequired(true)
		.setDescription('Name of region of the sector (terminus/outlands/expanse/void)')),
	messages: {},
	//rows: [],
	//sector: null,

	async execute(interaction, oracles)
	{
		
		sector = Sector.GenerateSector(oracles, interaction.options.getString('region').toLowerCase(), interaction.guild.id);
		//this.rows = [];
		//this.sector = Sector.GenerateSector(oracles, interaction.options.getString('region').toLowerCase());
		let rows = this.ShowOriginalSector(sector);
		await interaction.reply({content: `${sector.name} Sector`, components: rows});
		//await interaction.reply({content: `${this.sector.name} Sector`, components: this.rows});
		let message = await interaction.fetchReply();
		let id = message.id;

		this.messages[id] = {rows: rows, sector: sector};

	},
	async ShowCell(interaction)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sector')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		let [embeds, attachments] = this.messages[id].sector.grid[row][col].toEmbed();
		//let [embeds, attachments] = this.sector.grid[row][col].toEmbed();
		this.messages[id].rows = [];
		//this.rows = [];
		let buttonRow0 = new ActionRowBuilder();
		let buttonRow1 = new ActionRowBuilder();
		let buttonRow2 = new ActionRowBuilder();
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`sectorAddPOI${row}${col}`).setLabel('Add POI').setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`sectorAddSettlement${row}${col}`).setLabel('Add Settlement').setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`sectorAddStellarObject${row}${col}`).setLabel('Add Stellar Object').setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`sectorAddPlanet${row}${col}`).setLabel('Add Planet').setStyle(ButtonStyle.Primary));
		buttonRow0.addComponents(new ButtonBuilder().setCustomId(`sectorAddStarship${row}${col}`).setLabel('Add Starship').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId(`sectorAddDerelict${row}${col}`).setLabel('Add Derelict').setStyle(ButtonStyle.Primary));
		buttonRow1.addComponents(new ButtonBuilder().setCustomId(`sectorAddPrecursorVault${row}${col}`).setLabel('Add Precursor Vault').setStyle(ButtonStyle.Primary));
		buttonRow2.addComponents(new ButtonBuilder().setCustomId('sectorShowSector').setLabel('Show Sector').setStyle(ButtonStyle.Primary));
		this.messages[id].rows.push(buttonRow0);
		this.messages[id].rows.push(buttonRow1);
		this.messages[id].rows.push(buttonRow2);
		//this.rows.push(buttonRow0);
		//this.rows.push(buttonRow1);
		//this.rows.push(buttonRow2);
		await interaction.update({components: this.messages[id].rows, embeds: embeds, files: attachments});
		//await interaction.update({components: this.rows, embeds: embeds, files: attachments});
		//await interaction.update({components: this.rows, embeds: this.sector.grid[row][col].toEmbed()})
	},
	ShowOriginalSector(sector)
	{
		let rows = [];
		for(let row = 0; row < sector.grid.length; row++)
		{
			let buttonRow = new ActionRowBuilder();
			for(let column = 0; column < sector.grid[row].length; column++)
			{
				buttonRow.addComponents(new ButtonBuilder().setCustomId(`sector${row}${column}`).setLabel(`${sector.grid[row][column].toString()}`).setStyle(ButtonStyle.Primary));
			}
			rows.push(buttonRow);
		}
		return rows;
	},
	async ShowSector(interaction)
	{
		let id = interaction.message.id;
		this.messages[id].rows = [];
		//this.rows = [];
		for(let row = 0; row < this.messages[id].sector.grid.length; row++)
		{
			let buttonRow = new ActionRowBuilder();
			for(let column = 0; column < this.messages[id].sector.grid[row].length; column++)
			{
				buttonRow.addComponents(new ButtonBuilder().setCustomId(`sector${row}${column}`).setLabel(`${this.messages[id].sector.grid[row][column].toString()}`).setStyle(ButtonStyle.Primary));
			}
			this.messages[id].rows.push(buttonRow);
			//this.rows.push(buttonRow);
		}
	},
	async ShowSectorButtons(interaction)
	{
		let id = interaction.message.id;
		await this.ShowSector(interaction)
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddPOI(interaction)
	{
		let rowcol = interaction.customId.split('sectorAddPOI')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		const modal = new ModalBuilder().setTitle(`Add POI to cell (${row},${col})`).setCustomId(`sectorAddPOIModal${row}${col}`);
		const textInput = new TextInputBuilder().setCustomId('sectorAddPOIText').setLabel(`Title`).setStyle(TextInputStyle.Short);
		const row0 = new ActionRowBuilder();
		row0.addComponents(textInput);
		modal.addComponents(row0);
		await interaction.showModal(modal);
	},
	async POIModalSubmit(interaction)
	{
		let id = interaction.message.id;
		const text = interaction.fields.getTextInputValue('sectorAddPOIText');
		let rowcol = interaction.customId.split('sectorAddPOIModal')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPOI(row, col, text);
		this.messages[id].sector.Save();
		//this.sector.AddPOI(row, col, text);
		//this.sector.Save();
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddSettlement(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddSettlement')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddSettlement(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddSettlement(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddStellarObject(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddStellarObject')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddStellarObject(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddStellarObject(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddPlanet(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddPlanet')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPlanet(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddPlanet(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddStarship(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddStarship')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddStarship(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddStarship(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddDerelict(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddDerelict')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddDerelict(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddDerelict(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},
	async AddPrecursorVault(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('sectorAddPrecursorVault')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPrecursorVault(row, col, oracles);
		this.messages[id].sector.Save();
		//this.sector.AddPrecursorVault(row, col, oracles);
		//this.sector.Save()
		await this.ShowSector(interaction);
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
		//await interaction.update({components: this.rows, embeds: [], files: []});
	},

}