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
	else if (parts[0] == "COUNT" && parts[1] == "CONNECT") // COUNT_CONNECT_#
		return "Connect " + parts[2] + (parts[2] == 1 ? " time" : " times");
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
	return (enemy1.name == enemy2.name && enemy1.align == enemy2.align && enemy1.hp == enemy2.hp && enemy1.attack == enemy2.attack && enemy1.defense == enemy2.defense && enemy1.displayName == enemy2.displayName);
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

function arraysEqual(_arr1, _arr2)
{
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;
	
    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();
	
    for (var i = 0; i < arr1.length; i++)
	{
        if (arr1[i] !== arr2[i])
            return false;
    }
	
    return true;
}

function isSameEnemySkills(enemy1, enemy2)
{
	if (enemy1.name == enemy2.name)
	{
		if (arraysEqual(enemy1.memoriaList, enemy2.memoriaList))
		{
			// same enemies, any type, same skills
			return true;
		}
		else
		{
			if (enemy1.type == enemy2.type)
			{
				// same enemies, same type, different skills
				return false;
			}
			else
			{
				// same enemies, different types, different skills
				enemy1.renderType = true;
				enemy2.renderType = true;
				return false;
			}
		}
	}
	
	// different enemies
	return false;
}

function recordSkills(enemy, enemies)
{
	// enemy = {"name": translateCharId(enemyJson.charId, characterJson), "align": translateAlign(enemyJson.align), "memoriaList": enemyJson.memoriaList};
	
	for (var i = 0; i < enemies.length; i++)
	{
		if (isSameEnemySkills(enemy, enemies[i]))
			return;
	}
	
	// was not found, so add new entry
	if (enemy.memoriaList.length > 0)
		enemies.push(enemy);
}

function getMemoriaById(id, jsonObj)
{
	for (var i = 0; i < jsonObj.memoriaList.length; i++)
	{
		if (jsonObj.memoriaList[i].memoriaId == id)
			return jsonObj.memoriaList[i];
	}
	
	return null;
}

function getMagiaById(id, jsonObj)
{
	for (var i = 0; i < jsonObj.magiaList.length; i++)
	{
		if (jsonObj.magiaList[i].magiaId == id)
			return jsonObj.magiaList[i];
	}
	
	return null;
}

function getDoppelById(id, jsonObj)
{
	for (var i = 0; i < jsonObj.doppelList.length; i++)
	{
		if (jsonObj.doppelList[i].doppelId == id)
			return jsonObj.doppelList[i];
	}
	
	return null;
}

// art is not literally art; bad english for effects or perhaps "magical arts"
function getArtById(id, jsonObj)
{
	for (var i = 0; i < jsonObj.artList.length; i++)
	{
		if (jsonObj.artList[i].artId == id)
			return jsonObj.artList[i];
	}
	
	return null;
}

