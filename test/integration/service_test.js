/*eslint-env node*/
var expect = require('chai').expect;
var assert = require('chai').assert;
var fs = require('fs');
var module = require('../../index.js');
var fileProcessor = require('../../lib/FileProcessor.js')(module.settings);
var service = require('supertest')(module.app);
var exec = require('child_process').exec; //allows calling shell scripts as child processes

describe('Folder Type REST services ', function () {

    var files = [
        {path: "image_conversion/test.jpg", filename: "test.jpg", folder: "image_conversion"},
        {path: "image_conversion/test.jpeg", filename: "test.jpeg", folder: "image_conversion"},
        {path: "image_conversion/test.bmp", filename: "test.bmp", folder: "image_conversion"},
        {path: "image_conversion/test.png", filename: "test.png", folder: "image_conversion"},
        {path: "image_conversion/test.tif", filename: "test.tif", folder: "image_conversion"},
        {path: "image_conversion/test.tiff", filename: "test.tiff", folder: "image_conversion"},
        {path: "image_conversion/test.gif", filename: "test.gif", folder: "image_conversion"},
        {path: "office_conversion/test.doc", filename: "test.doc", folder: "office_conversion"},
        {path: "office_conversion/test.docx", filename: "test.docx", folder: "office_conversion"},
        {path: "office_conversion/test.xls", filename: "test.xls", folder: "office_conversion"},
        {path: "office_conversion/test.xlsx", filename: "test.xlsx", folder: "office_conversion"},
        {path: "office_conversion/test.ppt", filename: "test.ppt", folder: "office_conversion"},
        {path: "office_conversion/test.pptx", filename: "test.pptx", folder: "office_conversion"}
    ];

    /**
     * parses the response stream which contains the file
     * @param {object}  res
     * @param callback
     */
    function binaryParser(res, callback) {
        res.setEncoding('binary');
        res.data = '';
        res.on('data', function (chunk) {
            res.data += chunk;
        });
        res.on('end', function () {
            callback(null, new Buffer(res.data, 'binary'));
        });
    }

    /**
     * controls the results of download file process
     * @param {Object}      error       error  object returned by the request
     * @param {Object}      response    response returned by the request
     * @param {function}    done        callback for mocha tests
     * @param {number}      type        size of the requested image
     * @param {string}      extension   extension of the file
     * @param {number}      localKey    key od the file in the files array
     */
    function checkDownloadResult(error, response, done,type,extension,localKey) {
        if(error){
            return done(error);
        }
        assert.equal(200,response.status);
        assert.ok(Buffer.isBuffer(response.body));
        fs.writeFile(__dirname + "/../files/tmp/download", response.body, function (error) {
            if (error) {
                return done(error);
            }
            var addon=type===1?"_usage.pdf":(type===2?"_thumb.jpg":("."+(module.settings.allowedExtensions[extension].useOriginalAsMaster?extension:"pdf")));
            exec("cmp --silent " + module.settings.archiveRoot + "/" + fileProcessor.returnStoragePath(files[localKey].hash) +"/"+files[localKey].hash+ addon+" "+__dirname + "/../files/tmp/download", function (error) {
                var masterError = error;
                exec("rm -f " + __dirname + "/../files/tmp/download", function (error) {
                    done((masterError ? masterError : error));
                });
            });
        });
    }

    /**
     * controls successful result from the process file method
     * @param {function} callback   callback function for mocha
     * @param {number}   status     response status
     * @param {string}   message    message returned from function
     * @param {string}   extension  extension of the current file processed
     * @param {number}   localKey   localKey of the file in the files array
     */
    function controlFiles(callback, status, message, extension,localKey) {
        assert.equal(status, 200);
        assert.equal(message.length, 32);
        files[localKey].hash = message;
        var path = module.settings.archiveRoot + "/" + fileProcessor.returnStoragePath(message);
        var originalFile = path + "/" + message + "." + (module.settings.allowedExtensions[extension].useOriginalAsMaster ? extension : "pdf");
        var usageFile = path + "/" + message + "_usage.pdf";
        var thumbFile = path + "/" + message + "_thumb.jpg";
        var errors = []
        if (!fs.existsSync(originalFile)) {
            errors.push(new Error("System did not threw error, but the original file is not created"));
        }
        if (!fs.existsSync(usageFile)) {
            errors.push(new Error("System did not threw error but the usage file is not created"));
        }
        if (!fs.existsSync(thumbFile)) {
            errors.push(new Error("System did not threw error but the thumb file is not created"));
        }
        if (errors.length > 0) {
            console.log(errors);
            callback(errors[0]);
        } else {
            callback();
        }
    }

    describe('Upload service ',
        function () {

            it('will upload and store jpg ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[0].path)
                    .end()
                    .expect(function (res) {
                        controlFiles(done, res.status, res.body.message, "jpg",0);
                    });
            });

            it('will upload and store jpeg ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[1].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "jpeg",1);
                    });
            });

            it('will upload and store bmp ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[2].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "bmp",2);
                    });
            });


            it('will upload and store png ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[3].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "png",3);
                    });
            });


            it('will upload and store tif ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[4].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "tif",4);
                    });
            });

            it('will upload and store tiff ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[5].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "tiff",4);
                    });
            });


            it('will upload and store gif ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[6].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "gif",6);
                    });
            });

            it('will upload and store doc ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[7].path)
                    .end()
                    .expect(function (res) {
                        controlFiles(done, res.status, res.body.message, "doc",7);
                    });
            });

            it('will upload and store docx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[8].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "docx",8);
                    });
            });

            it('will upload and store xls ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[9].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "xls",9);
                    });
            });

            it('will upload and store xlsx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[10].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "xlsx",10);
                    });
            });

            it('will upload and store ppt ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[11].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "ppt",11);
                    });
            });
            it('will upload and store pptx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[12].path)
                    .end()
                    .expect(function ( res) {
                        controlFiles(done, res.status, res.body.message, "pptx",12);
                    });
            });
        });

    describe('Download service ', function () {


        it(' will download the master copy of jpg', function (done) {
            service.get("/" + files[0].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"jpg",0);
                });
        });

        it(' will download the usage copy of jpg', function (done) {
            service.get("/" + files[0].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"jpg",0);
                });
        });

        it(' will download the thumbnail of jpg', function (done) {
            service.get("/" + files[0].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"jpg",0);
                });

        });

        it(' will download the master copy of jpeg', function (done) {
            service.get("/" + files[1].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"jpeg",1);
                });
        });

        it(' will download the usage copy of jpeg', function (done) {
            service.get("/" + files[1].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"jpeg",1);
                });
        });

        it(' will download the thumbnail of jpeg', function (done) {
            service.get("/" + files[1].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"jpeg",1);
                });
        });

        it(' will download the master copy of bmp', function (done) {
            service.get("/" + files[2].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"bmp",2);
                });
        });

        it(' will download the usage copy of bmp', function (done) {
            service.get("/" + files[2].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"bmp",2);
                });
        });

        it(' will download the thumbnail of bmp', function (done) {
            service.get("/" + files[2].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"bmp",2);
                });
        });


        it(' will download the master copy of png', function (done) {
            service.get("/" + files[3].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"png",3);
                });
        });

        it(' will download the usage copy of png', function (done) {
            service.get("/" + files[3].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"png",3);
                });
        });

        it(' will download the thumbnail of png', function (done) {
            service.get("/" + files[3].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"png",3);
                });
        });


        it(' will download the master copy of tif', function (done) {
            service.get("/" + files[4].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"tif",4);
                });
        });

        it(' will download the usage copy of tif', function (done) {
            service.get("/" + files[4].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"tif",4);
                });
        });

        it(' will download the thumbnail of tif', function (done) {
            service.get("/" + files[4].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"tif",4);
                });
        });

        it(' will download the master copy of tiff', function (done) {
            service.get("/" + files[5].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"tiff",5);
                });
        });

        it(' will download the usage copy of tiff', function (done) {
            service.get("/" + files[5].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"tiff",5);
                });
        });

        it(' will download the thumbnail of tiff', function (done) {
            service.get("/" + files[5].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"tiff",5);
                });
        });

        it(' will download the master copy of gif', function (done) {
            service.get("/" + files[6].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"gif",6);
                });
        });

        it(' will download the usage copy of gif', function (done) {
            service.get("/" + files[6].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"gif",6);
                });
        });

        it(' will download the thumbnail of gif', function (done) {
            service.get("/" + files[6].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"gif",6);
                });
        });

        it(' will download the master copy of doc', function (done) {
            service.get("/" + files[7].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"doc",7);
                });
        });

        it(' will download the usage copy of doc', function (done) {
            service.get("/" + files[7].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"doc",7);
                });
        });

        it(' will download the thumbnail of doc', function (done) {
            service.get("/" + files[7].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"doc",7);
                });
        });
        it(' will download the master copy of docx', function (done) {
            service.get("/" + files[8].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"docx",8);
                });
        });

        it(' will download the usage copy of docx', function (done) {
            service.get("/" + files[8].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"docx",8);
                });
        });

        it(' will download the thumbnail of docx', function (done) {
            service.get("/" + files[8].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"docx",8);
                });
        });

        it(' will download the master copy of xls', function (done) {
            service.get("/" + files[9].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"xls",9);
                });
        });

        it(' will download the usage copy of xls', function (done) {
            service.get("/" + files[9].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"xls",9);
                });
        });

        it(' will download the thumbnail of xls', function (done) {
            service.get("/" + files[9].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"xls",9);
                });
        });
        it(' will download the master copy of xlsx', function (done) {
            service.get("/" + files[10].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"xlsx",10);
                });
        });

        it(' will download the usage copy of xlsx', function (done) {
            service.get("/" + files[10].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"xlsx",10);
                });
        });

        it(' will download the thumbnail of xlsx', function (done) {
            service.get("/" + files[10].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"xlsx",10);
                });
        });

        it(' will download the master copy of ppt', function (done) {
            service.get("/" + files[11].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"ppt",11);
                });
        });

        it(' will download the usage copy of ppt', function (done) {
            service.get("/" + files[11].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"ppt",11);
                });
        });

        it(' will download the thumbnail of ppt', function (done) {
            service.get("/" + files[11].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"ppt",11);
                });
        });
        it(' will download the master copy of pptx', function (done) {
            service.get("/" + files[12].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,0,"pptx",12);
                });
        });

        it(' will download the usage copy of pptx', function (done) {
            service.get("/" + files[12].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,1,"pptx",12);
                });
        });

        it(' will download the thumbnail of pptx', function (done) {
            service.get("/" + files[12].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err,res) {
                    checkDownloadResult(err, res, done,2,"pptx",12);
                });

        });
        


    });
});