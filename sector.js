fs = require('fs')
const {MessageEmbed, Util } = require('discord.js');
const {RollOnOracle} = require('./oracle.js');

class Sector
{
	constructor(name='New Sector')
	{
		this.name = name;
		let row0 = [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()];
		let row1 = [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()];
		let row2 = [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()];
		let row3 = [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()];
		let row4 = [new Cell(), new Cell(), new Cell(), new Cell(), new Cell()];
		this.grid = [row0, row1, row2, row3, row4];
		this.id = 0;
	}
	static GenerateSector(oracles, region, id)
	{
		if(!fs.existsSync(`./Data/sectors/${id}`))
		{
			fs.mkdirSync(`./Data/sectors/${id}`);
		}
		const sectorFiles = fs.readdirSync(`./data/sectors/${id}/`).filter(file => file.endsWith('.json'));
		let namePrefix = RollOnOracle(oracles['Space']['/Oracles/Space/Sector_Name/Prefix'])[0];
		let nameSuffix = RollOnOracle(oracles['Space']['/Oracles/Space/Sector_Name/Suffix'])[0];
		let name = `${namePrefix} ${nameSuffix}`;
		while(sectorFiles.includes(name+'.json'))
		{
			namePrefix = RollOnOracle(oracles['Space']['/Oracles/Space/Sector_Name/Prefix'])[0];
			nameSuffix = RollOnOracle(oracles['Space']['/Oracles/Space/Sector_Name/Suffix'])[0];
			name = `${namePrefix} ${nameSuffix}`;
		}
		let sector = new Sector(name);
		sector.id = id;
		let numSettlements = 0;
		if(region == 'terminus')
		{
			numSettlements = 4;
		}
		else if(region == 'outlands')
		{
			numSettlements = 3;
		}
		else if(region == 'expanse')
		{
			numSettlements = 2;
		}
		else if(region == 'void')
		{
			numSettlements = 0;
		}
		else
		{
			numSettlements = 3;
		}
		for(let num = 0; num < numSettlements; num++)
		{
			let row = Math.floor(Math.random()*5);
			let column = Math.floor(Math.random()*5);
			let settlement = Settlement.GenerateSettlement(oracles);
			sector.grid[row][column].contents.push(settlement);
		}
		sector.Save();
		return sector;
	}
	Save()
	{
		if(!fs.existsSync(`./Data/sectors/${this.id}`))
		{
			fs.mkdirSync(`./Data/sectors/${this.id}`);
		}
		fs.writeFileSync(`./Data/sectors/${this.id}/${this.name}.json`, JSON.stringify(this, null, 2), 'utf8');
	}
	static fromJSON(jsonData)
	{
		let myObj = JSON.parse(jsonData);
		let sector = new Sector();
		sector.name = myObj.name;
		for(let row = 0; row < myObj.grid.length; row++)
		{
			for(let cell = 0; cell < myObj.grid[row].length; cell++)
			{
				sector.grid[row][cell] = Cell.fromJSON(myObj.grid[row][cell]);
			}
		}
		return sector;
	}
	AddPOI(row, col, title)
	{
		this.grid[row][col].contents.push(new POI(title, 'POI'));
	}
	AddSettlement(row, col, oracles)
	{
		this.grid[row][col].contents.push(Settlement.GenerateSettlement(oracles));
	}
	AddPlanet(row, col, oracles)
	{
		this.grid[row][col].contents.push(Planet.GeneratePlanet(oracles));
	}
	AddStellarObject(row, col, oracles)
	{
		this.grid[row][col].contents.push(StellarObject.GenerateStellarObject(oracles));
	}
	AddStarship(row, col, oracles)
	{
		this.grid[row][col].contents.push(Starship.GenerateStarship(oracles));
	}
	AddDerelict(row, col, oracles)
	{
		this.grid[row][col].contents.push(Derelict.GenerateDerelict(oracles));
	}
	AddPrecursorVault(row, col, oracles)
	{
		this.grid[row][col].contents.push(PrecursorVault.GeneratePrecursorVault(oracles));
	}
}