function interpretArt(art, jsonObj, effectJson)
{
	var effect = null;
	var effectName = null;
	var turn = -1;
	var target = null;
	var damageEffect = false;
	
	switch (art.code)
	{
		case "ATTACK":
			damageEffect = true;
			if (art.sub == "ALIGNMENT")
				effectName = "Attribute Strengthened Damage";
			else
				effectName = "Damage";
			
			if (art.target == "TARGET")
				effectName += " One Enemy";
			else if (art.target == "ALL")
				effectName += " All Enemies";
			else if (art.target == "RANDOM5")
				effectName += " 5 Random Enemies";
			else if (art.target == "RANDOM4")
				effectName += " 4 Random Enemies";
			else if (art.target == "RANDOM3")
				effectName += " 3 Random Enemies";
			else if (art.target == "RANDOM2")
				effectName += " 2 Random Enemies";
			else if (art.target == "VERTICAL")
				effectName += " A Vertical Line";
			else if (art.target == "HORIZONTAL")
				effectName += " A Horizontal Line";
			else
				effectName += " " + art.target;
			
			effectName += " [" + (art.effect / 10) + "%]";
			break;
		case "CONDITION_GOOD":
			if (art.rate < 1000)
				effectName = "Chance to ";
			else
				effectName = "";
			
			if (art.sub == "COUNTER" && art.effect == 1200)
				effectName += "Strengthened ";
			
			if (art.sub == "AUTO_HEAL")
				effectName += "Regenerate " + (art.genericValue != undefined ? art.genericValue : "HP") + " [" + (art.effect / 10) + "%]";
			else if (art.sub == "PROTECT")
				effectName += effectJson[art.sub] + (art.target == "DYING" ? " on Allies with Critical Health" : "") + " [" + (art.rate / 10) + "%]";
			else if (art.sub == "AVOID" || art.sub == "PURSUE" || art.sub == "DEFENSE_IGNORED" || art.sub == "COUNTER" || art.sub == "PROVOKE" || art.sub == "CRITICAL" || art.sub == "GUTS" || art.sub == "SKILL_QUICK" || art.sub == "IMITATE_ATTRIBUTE")
				effectName += effectJson[art.sub] + " [" + (art.rate / 10) + "%]";
			else if (art.sub == "BARRIER")
				effectName += effectJson[art.sub] + " [" + (art.effect) + "]";
			else if (art.sub == "REFLECT_DEBUFF")
				effectName += effectJson[art.sub] + " [" + (art.effect) + " Debuffs]";
			else
				effectName += effectJson[art.sub] + " [" + (art.rate != 1000 ? "" + (art.rate / 10) + "% chance / " : "") + (art.effect / 10) + "%]";
			break;
		case "CONDITION_BAD":
			effectName = "Chance to ";
			
			if ((art.sub == "POISON" || art.sub == "CURSE") && art.effect == 300)
				effectName += "Strengthened ";
			
			effectName += effectJson[art.sub] + " [" + (art.rate / 10) + "%]";
			break;
		case "BUFF":
			effectName = effectJson[art.sub] + " Up [" + (art.effect / 10) + "%]";
			break;
		case "DEBUFF":
			if (art.sub == "WEAK_CHARGE_DONE" || art.sub == "WEAK_BLAST")
			    effectName = effectJson[art.sub] + " [" + (art.effect / 10) + "%]";
			else
				effectName = effectJson[art.sub] + " Down [" + (art.effect / 10) + "%]";
			break;
		case "IGNORE":
			if (art.rate < 1000)
				effectName = "Chance to ";
			else
				effectName = "";
			
			if (art.sub == "DAMAGE_DOWN")
				effectName += "Ignore ";
			else if (art.sub == "CONDITION_BAD")
				effectName += "Negate "
			else
				effectName += "Anti-"; // special case(?): { "artId": 610319100, "code": "IGNORE", "target": "ALL", "sub": "DEBUFF", "turn": 1, "rate": 1000, "growPoint": 0, "genericValue": "NONE" }
			
			effectName += effectJson[art.sub];
			if (art.rate < 1000)
				effectName += " [" + (art.rate / 10) + "%]";
			break;
		case "HEAL":
			if (art.sub == "MP")
				effectName = "MP Restore [" + (art.effect / 10) + " MP]";
			else if (art.sub == "HP")
				effectName = "HP Restore [" + (art.effect / 10) + "%]";
			else if (art.sub == "MP_DAMAGE")
				effectName = "MP Damage [" + (art.effect / 10) + " MP]";
			break;
		case "INITIAL":
			if (art.sub == "MP")
				effectName = "MP Gauge Increased On Battle Start [" + (art.effect / 10) + "% full]";
			break;
		case "ENCHANT":
			effectName = "Chance to " + effectJson[art.sub] + " on Attack [" + (art.rate / 10) + "%]";
			break;
		case "REVOKE":
			switch (art.sub)
			{
				case "BAD":
					effectName = "Remove Status Ailments";
					break;
				case "GOOD":
					effectName = "Remove Granted Effects";
					break;
				case "BUFF":
					effectName = "Remove Buffs";
					break;
				case "DEBUFF":
					effectName = "Remove Debuffs";
					break;
			}
			break;
		case "BUFF_DYING":
			effectName = effectJson[art.sub] + " Up When At Critical Health [" + (art.effect / 10) + "%]";
			break;
		case "BUFF_HPMAX":
			effectName = effectJson[art.sub] + " Up While At Max Health [" + (art.effect / 10) + "%]";
			break;
		case "BUFF_PARTY_DIE":
			effectName = effectJson[art.sub] + " Up When Ally Dies [" + (art.effect / 10) + "%]";
			break;
		case "BUFF_DIE":
			effectName = effectJson[art.sub] + " Up Upon Death [" + (art.effect / 10) + "%]";
			break;
		case "RESURRECT":
			effectName = "Revive Ally [" + (art.effect / 10) + "% HP]";
			break;
	}
	
	if (effectName == null)
		effectName = "Not Found: " + art.code + " " + art.sub;
	
	if (art.turn != undefined)
		turn = art.turn;
	
	if (!damageEffect)
	{
		switch (art.target)
		{
			case "SELF":
				target = "Self";
				break;
			case "DYING":
			case "TARGET":
			case "ONE":
				target = "One Enemy";
				break;
			case "ALL":
				if ((art.code == "HEAL" && art.sub != "MP_DAMAGE") || (art.code == "CONDITION_GOOD") || (art.code == "BUFF") || (art.code == "BUFF_DIE") || (art.code == "IGNORE") || (effectName == "Remove Status Ailments") || (effectName == "Remove Debuffs"))
					target = "Allies";
				else
					target = "All Enemies";
				break;
			default:
				target = art.target;
				break;
		}
	}
	else
	{
		target = undefined;
	}
	
	return {"effect": effectName, "turn": turn, "target": target, "times": 1};
}

