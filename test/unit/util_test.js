var expect = require('chai').expect;
var assert = require('chai').assert;
var chance = require('chance')();

var testSettings = {
    archiveRoot: "/srv/uploads",
    temporaryUploadPath: "/srv/tmp",
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

        it(' will fail when original file is dnot found', function (done) {

        });

        it(' will fail when destination is read only', function (done) {

        });

        it(' will not fail on correct information', function (done) {

        });
    });


    describe('Convert using office function', function () {

        it(' will fail when original file is not found', function (done) {

        });

        it(' will not fail on ppt file', function (done) {

        });

        it(' will not fail on pptx file', function (done) {

        });

        it(' will not fail on doc file', function (done) {

        });

        it(' will not fail on docx file', function (done) {

        });

        it(' will not fail on xls file', function (done) {

        });

        it(' will not fail on xlsx file', function (done) {

        });


    });


    describe('Convert using imagemagick function', function () {

        it(' will fail when original file is not found', function (done) {

        });

        it(' will not fail on jpg file', function (done) {

        });

        it(' will not fail on jpeg file', function (done) {

        });

        it(' will not fail on bmp file', function (done) {

        });

        it(' will not fail on gif file', function (done) {

        });

        it(' will not fail on png file', function (done) {

        });

        it(' will not fail on tif file', function (done) {

        });

        it(' will not fail on tiff file', function (done) {

        });

    });


    describe('Compress PDF using imagemagick function', function () {

        it(' will fail when original file is not found', function (done) {

        });

        it(' will not fail on correct information', function (done) {

        });

    });


    describe('Create thumbnail using imagemagick function', function () {
        it(' will fail when original file is not found', function (done) {

        });

        it(' will not fail on correct information', function (done) {

        });
    });


    describe('Remove obsolete file function', function () {

        it(' will remove the correct file on use original as master', function (done) {

        });

        it(' will remove the correct file on do not use original as master', function (done) {

        });
    });


    describe('Return storage path function', function () {

        it(' will return desired result on given settings (2*3)', function (done) {
            var result=fileProcessor23.returnStoragePath("ABCDEF123456789");
            assert.equal(result,"AB/CD/EF/ABCDEF123456789");
            done();
        });

        it(' will return desired result on given settings (3*2)', function (done) {
            var clonedSettings = JSON.parse(JSON.stringify(testSettings));
            clonedSettings.directoryNameLength = 3;
            clonedSettings.directoryDepth = 2;
            var fileProcessor32 = require('../../FileProcessor.js')(clonedSettings);
            var result=fileProcessor32.returnStoragePath("ABCDEF123456789");
            assert.equal(result,"ABC/DEF/ABCDEF123456789");
            done();
        });
    });
});

