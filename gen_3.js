/*
    Strategy: Classic MinMax based on location values
    (and look a bit deeper than gen2)
 */
function gen_3_makeMove( state, piece ) {

    var depth = 5; // lookahead depth
    var width = 4; // how many states to keep per level (basically, we prune quite aggressively)
		
	return minmax( state, depth, width, heuristic_location, piece );
}

function heuristic_location( state, color ) {

	var score = 2 * state.count( color );

	// value corners at 5 points
	score += state.squares[0].piece == color ? 5 : 0;
	score += state.squares[7].piece == color ? 5 : 0;
	score += state.squares[56].piece == color ? 5 : 0;
	score += state.squares[63].piece == color ? 5 : 0;
	
	// value edges at 3 points
	[1, 2, 3, 4, 5, 6, 8, 16, 24, 32, 49, 48, 15, 23, 31, 39, 47, 55, 57, 58, 59, 60, 61, 62].forEach(function(s){
		score += state.squares[s].piece == color ? 3 : 0;
	});
	
	// devalue 1st inner ring (all pieces 1 next to the edges) favoring the opponent there
	[9, 10, 11, 12, 13, 14, 15, 17, 25, 33, 41, 49, 14, 22, 30, 38, 46, 54, 50, 51, 52, 53].forEach(function(s){
		score += state.squares[s].piece == color ? 1 : 0;
	});
		
	return score;
}

strats[3] = gen_3_makeMove;
strategy_description[3] = "MinMax based on location scoring";