function interpretMemoria(memoria, jsonObj, effectJson, hpThreshold=null)
{
	var effects = [];
	var artDesc;
	var memoriaDesc = memoria;
	
	for (var artIndex = 0; artIndex < memoria.artList.length; artIndex++)
	{
		artDesc = interpretArt(getArtById(memoria.artList[artIndex], jsonObj), jsonObj, effectJson);
		if (artDesc.effect.startsWith("Anti-Debuff") || artDesc.effect.startsWith("Negate Status Ailments") || artDesc.effect.startsWith("Skill Quicken"))
		{
			var found = false;
			for (var i = 0; i < effects.length; i++)
			{
				if (effects[i].effect == artDesc.effect && effects[i].target == artDesc.target && effects[i].turn == artDesc.turn)
				{
					found = true;
					effects[i].times++;
					break;
				}
			}
			
			if (!found)
			{
				effects.push(artDesc);
			}
		}
		else
		{
			effects.push(artDesc);
		}
	}
	
	if (memoria.type == "ABILITY")
	{
		// can ignore target (unless Attack/Defense Up Upon Death type buff)
		// put turns at end of each where applicable
		memoriaDesc = "";
		
		for (var effectIndex = 0; effectIndex < effects.length; effectIndex++)
		{
			if (effects[effectIndex].effect.startsWith("Anti-Debuff") || effects[effectIndex].effect.startsWith("Negate Status Ailments") || (effects[effectIndex].effect.startsWith("Skill Quicken") && effects[effectIndex].times > 1))
			{
				if (effects[effectIndex].effect.endsWith("[100%]"))
					effects[effectIndex].effect = effects[effectIndex].effect.split("100%]")[0];
				else
					effects[effectIndex].effect = effects[effectIndex].effect.split("]")[0] + " / ";

				effects[effectIndex].effect += effects[effectIndex].times + (effects[effectIndex].effect.startsWith("Anti-Debuff") ? " Debuff" : (effects[effectIndex].effect.startsWith("Negate Status Ailments") ? " Status Ailment" : " Time")) + (effects[effectIndex].times > 1 ? "s" : " ") + "]";
			}
			
			if (effects[effectIndex].effect.includes("Upon Death"))
			{
				memoriaDesc += effects[effectIndex].effect + " (" + effects[effectIndex].target + (effects[effectIndex].turn > 0 ? " / " + effects[effectIndex].turn + (effects[effectIndex].turn == 1 ? " Turn)" : " Turns)") : ")");
			}
			else
			{
				memoriaDesc += effects[effectIndex].effect + (effects[effectIndex].turn > 0 ? " (" + effects[effectIndex].turn + (effects[effectIndex].turn == 1 ? " Turn)" : " Turns)") : "");
			}
			
			if (effectIndex < effects.length - 1)
				memoriaDesc += " & ";
		}
	}
	else if (memoria.type == "SKILL" || memoria.type == "STARTUP")
	{
		// if same target and turns for all, sort them and put the target and turns at the end of the string
		// else put target and turns at the end of each
		
		var turn = effects[0].turn;
		var target = effects[0].target;
		var sameTurnTarget = true;
		
		for (var effectIndex = 1; effectIndex < effects.length; effectIndex++)
		{
			if (effects[effectIndex].turn != turn || effects[effectIndex].target != target)
			{
				sameTurnTarget = false;
				break;
			}
		}
		
		if (sameTurnTarget)
		{
			effects.sort(function(a, b) { return a.effect.localeCompare(b.effect); });
			memoriaDesc = "";
			for (var effectIndex = 0; effectIndex < effects.length; effectIndex++)
			{
				if (effects[effectIndex].effect.startsWith("Anti-Debuff") || effects[effectIndex].effect.startsWith("Negate Status Ailments") || (effects[effectIndex].effect.startsWith("Skill Quicken") && effects[effectIndex].times > 1))
				{
					if (effects[effectIndex].effect.endsWith("[100%]"))
						effects[effectIndex].effect = effects[effectIndex].effect.split("100%]")[0];
					else if (effects[effectIndex].effect.endsWith("]"))
						effects[effectIndex].effect = effects[effectIndex].effect.split("]")[0] + " / ";
					else
						effects[effectIndex].effect = effects[effectIndex].effect + " [";

					effects[effectIndex].effect += effects[effectIndex].times + (effects[effectIndex].times > 1 ? " Times" : " Time") + "]";
				}
				
				memoriaDesc += effects[effectIndex].effect;
				
				if (effectIndex < effects.length - 1)
					memoriaDesc += " & ";
			}

			if (memoria.type == "STARTUP")
			{
				memoriaDesc += " (" + target + " / " + (turn > 0 ? turn + (turn == 1 ? " Turn" : " Turns") : "∞ Turns") + " on Battle Start)";
			}
			else
			{
				memoriaDesc += " (" + target + (turn > 0 ? " / " + turn + (turn == 1 ? " Turn" : " Turns") : "") + ")";
			}
		}
		else
		{
			memoriaDesc = "";
			for (var effectIndex = 0; effectIndex < effects.length; effectIndex++)
			{
				if (effects[effectIndex].effect.startsWith("Anti-Debuff") || effects[effectIndex].effect.startsWith("Negate Status Ailments") || (effects[effectIndex].effect.startsWith("Skill Quicken") && effects[effectIndex].times > 1))
				{
					if (effects[effectIndex].effect.endsWith("[100%]"))
						effects[effectIndex].effect = effects[effectIndex].effect.split("100%]")[0];
					else
						effects[effectIndex].effect = effects[effectIndex].effect.split("]")[0] + " / ";

					effects[effectIndex].effect += effects[effectIndex].times + (effects[effectIndex].times > 1 ? " Times" : " Time") + "]";
				}

				if (memoria.type == "STARTUP")
				{
					memoriaDesc += effects[effectIndex].effect + " (" + effects[effectIndex].target + " / " + (effects[effectIndex].turn > 0 ? effects[effectIndex].turn + (effects[effectIndex].turn == 1 ? " Turn" : " Turns") : "∞ Turns") + " on Battle Start)";

				}
				else
				{
					memoriaDesc += effects[effectIndex].effect + " (" + effects[effectIndex].target + (effects[effectIndex].turn > 0 ? " / " + effects[effectIndex].turn + (effects[effectIndex].turn == 1 ? " Turn" : " Turns") : "") + ")";
				}
				
				if (effectIndex < effects.length - 1)
					memoriaDesc += " & ";
			}
		}
		
		if (memoria.type == "SKILL")
		{
			if (memoria.cost == 1)
				memoriaDesc += "|Every turn";
			else
				memoriaDesc += "|Every " + memoria.cost + " turns";
		}
	}
	if (hpThreshold)
	{
		if (hpThreshold[0] == 100)
		{
			if (hpThreshold[1] != 0)
			{
				memoriaDesc += " (Above " + hpThreshold[1] + "% HP)";
			}
		}
		else
		{
			if (hpThreshold[1] == 0)
			{
				memoriaDesc += " (Below " + hpThreshold[0] + "% HP)";
			}
			else
			{
				memoriaDesc += " (" + hpThreshold[0] + "-" + hpThreshold[1] + "% HP)";
			}
		}
	}
	return memoriaDesc;
}

