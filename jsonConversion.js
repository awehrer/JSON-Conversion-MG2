function translateMissionCode(missionCode)
{
    var parts = missionCode.split("_");
    if (parts[0] == "ACTION")
        return "Clear within " + parts[1] + " turns";
    else if (parts[0] == "HP")
        return "Clear when total remaining HP is " + parts[1] + "% or more";
    else if (parts[0] == "NOT" && parts[1] == "CONTINUE")
        return "Clear without Continue";
    else
        return missionCode;
}

function convertJSON()
{
    var jsonObj = JSON.parse(document.getElementById("jsonText").innerHTML);

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
    var questbody = "{{Questbody"
                + "\n}}";

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
    var missionRewardQuantity = missionRewardCode.substr(index+1);
    var missions = "{{Missions\n|Mission1 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission1)
                            + "\n|Mission2 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission2)
                            + "\n|Mission3 = " + translateMissionCode(jsonObj.webData.userQuestBattleResultList[0].questBattle.mission3)
                            + "\n|Mission Reward Quantity = " + missionRewardQuantity
                            + "\n|Mission Reward = " + missionRewardCode.substr(0, index)
                            + "\n}}";

    document.getElementById("resultText").innerHTML = questheader + "\n" + questbody + "\n" + missions;

    $.getJSON("characters.json", function(json) {
        console.log(json); // this will show the info it in firebug console
    });
    
    <!--https://magireco.fandom.com/api.php?action=expandtemplates&format=json&text=%7B%7BTemplate%3ADrops%7CStanding%20Ear%20Wrapper%7D%7D-->
    /*var apiEndpoint = "https://magireco.fandom.com/api.php";
    var params = "action=parse&format=json&text=" + document.getElementById("resultText").innerHTML;

    fetch(apiEndpoint + "?" + params + "&origin=*")
        .then(function(response){return response.json();})
        .then(function(response) {
            console.log(response.parse.text["*"]);
            document.getElementById("resultRender").innerHTML = response.parse.text["*"];
        })
        .catch(function(error){console.log(error);});*/
}
