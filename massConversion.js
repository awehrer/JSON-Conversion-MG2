const quests = {story: {}, challenge: {}, ex: {}, evils: {}};
var completed = 0;
var total = 0;
var type = ''
function massConvert(downloadIndividually=null) {
  completed = 0;
  type = document.getElementById("event_type").value
  for (let name in quests) {
    quests[name] =  {};
  }
  const fileData = document.getElementById("fileItem").files;
  total = fileData.length;
  for (let i = 0; i < fileData.length; i++) {
      let Reader = new FileReader;
      Reader.readAsText(fileData[i]);
      Reader.onload = function() {
          convertJSONString(Reader.result, fileData[i].name, downloadIndividually);
      }
  }
}

function downloadFinalText(finalText, fileName) {
  var fileName = fileName.split(".")[0] + "_wiki.txt"
  let currentFile = new File([finalText], fileName);
  let downloadURL = window.URL.createObjectURL(currentFile);
  let downloader = document.createElement('a');
  downloader.href = downloadURL;
  downloader.download = fileName;
  downloader.click();
  URL.revokeObjectURL(downloadURL);
}

function recordQuest(finalText, fileName, downloadIndividually) {
    var fileName = fileName.split(".")[0];
    var num = Number(fileName.split("_")[1]);
    var fileName = fileName.split("_")[0]
    console.log(type)
    if (type == 'tower'){
      fileName = fileName.toLowerCase()
    }
    else if (!quests[fileName]){
      quests[fileName] = {};
    }
    quests[fileName][num] = finalText;

    completed += 1;
    if (completed == total) {
      tabberCombine(downloadIndividually,fileName);
    }
}

function storyCondense() {
  var stories = [];
  var curStart = 1;
  var curHeader = (quests['story'][1].split('Questheader')[1]).split('\n}}')[0];
  var curFooter = quests['story'][1].split('Missions')[1];
  var curEnemies = arrangeEnemies((quests['story'][1].split('Questbody')[1]).split('\n}}')[0]);
  for (let i = 2; i < 41; i++) {
    if (!quests['story'][i]) {
      if (curStart == i-1) {
        stories.push(String(i-1));
      }
      else {
        stories.push(String(curStart) + "-" + String(i-1));
      }
      break;
    }
    var storyData = quests['story'][i];
    const newHeader = (storyData.split('Questheader')[1]).split('\n}}')[0];
    const newFooter = storyData.split('Missions')[1];
    var newEnemies = arrangeEnemies((storyData.split('Questbody')[1]).split('\n}}')[0]);
    if ((newHeader != curHeader) || (newFooter != curFooter) || (newEnemies!= curEnemies)) {
      if (curStart == i-1) {
        stories.push(String(i-1));
      }
      else {
        stories.push(String(curStart) + "-" + String(i-1));
      }
      curStart = i;
      curHeader = newHeader;
      curFooter = newFooter;
      curEnemies = newEnemies;
    }
  }
  return stories;
}

function arrangeEnemies(enemies) {
  enemies = enemies.replace('|b|', '||');
  enemies = enemies.split('\n');
  const wave1 = [];
  const wave2 = [];
  for (const line of enemies) {
    if (line[1] == '1') {
      wave1.push(line.slice(6));
    }
    else if (line) {
      wave2.push(line.slice(6));
    }
  }
  wave1.sort()
  wave2.sort()
  return String(wave1) + String(wave2)
}

function tabberCombine(dl,name) {
  if (type == 'tower') {
    tabberCombineTower(dl)
  }
  else if (type='personal_story') {
    tabberCombinePersonal(dl,name)
  }

  else if (type == 'branch') {
    tabberCombineBranch(dl)
  }
}

