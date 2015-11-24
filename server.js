var app=require('./index.js');

//=================================SERVER INIT SCRIPT=============================================//
app.listen(settings.serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger.log('info','SIMPLE FILE ARCHIVE STARTED SERVING... ');
    logger.log('info','');
    logger.log('info','______________________  SETTINGS  ______________________');
    logger.log('info','');
    logger.log('info','Server Address       : %s:%s', host, port);
    logger.log('info','Archive Root         : ' + settings.archiveRoot);
    logger.log('info','Upload Path          : ' + settings.temporaryUploadPath);
    logger.log('info','Directory Length     : ' + settings.directoryNameLength);
    logger.log('info','Directory Depth      : ' + settings.directoryDepth);
    logger.log('info','Supported File Types : ' + Object.keys(settings.allowedExtensions).join());
    logger.log('info','________________________________________________________');
    logger.log('info','');

    logger.log('info','!!!CAUTION!!! DO NOT CHANGE THE SETTINGS AFTER FIRST RUN');

});
//================================================================================================//
