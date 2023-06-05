const quests = {story: {}, challenge: {}, ex: {}, evils: {}};
var completed = 0;
var total = 0;
function massConvert(downloadSingle=true) {
  const fileData = document.getElementById("fileItem").files;
  total = fileData.length
  for (let i = 0; i < fileData.length; i++) {
      let Reader = new FileReader;
      Reader.readAsText(fileData[i]);
      Reader.onload = function() {
          convertJSONString(Reader.result, fileData[i].name, downloadSingle);
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

function recordQuest(finalText, fileName) {
    var fileName = fileName.split(".")[0];
    var num = Number(fileName.split("_")[1]);
    quests[fileName.split("_")[0].toLowerCase()][num] = finalText;
    completed += 1;
    if (completed == total) {
      tabberCombine();
    }
}

function tabberCombine() {
  output = "<tabber>\nStory=\n{{#tag:tabber|\n"
  for (let i = 1; i < 41; i++) {
    if (!quests['story'][i]) break;
    output += 'Battle ' + i + '=\n' + '<div style="display:none">\n' + "'''Story Battle " + i + "'''\n" + '</div>\n' + quests['story'][i] + "\n{{!}}-{{!}}\n";
  }
    output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
  + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{MemoPic|EVENT CLEAR MEMO GOES HERE|50px}}\n' + '{{!}}}\n';

    output += '|-|Challenge=\n{{#tag:tabber|\n';
  for (let i = 1; i < 11; i++) {
    output += 'Battle ' + i + '=\n' + '<div style="display:none">\n' + "'''Challenge Battle " + i + "'''\n" + '</div>\n' + quests['challenge'][i] + "\n{{!}}-{{!}}\n";
  }
  output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
  + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Magia Stone|10}}\n' + '{{!}}}\n';

  if (quests['ex']) {
      output += '|-|EX Challenge=\n{{#tag:tabber|\n';
      for (let i = 1; i < 6; i++) {
        output += 'Battle '+ i + '=\n' + '<div style="display:none">\n' + "'''EX Challenge Battle " + i + "'''\n" + '</div>\n' + quests['ex'][i] + "\n{{!}}-{{!}}\n";
      }
      output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
    + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Magia Stone|10}}\n' + '{{!}}}\n';
    }

  if (quests['evils']) {
      output += '|-|Hundred Evils Challenge=\n{{#tag:tabber|\n';
      for (let i = 1; i < 4; i++) {
        output += 'Challenge ' + i + '=\n' + '<div style="display:none">\n' + "'''Hundred Evils Challenge " + i + "'''\n" + '</div>\n' + quests['evils'][i] + '\n{{!}}-{{!}}\n';
      }
      output += '}}\n' + '{{{!}} class="article-table" style="width:100%; border: solid pink 2px"\n'
      + '! style="width:15%; text-align:center"{{!}}Section clear\n' + '{{!}}style="text-align:center" {{!}}{{Inum|Gacha Ticket|1}}\n'
    }
  output += '</tabber>'
  downloadFinalText(output, "final_tabber.")
}