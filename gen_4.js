/*
    Strategy: MinMax trying to maintain parity, adding in score in the endgame.
    Also: don't prune a lot since that would be bad for parity
 */
function gen_4_makeMove( state, color ) {

    var depth = 6; // lookahead depth
    var width = 4; // how many states to keep per level (this is hardly pruning afaict)
		
	return minmax( state, depth, width, heuristic_parity, color );
}

/*
    Try to maintain equal number of pieces after every move, but weigh in score at the
    end to ensure making winning moves
*/
function heuristic_parity( state, color ) {

    var aiScore = state.count( color );
    var playerScore = state.count( other(color) );
    var movesLeft = size*size - (aiScore + playerScore);
    var ahead = aiScore - playerScore;
        
    // if many moves are left, score difference is essentially 0
    // if 0 moves left, it counts fully, but since we care about parity,
    // winning with 1 piece difference is all we need    
	var score = (1/(1+movesLeft)) * ahead;

    // parity will score 1 point, 1 diff 0.5, 2 diff 0.2, 3 diff 0.1 etc.
    score += 1/(1 + ahead*ahead );
		
	return score;
}

strats[4] = gen_4_makeMove;
strategy_description[4] = "MinMax trying to maintain parity and use scoring for endgame";