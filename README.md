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