function tabberCombineTower(downloadIndividually) {
  const stories = storyCondense()
  output = "<tabber>\nStory=\n{{#tag:tabber|\n"
  halfOfStories = stories[stories.length-1]
  if (halfOfStories.includes('-')) {
    halfOfStories = halfOfStories.split('-')[1]
  }
  if (quests['evils'][1]) {
    halfOfStories = halfOfStories / 2
  }
  for (var story of stories) {
    if (story.includes('-')) {
      var battle = 'Battles ';
    }
    else {
      var battle = 'Battle ';
    }
    output += battle + story + '=\n' + '<div style="display:none">\n' + "'''Story " + battle + story + "'''\n" + '</div>\n'
    + quests['story'][Number(story.split('-')[0])] + "\n{{!}}-{{!}}\n";
  }
  output += '}}\n'
  if (quests['evils'][1]) {
  output += '{{#tag:tabber|\nBattles 1-' + halfOfStories + '=\n<div style="display:none">\n' + "'''Battles 1-" + halfOfStories + "'''\n" + '</div>\n'
  }
  output += '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n' + '! style="width:15%; text-align:center"{{!}}Section clear\n'
  + '{{!}}style="text-align:center" {{!}}{{Inum|Magia Stone|10}}\n' + '{{!}}}\n';

  if (quests['evils'][1]) {
    output += '{{!}}-{{!}}Battles ' + Number(halfOfStories+1) + '-' + halfOfStories*2 + '=\n<div style="display:none">\n' + "'''Battles " + Number(halfOfStories+1) + "-"
    + halfOfStories*2 + "'''\n" + '</div>\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
    + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{MemoPic|EVENT CLEAR MEMO GOES HERE|50px}}\n' + '{{!}}}\n' + '}}\n';
  }

  output += '|-|Challenge=\n{{#tag:tabber|\n';
  for (let i = 1; i < 11; i++) {
    output += 'Battle ' + i + '=\n' + '<div style="display:none">\n' + "'''Challenge Battle " + i + "'''\n" + '</div>\n' + quests['challenge'][i] + "\n{{!}}-{{!}}\n";
  }
  output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
  + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Magia Stone|10}}\n' + '{{!}}}\n';

  if (quests['ex'][1]) {
      output += '|-|EX Challenge=\n{{#tag:tabber|\n';
      for (let i = 1; i < 6; i++) {
        output += 'Battle '+ i + '=\n' + '<div style="display:none">\n' + "'''EX Challenge Battle " + i + "'''\n" + '</div>\n' + quests['ex'][i] + "\n{{!}}-{{!}}\n";
      }
      output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
    + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Magia Stone|10}}\n' + '{{!}}}\n';
    }

  if (quests['evils'][1]) {
      output += '|-|Hundred Evils Challenge=\n{{#tag:tabber|\n';
      for (let i = 1; i < 4; i++) {
        output += 'Challenge ' + i + '=\n' + '<div style="display:none">\n' + "'''Hundred Evils Challenge " + i + "'''\n" + '</div>\n' + quests['evils'][i] + '\n{{!}}-{{!}}\n';
      }
      output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
      + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Gacha Ticket|1}}\n'
    }
  output += '</tabber>'
  if (downloadIndividually === null) {
    document.getElementById("resultText").value = output
  }
  else {
    downloadFinalText(output, "final_tabber.")
  }
}

