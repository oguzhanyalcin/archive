var express = require('express');//loads the express.js library
var app = express();//initializes an express app
var crypto = require('crypto');//for creating hashes
var fs = require('fs');//enables file system functions
var multer = require('multer');//enables uploading files
var mkdirp = require('mkdirp');//creates directories recursively

try {
    var settings = JSON.parse(fs.readFileSync('./settings.json'));
} catch (ex){
    console.log(ex);
   return;
}

//setting check starts
if(!settings.directoryDepth || settings.directoryDepth<1){
    console.log("Directory depth param (directoryDepth) must be set and must be bigger than 0");
    return;
}

if(!settings.directoryNameLength || settings.directoryNameLength<1){
    console.log("Directory name length param (directoryNameLength) must be set and must be bigger than 0");
    return;
}



//setting check ends
var upload = multer({dest: settings.temporaryUploadPath});




app.post('/', upload.single('archiveFile'), function (req, res) {
    if (req.files.archiveFile) {
        var md5sum = crypto.createHash('md5').update(req.file.buffer).digest('hex');
        var extension = req.file.originalname.substr(req.file.originalname.lastIndexOf("\.") + 1);
        mkdirp(settings.archiveRoot+"/"+returnStoragePath(md5sum),function(error){

        });

    }

});

app.get('/', function (req, res) {
    var hash = req.hash;
    var size = req.size;


});

function returnStoragePath(hash){
    var regex=new RegExp("[\\s\\S]{1,"+settings.directoryNameLength+"}","g");
    var length=settings.directoryNameLength * settings.directoryDepth;
    var parts = hash.toUpperCase().substring(0,length).match(regex) || [];
    var folder =parts.join("/");

}



var server = app.listen(settings.serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('SIMPLE FILE ARCHIVE STARTED SERVING... ');
    console.log('');
    console.log('______________________  SETTINGS  ______________________');
    console.log('');
    console.log('Server Address       : %s:%s',host,port);
    console.log('Archive Root         : '+ settings.archiveRoot);
    console.log('Upload Path          : '+ settings.temporaryUploadPath);
    console.log('Directory Length     : '+ settings.directoryNameLength);
    console.log('Directory Depth      : '+ settings.directoryDepth);
    console.log('Supoorted File Types : '+Object.keys(settings.allowedExtensions).join());
    console.log('________________________________________________________');
    console.log('');

    console.log('!!!CAUTION!!! DO NOT CHANGE THE SETTINGS AFTER FIRST RUN');

});