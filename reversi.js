var size = 8;

var board;
var computer;
var state;

/*
    Log text to the "chat window" and also the console log.
    This is where you send stuff you need the player to see
 */
function log(str) {

	console.log(str);
	var logDiv = document.getElementById("log");
	var msg = document.createElement("p");
	msg.appendChild(document.createTextNode(str));
	logDiv.appendChild(msg);
	
	// scroll bottom of div into view
	logDiv.scrollTop = logDiv.scrollHeight;
}

/*
    Main entry point: creates AI with specified generation, makes board, state, sets up canvas.
 */
function start(generation) {
    
    log("Start at generation: " + generation);

    state = new GameState();
   // console.log(state.dot());
    computer = new AI( generation );

    var scale = 5/6;
   	var canvas = document.getElementById("board");
	var ctx = canvas.getContext("2d");

	var h = document.body.clientHeight * scale;
	var w = h; // make it square, and height is usually the limiting factor
	
    // Get a good width/height given the screen size
	canvas.width = w;
	canvas.height = h;

    board = new BoardGUI(canvas, state);
    board.init();
    board.paint();
    
    var vl = document.getElementById("visual_log");
    vl.style.width = 1.35 * canvas.width / board.snapshot_factor;
    
    // make a snaphot of the start position for the visual movelog
    vlog();
    
	canvas.onclick = processClick;

}

/*
    Only point of player input: when it's the players turn, accept that move if possible the run AI
 */
function processClick( clickEvent ) {
    
    if( !state.playerTurn ) {
        log("Not your turn");
        return;
    }
		  
    state.playerTurn = false;
  
	var canvasX = clickEvent.clientX - this.offsetLeft;
	var canvasY = clickEvent.clientY - this.offsetTop;
	
	var x = Math.floor( canvasX / (this.width / size) );
	var y = Math.floor( canvasY / (this.height / size) );
	
	if( state.isLegalMove(x, y, state.playerPiece) ) {
	   state.play(x, y, state.playerPiece);
	   board.paint();
	   vlog();
	   
	   var AICanMove = state.moveLeftFor(state.AIPiece);
	   if( !AICanMove && !state.moveLeftFor(state.playerPiece)  ) { // field full or no more legal moves
	       doResult();
	   } else if( !AICanMove ) {
	   	log("AI can't move, passing to you");
	   	state.playerTurn = true;
	   } else {
	   	console.log("Still moves possible");
	   	window.setTimeout(doAI, 800);	
	   }
	   
	   
	      	   	   
	} else {
	   log("Illegal move (" + x +"," + y +")");
	   state.playerTurn = true; // keep the turn bro
	}
	
}

/*
    When the game is over, find out who won or if it is a tie.
 */
function doResult() {
	log("Game finished");

    var cd = state.count( piece.dark );
    var cl = state.count( piece.light );
	log("Dark score: " + cd );
	log("Light score: " + cl );

    if( cd == cl ) {
        log("It's a tie");
    } else if( cd > cl ) {
        log("Dark wins");
    } else {
        log("Light wins");
    }

}

// add a snapshot to the visual log
function vlog() {

    var vl = document.getElementById("visual_log");
    
    var pic = board.snapshot();
    vl.appendChild(pic);
    
    // scroll bottom of div into view
	vl.scrollTop = vl.scrollHeight;
}

/*
    Request the AI move and make it, check if the AI keeps the turn if player has no legal moves reamining.
 */
function doAI() {
		var move = computer.makeMove();
		state.play(move.x, move.y, state.AIPiece);
	   	board.paint();
	   	vlog();
	   	var playerCanMove = state.moveLeftFor(state.playerPiece);
	   	if( !playerCanMove && !state.moveLeftFor(state.AIPiece) ) {
	   		doResult();
	   	} else if( !playerCanMove ){
	   		log("No move possible for you");
	   		window.setTimeout(doAI, 2000);// give player time to consider	 
	   	}  else {
	   		state.playerTurn = true;	 
	   	}
}

var piece = { dark: 1, light: 2 };

function other( color ) {
    return color == piece.dark ? piece.light : piece.dark;
}

