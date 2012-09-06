var gamesPerFight = 10; // how many games per face-off
var waitTime = 20; // millis

function load( generations ) {
    for(var i=0; i<=generations; i++) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "gen_" + i + ".js";
        head.appendChild(script);
    }
}

var canvas;
var results;
var state;
var sim = {
	"computer": { "a": null, "b": null},
	"currentPlayer": null,
	"board": null,
	"wins": { "a": 0, "b": 0},
	"games": 0
};

function shootout( generations ) {
    
    
    var scale = 5/6;
   	canvas = document.getElementById("board");
	var ctx = canvas.getContext("2d");

	var h = document.body.clientHeight * scale;
	var w = h; // make it square, and height is usually the limiting factor
	
    // Get a good width/height given the screen size
	canvas.width = w;
	canvas.height = h;
 
 	// run a bunch of sims
 	// now this looks weird, but it allows us to chain stuff together using window.setTimeout 
 	// so the browser has the time to render board states
 	generation_count = generations;
 	generation_a = 0;
 	generation_b = 0;
 	results = [];
 	
 	gameSetup( sim, generation_a, generation_b);
 	runSim(); // will call stuff and end up calling showResultsTable()
 	
}

function gameSetup( sim, genA, genB ) {

	state = new GameState();
		
	sim.board = new BoardGUI(canvas, state);
	sim.board.init();
	sim.board.paint();
		
		
	// play randomly selected light/dark
	var aColor = Math.random() < 0.5 ? piece.dark : piece.light;
	
	sim.computer.a = new AI( genA, aColor );
	sim.computer.b = new AI( genB, other(aColor) );
	
	// dark starts
	sim.currentPlayer = aColor == piece.dark ? sim.computer.a : sim.computer.b;

	log("Running " + genA + " (" + (aColor==piece.dark?"Dark":"Light") + ") vs " + genB + " (" + (aColor==piece.dark?"Light":"Dark") + ") game " + (sim.games+1));

}

function runSim() {

	// run 1 iteration of whatever sim we have
	//log("Advancing sim state");
	
	if( state.moveLeftFor( sim.currentPlayer.piece ) ) {
		var move = sim.currentPlayer.makeMove();
		state.play(move.x, move.y, sim.currentPlayer.piece);
		sim.board.paint();
		// pass the turn
		sim.currentPlayer = sim.currentPlayer == sim.computer.a ? sim.computer.b : sim.computer.a;
		window.setTimeout( runSim, waitTime ); // call myself later
	} else if( state.moveLeftFor( other(sim.currentPlayer.piece) ) ) {
		// current can't move but opponent can, turn passes
		sim.currentPlayer = sim.currentPlayer == sim.computer.a ? sim.computer.b : sim.computer.a;
		window.setTimeout( runSim, waitTime ); // call myself later
	} else {
		// nobody can make a move: game end
		gameEnd();
	}

}

function gameEnd() {

//	log( (state.count(sim.computer.a.piece) > state.count(sim.computer.b.piece) ? generation_a : generation_b) + " Wins");

	// another game done
	sim.games++;

	// count wins (both to avoid miscounting draws)
	sim.wins.a += state.count(sim.computer.a.piece) > state.count(sim.computer.b.piece) ? 1 : 0;
	sim.wins.b += state.count(sim.computer.b.piece) > state.count(sim.computer.a.piece) ? 1 : 0;
	
	// do we need to run more of this face-off or should we go to next or are we done completely?
	if( sim.games == gamesPerFight ) {
		
		// update results
		if( results[ generation_a ] == undefined ) {
			results[ generation_a ] = []; // (first result for this generation)
		}
		results[ generation_a ][ generation_b ] = sim.wins.a / sim.games;
		
		// totally done?
		if( generation_a == generation_count && generation_b == generation_count ) {
			showResultsTable();
			return; // so we don't start making more games
		} else {
			sim.games = 0;
			sim.wins.a = 0;
			sim.wins.b = 0;
			if( generation_b < generation_a ) {
				// b always trails a
				generation_b++;
			} else {
				// next generation, b starts at 0 again
				generation_a++;
				generation_b = 0;
			}
			
		}
	} 
	
	// do another game
	gameSetup( sim, generation_a, generation_b );
	window.setTimeout( runSim, waitTime ); // go back to executing

}

function showResultsTable() {

	log("Making table");

	var matrix = document.createElement("table");
    var header = document.createElement("tr");
    var iHead = document.createElement("th");
    iHead.appendChild( document.createTextNode("left vs top") );
    header.appendChild(iHead);
    for(var i=0; i<=generations; i++) {
        iHead = document.createElement("th");
        iHead.appendChild( document.createTextNode(i) );
        header.appendChild(iHead);
    }
    matrix.appendChild(header);
        
    for(var i=0; i<results.length; i++) {

        var iVersusJ = document.createElement("tr");
        
        for(var j=0; j<results[i].length; j++) {

            if( j==0 ){
                var who = document.createElement("td");
                who.appendChild( document.createTextNode(i) );
                iVersusJ.appendChild(who);
            }

            var result = results[i][j]; // percentage wins for i vs j
            var resTD = document.createElement("td");
            resTD.appendChild(document.createTextNode( ((Math.floor(result*100*100))/100) + "%" ));
            
            iVersusJ.appendChild( resTD );
        }    
        matrix.appendChild(iVersusJ);
    }    
    
    document.getElementsByTagName("body")[0].appendChild( matrix );
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