const quests = {story: {}, challenge: {}, ex: {}, evils: {}};
var completed = 0;
var total = 0;
function massConvert(downloadIndividually=null) {
  completed = 0;
  quests['story'] =  {};
  quests['challenge']  = {};
  quests['ex'] = {};
  quests['evils'] = {};
  const fileData = document.getElementById("fileItem").files;
  total = fileData.length
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
    quests[fileName.split("_")[0].toLowerCase()][num] = finalText;
    completed += 1;
    if (completed == total) {
      tabberCombine(downloadIndividually);
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

function tabberCombine(dl) {
  if (document.getElementById("event_type").value == 'tower') {
    tabberCombineTower(dl)
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