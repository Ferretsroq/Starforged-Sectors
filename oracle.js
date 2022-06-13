


function RollOnOracle(oracle, roll=null)
{
	if(roll == null)
	{
		let rollMax = Math.max(...oracle.map(element=>element.Ceiling));
		roll = Math.floor(Math.random()*rollMax)+1;
	}
	let result = '';
	for(element in oracle)
	{
		if(oracle[element].Ceiling >= roll)
		{
			result = oracle[element]['Result'];
			break;
		}
	}
	return [result, roll];
}


module.exports = {RollOnOracle};