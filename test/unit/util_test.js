/*eslint-env node*/
var expect = require('chai').expect;
var assert = require('chai').assert;
var exec = require('child_process').exec; //allows calling shell scripts as child processes

var testSettings = {
    archiveRoot: "../files/archive",
    temporaryUploadPath: "../files",
    serverPort: 6000,
    directoryNameLength: 2,
    directoryDepth: 3,
    officeSocketIp: "127.0.0.1",
    officeSocketPort: 2220,
    allowedExtensions: {
        jpg: {
            useOriginalAsMaster: false,
            officeConversion: false
        },
        png: {
            useOriginalAsMaster: false,
            officeConversion: false
        },
        gif: {
            useOriginalAsMaster: false,
            officeConversion: false
        },
        jpeg: {
            useOriginalAsMaster: false,
            officeConversion: false
        },
        bmp: {
            useOriginalAsMaster: false,
            officeConversion: false
        },
        ppt: {
            useOriginalAsMaster: true,
            officeConversion: true
        },
        doc: {
            useOriginalAsMaster: true,
            officeConversion: true
        },
        docx: {
            useOriginalAsMaster: true,
            officeConversion: true
        },
        xls: {
            useOriginalAsMaster: true,
            officeConversion: true
        },
        xlsx: {
            useOriginalAsMaster: true,
            officeConversion: true
        },
        pptx: {
            useOriginalAsMaster: true,
            officeConversion: true
        }
    }
};

var fileProcessor23 = require('../../FileProcessor.js')(testSettings);

