var R = require('ramda')
var Promise = require('bluebird')

var _ = require('lodash')
var path = require('path')
var id3 = require('id3js')
var ID3_OPEN_LOCAL = id3.OPEN_LOCAL
	id3 = Promise.promisify(id3)

var voyager = require('voyager')
var albumArt = require('./lastFM').getAlbumArt
var traverse = require('./traverse')

var addTrack = function(album,file_name,ext,id3){
	return album.tracks[file_name] = {
		ext: ext,
		id3: id3
	}
}

var addAlbumArt = function(album){
	var track = _.sample(album.tracks)

	return albumArt(track.id3.artist, track.id3.album)
		.then( function(url){
			return album.art = url
		})
}


var addAlbumArts = function(albums){

	return Promise.settle(
		_.map(albums,addAlbumArt)
	).then(R.always(albums))
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

var scan = function(file_types,scan_directory){

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
	var program = require('commander')

	program
		.description("Fetch Album Art and Retrieve ID3 info for all the tracks in a target folder.")
		.option("-t, --types <mp3,wav,...>", "file types of tracks.", R.split(','))
		.option("-d --directory <directory>","The directory where your music is stored.  Defaults to <UserHome>/Music")
		.option("-p --pretty", "Pretty print the JSON output")
		.parse(process.argv)

	var default_path = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '\\' + 'Music'
	var music_folder = program.directory || default_path;
	var track_file_types = program.types || ['.mp3']

	var stringify = program.pretty ? R.partialRight(JSON.stringify,null,2) : JSON.stringify

	scan(track_file_types, music_folder)
		.then(stringify)
		.then(console.log,console.error)
}

module.exports = scan