class Cell
{
	constructor()
	{
		this.contents = [];
	}
	toString()
	{
		if(this.contents.length > 0)
		{
			let titles = [];
			for(let content = 0; content < this.contents.length; content++)
			{
				titles.push(this.contents[content].title);
			}
			return titles.join(', ');
		}
		return ' ';
	}
	toEmbed()
	{
		let embeds = [];
		let attachments = [];
		for(let index = 0; index < this.contents.length; index++)
		{
			if(this.contents[index].description != 'Planet')
			{
				embeds.push(this.contents[index].toEmbed());
			}
			if(this.contents[index].description == 'Settlement')
			{
				if(this.contents[index].planet != null)
				{
					let [embed, attachment] = this.contents[index].planet.toEmbed();
					//embeds.push(this.contents[index].planet.toEmbed());
					embeds.push(embed)
					attachments.push(attachment);
				}
				for(let npc in this.contents[index].NPCs)
				{
					embeds.push(this.contents[index].NPCs[npc].toEmbed());
				}
			}
			if(this.contents[index].description == 'Derelict' || this.contents[index].description == 'Precursor Vault')
			{
				if(this.contents[index].planet != null)
				{
					let [embed, attachment] = this.contents[index].planet.toEmbed();
					embeds.push(embed);
					attachments.push(attachment);
				}
			}
			if(this.contents[index].description == 'Planet')
			{
				let [embed, attachment] = this.contents[index].toEmbed();
				embeds.push(embed)
				attachments.push(attachment);
			}
		}
		return [embeds, attachments];
	}
	static fromJSON(jsonData)
	{
		let cell = new Cell()
		for(let content = 0; content < jsonData.contents.length; content++)
		{
			if(jsonData.contents[content].description == 'Settlement')
			{
				cell.contents.push(Settlement.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'POI')
			{
				cell.contents.push(POI.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'Planet')
			{
				cell.contents.push(Planet.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'Stellar Object')
			{
				cell.contents.push(StellarObject.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'Starship')
			{
				cell.contents.push(Starship.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'Derelict')
			{
				cell.contents.push(Derelict.fromJSON(jsonData.contents[content]));
			}
			else if(jsonData.contents[content].description == 'PrecursorVault')
			{
				cell.contents.push(PrecursorVault.fromJSON(jsonData.contents[content]));
			}
		}
		return cell;
	}

}

class POI
{
	constructor(title, description)
	{
		this.title = title;
		this.description = description;
	}
	toEmbed()
	{
		const color = Util.resolveColor('0xababab');
		const title = this.title;
		const description = this.description;
		const embed = new MessageEmbed().setColor(color).setTitle(title).setDescription(description);
		return embed;
	}
	static fromJSON(jsonData)
	{
		return new POI(jsonData.title, jsonData.description);
	}
}

class Settlement
{
	constructor(title, description, location, project0, project1, trouble)
	{
		this.title = title;
		this.description = description;
		this.location = location;
		this.project0 = project0;
		this.project1 = project1;
		this.trouble = trouble;
		this.planet = null;
		this.NPCs = [];
	}
	static GenerateSettlement(oracles)
	{
		let nameOracle = oracles['Settlements']['Oracles/Settlements/Name'];
		let locationOracle = oracles['Settlements']['Oracles/Settlements/Location'];
		let projectsOracle = oracles['Settlements']['Oracles/Settlements/Projects'];
		let troubleOracle = oracles['Settlements']['Oracles/Settlements/Trouble'];
		let name = RollOnOracle(nameOracle)[0];
		let location = RollOnOracle(locationOracle)[0];
		let project0 = RollOnOracle(projectsOracle)[0];
		let project1 = RollOnOracle(projectsOracle)[0];
		let trouble = RollOnOracle(troubleOracle)[0];
		let settlement = new Settlement(name, 'Settlement', location, project0, project1, trouble);
		if(location == 'Planetside' || location == 'Orbital')
		{
			settlement.planet = Planet.GeneratePlanet(oracles);
		}
		settlement.NPCs.push(NPC.GenerateNPC(oracles));
		settlement.NPCs.push(NPC.GenerateNPC(oracles));
		settlement.NPCs.push(NPC.GenerateNPC(oracles));
		return settlement;
	}
	toEmbed()
	{
		return new MessageEmbed().setColor(Util.resolveColor('0xababab')).setTitle(this.title).setDescription(this.description).addFields({name: 'Location', value: this.location}, {name: 'Projects', value: `${this.project0}\n${this.project1}`}, {name: 'Trouble', value: this.trouble});
	}
	static fromJSON(jsonData)
	{
		let settlement = new Settlement(jsonData.title, jsonData.description, jsonData.location, jsonData.project0, jsonData.project1, jsonData.trouble);
		if(jsonData.planet != null)
		{
			settlement.planet  = Planet.fromJSON(jsonData.planet);
		}
		for(let npc = 0; npc < jsonData.NPCs.length; npc++)
		{
			settlement.NPCs.push(NPC.fromJSON(jsonData.NPCs[npc]));
		}
		return settlement;
	}
}

class Planet
{
	constructor(planetClass, atmosphere, space, feature, life, peril, opportunity)
	{
		this.planetClass = planetClass;
		this.atmosphere = atmosphere;
		this.space = space;
		this.feature = feature;
		this.life = life;
		this.peril = peril;
		this.opportunity = opportunity;
		this.description = 'Planet';
		this.title = `${planetClass} Planet`;
	}
	static GeneratePlanet(oracles)
	{
		let classOracle = oracles['Planets']['Oracles/Planets/Class'];
		let planetClass = RollOnOracle(`/Oracles/${classOracle[0].substr(1).split(' ')[0]}`);
		let atmosphereOracle = oracles['Planets'][`Oracles/Planets/${planetClass}/Atmosphere`];
		let atmosphere = RollOnOracle(atmosphereOracle)[0];
		let observedFromSpace = RollOnOracle(oracles['Planets'][`Oracles/Planets/${planetClass}/Observed_From_Space`])[0];
		let feature = RollOnOracle(oracles['Planets'][`Oracles/Planets/${planetClass}/Feature`])[0];
		let lifeStatus = RollOnOracle(oracles['Planets'][`Oracles/Planets/${planetClass}/Life`])[0];
		let lifebearing = true;
		if(lifeStatus == 'None' || lifeStatus == 'Extinct')
		{
			lifebearing = false;
		}
		let peril = null;
		let opportunity = null;
		if(lifebearing)
		{
			peril = RollOnOracle(oracles['Planets']['Oracles/Planets/Peril/Lifebearing'])[0];
			opportunity = RollOnOracle(oracles['Planets']['Oracles/Planets/Opportunity/Lifebearing'])[0];
		}
		else
		{
			peril = RollOnOracle(oracles['Planets']['Oracles/Planets/Peril/Lifeless'])[0];
			opportunity = RollOnOracle(oracles['Planets']['Oracles/Planets/Opportunity/Lifeless'])[0];
		}
		return new Planet(planetClass, atmosphere, observedFromSpace, feature, lifeStatus, peril, opportunity);
	}
	toEmbed()
	{
		let color = '0xababab';
		let imnumber = Math.floor(Math.random()*2)+1;
		let imname = `./data/images/Starforged-Planet-Token-${this.planetClass}-0${imnumber}.png`;
		if(this.planetClass == 'Desert')
		{
			color = '0xebc934';
		}
		else if(this.planetClass == 'Furnace')
		{
			color = '0x944009';
		}
		else if(this.planetClass == 'Grave')
		{
			color = '0x47403b';
		}
		else if(this.planetClass == 'Ice')
		{
			color = '0x00e1ff'
		}
		else if(this.planetClass == 'Jovian')
		{
			color = '0x784000'
		}
		else if(this.planetClass == 'Jungle')
		{
			color = '0x007038';
		}
		else if(this.planetClass == 'Ocean')
		{
			color = '0x003780';
		}
		else if(this.planetClass == 'Rocky')
		{
			color = '0x361a00';
		}
		else if(this.planetClass == 'Shattered')
		{
			color = '0x3d342c';
		}
		else if(this.planetClass == 'Tainted')
		{
			color = '0x800079';
		}
		else if(this.planetClass == 'Vital')
		{
			color = '0x00b85c';
		}
		let title = `${this.planetClass} Planet`;
		let embed = new MessageEmbed().setThumbnail(`attachment://Starforged-Planet-Token-${this.planetClass}-0${imnumber}.png`).setTitle(title).setColor(Util.resolveColor(color)).addFields({name: 'Atmosphere', value: this.atmosphere}, {name: 'Observed From Space', value: this.space}, {name: 'Feature', value: this.feature}, {name: 'Life', value: this.life}, {name: 'Peril', value: this.peril}, {name: 'Opportunity', value: this.opportunity});
		return [embed, imname];
	}
	static fromJSON(jsonData)
	{
		return new Planet(jsonData.planetClass, jsonData.atmosphere, jsonData.space, jsonData.feature, jsonData.life, jsonData.peril, jsonData.opportunity);
	}
}

class NPC
{
	constructor(name, firstLook, disposition, role, goal)
	{
		this.name = name;
		this.firstLook = firstLook;
		this.disposition = disposition;
		this.role = role;
		this.goal = goal;
		this.aspects = [];
	}
	static GenerateNPC(oracles)
	{
		let name = `${RollOnOracle(oracles['Characters']['Oracles/Characters/Name/Given_Name'])[0]} ${RollOnOracle(oracles['Characters']['Characters / Name / Family Name'])[0]}`;
		let firstLook = RollOnOracle(oracles['Characters']['Oracles/Characters/First_Look'])[0];
		let disposition = RollOnOracle(oracles['Characters']['Oracles/Characters/Disposition'])[0];
		let role = RollOnOracle(oracles['Characters']['Oracles/Characters/Role'])[0];
		let goal = RollOnOracle(oracles['Characters']['Oracles/Characters/Goal'])[0];
		return new NPC(name, firstLook, disposition, role, goal);
	}
	toEmbed()
	{
		let embed = new MessageEmbed().setColor(Util.resolveColor('0xbababa')).setTitle('NPC').setDescription(this.name).addFields({name: 'First Look', value: this.firstLook}, {name: 'Disposition', value: this.disposition}, {name: 'Role', value: this.role}, {name: 'Goal', value: this.goal});
		for(aspect in this.aspects)
		{
			embed.addFields({name: 'Aspect', value: this.aspects[aspect], inline: true});
		}
		return embed;
	}
	static fromJSON(jsonData)
	{
		return new NPC(jsonData.name, jsonData.firstLook, jsonData.disposition, jsonData.role, jsonData.goal);
	}
}

class StellarObject
{
	constructor(star)
	{
		this.title = 'Stellar Object';
		this.name = star;
		this.description = 'Stellar Object';
		this.color = '0x000000';
	}
	static GenerateStellarObject(oracles)
	{
		return new StellarObject(RollOnOracle(oracles['Space']['Oracles/Space/Stellar_Object'])[0]);
	}
	toEmbed()
	{
		let embed = new MessageEmbed().setColor(Util.resolveColor(this.color)).setTitle('Stellar Object').setDescription(this.name);
		return embed;
	}
	static fromJSON(jsonData)
	{
		return new StellarObject(jsonData.name);
	}
}

class Starship
{
	constructor(name, starshipType, fleet, initialContact, firstLook)
	{
		this.title = name;
		this.name = name;
		this.type = starshipType;
		this.fleet = fleet;
		this.contact = initialContact;
		this.look = firstLook;
		this.description = 'Starship';
		this.color = '0x3458eb';
	}
	static GenerateStarship(oracles)
	{
		let name = RollOnOracle(oracles['Starships']['Oracles/Starships/Name'])[0];
		let starshipType = RollOnOracle(oracles['Starships']['Oracles/Starships/Type'])[0];
		let fleet = RollOnOracle(oracles['Starships']['Oracles/Starships/Fleet'])[0];
		let initialContact = RollOnOracle(oracles['Starships']['Oracles/Starships/Initial_Contact'])[0];
		let firstLook = RollOnOracle(oracles['Starships']['Oracles/Starships/First_Look'])[0];
		return new Starship(name, starshipType, fleet, initialContact, firstLook);

	}
	toEmbed()
	{
		let embed = new MessageEmbed().setColor(Util.resolveColor(this.color)).setTitle(this.name).setDescription(this.description);
		embed.addFields({name: 'Type', value: this.type});
		embed.addFields({name: 'Fleet', value: this.fleet});
		embed.addFields({name: 'Initial Contact', value: this.contact});
		embed.addFields({name: 'First Look', value: this.look});
		return embed;
	}
	static fromJSON(jsonData)
	{
		return new Starship(jsonData.name, jsonData.type, jsonData.fleet, jsonData.contact, jsonData.look);
	}
}

class Derelict
{
	constructor(location, type, condition, firstLook, planet)
	{
		this.title = 'Derelict';
		this.location = location;
		this.type = type;
		this.condition = condition;
		this.firstLook = firstLook;
		this.planet = planet;
		this.color = '0x4d0000'
		this.description = 'Derelict';
	}
	static GenerateDerelict(oracles)
	{
		let location = RollOnOracle(oracles['Derelicts']['Oracles/Derelicts/Location'])[0];
		let type = RollOnOracle(oracles['Derelicts'][`Oracles/Derelicts/Type/${location}`])[0];
		let condition = RollOnOracle(oracles['Derelicts']['Oracles/Derelicts/Condition'])[0];
		let outerFirstLook = RollOnOracle(oracles['Derelicts']['Oracles/Derelicts/Outer_First_Look'])[0];
		let planet = null;
		if(location === 'Planetside' || location === 'Orbital')
		{
			planet = Planet.GeneratePlanet(oracles);
		}
		return new Derelict(location, type, condition, outerFirstLook, planet);
	}
	toEmbed()
	{
		let embed = new MessageEmbed().setColor(Util.resolveColor(this.color)).setTitle(`${this.location} Derelict`).setDescription(this.description);
		embed.addFields({name: 'Type', value: this.type});
		embed.addFields({name: 'Condition', value: this.condition});
		embed.addFields({name: 'Outer First Look', value: this.firstLook});
		return embed;
	}
	static fromJSON(jsonData)
	{
		if(jsonData.planet != null)
		{
			return new Derelict(jsonData.location, jsonData.type, jsonData.condition, jsonData.firstLook, Planet.fromJSON(jsonData.planet));
		}
		else
		{
			return new Derelict(jsonData.location, jsonData.type, jsonData.condition, jsonData.firstLook, null);
		}
	}
}

class PrecursorVault
{
	constructor(location, scale, form, shape, material, firstLook, planet)
	{
		this.title = 'Vault';
		this.location = location;
		this.scale = scale;
		this.form = form;
		this.shape = shape;
		this.material = material;
		this.firstLook = firstLook;
		this.planet = planet;
		this.description = 'Precursor Vault';
		this.color = '0x38734d'
	}
	static GeneratePrecursorVault(oracles)
	{
		let location = RollOnOracle(oracles['Vaults']['Oracles/Vaults/Location'])[0];
		let scale = RollOnOracle(oracles['Vaults'][`Oracles/Vaults/Scale`])[0];
		let form = RollOnOracle(oracles['Vaults']['Oracles/Vaults/Form'])[0];
		let shape = RollOnOracle(oracles['Vaults']['Oracles/Vaults/Shape'])[0];
		let material = RollOnOracle(oracles['Vaults']['Oracles/Vaults/Material'])[0];
		let firstLook = RollOnOracle(oracles['Vaults']['Oracles/Vaults/Outer_First_Look'])[0];
		let planet = null;
		if(location === 'Planetside' || location === 'Orbital')
		{
			planet = Planet.GeneratePlanet(oracles);
		}
		return new PrecursorVault(location, scale, form, shape, material, firstLook, planet);
	}
	toEmbed()
	{
		let embed = new MessageEmbed().setColor(Util.resolveColor(this.color)).setTitle(`${this.location} Precursor Vault`).setDescription(this.description);
		embed.addFields({name: 'Scale', value: this.scale});
		embed.addFields({name: 'Form', value: this.form});
		embed.addFields({name: 'Shape', value: this.shape});
		embed.addFields({name: 'Material', value: this.material});
		embed.addFields({name: 'Outer First Look', value: this.firstLook});
		return embed;
	}
	static fromJSON(jsonData)
	{
		if(jsonData.planet != null)
		{
			return new PrecursorVault(jsonData.location, jsonData.scale, jsonData.form, jsonData.shape, jsonData.material, jsonData.firstLook, Planet.fromJSON(jsonData.planet));
		}
		else
		{
			return new PrecursorVault(jsonData.location, jsonData.scale, jsonData.form, jsonData.shape, jsonData.material, jsonData.firstLook, null);
		}
	}
}

module.exports = {Sector, Planet};