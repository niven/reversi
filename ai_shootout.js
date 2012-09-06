var gamesToPlay = 10;

function load( generations ) {
    for(var i=0; i<generations; i++) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "gen_" + i + ".js";
        head.appendChild(script);
    }
}

var canvas;

function shootout( generations ) {
    
    
    var scale = 5/6;
   	canvas = document.getElementById("board");
	var ctx = canvas.getContext("2d");

	var h = document.body.clientHeight * scale;
	var w = h; // make it square, and height is usually the limiting factor
	
    // Get a good width/height given the screen size
	canvas.width = w;
	canvas.height = h;
 
    var matrix = document.createElement("table");
    var header = document.createElement("tr");
    var iHead = document.createElement("th");
    iHead.appendChild( document.createTextNode("left vs top") );
    header.appendChild(iHead);
    for(var i=0; i<generations; i++) {
        iHead = document.createElement("th");
        iHead.appendChild( document.createTextNode(i) );
        header.appendChild(iHead);
    }
    matrix.appendChild(header);
        
    for(var i=0; i<generations; i++) {

        var iVersusJ = document.createElement("tr");
        
        for(var j=0; j<=i; j++) {

            if( j==0 ){
                var who = document.createElement("td");
                who.appendChild( document.createTextNode(i) );
                iVersusJ.appendChild(who);

            }
            log("Running generation " + i + " against " + j);
            var result = fight(i, j); // percentage wins for i vs j
            var resTD = document.createElement("td");
            resTD.appendChild(document.createTextNode( ((Math.floor(result*100*100))/100) + "%" ));
            
            iVersusJ.appendChild( resTD );
        }    
        matrix.appendChild(iVersusJ);
    }    
    
    document.getElementsByTagName("body")[0].appendChild( matrix );
}

var board;
function fight(a, b) {
    
   
    state = new GameState();

    board = new BoardGUI(canvas, state);
    board.init();
    board.paint();
    
    // play randomly selected light/dark
    var aColor = Math.random() < 0.5 ? piece.dark : piece.light;
    
    computerA = new AI( a, aColor );
    computerB = new AI( b, other(aColor) );

    // dark starts
    var currentPlayer = aColor == piece.dark ? computerA : computerB;

    while( state.moveLeftFor( currentPlayer.piece ) ) {
        
   		var move = currentPlayer.makeMove();
		state.play(move.x, move.y, currentPlayer.piece);
        board.paint();
        
		// other guys turn
        currentPlayer = currentPlayer == computerA ? computerB : computerA;
        
        if( !state.moveLeftFor(currentPlayer) ) {
            currentPlayer = currentPlayer == computerA ? computerB : computerA;
        }
    }
    
    // noboday can make more moves, either board full or no moves possible
    log("score A " + state.count(computerA.piece) + " score B: " + state.count(computerB.piece) );

    return Math.random();
}



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