function separateHealthThreshold(hpThresholdList)
{
	var thresholdIndices = {};
	var thresholds = [];

	var hpVals = [0];
	for (var i = 0; i < hpThresholdList.length; i++)
	{
		hpVals.push(hpThresholdList[i].hpRate);
	}
	for (var hpGroup = hpThresholdList.length - 1; hpGroup >= 0; hpGroup--)
	{
		var hp = hpVals[hpGroup+1];
		var nextHp = hpVals[hpGroup];
		for (let item of hpThresholdList[hpGroup].memoriaIdList)
		{
			if (thresholdIndices[item] >= 0 && thresholds[thresholdIndices[item]][2] == hp)
				{
				thresholds[thresholdIndices[item]][2] = nextHp;
				}
			else
				{
				thresholdIndices[item] = thresholds.length;
				thresholds.push([item, hp, nextHp]);
				}
		}
	}
	return formatThresholds(thresholds);
}

function formatThresholds(thresholds)
{	
	thresholds.sort(function(a, b) {
		if (a[1] == b[1]) {
		  return a[2] - b[2];
		}
		return b[1] - a[1];
	  });
	  thresholdsFormatted = [];
	  for (let item of thresholds)
	  {
		thresholdsFormatted.push(item[0] + " " + item[1] + " " + item[2]);
	  }
	return thresholdsFormatted;
}

