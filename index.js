/*eslint-env node*/
//==========================LOAD EXTERNAL LIBRARIES===============================================//
var express = require('express'); //loads the express.js library
var app = express(); //initializes an express app
var fs = require('fs'); //enables file system functions
var multer = require('multer'); //enables uploading files
var path=require('path');//enables path based operations
var crypto=require('crypto');//enables crypto operations
var winston = require('winston');//enable logging
var logger = new(winston.Logger)({
    exitOnError: false,
    transports: [
        new (winston.transports.File)({
            filename: __dirname + '/logs/server.log',
            maxFiles: 50,
            maxsize: 1024*1024,
            json:false
        }),
        new(winston.transports.Console)({
            colorize: true
        })
    ]
});
//================================================================================================//

//==========================LOAD SETTINGS=========================================================//
var settings;
try {
    settings = JSON.parse(fs.readFileSync('./settings.json'));
} catch (ex) {
    logger.log('error',ex);
    return;
}

var storage = multer.diskStorage({
    destination: settings.temporaryUploadPath,
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex').toUpperCase() + path.extname(file.originalname))
        })
    }
});
var upload = multer({storage: storage}); //enable upload functionality
var fileProcessor = require('./lib/FileProcessor.js')(settings);//File processing helper
var downloadOptions={
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
};
//================================================================================================//

//====================================ROUTES======================================================//
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
app.get('/:hash/:size', function (request, response) {
    var hash = request.params.hash;
    var size=request.params.size || 0;
    if(!hash || hash.length!=32){
        response.type('json').status(400).send({message: "Hash not recognized"}).end();
        return;
    }
    var extraInfo=size==1?"_usage":(size==2?"_thumb":"");
    var localPath=settings.archiveRoot+"/"+fileProcessor.returnStoragePath(hash);
    fs.readdir(localPath,function(error,files){
        if(error){
            logger.log('error','File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + localPath + ' Error is: '+error);
            response.type('json').status(error.status).end();
            return;
        }
        var filesToProcess=files.filter(function (file) {
            return  size==0?!file.startsWith(hash+"_"):file.startsWith(hash+extraInfo) ;
        }).map(function (file) {
            return path.join(localPath, file);
        });
        if(!filesToProcess || filesToProcess.length===0){
            logger.log('error','File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + localPath+' Error is: File not found');
            response.type('json').status(error.status).end();
            return;
        }
        response.sendFile(filesToProcess[0],downloadOptions,function(error){
            if(error){
                logger.log('error','File cannot be served with information Hash: '+hash + ' Size:'+size+' under path: ' + localPath + ' Error is: '+error);
                response.type('json').status(error.status).end();
                return;
            }
        });
    });
});
//================================================================================================//
module.exports={
    app:app,
    logger:logger,
    settings: settings
};
