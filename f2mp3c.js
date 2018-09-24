var fs = require( 'fs' );
var path = require( 'path' );
var f2m = require("flac-to-mp3")
var exec = require('child_process').exec;
// In newer Node.js versions where process is already global this isn't necessary.
var process = require( "process" );

function getExtension(file){
    var name = file.split(".");
    return name[name.length - 1].toLowerCase()
}

function readDir(dir, readSubDir){
    var toConvert = [];
    var files = fs.readdirSync(dir);
    files.forEach(function(file, index){
        var filePath = path.join(dir, file);
        var stat = fs.statSync(filePath);
        if(stat.isFile()){
            var extension = getExtension(file);
            if (extension == "flac"){
                toConvert.push(filePath);
                console.info("Added " + filePath + " to convertion queue");
            }
        } else if(stat.isDirectory()){
            console.info("Found sub dir: " + filePath);
            if (readSubDir){
                readDir(filePath, readSubDir).forEach((val) => toConvert.push(val));
            }
        }
    });
    return toConvert;
}

function convertFiles(files, deleteOld){
    console.info("-----------------------------------------------------------------------------------");
    console.info(`Converting ${files.length} files`);
    console.info("-----------------------------------------------------------------------------------");
    
    function getNextFile(){
        if(files.length > 1){
            return files.pop();
        } else return false;
    }
    
    function convertFile(file){
        var ext = getExtension(file);
        var convertion = exec(`ffmpeg -i ${file} -vn -ar 44100 -ac 2 -ab 192k -f mp3 ${file.substring(0, file.length - ext.length)}mp3 -y`);
        process.stdout.write(`Converting: ${file} - 0% \r`);
        var duration = 1;
        var time = 1;
        var durationIdentifyer = "Duration: ";
        var timeIndentifyer = "time=";
        var reportPorgress = function(data){
            var lines = data.split(/\r?\n/);
            lines.forEach((line, index) => {
                if(line.indexOf(durationIdentifyer) != -1) {
                    var durationData = line.split(",")[0].split(durationIdentifyer)[1];
                    var d = durationData.split(":");
                    duration = ((d[0] * 60 + d[1]) * 60 + d[2]);
                }
                if(line.indexOf(timeIndentifyer) != -1){
                    var timeData = line.split(timeIndentifyer)[1].split(" ")[0];
                    var t = timeData.split(":");
                    time = ((t[0] * 60 + t[1]) * 60 + t[2]);
                }
            });
            var progress = Math.ceil(((time * 100) / duration) * 10) / 10;
            process.stdout.write(`Converting[${progress}%]: ${file} \r`);
        }
        convertion.stdout.on('data',(data) => reportPorgress(data));
        convertion.stderr.on('data', (data) => reportPorgress(data));
        convertion.on('close', function(code) {
            process.stdout.write(`File: ${file} - converted \n`);
            var next = getNextFile();
            if(next) convertFile(next);
        });
    }

    var next = getNextFile();
    if (next) convertFile(next);
}

var toScann = process.argv[2].toString();
var scanSubDirs = process.argv[3] || true;
var deleteOld = process.argv[4] || false;
console.info("-----------------------------------------------------------------------------------");
console.info(`Scanning:  ${toScann} ${scanSubDirs ? "with sub dirs" : "without sub dirs"}`);
console.info("-----------------------------------------------------------------------------------");
var toConvert = readDir(toScann, scanSubDirs);
convertFiles(toConvert, deleteOld);
