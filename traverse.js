var type = function(val){
  return ({}).toString.call(val).slice(8,-1)
}

var traverse = function(cb,target){

	var results = []
	var stack = []

	while( target ){

	  results.push(cb(target))

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
	return results;
}

module.exports = traverse;