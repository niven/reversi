/*
    Strategy: Take all the empty squares and sort them by distance from center,
    then try each in turn that is legal and suggest that one.
    
    This biases towards the edges and especially the corners.
 */
function gen_1_makeMove( state, piece ) {

	var legalMoves = state.getLegalMoves( piece );
	
	// sort by distance to center as x^2+y^2 treating the center as (0,0)
	var sorted = legalMoves.sort(function(a, b){
		var x = (a.index % size) - (size/2);
		var y = Math.floor( a.index/size - (size/2) );
		
		var a_score = x*x + y*y;
		
		x = (b.index % size) - (size/2);
		y = Math.floor( b.index/size - (size/2) );

		var b_score = x*x + y*y;
		
		return a_score - b_score;
		
	});
	
	// there is at least 1 legal move, so this is safe
    return { "x": sorted[0].getX(), "y": sorted[0].getY() };
	
}

strats[1] = gen_1_makeMove;
strategy_description[1] = "Bias towards edges and corners";