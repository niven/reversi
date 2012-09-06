/*
    Strategy: Classic MinMax based on the heuristic "difference of pieces" (which I think is not a good one for Reversi)
 */
function gen_2_makeMove( state ) {

    var depth = 4; // lookahead depth
    var width = 3; // how many states to keep per level (basically, we prune quite aggressively)
	
	return minmax( state, depth, width, heuristic_count );
	
}


var minmax_scoring_function = null;

/*
	MinMax?
	We take the current state, find out all legal moves we can make, then simulate doing that.
	Then we score each result, and keep the top N (width).
	
	Then we get all legal moves for the opponent, simulate making all of them and then counting their score
	Then we keep the top N (so we assume our opponent scores in the same way we do)
	
	We do this "depth" times.
	We then propagate scores up the tree: the score of each state is the max of the descending states,
	(which considered optimal moves)
	finally we keep the one that has the highest score (which assumes we both make moves that max score)
*/
function minmax( state, depth, width, scoring_function ) {

    minmax_boardstates_evaluated = 0; // track this for debug
	minmax_scoring_function = scoring_function;
	
    var tree = new Node( -1, copy_state(state) );
    var leaves = [ tree ];
    var color = state.AIPiece;
    
    // expand depth times
    for(var d=0; d<depth; d++) { 
        
        // for each leaf we need to expand
        var newLeaves = [];
        leaves.forEach(function(n){
            newLeaves = newLeaves.concat( expand( n, width, color ) );
        });
        leaves = newLeaves;
        color = other( color );
            
    }

//    console.log( tree.dot() );

    // now propagate the score up to our first level leaves
    var sorted = tree.children.sort(function(a, b){
        return a.getScore() - b.getScore();
    });

    // now pick random move from all the moves that have top score to avoid always doning the same
    // in symmetric scoring board states
    var topScore = sorted[0].getScore();
    var eta = 0.001; // since scores are floats
    var bestMoves = sorted.filter(function(m){
        return (topScore - m.getScore()) < eta;
    });

    var selectedMove = bestMoves[ Math.floor(Math.random()*bestMoves.length) ];

    console.log("Evaluated board states: " + minmax_boardstates_evaluated);

    return {"x": state.squares[ selectedMove.index ].getX(), "y": state.squares[ selectedMove.index ].getY() };
}

// take a node and create breadth children for it given its colors turn
var minmax_boardstates_evaluated = 0; // for debug
function expand( node, width, color ) {
    
    // simulate the moves
	var legalMoves = node.state.getLegalMoves( color );
	minmax_boardstates_evaluated += legalMoves.length;
//	console.log("Legal moves", legalMoves.map(function(s){  return s.index }) );
	
	var scoredMoves = legalMoves.map(function(s){
	   var as = copy_state(node.state);
	   as.play( s.getX(), s.getY(), color);
	   return new Node( s.index, as, color);
	});
    
    // check if there are no moves possible
    if( scoredMoves.length == 0 ) {
        var nop = new Node(-1, copy_state(node.state), color); // just propagate the board
        // this will keep the score as-is
        scoredMoves.push( nop );
    }
    
    // prune
    // sort by score
    scoredMoves = scoredMoves.sort(function(a, b){
        return a.getScore() - b.getScore();
    });
    // remove from end until maximum of breadth items is left
    while( scoredMoves.length > width ) {
        scoredMoves.shift();
    }
//    console.log("Result states ", scoredMoves.length);
    node.children = scoredMoves;
    
    return scoredMoves;    
}

// node of minmax tree, index of square is a convenient key
function Node( index, state, color ) {
    
    this.index = index;
    this.state = state;
    this.children = null;
    this.score = minmax_scoring_function( state, color );
    
}

Node.prototype.getScore = function() {

    if( this.children == null || this.children.length == 0 ) { // might not be any possible moves left
        return this.score;
    }
    
    // otherwise: max score of children
    var sorted = this.children.sort(function(a,b){
        return a.getScore() - b.getScore();
    });
    
//    console.log("chidlren", this.children);
    return sorted[0].getScore(); // score of max scoring child
}

// todo: make useful :)
Node.prototype.dot = function() {
    
    var dot = "digraph {\n";
    
    var nodes = [this];
    while( nodes.length > 0 ) {
        var n = nodes.pop();
        if( n.children != null ) {
            n.children.forEach(function(c){
                dot += n.index + " -> " + c.index + "\n";
            });
            nodes = nodes.concat( n.children );
        }
    }
    
    return dot + "}";
    
}

/*
    Compute score by counting difference in pieces
 */
function heuristic_count( state, color ) {
    return state.count( color ) - state.count( other(color) );
}

function copy_state( state ) {
    
    var copy = new GameState();
    copy.playerPiece = state.playerPiece;
    copy.AIPiece = state.AIPiece;
    
    // copy all pieces
    for(var i=0; i<state.squares.length; i++) {
        copy.squares[i].piece = state.squares[i].piece;
    }
    
    // good to go
    return copy;
}

strats[2] = gen_2_makeMove;
strategy_description[2] = "MinMax based on number of pieces";