function translateMissionCode(missionCode)
{
    var parts = missionCode.split("_");
    if (parts[0] == "ACTION") // ACTION_#
        return "Clear within " + parts[1] + " turns";
    else if (parts[0] == "HP") // HP_#
        return "Clear when total remaining HP is " + parts[1] + "% or more";
    else if (missionCode == "NOT_CONTINUE") // NOT_CONTINUE
        return "Clear without Continue";
	else if (missionCode == "NOT_DEAD") // NOT_DEAD
		return "Clear without losing any Magical Girls";
	else if (missionCode == "CLEAR") // CLEAR
		return "Clear";
	else if (parts[0] == "ONLY" && parts[1] == "MEMBER" && parts[2] == "COUNT") // ONLY_MEMBER_COUNT_#
		return "Clear with " + parts[3] + " Magical Girls or less";
	else if (parts[0] == "WAVE") // WAVE_#
		return "Clear within " + parts[1] + " Wave(s)";
	else if (missionCode == "ONLY_DAMAGE_ATTRIBUTE_FIRE") // ONLY_DAMAGE_ATTRIBUTE_FIRE
		return "Clear using only Flame DMG";
	else if (missionCode == "ONLY_DAMAGE_ATTRIBUTE_WATER") // ONLY_DAMAGE_ATTRIBUTE_WATER
		return "Clear using only Aqua DMG";
	else if (missionCode == "ONLY_DAMAGE_ATTRIBUTE_TIMBER") // ONLY_DAMAGE_ATTRIBUTE_TIMBER
		return "Clear using only Forest DMG";
	else if (missionCode == "ONLY_DAMAGE_ATTRIBUTE_LIGHT") // ONLY_DAMAGE_ATTRIBUTE_LIGHT
		return "Clear using only Light DMG";
	else if (missionCode == "ONLY_DAMAGE_ATTRIBUTE_DARK") // ONLY_DAMAGE_ATTRIBUTE_DARK
		return "Clear using only Dark DMG";
    else
        return missionCode;
}

function translateItemCode(itemCode, itemJson)
{
    if (itemJson[itemCode] != undefined)
        return itemJson[itemCode];
    else
        return itemCode;
}

function translateAlign(align)
{
	var attrMap = {"LIGHT": "Light", "DARK": "Dark", "WATER": "Aqua", "FIRE": "Flame", "TIMBER": "Forest", "VOID": "Void"};
	return (attrMap[align] != undefined ? attrMap[align] : align);
}

function translateCharId(id, characterJson)
{
	if (characterJson[id] != undefined)
        return characterJson[id];
    else
        return id;
}

function isSameEnemy(enemy1, enemy2)
{
	return (enemy1.name == enemy2.name && enemy1.align == enemy2.align && enemy1.hp == enemy2.hp && enemy1.attack == enemy2.attack && enemy1.defense == enemy2.defense);
}

function findDuplicateAndIncrementQuantity(enemy, enemies)
{
	for (var i = 0; i < enemies.length; i++)
	{
		if (isSameEnemy(enemy, enemies[i]))
		{
			enemies[i].quantity++;
			return true;
		}
	}
	
	return false;
}

