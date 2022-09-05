// Require the necessary discord.js classes
const {Client, Collection, GatewayIntentBits, InteractionType} = require('discord.js');
const {token} = require('./config.json');
const { clientId, guildIds } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.characters = {};
client.oracles = {};
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles)
{
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// Load character data
// Load oracle data
LoadOracles(client);

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Command listener
client.on('interactionCreate', async interaction =>
{
	if(interaction.type != InteractionType.ApplicationCommand) return;

	const command = client.commands.get(interaction.commandName);
	if(!command) return;
	try
	{
		if(interaction.commandName === 'loadchar')
		{
			await command.execute(interaction, client.characters);
		}
		else if(interaction.commandName === 'roll')
		{
			await command.execute(interaction, client.characters);
		}
		else if(interaction.commandName === 'char')
		{
			await command.execute(interaction, client.characters);
		}
		else if(interaction.commandName === 'oracle')
		{
			await command.execute(interaction, client.oracles);
		}
		else if(interaction.commandName === 'oracles')
		{
			await command.execute(interaction, client.oracles);
		}
		else if(interaction.commandName === 'sector')
		{
			await command.execute(interaction, client.oracles);
		}
		else if(interaction.commandName === 'planet')
		{
			await command.execute(interaction, client.oracles);
		}
		else if(interaction.commandName === 'addasset')
		{
			await command.execute(interaction, client.characters);
		}
		else if(interaction.commandName === 'newchar')
		{
			await command.execute(interaction, client.characters);
		}
		else
		{
			await command.execute(interaction);
		}
	}
	catch (error)
	{
		console.error(error);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
	}
});

// Button listener
client.on('interactionCreate', async interaction =>
{
	if(!interaction.isButton()) return;
	if(interaction.customId.startsWith('roll'))
	{
		await client.commands.get('roll').Roll(interaction, interaction.customId.split('roll')[1]);
	}
	else if(interaction.customId === 'trackMarkProgress')
	{
		await client.commands.get('loadtrack').MarkProgress(interaction);
	}
	else if(interaction.customId === 'trackFulfill')
	{
		await client.commands.get('loadtrack').Fulfill(interaction);
	}
	else if(interaction.customId === 'tracksMarkProgress')
	{
		await client.commands.get('tracks').MarkProgress(interaction);
	}
	else if(interaction.customId === 'tracksFulfill')
	{
		await client.commands.get('tracks').Fulfill(interaction);
	}
	else if(interaction.customId === 'tracksLeft')
	{
		await client.commands.get('tracks').MoveLeft(interaction);
	}
	else if(interaction.customId === 'tracksRight')
	{
		await client.commands.get('tracks').MoveRight(interaction);
	}
	else if(interaction.customId === 'movesLeft')
	{
		await client.commands.get('moves').MoveLeft(interaction);
	}
	else if(interaction.customId === 'movesRight')
	{
		await client.commands.get('moves').MoveRight(interaction);
	}
	else if(interaction.customId === 'movesAll')
	{
		await client.commands.get('moves').ClearFilter(interaction);
	}
	else if(interaction.customId.startsWith('moves'))
	{
		if(interaction.customId === 'movesSession')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Session Moves');
		}
		else if(interaction.customId === 'movesAdventure')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Adventure Moves');
		}
		else if(interaction.customId === 'movesConnection')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Connection Moves');
		}
		else if(interaction.customId === 'movesExploration')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Exploration Moves');
		}
		else if(interaction.customId === 'movesCombat')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Combat Moves');
		}
		else if(interaction.customId === 'movesSuffer')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Suffer Moves');
		}
		else if(interaction.customId === 'movesRecover')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Recover Moves');
		}
		else if(interaction.customId === 'movesThreshold')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Threshold Moves');
		}
		else if(interaction.customId === 'movesLegacy')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Legacy Moves');
		}
		else if(interaction.customId === 'movesFate')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Fate Moves');
		}
		else if(interaction.customId === 'movesQuest')
		{
			await client.commands.get('moves').FilterMoves(interaction, 'Quest Moves');
		}
	}
	else if(interaction.customId === 'oraclesLeft')
	{
		await client.commands.get('oracles').MoveLeft(interaction);
	}
	else if(interaction.customId === 'oraclesRight')
	{
		await client.commands.get('oracles').MoveRight(interaction);
	}
	else if(interaction.customId === 'oraclesAll')
	{
		await client.commands.get('oracles').ClearFilter(interaction);
	}
	else if(interaction.customId === 'oraclesRoll')
	{
		await client.commands.get('oracles').RollOnCurrentOracle(interaction);
	}
	else if(interaction.customId.startsWith('oracles'))
	{
		if(interaction.customId === 'oraclesCharacterCreation')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Character Creation');
		}
		else if(interaction.customId === 'oraclesCharacters')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Characters');
		}
		else if(interaction.customId === 'oraclesCore')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Core');
		}
		else if(interaction.customId === 'oraclesCreatures')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Creatures');
		}
		else if(interaction.customId === 'oraclesDerelicts')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Derelicts');
		}
		else if(interaction.customId === 'oraclesFactions')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Factions');
		}
		else if(interaction.customId === 'oraclesLocationThemes')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Location Themes');
		}
		else if(interaction.customId === 'oraclesMisc')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Misc');
		}
		else if(interaction.customId === 'oraclesMoves')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Moves');
		}
		else if(interaction.customId === 'oraclesPlanets')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Planets');
		}
		else if(interaction.customId === 'oraclesSettlements')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Settlements');
		}
		else if(interaction.customId === 'oraclesSpace')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Space');
		}
		else if(interaction.customId === 'oraclesStarships')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Starships');
		}
		else if(interaction.customId === 'oraclesVaults')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Vaults');
		}
		else if(interaction.customId === 'oraclesCustom')
		{
			await client.commands.get('oracles').FilterOracles(interaction, 'Custom');
		}
	}
	else if(['charMarkQuests', 'charMarkBond', 'charMarkDiscovery', 'charMarkBackground'].includes(interaction.customId))
	{
		await client.commands.get('char').MarkTrack(interaction, interaction.customId);
	}
	else if(['charAddMomentum', 'charMinusMomentum', 'charResetMomentum', 'charAddHealth', 'charMinusHealth', 'charAddSpirit', 'charMinusSpirit', 'charAddSupply', 'charMinusSupply'].includes(interaction.customId))
	{
		await client.commands.get('char').MoveTrack(interaction, interaction.customId);
	}
	else if(interaction.customId === 'charShowAssets')
	{
		await client.commands.get('char').ShowAssets(interaction);
	}
	else if(interaction.customId.startsWith('charAsset'))
	{
		await client.commands.get('char').ShowAnAsset(interaction, interaction.customId);
	}
	else if(interaction.customId == 'charShowStats')
	{
		await client.commands.get('char').ShowStats(interaction);
	}
	else if(interaction.customId == 'charLevelAsset')
	{
		await client.commands.get('char').LevelAnAsset(interaction);
	}
	else if(interaction.customId.startsWith('sector') && interaction.customId.length == 8)
	{
		await client.commands.get('sector').ShowCell(interaction);
	}
	else if(interaction.customId.startsWith('sectorAddPOI'))
	{
		await client.commands.get('sector').AddPOI(interaction);
	}
	else if(interaction.customId.startsWith('sectorAddSettlement'))
	{
		await client.commands.get('sector').AddSettlement(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('sectorAddPlanet'))
	{
		await client.commands.get('sector').AddPlanet(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('sectorAddStarship'))
	{
		await client.commands.get('sector').AddStarship(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('sectorAddDerelict'))
	{
		await client.commands.get('sector').AddDerelict(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('sectorAddPrecursorVault'))
	{
		await client.commands.get('sector').AddPrecursorVault(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('sectorAddStellarObject'))
	{
		await client.commands.get('sector').AddStellarObject(interaction, client.oracles);
	}
	else if(interaction.customId === 'sectorShowSector')
	{
		await client.commands.get('sector').ShowSectorButtons(interaction);
	}
	else if(interaction.customId.startsWith('loadsector') && interaction.customId.length == 12)
	{
		await client.commands.get('loadsector').ShowCell(interaction);
	}
	else if(interaction.customId.startsWith('loadsectorAddPOI'))
	{
		await client.commands.get('loadsector').AddPOI(interaction);
	}
		else if(interaction.customId.startsWith('loadsectorAddSettlement'))
	{
		await client.commands.get('loadsector').AddSettlement(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('loadsectorAddPlanet'))
	{
		await client.commands.get('loadsector').AddPlanet(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('loadsectorAddStarship'))
	{
		await client.commands.get('loadsector').AddStarship(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('loadsectorAddDerelict'))
	{
		await client.commands.get('loadsector').AddDerelict(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('loadsectorAddPrecursorVault'))
	{
		await client.commands.get('loadsector').AddPrecursorVault(interaction, client.oracles);
	}
	else if(interaction.customId.startsWith('loadsectorAddStellarObject'))
	{
		await client.commands.get('loadsector').AddStellarObject(interaction, client.oracles);
	}
	else if(interaction.customId === 'loadsectorShowSector')
	{
		await client.commands.get('loadsector').ShowSectorButtons(interaction);
	}
	else if(interaction.customId === 'assetsLeft')
	{
		await client.commands.get('assets').MoveLeft(interaction);
	}
	else if(interaction.customId === 'assetsRight')
	{
		await client.commands.get('assets').MoveRight(interaction);
	}

});

// Modal submit listener
client.on('interactionCreate', async interaction =>
{
	if(interaction.type != InteractionType.ModalSubmit) return;
	if(interaction.customId == 'modalFoo')
	{
		await client.commands.get('testmodal').Submit(interaction);
	}
	else if(interaction.customId.startsWith('sectorAddPOIModal'))
	{
		await client.commands.get('sector').POIModalSubmit(interaction);
	}
	else if(interaction.customId.startsWith('loadsectorAddPOIModal'))
	{
		await client.commands.get('loadsector').POIModalSubmit(interaction);
	}
});



//Login to Discord with your client's token
client.login(token);


function LoadCharacters(client)
{
	for(const file of fs.readdirSync('./data/characters').filter(file => file.endsWith('.json')))
	{
		let char = Character.FromJSON(fs.readFileSync(`./data/characters/${file}`))
		client.characters[char.playerID] = char;
	}
}

function LoadOracles(client)
{
	// Dataforged Oracles
	let file = fs.readFileSync('./data/dataforged/src/starforged/oracles.json');
	let oracleData = JSON.parse(file);
	let myOracles = {};
	for(oracleType in oracleData)
	{
		if(!(oracleData[oracleType].Name in myOracles))
		{
			myOracles[oracleData[oracleType].Name] = {};
		}
		for(oracle in oracleData[oracleType].Oracles)
		{
			if('Table' in oracleData[oracleType].Oracles[oracle])
			{
				myOracles[oracleData[oracleType].Name][oracleData[oracleType].Oracles[oracle]['$id'].substr(10)] = oracleData[oracleType].Oracles[oracle].Table;
			}
			else if('Tables' in oracleData[oracleType].Oracles[oracle])
			{
				for(table in oracleData[oracleType].Oracles[oracle].Tables)
				{
					if('Display name' in oracleData[oracleType].Oracles[oracle].Tables[table])
					{
						myOracles[oracleData[oracleType].Name][oracleData[oracleType].Oracles[oracle].Tables[table]['$id'].substr(10)] = oracleData[oracleType].Oracles[oracle].Tables[table].Table;
					}
					else
					{
						myOracles[oracleData[oracleType].Name][oracleData[oracleType].Oracles[oracle].Tables[table]['$id'].substr(10)] = oracleData[oracleType].Oracles[oracle].Tables[table].Table;
					}
				}
			}
			else if('Oracles' in oracleData[oracleType].Oracles[oracle])
			{
				for(let nestedOracle in oracleData[oracleType].Oracles[oracle]['Oracles'])
				{
					myOracles[oracleData[oracleType].Name][oracleData[oracleType].Oracles[oracle].Oracles[nestedOracle]['$id'].substr(10)] = oracleData[oracleType].Oracles[oracle].Oracles[nestedOracle].Table;
				}
			}
		}
		for(category in oracleData[oracleType].Categories)
		{
			for(oracle in oracleData[oracleType].Categories[category].Oracles)
			{
				if('Table' in oracleData[oracleType].Categories[category].Oracles[oracle])
				{
					myOracles[oracleData[oracleType].Name][oracleData[oracleType].Categories[category].Oracles[oracle]['$id'].substr(10)] = oracleData[oracleType].Categories[category].Oracles[oracle].Table;
				}
			}
		}
	}
	// Custom Oracles
	const oracleFiles = fs.readdirSync('./data/customoracles').filter(file => file.endsWith('.json'));
	myOracles['Custom'] = {};
	for (const file of oracleFiles)
	{
		let myFile = fs.readFileSync(`./data/customoracles/${file}`);
		let fileData = JSON.parse(myFile);
		for(oracleType in fileData)
		{
			myOracles['Custom'][fileData[oracleType]['$id']] = fileData[oracleType]['Table'];
		}
	}
	client.oracles = myOracles;
}