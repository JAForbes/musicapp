Nothing to see here
-------------------

This is going to be a simple app that just shows you albums in your music folder.
When you click on it it plays in your default music app perhaps.  Or maybe it plays right there.
Nothing fancy.

All that is here right now, is a module `lastFM.js` that grabs album art from the lastFM API

Installation
------------

```
npm install JAForbes/musicapp
```

Usage
-----

```js
var albumArt = require('JAForbes/musicapp').getAlbumArt
albumArt('Stone Temple Pilots','Core')
  .then(console.log) //=> "http://userserve-ak.last.fm/serve/_/58203833/Core.png"
```