function interpretMagia(magia, jsonObj, effectJson)
{
	var effects = [];
	var artDesc;
	var magiaDesc = "";
	var artJsonObj;
	
	if (magia.level > 1)
		magiaDesc += "[WARNING: Magia level > 1]"; // assuming all enemies are magia level 1 unless this is triggered
	
	for (var artIndex = 0; artIndex < magia.artList.length; artIndex++)
	{
		artJsonObj = getArtById(magia.artList[artIndex], jsonObj)
		
		if (artJsonObj.sub != "DUMMY")
		{
			artDesc = interpretArt(artJsonObj, jsonObj, effectJson);
			if (artDesc.effect.startsWith("Anti-Debuff") || artDesc.effect.startsWith("Negate Status Ailments") || artDesc.effect.startsWith("Skill Quicken"))
			{
				var found = false;
				for (var i = 0; i < effects.length; i++)
				{
					if (effects[i].effect == artDesc.effect && effects[i].target == artDesc.target && effects[i].turn == artDesc.turn)
					{
						found = true;
						effects[i].times++;
						break;
					}
				}

				if (!found)
				{
					effects.push(artDesc);
				}
			}
			else
			{
				effects.push(artDesc);
			}
		}
	}
	
	for (var effectIndex = 0; effectIndex < effects.length; effectIndex++)
	{
		if (effects[effectIndex].effect.startsWith("Anti-Debuff") || effects[effectIndex].effect.startsWith("Negate Status Ailments") || (effects[effectIndex].effect.startsWith("Skill Quicken") && effects[effectIndex].times > 1))
		{
			if (effects[effectIndex].effect.endsWith("[100%]"))
				effects[effectIndex].effect = effects[effectIndex].effect.split("100%]")[0];
			else
				effects[effectIndex].effect = effects[effectIndex].effect.split("]")[0];
			
			effects[effectIndex].effect += ' [' + effects[effectIndex].times + (effects[effectIndex].times > 1 ? " Times" : " Time") + "]";
		}
		
		if (effects[effectIndex].target != undefined)
		{
			magiaDesc += effects[effectIndex].effect + " (" + effects[effectIndex].target + (effects[effectIndex].turn > 0 ? " / " + effects[effectIndex].turn + (effects[effectIndex].turn == 1 ? " Turn" : " Turns") : "") + ")";
		}
		else
		{
			magiaDesc += effects[effectIndex].effect;
		}

		if (effectIndex < effects.length - 1)
			magiaDesc += " & ";
	}
	
	return magiaDesc;
}

function convertJSON()
{
	convertJSONString(document.getElementById("jsonText").value);
}

