var express = require('express');//loads the express.js library
var app = express();//initializes an express app
var crypto = require('crypto');//for creating hashes
var fs = require('fs');//enables file system functions
var multer = require('multer');//enables uploading files
var mkdirp = require('mkdirp');//creates directories recursively
var async=require('async');//allows ordering async tasks

// load settings
try {
    var settings = JSON.parse(fs.readFileSync('./settings.json'));
} catch (ex) {
    console.log(ex);
    return;
}

//setting check starts
if (!settings.directoryDepth || settings.directoryDepth < 1) {
    console.log("Directory depth param (directoryDepth) must be set and must be bigger than 0");
    return;
}

if (!settings.directoryNameLength || settings.directoryNameLength < 1) {
    console.log("Directory name length param (directoryNameLength) must be set and must be bigger than 0");
    return;
}

//setting check ends


var upload = multer({dest: settings.temporaryUploadPath});


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
app.post('/', upload.single('archiveFile'), function (req, res) {
    if (req.file) {
        var extension = req.file.originalname.substr(req.file.originalname.lastIndexOf("\.") + 1);
        if(!settings.allowedExtensions[extension]){
            res.type('json').status(400).send({message:"File type not allowed"}).end();
        }
        var md5sum = crypto.createHash('md5').update(req.file.buffer).digest('hex');
        var path=settings.archiveRoot + "/" + returnStoragePath(md5sum);
        mkdirp(
            path,
            function (error) {
                if (error) {
                    res.type('json').status(500).send({message:error}).end();
                    return;
                }
                var tasks=[];
                if(settings.allowedExtensions[extension].officeConversion===true){
                    tasks.push(convertUsingOffice);
                }else{
                    tasks.push(convertUsingImageMagick);
                }
                tasks.push(compressPdf);
                tasks.push(createThumbnail);
                async.waterfall(tasks,function(error){
                    if(error){
                        res.type('json').status(400).send({message:error}).end();
                        return;
                    }
                    res.type('json').status(200).send({message:md5sum}).end();
                });
            }
        );
    }
    res.type('json').status(400).send({message:"File not received"}).end();
});

/**
 * Returns the target folder of a file with given hash
 * @param   {string}  hash  md5 hash of the file
 * @returns {string}  final destination that the file will be saved
 */
function returnStoragePath(hash) {
    var regex = new RegExp("[\\s\\S]{1," + settings.directoryNameLength + "}", "g");
    var length = settings.directoryNameLength * settings.directoryDepth;
    var parts = hash.toUpperCase().substring(0, length).match(regex) || [];
    return parts.join("/");
}

function convertUsingOffice(callback,currentPath,targetPath){
    callback(null,targetPath);
}

function convertUsingImageMagick(callback,currentPath,targetPath){
    callback(null,targetPath);
}

function compressPdf(callback,pdfPath){
    callback(null,compressedPdfPath);
}

function createThumbnail(callback,pdfPath){
    callback(null);
}

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