// define the neighbours of each square as compass points
var directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

/*
    Square that a piece can occupy and its neighbours
 */
function Square(index) {

    this.index = index;

    this.piece = null;
    
    this.w = null;
    this.e = null;
    this.n = null;
    this.s = null;
    
    this.nw = null;
    this.sw = null;
    this.se = null;
    this.ne = null;
    
}

Square.prototype.toString = function() {

	return this.index + ":" + (this.piece == piece.dark ? "D" : ( this.piece == piece.light ? "L" : "[]"));
	
}

Square.prototype.getX = function() {
    return this.index % size;
}

Square.prototype.getY = function() {
    return Math.floor(this.index / size);
}

/*
    Sets up the board data structure and has methods to query the board.
 */
function GameState() {
    
    this.squares = new Array( size*size );

    for(var i=0; i<size*size; i++) {
        this.squares[i] = new Square(i);
    }
    
    // set up links from each square to each of its neighbours
    for(var s=0; s<size*size; s++) {
        var sq = this.squares[s];
        // any north neighbor?
        if( s > size-1 ) {
            sq.n = this.squares[s-size];
        }
        // any south neighbor?
        if( s < size*(size-1) ) {
            sq.s = this.squares[s+size];
        }
        // any west neighbor?
        if( s % size > 0 ) {
            sq.w = this.squares[s-1];
        }
        // any east neighbor?
        if( s % size != size-1 ) {
            sq.e = this.squares[s+1];
        }
        // any nw neighbor?
        if( s > size && s % size > 0 ) {
            sq.nw = this.squares[ (s-1) - size]; // west and north
        }
        // any sw neighbor?
        if( s < size*(size-1) && s % size > 0 ) {
            sq.sw = this.squares[ (s-1) + size]; // west and south
        }
        // any se neighbor?
        if( s < size*(size-1) && s % size != size-1 ) {
            sq.se = this.squares[ (s+1) + size]; // east and south
        }
        // any ne neighbor?
        if( s > size-1 && s % size != size-1 ) {
            sq.ne = this.squares[ (s+1) - size]; // east and north
        }
    }
        
    // initial setup
    this.squares[3*size + 3].piece = piece.light;
    this.squares[4*size + 4].piece = piece.light;
    this.squares[3*size + 4].piece = piece.dark;
    this.squares[4*size + 3].piece = piece.dark;
    
    this.playerPiece = piece.dark;
    this.AIPiece = piece.light;
    
    this.playerTurn = true;
    
}

GameState.prototype.play = function(x, y, color) {
    this.squares[x + y*size].piece = color;
	this.flipDiscs(x, y);
}

/*

	Dark must place a piece with the dark side up on the board, 
	in such a position that there exists at least one straight (horizontal, vertical, or diagonal) 
	occupied line between the new piece and another dark piece (the ANCHOR), 
	with one or more contiguous light pieces between them. (so not just adjacent)

 */
GameState.prototype.isLegalMove = function(x, y, pieceColor) {

	// first check if the space is free at all
    if( this.squares[x + y*size].piece != null ) {
//    	console.log("square already taken");
    	return false;
    }
    
    // check if there are any adjacent pieces
    if( !this.hasNeighbours(x, y) ) {
//    	console.log("No neighbors");
    	return false;
    }
    
    // get chains for each direction, and see if there is an anchor with at least 1 other color in between
    var isLegal = false;
    directions.forEach(function(dir){
    
    	var chain = this.getChain(x, y, dir);
    	chain.shift(); // remove the initial element (where you clicked)
//    	console.log("Chain for (" + x + "," + y + ") "+ (x + y*size) + "in " + dir + " = " + chain);
    	// check if this chain has <othercolor> n times followed by <mycolor>
    	var others = 0;
    	var current;
    	while( chain.length > 0 ) {
    		current = chain.shift();
    		if( current.piece != null && current.piece != pieceColor ) {
    			others++;
    		} else {
    			break;
    		}
    	}
//    	console.log("Othercolors in chain: " + others);
    	if( others > 0 ) { // at least some other pieces, and then something
//    		console.log("some intermediate others, current = ",  current.toString());
    		if( current.piece != null && current.piece == pieceColor ) {
//    		console.log("RET TR");
    			isLegal = true; // anchor found, bail out with success
    			return;
    		}
    	}
    	
    }, this);
    
    return isLegal; // no valid anchor
    
}

