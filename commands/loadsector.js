const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton, SelectMenuComponent, MessageEmbed, ButtonStyle, TextInputComponent, TextInputStyle, Modal, ModalActionRowComponent } = require('discord.js');
const fs = require('fs');
const {Sector, Planet} = require('../sector.js');


module.exports = 
{
	data: new SlashCommandBuilder()
	.setName('loadsector')
	.setDescription('Fetch a sector!')
	.addStringOption(option =>
		option.setName('name')
		.setRequired(true)
		.setDescription('Name of sector to fetch')),
	messages: {},
	//sector: null,
	//rows: [],
	async execute(interaction, oracles)
	{
		//this.rows = [];
		sectorData = fs.readFileSync(`./data/sectors/${interaction.guild.id}/${interaction.options.getString('name')}.json`);
		//this.sector = Sector.fromJSON(sectorData);
		let sector = Sector.fromJSON(sectorData);
		let rows = this.ShowOriginalSector(sector);
		//this.ShowSector();
		await interaction.reply({content: `${this.sector.name} Sector`, components: this.rows});
		let message = interaction.fetchReply();
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
		this.messages[id].rows = [];
		let buttonRow0 = new MessageActionRow();
		let buttonRow1 = new MessageActionRow();
		let buttonRow2 = new MessageActionRow();
		buttonRow0.addComponents(new MessageButton().setCustomId(`loadsectorAddPOI${row}${col}`).setLabel('Add POI').setStyle('PRIMARY'));
		buttonRow0.addComponents(new MessageButton().setCustomId(`loadsectorAddSettlement${row}${col}`).setLabel('Add Settlement').setStyle('PRIMARY'));
		buttonRow0.addComponents(new MessageButton().setCustomId(`loadsectorAddStellarObject${row}${col}`).setLabel('Add Stellar Object').setStyle('PRIMARY'));
		buttonRow0.addComponents(new MessageButton().setCustomId(`loadsectorAddPlanet${row}${col}`).setLabel('Add Planet').setStyle('PRIMARY'));
		buttonRow0.addComponents(new MessageButton().setCustomId(`loadsectorAddStarship${row}${col}`).setLabel('Add Starship').setStyle('PRIMARY'));
		buttonRow1.addComponents(new MessageButton().setCustomId(`loadsectorAddDerelict${row}${col}`).setLabel('Add Derelict').setStyle('PRIMARY'));
		buttonRow1.addComponents(new MessageButton().setCustomId(`loadsectorAddPrecursorVault${row}${col}`).setLabel('Add Precursor Vault').setStyle('PRIMARY'));
		buttonRow2.addComponents(new MessageButton().setCustomId('loadsectorShowSector').setLabel('Show Sector').setStyle('PRIMARY'));
		this.messages[id].rows.push(buttonRow0);
		this.messages[id].rows.push(buttonRow1);
		this.messages[id].rows.push(buttonRow2);
		await interaction.update({components: this.messages[id].rows, embeds: embeds, files: attachments});
		//await interaction.update({components: this.rows, embeds: this.sector.grid[row][col].toEmbed()})
	},
	ShowOriginalSector(sector)
	{
		let rows = [];
		for(let row = 0; row < sector.grid.length; row++)
		{
			let buttonRow = new MessageActionRow();
			for(let column = 0; column < sector.grid[row].length; column++)
			{
				buttonRow.addComponents(new MessageButton().setCustomId(`sector${row}${column}`).setLabel(`${sector.grid[row][column].toString()}`).setStyle('PRIMARY'));
			}
			rows.push(buttonRow);
		}
		return rows;
	},
	async ShowSector()
	{
		let id = interaction.message.id;
		this.rows = [];
		for(let row = 0; row < this.messages[id].sector.grid.length; row++)
		{
			let buttonRow = new MessageActionRow();
			for(let column = 0; column < this.messages[id].sector.grid[row].length; column++)
			{
				buttonRow.addComponents(new MessageButton().setCustomId(`loadsector${row}${column}`).setLabel(`${this.messages[id].sector.grid[row][column].toString()}`).setStyle('PRIMARY'));
			}
			this.messages[id].rows.push(buttonRow);
		}
	},
	async ShowSectorButtons(interaction)
	{
		let id = interaction.message.id;
		await this.ShowSector()
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddPOI(interaction)
	{
		let rowcol = interaction.customId.split('sectorAddPOI')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		const modal = new Modal().setTitle(`Add POI to cell (${row},${col})`).setCustomId(`loadsectorAddPOIModal${row}${col}`);
		const textInput = new TextInputComponent().setCustomId('sectorAddPOIText').setLabel(`Title`).setStyle('SHORT');
		const row0 = new MessageActionRow();
		row0.addComponents(textInput);
		modal.addComponents(row0);
		await interaction.showModal(modal);
	},
	async POIModalSubmit(interaction)
	{
		let id = interaction.message.id;
		const text = interaction.fields.getTextInputValue('sectorAddPOIText');
		let rowcol = interaction.customId.split('loadsectorAddPOIModal')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPOI(row, col, text);
		this.messages[id].sector.Save();
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddSettlement(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddSettlement')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddSettlement(row, col, oracles);
		this.messages[id].sector.Save()
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddStellarObject(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddStellarObject')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.sector.AddStellarObject(row, col, oracles);
		this.sector.Save()
		this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddPlanet(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddPlanet')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPlanet(row, col, oracles);
		this.messages[id].sector.Save()
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddStarship(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddStarship')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddStarship(row, col, oracles);
		this.messages[id].sector.Save()
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddDerelict(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddDerelict')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddDerelict(row, col, oracles);
		this.messages[id].sector.Save()
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
	async AddPrecursorVault(interaction, oracles)
	{
		let id = interaction.message.id;
		let rowcol = interaction.customId.split('loadsectorAddPrecursorVault')[1];
		let row = rowcol[0];
		let col = rowcol[1];
		this.messages[id].sector.AddPrecursorVault(row, col, oracles);
		this.messages[id].sector.Save()
		await this.ShowSector();
		await interaction.update({components: this.messages[id].rows, embeds: [], files: []});
	},
}