function convertJSONString(jsonString, fileName="", downloadIndividually=null)
{
    var jsonObj = JSON.parse(jsonString);
    
    $.getJSON("characters.json", convertJSONWithCharacterJSON);
    
    function convertJSONWithCharacterJSON(characterJson)
    {
        $.getJSON("items.json", convertJSONWithItemJSON);
        
        function convertJSONWithItemJSON(itemJson)
        {
			$.getJSON("effects.json", convertJSONWithEffectJSON);
			
			function convertJSONWithEffectJSON(effectJson)
			{
				var questheader;
				
				if (jsonObj.battleType != "ARENA")
				{
					/* Example:
					{{Questheader
					|Difficulty = 20 |AP = 5 |CC = 400 |Master EXP = 64 |Magical girl EXP = 24 |Bond EXP = 40
					}}
					*/
					var questheader = "{{Questheader"
									+ "\n|Difficulty = " + (jsonObj.webData.userQuestBattleResultList[0].questBattle.difficulty != undefined ? jsonObj.webData.userQuestBattleResultList[0].questBattle.difficulty : jsonObj.scenario.difficulty)
									+ " |AP = " + (jsonObj.webData.userQuestBattleResultList[0].questBattle.ap != undefined ? jsonObj.webData.userQuestBattleResultList[0].questBattle.ap : (jsonObj.scenario.cost > 0 ? jsonObj.scenario.cost : (jsonObj.webData.userQuestBattleResultList[0].questBattle.needItemNum != undefined ? "{{Inum|" + (itemJson[jsonObj.webData.userQuestBattleResultList[0].questBattle.useItemId] != undefined ? itemJson[jsonObj.webData.userQuestBattleResultList[0].questBattle.useItemId] : jsonObj.webData.userQuestBattleResultList[0].questBattle.useItemId) + "|" + jsonObj.webData.userQuestBattleResultList[0].questBattle.needItemNum + "|40px}}" : 0)))
									+ " |CC = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.riche
									+ " |Master EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.exp
									+ " |Magical girl EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.cardExp
									+ " |Bond EXP = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.baseBondsPt
									+ (jsonObj.webData.userQuestBattleResultList[0].questBattle.limitTurn != undefined ? " |Maximum turns = " + jsonObj.webData.userQuestBattleResultList[0].questBattle.limitTurn : "")
									+ "\n}}";
				}

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
						enemy = {"name": translateCharId(enemyJson.charId, characterJson), "align": translateAlign(enemyJson.align), "hp": enemyJson.hp, "quantity": 1, "attack": enemyJson.attack, "defense": enemyJson.defence, "species": enemyJson.enemyKindType, "displayName": enemyJson.name};
						
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
									+ "|" + (enemies[enemyIndex].displayName.endsWith(" Mirror") || enemies[enemyIndex].displayName.endsWith("/ミラー") ? enemies[enemyIndex].name + " / Mirror" : "")
									+ "|" + enemies[enemyIndex].attack + "|" + enemies[enemyIndex].defense;
									
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
				{{EnemySkills
				|{{Skills|Rumor of the Memory Curator|P1=Ignore Damage Cut [100%]|A1=Attack Down [35%] & Darkness (One / 1 Turn)|A1f=Every 2 turns}}
				}}
				*/
				
				var enemySkills = "{{EnemySkills";
				enemies = [];
				
				for (var waveIndex = 0; waveIndex < jsonObj.waveList.length; waveIndex++)
				{
					for (var enemyIndex = 0; enemyIndex < jsonObj.waveList[waveIndex].enemyList.length; enemyIndex++)
					{
						enemyJson = jsonObj.waveList[waveIndex].enemyList[enemyIndex];
						
						if (enemyJson.posBody == undefined)
						{
							if (enemyJson.hpRateGimmickList.length != 0)
							{
								enemyJson.memoriaList = separateHealthThreshold(enemyJson.hpRateGimmickList);
							}
							enemy = {"name": translateCharId(enemyJson.charId, characterJson), "type": translateAlign(enemyJson.align), "magiaId": enemyJson.magiaId, "doppelId": enemyJson.doppelId, "memoriaList": enemyJson.memoriaList, "renderType": false, "species": enemyJson.enemyKindType, "displayName": enemyJson.name};
							recordSkills(enemy, enemies);
						}
					}
				}
				
				var memoria;
				var memoriaDesc;
				var magia;
				var magiaDesc;
				//var doppel;
				//var doppelDesc;
				var numPassives;
				var numSkills;
				var hpThreshold;
				
				for (var i = 0; i < enemies.length; i++)
				{
					enemySkills += "\n|{{Skills|" + enemies[i].name
								+ (enemies[i].displayName.endsWith(" Mirror") || enemies[i].displayName.endsWith("/ミラー") ? "|" + enemies[i].name + " / Mirror" : "")
								+ (enemies[i].renderType ? "|Type=" + enemies[i].type : "");
					numPassives = 0;
					numSkills = 0;
					
					for (memoriaIndex = 0; memoriaIndex < enemies[i].memoriaList.length; memoriaIndex++)
					{
						if (enemies[i].memoriaList[memoriaIndex].length > 7) {
							hpThreshold = (enemies[i].memoriaList[memoriaIndex].split(/\s/)).slice(1);
							memoria = getMemoriaById(enemies[i].memoriaList[memoriaIndex].split(/\s/)[0], jsonObj);
						}
						else {
							hpThreshold = null
							memoria = getMemoriaById(enemies[i].memoriaList[memoriaIndex], jsonObj);
							}
						memoriaDesc = interpretMemoria(memoria, jsonObj, effectJson, hpThreshold);
						
						if (memoria.type == "ABILITY" || memoria.type == "STARTUP")
						{
							numPassives++;
							enemySkills += "|P" + numPassives + "=" + memoriaDesc;
						}
						else if (memoria.type == "SKILL")
						{
							numSkills++;
							var descParts = memoriaDesc.split("|");
							enemySkills += "|A" + numSkills + "=" + descParts[0] + "|A" + numSkills + "f=" + descParts[1];
						}
					}
					
					if (enemies[i].magiaId != undefined)
					{
						magia = getMagiaById(enemies[i].magiaId, jsonObj);
						magiaDesc = interpretMagia(magia, jsonObj, effectJson);
						enemySkills += "|Magia=" + magiaDesc;
					}
					
					// Not sure if used for enemies
					if (enemies[i].doppelId != undefined)
					{
						//doppel = getDoppelById(enemies[i].doppelId, jsonObj);
						//doppelDesc = interpretDoppel(doppel, jsonObj, effectJson);
						//enemySkills += "|Doppel=" + doppelDesc;
						enemySkills += "|Doppel=" + enemies[i].doppelId;
					}
					
					enemySkills += "}}";
				}
				
				enemySkills += "\n}}";

				if (jsonObj.battleType != "ARENA")
				{
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
					var missions = "";
					if (missionRewardCode != undefined)
					{
						console.log(missionRewardCode);
						var index = missionRewardCode.lastIndexOf("_");
						var missionRewardQuantity = missionRewardCode.substr(index + 1);
						missions = "{{Missions\n|Mission1 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission1)
												+ "\n|Mission2 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission2)
												+ "\n|Mission3 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission3)
												+ "\n|Mission Reward Quantity = " + missionRewardQuantity
												+ "\n|Mission Reward = " + translateItemCode(missionRewardCode.substr(0, index), itemJson)
												+ "\n}}";
					}

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

					if (jsonObj.webData.userQuestBattleResultList[0].questBattle.addDropItemId != undefined)
					{
						var dropItem = jsonObj.webData.userQuestBattleResultList[0].questBattle.addDropItemId;
						itemCount++;
						drops += "|" + translateItemCode(dropItem, itemJson);
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

					if (jsonObj.webData.userQuestBattleResultList[0].questBattle.firstClearRewardCodes != undefined)
					{
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
					}

					drops += "}}";
					
					if (fileName)
					{
						if (downloadIndividually)
						{
							downloadFinalText((questheader + "\n" + questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "")  + (missions != "" ? "\n" + missions : "") + "\n" + drops), fileName);
						}
						else
						{
							recordQuest((questheader + "\n" + questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "")  + (missions != "" ? "\n" + missions : "") + "\n" + drops), fileName, downloadIndividually)
						}
					}
					else
					{
						document.getElementById("resultText").value = questheader + "\n" + questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "")  + (missions != "" ? "\n" + missions : "") + "\n" + drops;
					}
				}
				else
					if (fileName)
					{
						if (downloadIndividually)
						{
							downloadFinalText((questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "")), fileName);
						}
						else
						{
							recordQuest((questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "")), fileName, downloadIndividually);
						}
						
					}
					else
					{
						document.getElementById("resultText").value = questbody + (enemySkills != "{{EnemySkills\n}}" ? "\n" + enemySkills : "");
					}
			}
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
