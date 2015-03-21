Nothing to see here
-------------------

This is going to be a simple app that just shows you albums in your music folder.
When you click on it it plays in your default music app perhaps.  Or maybe it plays right there.
Nothing fancy.

All that is here right now, is a module `lastFM.js` that grabs album art from the lastFM API
and 'scan.js' which scans a target folder and retrieves album art and ID3 tags for every track.

I don't think this is useful to anyone yet.

Installation
------------

```
npm install JAForbes/musicapp
```

Usage
-----

```js
var albumArt = require('JAForbes/musicapp/lastFM').getAlbumArt
albumArt('Stone Temple Pilots','Core')
  .then(console.log) //=> "http://userserve-ak.last.fm/serve/_/58203833/Core.png"
```

```js
var scan = require('JAForbes/musicapp/scan')

scan(['.mp3'],'C://Users//James//Music')
  .then(function(albums){
  	var album = albums['C://Users//James//Led Zeppelin//Led Zeppelin IV']
  	album.art //=> "http://userserve-ak.last.fm/serve/_/91166547/Led+Zeppelin+IV+2156+Led+Zeppelin+IV.jpg"

  	var track = album.tracks["01. Black Dog"]
  	track.id3.artist //=> "Led Zeppelin"
  })
```

Or from the CLI

```
 Usage: scan [options]

  Fetch Album Art and Retrieve ID3 info for all the tracks in a target folder.

  Options:

    -h, --help                  output usage information
    -t, --types <mp3,wav,...>   file types of tracks.
    -d --directory <directory>  The directory where your music is stored.  Defaults to <UserHome>/Music
    -p --pretty                 Pretty print the JSON output
```