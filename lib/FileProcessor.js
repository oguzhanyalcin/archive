/*eslint-env node*/
var mkdirp = require('mkdirp'); //creates directories recursively
var async = require('async'); //allows ordering async tasks
var exec = require('child_process').exec; //allows calling shell scripts as child processes
var fs = require('fs'); //enables file system functions
var winston = require('winston');//for profiling
var path = require('path');//enables path based operations
var crypto=require('crypto');//enables crypto operations


//==========================CONVERSION SETTINGS=========================================================//
var officeConversionScript = "unoconv --connection 'socket,host=127.0.0.1,port=2220,tcpNoDelay=1;urp;StarOffice.ComponentContext' -f pdf ";
var imageMagickCompressPdfScript = " -compress Group4 -quality 100 -units PixelsPerInch -density 600 ";
//================================================================================================//

module.exports = function (settings) {
    return {

        /**
         * Checks whether the passed file object have all the constraints for operation
         * @param   {Object}    file                multer file information which needs to be verified
         * @param   {Object}    allowedExtensions   allowed extensions from settings
         * @returns {String}    result.type         type of the result(error/ok)
         * @returns {String}    result.message      error message
         * @returns {String}    result.extension    extension of the file
         */
        checkFileContent: function (file, allowedExtensions) {
            if (!file) {
                return {type: "error", message: "File not received"};
            }
            if (!fs.existsSync(file.path)) {
                return {type: "error", message: "Uploaded file can not be accessed"};
            }
            if (!file.destination || !file.filename || !file.originalname) {
                return {type: "error", message: "Missing file information"};
            }
            if (file.originalname.lastIndexOf("\.") === -1) {
                return {type: "error", message: "File must have an extension"};
            }
            var extension = path.extname(file.originalname);
            if (!extension || !allowedExtensions[extension.substr(1)]) {
                return {type: "error", message: "File type not allowed"};
            }
            return {type: "ok", extension: extension.substr(1)};
        },


        /**
         * Renames the uploaded file according to the given hash preserving the extension
         * @param {function}    callback        async.js callback function
         * @param {string}      origin          path the uploaded file is located
         * @param {string}      destination     path the uploaded file will be moved
         * @param {string}      filename        name of the file
         * @param {string}      hash            calculated hash for the file
         * @param {string}      extension       original extension of the file
         */
        moveUploadedFile: function (callback, origin, destination, filename, hash, extension) {
            winston.profile("office_convert");
            exec('mv ' + origin + "/" + filename + " " + destination + "/" + hash + "." + extension, function (error) {
                callback(error);
            });
        },
        /**
         * Creates a PDF instance of the uploaded file using soffice convertor.
         * If the original file is not notified as kept than it will be removed with this function.
         * @param {function}    callback                async.js callback function
         * @param {string}      originalFileLocation    current file
         */
        convertUsingOffice: function (callback, originalFileLocation) {
            winston.profile("office_convert");
            exec(officeConversionScript + originalFileLocation, function (error) {
                winston.profile("office_convert");
                callback(error);
            });
        },

        /**
         * Creates a pdf file from given input file(probably image file)
         * @param {function}    callback                async.js callback function
         * @param {string}      originalFile            current file
         * @param {string}      targetFile              target pdf file address
         */
        convertUsingImageMagick: function (callback, originalFile, targetFile) {
            winston.profile("image_convert");
            exec("convert " + originalFile + " " + targetFile, function (error) {
                winston.profile("image_convert");
                callback(error);
            });
        },

        /**
         * Compresses the file for creating usage copy of PDF
         * @param {function}    callback                async.js callback function
         * @param {string}      originalFile    current file
         */
        compressPdf: function (callback, originalFile, targetFile) {
            winston.profile("compress");
            exec("convert " + originalFile + imageMagickCompressPdfScript + targetFile, function (error) {
                winston.profile("compress");
                callback(error);
            });
        },
        /**
         * Creates an image from the very first page of the created PDF files.
         * @param {function}    callback        async.js callback function
         * @param {string}      originalFile    current file
         */
        createThumbnail: function (callback, originalFile, targetFile) {
            winston.profile("thumbnail");
            exec("convert " + originalFile + "[0] " + targetFile, function (error) {
                winston.profile("thumbnail");
                callback(error);
            });
        },

        /**
         * Last step of storing the file. There are two master files stored on the filesystem.
         * This will delete one of them according to the useOriginalAsMaster parameter.
         * @param {function}    callback                async.js callback function
         * @param {string}      originalFile            original file posted to the server
         * @param {string}      masterPdfFile           first conversion of the file
         * @param {boolean}     useOriginalAsMaster     if true pdf is deleted, otherwise original file is deleted
         */
        removeObsoleteFile: function (callback, originalFile, masterPdfFile, useOriginalAsMaster) {
            exec("rm -f " + (useOriginalAsMaster ? masterPdfFile : originalFile), function (error) {
                callback(error);
            });
        },
        /**
         * Returns the target folder of a file with given hash
         * @param   {string}  hash      md5 hash of the file
         * @returns {string}            final destination that the file will be saved
         */
        returnStoragePath: function (hash) {
            var regex = new RegExp("[\\s\\S]{1," + settings.directoryNameLength + "}", "g");
            var length = settings.directoryNameLength * settings.directoryDepth;
            var parts = hash.toUpperCase().substring(0, length).match(regex) || [];
            parts.push(hash.toUpperCase());
            return parts.join("/");
        },

        /**
         * The main function for upload process, method body have been moved under a function
         * for implementing a testable functionality without need of express.js
         * @param {Object}      file                multer file content
         * @param {function}    resultCallback      a callback function for handling response(first parameter status code, second is message to be returned)
         */
        processFile: function (file, resultCallback) {
            var checkResult = this.checkFileContent(file, settings.allowedExtensions);
            if (checkResult.type === "error") {
                resultCallback(400, checkResult.message);
                return;
            }
            var extension = checkResult.extension;
            var master = this;
            var md5sum = path.basename(file.path, "." + checkResult.extension);

            crypto.pseudoRandomBytes(16, function (err, raw) {
                if (err) return resultCallback(500, err);
                if (md5sum.length !== 32) {
                    md5sum = raw.toString('hex').toUpperCase()
                }
                var targetPath = settings.archiveRoot + "/" + master.returnStoragePath(md5sum);
                mkdirp(
                    targetPath,
                    function (error) {
                        if (error) {
                            resultCallback(500, error);
                            return;
                        }
                        var tasks = [];
                        tasks.push(function (callback) {
                            master.moveUploadedFile(callback, file.destination, targetPath, file.filename, md5sum, extension);
                        });
                        if (extension != "pdf") {
                            if (settings.allowedExtensions[extension].officeConversion === true) {
                                tasks.push(function (callback) {
                                    master.convertUsingOffice(callback, targetPath + "/" + md5sum + "." + extension);
                                });
                            } else {
                                tasks.push(function (callback) {
                                    master.convertUsingImageMagick(callback, targetPath + "/" + md5sum + "." + extension, targetPath + "/" + md5sum + ".pdf");
                                });
                            }
                        }
                        tasks.push(function (callback) {
                            master.compressPdf(callback, targetPath + "/" + md5sum + ".pdf", targetPath + "/" + md5sum + "_usage.pdf");
                        });
                        tasks.push(function (callback) {
                            master.createThumbnail(callback, targetPath + "/" + md5sum + "_usage.pdf", targetPath + "/" + md5sum + "_thumb.jpg");
                        });

                        if (extension != "pdf") {
                            tasks.push(function (callback) {
                                master.removeObsoleteFile(callback, targetPath + "/" + md5sum + "." + extension, targetPath + "/" + md5sum + ".pdf", settings.allowedExtensions[extension].useOriginalAsMaster);
                            });
                        }
                        async.series(tasks, function (error) {
                            if (error) {
                                resultCallback(400, error);
                                return;
                            }
                            resultCallback(200, md5sum);
                        });
                    }
                );
            });
        }
    };
};
