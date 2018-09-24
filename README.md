# f2mp3c
A simple nodejs command line tool that utilizes [_ffmpeg_](https://ffmpeg.org/) to convert from _.flac_ to _.mp3_. One would usually go the other way, but as Spotify does not support this, I created this script in order to convert a folder containing _.flac_ files to _.mp3_.

## Installation
----
You would need [ffmpeg](https://ffmpeg.org/) and [nodejs](https://nodejs.org) for this to work.
*On windows use chocolatey 👌*

    choco install ffmpeg
    choco install nodejs

## Usage
----
The script is ran by executing the script trough nodejs commandline. The script takes two arguments, the first one the path to the folder where you want to look for files to convert, and the other a boolean indicating weather or not you would like for subfolders to be scanned and converted aswell.

  `node f2mp3c.js "Path to folder" true|false`
