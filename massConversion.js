function massConvert()
{
    const fileData = document.getElementById("fileItem").files;
    
    for (let i = 0; i < fileData.length; i++) {
        let Reader = new FileReader;
        Reader.readAsText(fileData[i]);
        Reader.onload = function() {
            convertJSONString(Reader.result, fileData[i].name);
          };
      }
}

function downloadFinalText(finalText, fileName)
{
    var fileName = fileName.split(".")[0] + "_wiki.txt"
    let currentFile = new File([finalText], fileName);
    let downloadURL = window.URL.createObjectURL(currentFile);
    let downloader = document.createElement('a');
    downloader.href = downloadURL;
    downloader.download = fileName;
    downloader.click();
    URL.revokeObjectURL(downloadURL);
}