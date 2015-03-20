var Promise = require('bluebird')
var fs = require('fs')
var readdir = Promise.promisify(fs.readdir)
var R = require('ramda')
var P = R.pipeP
var voyager = require('voyager')
var path = require('path')

var id3 = require('id3js')

var scan_directories = ['C:/Users/James/Music']
var file_types = ['.mp3']
albumArt = require('./lastFM').getAlbumArt

//albumArt('Stone Temple Pilots','Core').then(console.log)

traverse = function(target,cb){

	var type = function(val){
	  return ({}).toString.call(val).slice(8,-1)
	}
	var stack = []
	while( target ){
	  cb(target)
	  for(var key in target){
	    var child = target[key]
	    var Tchild = type(child)
	    if(Tchild == 'Object'){
	      stack.push(child)
	    }
	    if(Tchild == 'Array'){
	    	for(var i = 0; i < child.length; i++){
	    		stack.push(child[i])
	    	}
	    }

	  }
	  target = stack.shift()
	}
}


var scan_directory = 'C:/Users/James/Music'

voyager({

  // Tree data structure.  `name` property is the starting path
  // Best to leave this alone and just change the os cwd
  // defaults to './'

  tree: { name: scan_directory },
  relevance: 0,
  file_relevance: 0,
  directory_relevance: 0

}).then(function(tree){
	//Create a flat list of all directories that have mp3's in them
	var albums = {}
	var called = []
	var promises = []
	traverse(tree, function(level){
		var parsed = path.parse(level.name)
		var ext = parsed.ext
		var isFile = file_types.some(R.eq(ext))
		if(isFile){
			var album = albums[parsed.dir] = albums[parsed.dir] || { tracks: {} }

			var promise = new Promise(function(resolve,reject){
				id3({ file: level.name, type: id3.OPEN_LOCAL }, function(err, id3){

					err && reject(err)
					resolve(album.tracks[parsed.name] = {
						ext: ext,
						id3: id3
					})
				})
			})
			promises.push(promise)

		}
	})

	return Promise.all(promises)
		.then(function(){
			return albums
		})

})
.then(function(albums){

	var promises = []
	for(var album_path in albums){
		var album = albums[album_path]
		var track;
		for(var key in album.tracks){
			track = album.tracks[key];
			break;
		}
			var promise = albumArt(track.id3.artist,track.id3.album)
				.then((function(album,url){
					return album.art = url
				}).bind(null,album))

		promises.push(promise)
	}
	return Promise.settle(promises).then(function(){
		return JSON.stringify(albums)
	})
})
.then(console.log,console.error)

