var R = require('ramda')
var Promise = require('Promise')
var request = Promise.denodeify(require('request'))



var get = {

	json: function(url){
		return request(url)
			.then(R.get('body'))
			.then(JSON.parse)
	}

}

var lastFM = {

	_albumArt: R.pipe(
		R.get('album'),
		R.get('image'),
		R.last,
		R.get('#text')
	),

	q: require('querystring').stringify,

	_lastFMurl: function (artist,album){
		var method = album && 'album' || 'artist'
		return "http://ws.audioscrobbler.com/2.0/?" + this.q({
			format: 'json',
			api_key: '4cb074e4b8ec4ee9ad3eb37d6f7eb240',
			method: (album && 'album' || 'artist') + '.getinfo',
			artist: artist,
			album: album
		})
	},
	getAlbumArt: function(artist,album){
		return Promise.resolve(
			this._lastFMurl(artist,album)
		)
			.then(get.json)
			.then(this._albumArt)
	}
}



module.exports = {
	getAlbumArt: lastFM.getAlbumArt.bind(lastFM)
}