function tabberCombinePersonal(downloadIndividually, char) {
  set = 1;
  quest = 0;
  output = '<tabber>\nEpisode 1=\n<div style="font-size:150%; text-align:center;">Episode 1</div>\n';
  output += '<div style="text-align:center">' + "'''Note: [[" + char + "]] will earn 2x Bond EXP from these quests (3x if set as leader)'''</div>\n{{#tag:tabber|\n"

  for (let i = 1; i < 13; i++) {
    if (quests[char][i]) {
      quest += 1
      output +='Battle ' + quest + '=\n<div style="display:none">'
      if (set == 4) {
          output +="'''Doppel: Battle " + quest + "'''\n</div>\n"
      }
      else {
        output +="\n'''Episode " + set + ": Battle " + quest + "'''\n</div>\n"
      }
      questText = quests[char][i]
      let pos = questText.search("MEMBER")
      questText = questText.slice(0, pos) + "Clear with [[" + char + "]] in your party" + questText.slice(pos + 17)
      output += questText
      if (quest==3) {
        if (set == 1) {
          output+='\n}}\n{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n! style="width:15%; text-align:center"{{!}}Section Clear\n'
          output+='{{!}}style="text-align:center" {{!}}[[' + char + "]]’s School Uniform {{ItemPic|Costume Icon|50px|"
          output+= char + "/Costumes#School_Uniform}}\n{{!}}}\n|-|\nEpisode 2=\n"
          output+='<div style="font-size:150%; text-align:center">Episode 2</div>\n'
          output+='<div style="text-align:center">' + "'''Note: [[" + char + "]] will earn 2x Bond EXP from these quests (3x if set as leader)'''</div>\n{{#tag:tabber|\n"
        }
        else if (set == 2) {
        output+='\n}}\n{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n! style="width:15%; text-align:center" {{!}}Section Clear\n'
        output+='{{!}} style="width:85%; text-align:center" {{!}}{{Inum|Magia Stone|5}}\n{{!}}}\n|-|\nEpisode 3=\n'
        output+='<div style="font-size:150%; text-align:center">Episode 3</div>\n'
        output+='<div style="text-align:center">' + "'''Note: [[" + char + "]] will earn 2x Bond EXP from these quests (3x if set as leader)'''</div>\n{{#tag:tabber|\n"
        }
        else if (set == 3) {
          output+='\n}}\n{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n! style="width:15%; text-align:center" {{!}}Section Clear\n'
          output+='{{!}} style="width:85%; text-align:center" {{!}}{{MemoPic|}}\n{{!}}}\n'
          if (quests[char][i+1]) {
            if (char.includes(" ")) {
              givenName = char.split(" ")[1]
            }
            else {
              givenName = char
            }
          output+='|-|\nDoppel=\n<div style="font-size:150%; text-align:center">' + givenName + "'s Doppel</div>\n{{#tag:tabber|\n"
          }
        }
        else if (set == 4) {
        output += '}}\n{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n! style="width:15%; text-align:center"{{!}}Section Clear\n'
        output += '{{!}}style="text-align:center" {{!}}Doppel of  {{ItemPic|Doppel Icon|50px|' + char + '#Doppel}}\n{{!}}}\n'
        }
        set += 1
        quest = 0
      }
      else {
        output += "\n{{!}}-{{!}}\n"
      }
    }
    else {
      break
    }
  }
  output += "</tabber>\n[[Category:Quests]]\n[[Category:Personal Quests]]"
  if (downloadIndividually === null) {
    document.getElementById("resultText").value = output
  }
  else {
    downloadFinalText(output, "final_tabber.")
  }
}

function tabberCombineBranch(downloadIndividually) {
  output="<tabber>\n";
  for (let name in quests) {
    if (name == 'Challenge') {
      battle = 'BATTLE '
    }
    else if (name == 'FREE') {
      battle = 'FREE '
    }
    else {
      battle ='Episode '
    }
    output += name + '=\n' + '{{#tag:tabber|\n'
    for (let i = 1; i < 21; i++) {
      if (quests[name][i]) {
      output += battle + i + '=\n' + '<div style="display:none">\n' + "'''" + name + battle + i + "'''\n</div>\n" + quests[name][i] + '\n{{Unlocks|'
        if (quests[name][i-1]) {
          output += '[[#' + name + '#' + battle + i-1 + '|' + name + battle + i-1 + ']]|'
        }
        if (quests[name][i+1]) {
          output += '[[#' + name + '#' + battle + i+1 + '|' + name + battle + i+1 + ']]'
        }
        else {
          output += 'Need=[[##|]]'
        }
      output += '}}\n{{!}}-{{!}}\n';
      }
    output += '}}\n' + '|-|'
    }
  }
  output += '</tabber>'
  if (downloadIndividually === null) {
    document.getElementById("resultText").value = output
  }
  else {
    downloadFinalText(output, "final_tabber.")
  }
}