function convertJSON()
{
    var jsonObj = JSON.parse(document.getElementById("jsonText").value);
    
    $.getJSON("characters.json", convertJSONWithCharacterJSON);
    
    function convertJSONWithCharacterJSON(characterJson)
    {
        $.getJSON("items.json", convertJSONWithItemJSON);
        
        function convertJSONWithItemJSON(itemJson)
        {
            /* Example:
            {{Questheader
            |Difficulty = 20 |AP = 5 |CC = 400 |Master EXP = 64 |Magical girl EXP = 24 |Bond EXP = 40
            }}
            */
            var questheader = "{{Questheader"
                            + "\n|Difficulty = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.difficulty
                            + " |AP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.ap
                            + " |CC = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.riche
                            + " |Master EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.exp
                            + " |Magical girl EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.cardExp
                            + " |Bond EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.baseBondsPt
                            + "\n}}";

            /* Example:
            {{Questbody
            |11={{Enemy|Kotori|Dark|24000|2|||5000|6000}}
            |12={{Enemy|Kotori|Forest|24000|3|||5000|6000}}
            |21={{Enemy|Shin|Dark|1400000|1|b||11000|15000|{{Hitspot|2=y|5=y|7=y|9=y}}}}
            }}
            */
			var questbody = "{{Questbody";
			
			var enemies;
			var uniqueEnemyCount;
			var enemyJson;
			var enemy;
			var bodyPos;
			var hitspots;
			var bossIndex;
			for (var waveIndex = 0; waveIndex < Object.keys(jsonObj.waveList).length; waveIndex++)
			{
				enemies = [];
				hitspots = null;
				bossIndex = -1;
				
				for (var enemyIndex = 0; enemyIndex < Object.keys(jsonObj.waveList[waveIndex].enemyList).length; enemyIndex++)
				{
					enemyJson = jsonObj.waveList[waveIndex].enemyList[enemyIndex];
					enemy = {"name": translateCharId(enemyJson.charId, characterJson), "align": translateAlign(enemyJson.align), "hp": enemyJson.hp, "quantity": 1, "attack": enemyJson.attack, "defense": enemyJson.defence};
					
					if (enemyJson.posBody != undefined) // indication of body parts of boss
					{
						if (hitspots == null)
						{
							hitspots = [];
							hitspots.push(enemyJson.posBody); // position of main body
						}
						
						hitspots.push(enemyJson.pos); // position of body part
					}
					else if (!findDuplicateAndIncrementQuantity(enemy, enemies))
					{
						var newArrayLength = enemies.push(enemy);
						
						if (enemyJson.bossType > 0)
							bossIndex = newArrayLength - 1;
					}
				}
				
				for (var enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++)
				{
					questbody += "\n|" + (waveIndex + 1) + "" + (enemyIndex + 1) + "={{Enemy|" 
								+ enemies[enemyIndex].name + "|" + enemies[enemyIndex].align
								+ "|" + enemies[enemyIndex].hp + "|" + enemies[enemyIndex].quantity
								+ "|" + (waveIndex > 0 && enemyIndex == 0 ? "b" : "")
								+ "||" + enemies[enemyIndex].attack + "|" + enemies[enemyIndex].defense;
								
					if (hitspots != null && enemyIndex == bossIndex)
					{
						questbody += "|{{Hitspot";
						
						for (var i = 0; i < hitspots.length; i++)
							questbody += "|" + hitspots[i] + "=y";
						
						questbody += "}}";
					}
					
					questbody += "}}";
				}
			}
			
            questbody += "\n}}";

            /* Example:
            {{Missions
            |Mission1 = Clear when total remaining HP is 30% or more
            |Mission2 = Clear within 25 turns
            |Mission3 = Clear without Continue
            |Mission Reward Quantity = 2
            |Mission Reward = Lucky Rake
            }}
            */
            var missionRewardCode = jsonObj.webData.userQuestBattleResultList[0].questBattle.missionRewardCode;
            console.log(missionRewardCode);
            var index = missionRewardCode.lastIndexOf("_");
            var missionRewardQuantity = missionRewardCode.substr(index + 1);
            var missions = "{{Missions\n|Mission1 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission1)
                                    + "\n|Mission2 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission2)
                                    + "\n|Mission3 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission3)
                                    + "\n|Mission Reward Quantity = " + missionRewardQuantity
                                    + "\n|Mission Reward = " + translateItemCode(missionRewardCode.substr(0, index), itemJson)
                                    + "\n}}";
						
			/* Example:
			{{Drops|CC|1Q=300|Nanny's Grip|Nanny's Pedestal|FC=Nanny's Grip|FCQ=2|FC2=Nanny's Pedestal|FC2Q=4|FC3=Forest Book ++|FC3Q=2|FC4=Dark Book +|FC4Q=3|FC5=Forest Book +|FC5Q=3|FC6=CC|FC6Q=100000}}
			*/
			var itemCode;
			var itemQuantity;
			var rewardNum;
			var dropItemNum = 1;
			var itemCount = 0;
			var fcItemCount = 0;
			var drops = "{{Drops";
			
			rewardNum = 1;
			if (jsonObj.webData.userQuestBattleResultList[0].questBattle.defaultDropItem != undefined)
			{
				while (jsonObj.webData.userQuestBattleResultList[0].questBattle.defaultDropItem["rewardCode" + rewardNum] != undefined)
				{
					itemCount++;
					var dropRewardCode = jsonObj.webData.userQuestBattleResultList[0].questBattle.defaultDropItem["rewardCode" + rewardNum];
					index = dropRewardCode.lastIndexOf("_");
					itemCode = dropRewardCode.substr(0, index);
					itemQuantity = dropRewardCode.substr(index + 1);
					drops += "|" + translateItemCode(itemCode, itemJson);
					if (itemQuantity > 1)
						drops += "|" + itemCount + "Q=" + itemQuantity;
					rewardNum++;
				}
			}
			
			while (jsonObj.webData.userQuestBattleResultList[0].questBattle["dropItem" + dropItemNum] != undefined)
			{
				rewardNum = 1;
				var dropItem = jsonObj.webData.userQuestBattleResultList[0].questBattle["dropItem" + dropItemNum];
				while (dropItem["rewardCode" + rewardNum] != undefined)
				{
					itemCount++;
					var dropRewardCode = dropItem["rewardCode" + rewardNum];
					index = dropRewardCode.lastIndexOf("_");
					itemCode = dropRewardCode.substr(0, index);
					itemQuantity = dropRewardCode.substr(index + 1);
					drops += "|" + translateItemCode(itemCode, itemJson);
					if (itemQuantity > 1)
						drops += "|" + itemCount + "Q=" + itemQuantity;
					rewardNum++;
				}
				
				dropItemNum++;
			}
			
			var fcItemCodes = jsonObj.webData.userQuestBattleResultList[0].questBattle.firstClearRewardCodes.split(",");
			
			for (var i = 0; i < fcItemCodes.length; i++)
			{
				index = fcItemCodes[i].lastIndexOf("_");
				itemCode = fcItemCodes[i].substr(0, index);
				itemQuantity = fcItemCodes[i].substr(index + 1);
				drops += "|FC" + (i != 0 ? (i + 1) : "") + "=" + translateItemCode(itemCode, itemJson);
				if (itemQuantity > 1)
					drops += "|FC" + (i != 0 ? (i + 1) : "") + "Q=" + itemQuantity;
			}
			
			drops += "}}";
			
			
			/* Example:
			{{EnemySkills
			|{{Skills|Rumor of the Memory Curator|P1=Ignore Damage Cut [100%]|A1=Attack Down [35%] & Darkness (One / 1 Turn)|A1f=Every 2 turns}}
			}}
			*/
			
            document.getElementById("resultText").value = questheader + "\n" + questbody + "\n" + missions + "\n" + drops;
        }
    }
    
    <!--https://magireco.fandom.com/api.php?action=expandtemplates&format=json&text=%7B%7BTemplate%3ADrops%7CStanding%20Ear%20Wrapper%7D%7D-->
    /*var apiEndpoint = "https://magireco.fandom.com/api.php";
    var params = "action=parse&format=json&text=" + document.getElementById("resultText").value;

    fetch(apiEndpoint + "?" + params + "&origin=*")
        .then(function(response){return response.json();})
        .then(function(response) {
            console.log(response.parse.text["*"]);
            document.getElementById("resultRender").value = response.parse.text["*"];
        })
        .catch(function(error){console.log(error);});*/
}