describe('File processing functions', function () {

    /**
     * Validates and removes the generated pdf file during conversion processes
     * @param {Object}      error       error returned by the conversion process
     * @param {function}    done        mocha done function for compğleting test
     * @param {boolean}     keepPdf     flag for keeping the generated pdf as is
     * @param {string}      addon       addon to file name for using same function more than one operation
     */
    function conversionHandler(error, done, keepPdf, addon) {
        if (error) {
            done(error);
        } else {
            var filename = "../files/office_conversion/test" + addon + ".pdf"
            if (!fs.existsSync(filename)) {
                done(new Error("System did not threw error but the file is not created"));
            } else {
                var stats = fs.statSync(filename);
                if (!keepPdf) {
                    exec("rm -y " + filename, function (error) {
                        if (stats.size > 0) {
                            done(error);
                        } else {
                            done("File created but size is 0 " + (error ? " and generated file can not be removed" : ""));
                        }

                    });
                } else {
                    if (stats.size > 0) {
                        done(error);
                    } else {
                        done();
                    }
                }
            }
        }
    }

    describe('Return storage path function', function () {

        it(' will return desired result on given settings (2*3)', function (done) {
            var result = fileProcessor23.returnStoragePath("ABCDEF123456789");
            assert.equal(result, "AB/CD/EF/ABCDEF123456789");
            done();
        });

        it(' will return desired result on given settings (3*2)', function (done) {
            var clonedSettings = JSON.parse(JSON.stringify(testSettings));
            clonedSettings.directoryNameLength = 3;
            clonedSettings.directoryDepth = 2;
            var fileProcessor32 = require('../../FileProcessor.js')(clonedSettings);
            var result = fileProcessor32.returnStoragePath("ABCDEF123456789");
            assert.equal(result, "ABC/DEF/ABCDEF123456789");
            done();
        });
    });

    describe('Check file function', function () {

        it('will fail on empty file descriptor', function (done) {
            var result = fileProcessor23.checkFileContent(null, testSettings.allowedExtensions)
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "File not received");
            done();
        });

        it('will fail on missing file', function (done) {
            var result = fileProcessor23.checkFileContent({path: "/some/unexpected/path"}, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "Uploaded file can not be accessed");
            done();
        });

        it('will fail on missing destination', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "EBYS.jpg"
            };
            delete correctValue.destination;
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "Missing file information");
            done();
        });

        it('will fail on missing filename', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "EBYS.jpg"
            };
            delete correctValue.filename;
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "Missing file information");
            done();
        });

        it('will fail on missing original name', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "EBYS.jpg"
            };
            delete correctValue.originalname;
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "Missing file information");
            done();
        });

        it('will fail on empty extension', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "jpg"
            };
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "File type not allowed");
        });

        it('will fail on not allowed extension', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "EBYS.xcf"
            };
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.not.exist;
            assert.equal(result.type, "error");
            assert.equal(result.message, "File type not allowed");
        });

        it('will not fail on correct information', function (done) {
            var correctValue = {
                path: "../files/EBYS.jpg",
                destination: "../files/",
                filename: "EBYS.jpg",
                originalname: "EBYS.jpg"
            };
            var result = fileProcessor23.checkFileContent(correctValue, testSettings.allowedExtensions);
            expect(result.message).to.exist;
            expect(result.extension).to.exist;
            assert.equal(result.type, "ok");
            assert.equal(result.extension, "jpg");
        });

    });

    describe('Move file function', function () {

        it(' will fail when original file is not found', function (done) {
            fileProcessor23.moveUploadedFile(function (error) {
                    if (error) {
                        done();
                    } else {
                        done(new Error("Process did not throw error"));
                    }
                }, "/srv/non/existing/folder", "/srv/another/non/existing/folder", "test",
                "ABCDECBS09654324561712", "jpg");
        });

        it(' will not fail on correct information', function (done) {
            fileProcessor23.moveUploadedFile(function (error) {
                    if (error) {
                        done(error);
                    } else {
                        if (!fs.existsSync("../files/archive/ABCDECBS09654324561712.jpg") || fs.existsSync("../files/image_conversion/test.jpg")) {
                            done(new Error("No error raised but file has not been moved"));
                        }
                        //put back the file
                        fileProcessor23.moveUploadedFile(function (error) {
                                if (error) {
                                    done(error);
                                } else {
                                    if (fs.existsSync("../files/archive/ABCDECBS09654324561712.jpg") || !fs.existsSync("../files/image_conversion/test.jpg")) {
                                        done(new Error("No error raised but file has not been moved"));
                                    } else {
                                        done();
                                    }
                                }
                            }, "../files/archive", "../files/image_conversion",
                            "ABCDECBS09654324561712", "test", "jpg")
                    }
                }, "../files/image_conversion", "../files/archive", "test",
                "ABCDECBS09654324561712", "jpg");
        });
    });


    describe('Convert using office function', function () {

        it(' will fail when original file is not found', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                if (error) {
                    done();
                } else {
                    done(new Error("Process did not throw error"));
                }
            }, "/srv/non/existing/folder/test.doc");
        });

        it(' will not fail on ppt file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.ppt");
        });

        it(' will not fail on pptx file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.pptx");
        });

        it(' will not fail on doc file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.doc");
        });

        it(' will not fail on docx file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.docx");
        });

        it(' will not fail on xls file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.xls");
        });

        it(' will not fail on xlsx file', function (done) {
            fileProcessor23.convertUsingOffice(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/office_conversion/test.xlsx");
        });

    });

    describe('Convert using imagemagick function', function () {

        it(' will fail when original file is not found', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                if (error) {
                    done();
                } else {
                    done(new Error("Process did not throw error"));
                }
            }, "/srv/non/existing/folder/test.jpg", "/srv/non/existing/folder/test.pdf");
        });

        it(' will not fail on jpg file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.jpg", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on jpeg file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.jpeg", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on bmp file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.bmp", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on gif file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.gif", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on png file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.png", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on tif file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, false, "");
            }, "../files/image_conversion/test.tif", "../files/image_conversion/test.pdf");
        });

        it(' will not fail on tiff file', function (done) {
            fileProcessor23.convertUsingImageMagick(function (error) {
                conversionHandler(error, done, true, "");
            }, "../files/image_conversion/test.tiff", "../files/image_conversion/test.pdf");
        });
    });


    describe('Compress PDF using imagemagick function', function () {

        it(' will fail when original file is not found', function (done) {
            fileProcessor23.compressPdf(function (error) {
                if (error) {
                    done();
                } else {
                    done(new Error("Process did not throw error"));
                }
            }, "/srv/non/existing/folder/test.pdf", "/srv/non/existing/folder/test_usage.pdf");
        });

        it(' will not fail on correct information', function (done) {
            fileProcessor23.compressPdf(function (error) {
                conversionHandler(error, done, true, "_usage");
            }, "../files/image_conversion/test.pdf", "../files/image_conversion/test_usage.pdf");
        });

    });


    describe('Create thumbnail using imagemagick function', function () {
        it(' will fail when original file is not found', function (done) {
            fileProcessor23.compressPdf(function (error) {
                if (error) {
                    done();
                } else {
                    done(new Error("Process did not throw error"));
                }
            }, "/srv/non/existing/folder/test_usage.pdf", "/srv/non/existing/folder/test_thumb.pdf");
        });

        it(' will not fail on correct information', function (done) {
            fileProcessor23.compressPdf(function (error) {
                conversionHandler(error, done, true, "_thumb");
            }, "../files/image_conversion/test_usage.pdf", "../files/image_conversion/test_thumb.pdf");
        });
    });


    describe('Remove obsolete file function', function () {

        it(' will remove the correct file on do not use original as master', function (done) {
            exec("cp ../files/image_conversion/test.doc ../files/image_conversion/test_1.doc", function (error) {
                if (error) {
                    done(error);
                } else {
                    fileProcessor23.removeObsoleteFile(function (error) {
                        if (error) {
                            done(error);
                        } else {
                            if (fs.existsSync("../files/image_conversion/test_1.doc")) {
                                done(new Error("System did not threw error but the file is not deleted"));
                            } else {
                                done();
                            }
                        }
                    }, "../files/image_conversion/test_1.doc", "../files/image_conversion/test.pdf", false);
                }
            });

        });

        it(' will remove the correct file on use original as master', function (done) {
            fileProcessor23.removeObsoleteFile(function (error) {
                if (error) {
                    done(error);
                } else {
                    if (fs.existsSync("../files/image_conversion/test.pdf")) {
                        done(new Error("System did not threw error but the file is not deleted"));
                    } else {
                        done();
                    }
                }
            }, "../files/image_conversion/test.doc", "../files/image_conversion/test.pdf", false);
        });


        it(" will remove the usage copy of the pdf", function (done) {
            exec("rm -y ../files/image_conversion/test_usage.pdf", function (error) {
                done(error);
            });
        });
    });


});
