/*
    Strategy: suggest a random legal move
 */
function gen_0_makeMove( state ) {
 
	var legalMoves = state.getLegalMoves( state.AIPiece );
	var square = legalMoves[ Math.floor(Math.random()*legalMoves.length) ];
	
	return { "x": square.getX(), "y": square.getY() };

}

strats[0] = gen_0_makeMove;
strategy_description[0] = "Random legal move";