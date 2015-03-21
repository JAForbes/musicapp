var Promise = require('bluebird')
var R = require('ramda')
var _ = require('lodash')
var path = require('path')
var id3 = require('id3js')
var ID3_OPEN_LOCAL = id3.OPEN_LOCAL
	id3 = Promise.promisify(id3)

var voyager = require('voyager')
var albumArt = require('./lastFM').getAlbumArt
var traverse = require('./traverse')

var sample = function(val){
	var keys = Object.keys(val)
	var n = keys.length;
	var key = keys[Math.floor(n*Math.random())]
	return val[key]
}

var addTrack = function(album,file_name,ext,id3){
	return album.tracks[file_name] = {
		ext: ext,
		id3: id3
	}
}

var addAlbumArt = function(album){
	var track = sample(album.tracks)

	var artist = track.id3.artist;
	var album = track.id3.album;

	return albumArt(artist, album)
		.then( function(url){
			return album.art = url
		})
}


addAlbumArts = function(albums){

	return Promise.settle(
		_.map(albums,addAlbumArt)
	)
}

var buildAlbums = function(file_types, tree){

	//Create a flat list of all directories that have mp3's in them
	var albums = {}

	var addID3IfNotDirectory = function(level){

		var parsed = path.parse(level.name)
		var ext = parsed.ext
		var isFile = file_types.some(R.eq(ext))

		if(isFile){

			var album = albums[parsed.dir] = albums[parsed.dir] || { tracks: {} }

			return id3({ file: level.name, type: ID3_OPEN_LOCAL })
				.then( addTrack.bind(0,album,parsed.name,ext) )
		}
	}

	return Promise.settle(
		traverse(addID3IfNotDirectory,tree)
	)
	.then(R.always(albums))
}

scan = function(file_types,scan_directory){

	return voyager({
	  tree: { name: scan_directory },
	  relevance: 0,
	  file_relevance: 0,
	  directory_relevance: 0

	})
	.then(buildAlbums.bind(0,file_types))
	.then(addAlbumArts)


}

if(require.main == module){
	scan(['.mp3'],'C:/Users/James/Music')
		.then(JSON.stringify)
		.then(console.log,console.error)
}

module.exports = scan