GameState.prototype.getLegalMoves = function( color ) {
    
    var empty = state.squares.filter(function(s){ return s.piece == null } );
    
    // to cut down on all the isLegalMove calls: squares with no neighbours are never legal
    empty = empty.filter(function(s){ 
		return this.hasNeighbours( s.getX(), s.getY() );
    }, this);

    return empty.filter(function(s){
        
        return this.isLegalMove( s.getX(), s.getY(), color);
        
    }, this);

}

// get all the chains and flip everything
GameState.prototype.flipDiscs = function(x, y) {
  	
  	var toColor = this.squares[x + size*y].piece; // this is what we change stuff into
//	console.log("Changing intermediates to " + (toColor == piece.dark ? "Dark" : "Light") );

    directions.forEach(function(dir){
	   	var chain = this.getChain(x, y, dir);
  		
 		chain.shift(); // this is the piece we placed
 		// gather potential flips
 		var discsToFlip = [];
 		while( chain.length > 0 && chain[0].piece != null && chain[0].piece != toColor ) {
 			discsToFlip.push( chain.shift() );
 		}
 		// check for anchor
 		if( chain.length > 0 && chain[0].piece != null && chain[0].piece == toColor ) {
// 			console.log("Chain has anchor, proceed to flip");
 			discsToFlip.forEach(function(d){ d.piece = toColor });
 		}
 		
	}, this);
}

/*
    Returns true if the specified square has any neighbours at all
 */
GameState.prototype.hasNeighbours = function(x, y) {

	var s = this.squares[x + y*size];
	return directions.some(function(dir){ return s[dir] != null && s[dir].piece != null });
}

/*
    Dump a .dot string for the game board links for debugging
 */
GameState.prototype.dot = function() {
    var dot = "digraph {\n";
    for(var s=0; s<size*size; s++) {
        var sq = this.squares[s];
        directions.forEach(function(d){
            if( sq[d] != null ) {
                dot += s + " -> " + sq[d].index + "\n";
            }
        });
    }
    return dot + "}";
}

/* 
    Returns all the squares starting from (x,y) in the given direction. 
    (includes the (x,y) start point   
 */
GameState.prototype.getChain = function(x, y, direction) {

    var out = [];    
    var current = this.squares[x + y*size];
    //console.log("Start chain at " + x + "," + y + ": " + current.index + " in dir " + direction);   
    do {
        out.push(current);        
        current = current[direction];
    } while( current != null );
    
    return out;
}

/*
    Check if there is a possible move left for color.
 */
GameState.prototype.moveLeftFor = function(color) {
	
	// check for all full
	var empty = this.squares.filter(function(s){ return s.piece == null } );
	if( empty.length == 0 ) {
		log("BOARD FULL");
		return false;
	}

	// check if any of the empty squares are valid moves for color
	while( empty.length > 0 ) {
	
		var s = empty.pop();
		var x = s.index % 8;
		var y = Math.floor( s.index/8 );
//		console.log("moveLeftFor " +x + "," +y +": " + s.index);
		if( this.isLegalMove(x, y, color) ) {
			return true;
		}
	}

    return false;
}

/*
    Return the number of pieces of color on the board
 */
GameState.prototype.count = function( color ) {
    return this.squares.filter(function(s){ return s.piece == color }).length;
}

// feedback that something is going on
var banter = ["Thinking cold, unhuman thoughts. . .", "Reticulating splines. . .", "Optimizing vertices. . .", "Flipping bits. . . "];
var strats = [];
var strategy_description = [];
function AI( generation ) {
    
    this.generation = generation;
    
}

AI.prototype.makeMove = function() {

	log(banter[Math.floor(Math.random()*banter.length)]);

	return strats[ this.generation ]( state );

	console.log("AI moved");

}
