/*eslint-env node*/
var expect = require('chai').expect;
var assert = require('chai').assert;
var fs = require('fs');
var module = require('../../index.js');
var fileProcessor = require('../../lib/FileProcessor.js')(module.settings);
var service = require('supertest')(module.app);

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

    var key = 0;

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

    function checkDownloadResult(error, response, done,type,extension) {
        if (error) {
            done(err);
            return;
        }
        assert.ok(Buffer.isBuffer(response.body));
        fs.writeFile(__dirname + "/../files/tmp/download", response.body, function (error) {
            if (error) {
                return done(error);
            }
            var addon=type===1?"_usage":(type===2?"_thumb":"")
            exec("cmp --silent " + __dirname + "/../files/archive/" + files[key].hash + addon+"."+(module.settings.allowedExtensions[extension].useOriginalAsMaster?extension:"pdf") + " "+__dirname + "/../files/tmp/download", function (error) {
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
     */
    function controlFiles(callback, status, message, extension) {
        assert.equal(status, 200);
        assert.equal(message.length, 32);
        files[key].md5 = message;
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
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "jpg");
                    });
            });

            it('will upload and store jpeg ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "jpeg");
                    });
            });

            it('will upload and store bmp ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "bmp");
                    });
            });


            it('will upload and store png ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "png");
                    });
            });


            it('will upload and store tif ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "tiff");
                    });
            });


            it('will upload and store gif ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "gif");
                    });
            });

            it('will upload and store doc ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "doc");
                    });
            });

            it('will upload and store docx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "docx");
                    });
            });

            it('will upload and store xls ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "xls");
                    });
            });

            it('will upload and store xlsx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "xlsx");
                    });
            });

            it('will upload and store ppt ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "ppt");
                    });
            });
            it('will upload and store pptx ', function (done) {
                service.post("/")
                    .attach('archiveFile', __dirname + '/../files/' + files[key++].path)
                    .send()
                    .expect(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        controlFiles(done, res.status, res.body.message, "pptx");
                    });
            });
        });

    describe('Download service ', function () {

        key = 0;

        it(' will download the master copy of jpg', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"jpg");
                });
        });

        it(' will download the usage copy of jpg', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"jpg");
                });
        });

        it(' will download the thumbnail of jpg', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"jpg");
                });
            key++;
        });

        it(' will download the master copy of jpeg', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"jpeg");
                });
        });

        it(' will download the usage copy of jpeg', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"jpeg");
                });
        });

        it(' will download the thumbnail of jpeg', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"jpeg");
                });
            key++;
        });

        it(' will download the master copy of bmp', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"bmp");
                });
        });

        it(' will download the usage copy of bmp', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"bmp");
                });
        });

        it(' will download the thumbnail of bmp', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"bmp");
                });
            key++;
        });


        it(' will download the master copy of png', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"png");
                });
        });

        it(' will download the usage copy of png', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"png");
                });
        });

        it(' will download the thumbnail of png', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"png");
                });
            key++;
        });


        it(' will download the master copy of tif', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"tif");
                });
        });

        it(' will download the usage copy of tif', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"tif");
                });
        });

        it(' will download the thumbnail of tif', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"tif");
                });
            key++;
        });

        it(' will download the master copy of tiff', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"tiff");
                });
        });

        it(' will download the usage copy of tiff', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"tiff");
                });
        });

        it(' will download the thumbnail of tiff', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"tiff");
                });
            key++;
        });

        it(' will download the master copy of gif', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"gif");
                });
        });

        it(' will download the usage copy of gif', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"gif");
                });
        });

        it(' will download the thumbnail of gif', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"gif");
                });
            key++;
        });

        it(' will download the master copy of doc', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"doc");
                });
        });

        it(' will download the usage copy of doc', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"doc");
                });
        });

        it(' will download the thumbnail of doc', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"doc");
                });
            key++;
        });
        it(' will download the master copy of docx', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"docx");
                });
        });

        it(' will download the usage copy of docx', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"docx");
                });
        });

        it(' will download the thumbnail of docx', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"docx");
                });
            key++;
        });

        it(' will download the master copy of xls', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"xls");
                });
        });

        it(' will download the usage copy of xls', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"xls");
                });
        });

        it(' will download the thumbnail of xls', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"xls");
                });
            key++;
        });
        it(' will download the master copy of xlsx', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"xlsx");
                });
        });

        it(' will download the usage copy of xlsx', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"xlsx");
                });
        });

        it(' will download the thumbnail of xlsx', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"xlsx");
                });
            key++;
        });

        it(' will download the master copy of ppt', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"ppt");
                });
        });

        it(' will download the usage copy of ppt', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"ppt");
                });
        });

        it(' will download the thumbnail of ppt', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"ppt");
                });
            key++;
        });
        it(' will download the master copy of pptx', function (done) {
            service.get("/" + files[key].hash + "/0")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,0,"pptx");
                });
        });

        it(' will download the usage copy of pptx', function (done) {
            service.get("/" + files[key].hash + "/1")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,1,"pptx");
                });
        });

        it(' will download the thumbnail of pptx', function (done) {
            service.get("/" + files[key].hash + "/2")
                .expect(200)
                .parse(binaryParser)
                .end(function (err, res) {
                    checkDownloadResult(err, res, done,2,"pptx");
                });
            key++;
        });
        


    });
});