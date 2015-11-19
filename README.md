# File Service #

This is a simplistic file save and retrieve service written in NodeJS.

### What does it do? ###

* Receives the posted file
* Converts the file to PDF using [imagemagick](http://www.imagemagick.org/script/index.php) and [Libre Office](https://www.libreoffice.org/)
* Resizes the file to different sizes(Master copy, working copy and thumbnail), for legislative alignment in Turkey (TSE-13298)