//==========================LOAD EXTERNAL LIBRARIES===============================================//
var express = require('express'); //loads the express.js library
var app = express(); //initializes an express app
var fs = require('fs'); //enables file system functions
var multer = require('multer'); //enables uploading files
//================================================================================================//

//==========================LOAD SETTINGS=========================================================//
var settings;
try {
    settings = JSON.parse(fs.readFileSync('./settings.json'));
} catch (ex) {
    console.log(ex);
    return;
}
var upload = multer({dest: settings.temporaryUploadPath}); //enable upload functionality
var fileProcessor = require('./FileProcessor.js')(settings);//File processing helper
var downloadOptions={
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};
//================================================================================================//

//==========================CHECK SETTINGS=========================================================//
if (!settings.directoryDepth || settings.directoryDepth < 1) {
    console.log("Directory depth param (directoryDepth) must be set and must be bigger than 0");
    return;
}

if (!settings.directoryNameLength || settings.directoryNameLength < 1) {
    console.log("Directory name length param (directoryNameLength) must be set and must be bigger than 0");
    return;
}
//================================================================================================//


/**
 * Receives the file upload using multer. The file must be posted in a multipart form.
 * The name of the file field must be archiveFile. With multer the file will be stored in a path
 * and information will be stored in req.file field. Business flow is as follows:
 * - If file extension is not stored in settings.allowedExtensions cancel the process
 * - Create md5 hash of the file content
 * - Gather file extension
 * - Create the folder according to the md5 hash
 * - convert file to pdf, according to the extension use imagemagick or libreoffice
 * - create a thumbnail and compressed PDF for daily usage
 * - put watermark if setting is active
 * - return the hash of the file
 */
app.post('/', upload.single('archiveFile'), function (request, response) {
    fileProcessor.processFile(request.file, function (status, message) {
        response.type('json').status(status).send({message: message}).end();
    });
});

/**
 * This route gets two parameters as input. First one is hash of the file that is requested.
 * The second one is the size of the file (0-master,1-usage,2-thumbnail)
 * checks the hash and tries to find the file. If no file is found then returns error.
 */
app.get('/:hash/:size', function (request, res) {
    var hash = request.params.hash;
    var size=request.params.size || 0;
    if(!hash || hash.length!=32){
        response.type('json').status(400).send({message: "Hash not recognized"}).end();
        return;
    }
    var extraInfo=size==1?"_usage":(size==2?"_thumb":"");
    var path=fileProcessor.returnStoragePath(hash);
    fs.readdir(path,function(error,files){
        if(error){
            console.log('XXX File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + path + ' Error is: '+error);
            response.type('json').status(error.status).end();
            return;
        }
        var files=files.filter(function (file) {
            return  file.startsWith("/"+hash+extraInfo) && fs.statSync(file).isFile() ;
        }).map(function (file) {
            return path.join(path, file);
        });
        if(!files || file.length===0){
            console.log('XXX File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + path);
            response.type('json').status(error.status).end();
            return;
        }
        response.sendFile(files[0],downloadOptions,function(error){
            if(error){
                console.log('XXX File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + path + ' Error is: '+error);
                response.type('json').status(error.status).end();
                return;
            }
        });
    });
});

//=================================SERVER INIT SCRIPT=============================================//
var server = app.listen(settings.serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('SIMPLE FILE ARCHIVE STARTED SERVING... ');
    console.log('');
    console.log('______________________  SETTINGS  ______________________');
    console.log('');
    console.log('Server Address       : %s:%s', host, port);
    console.log('Archive Root         : ' + settings.archiveRoot);
    console.log('Upload Path          : ' + settings.temporaryUploadPath);
    console.log('Directory Length     : ' + settings.directoryNameLength);
    console.log('Directory Depth      : ' + settings.directoryDepth);
    console.log('Supported File Types : ' + Object.keys(settings.allowedExtensions).join());
    console.log('________________________________________________________');
    console.log('');

    console.log('!!!CAUTION!!! DO NOT CHANGE THE SETTINGS AFTER FIRST RUN');

});
//================================================================================================//