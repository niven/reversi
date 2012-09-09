/*
    Strategy: MinMax trying to minimize the options the opponent
    has while maximizing our own options.
    (uses piece difference for endgame as well)
 */
function gen_5_makeMove( state, color ) {

    var depth = 3; // lookahead depth
    var width = 3; // how many states to keep per level (this is hardly pruning afaict)
		
	return minmax( state, depth, width, heuristic_constrict, color );
}

/*
    Try to maximize difference in options, but weigh in score at the
    end to ensure making winning moves
*/
function heuristic_constrict( state, color ) {

    var aiScore = state.count( color );
    var playerScore = state.count( other(color) );
    var movesLeft = size*size - (aiScore + playerScore);
    var ahead = aiScore - playerScore;
        
    // if many moves are left, score difference is essentially 0
    // if 0 moves left, it counts fully so 5 points    
	var score = (1/(1+movesLeft)) * ahead * 5;

    score += state.getLegalMoves( color ).length - state.getLegalMoves( other(color) ).length;
		
	return score;
}

strats[5] = gen_5_makeMove;
strategy_description[5] = "MinMax trying to reduce opponents options";