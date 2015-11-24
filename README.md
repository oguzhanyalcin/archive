[![Build Status](https://travis-ci.org/oguzhanyalcin/archive.svg)](https://travis-ci.org/oguzhanyalcin/archive) [![Code Climate](https://codeclimate.com/repos/565382bf2ddb7b003e007fd5/badges/50557e4e01a9110697e5/gpa.svg)](https://codeclimate.com/repos/565382bf2ddb7b003e007fd5/feed)  [![Test Coverage](https://codeclimate.com/repos/565382bf2ddb7b003e007fd5/badges/50557e4e01a9110697e5/coverage.svg)](https://codeclimate.com/repos/565382bf2ddb7b003e007fd5/coverage)

# File Service #

This is a simplistic file save and retrieve service written in NodeJS.

### What does it do? ###

* Receives the posted file
* Converts the file to PDF using [imagemagick](http://www.imagemagick.org/script/index.php) and [Libre Office](https://www.libreoffice.org/)
* Resizes the file to different sizes(Master copy, working copy and thumbnail), for legislative alignment in Turkey (TSE-13298)

### Functionalities ###

* Convert office and image files to PDF
* Compress PDF files for daily usage
* Add watermark
* Dynamic folder organization for fast file access
* Minimum finger print
* Serve desired copy of the file

### Libraries below must be installed on the server ###

* [ImageMagick](http://www.imagemagick.org/script/index.php)
* [Libre Office](https://www.libreoffice.org/) or [Open Office](https://www.openoffice.org/)
* [Uno Conv](https://github.com/dagwieers/unoconv)