/*eslint-env node*/
var routes=require('./index.js');
var settings=routes.settings;
var logger=routes.logger;
var app=routes.app;

//==========================CHECK SETTINGS=========================================================//
if (!settings.directoryDepth || settings.directoryDepth < 1) {
    logger.log('error',"Directory depth param (directoryDepth) must be set and must be bigger than 0");
    return;
}

if (!settings.directoryNameLength || settings.directoryNameLength < 1) {
    logger.log('error',"Directory name length param (directoryNameLength) must be set and must be bigger than 0");
    return;
}
//================================================================================================//


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
