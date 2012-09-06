
var color = {  dark: "rgb(40,40,40)", light: "rgb(255, 245, 190)" };

function BoardGUI(canvas, state) {

	return {
		"init" : function() {
			this.canvas.board = this; // circ ref FTW :)     
			this.state = state;       
		},
		"box" :  { "width" :  canvas.width / size, "height" : canvas.height / size },
  		"canvas" : canvas,
  		"snapshot_factor" : 8,
  		"paint" : function() {
            var ctx = this.canvas.getContext("2d");
    		ctx.fillStyle = "rgb(10,210,10)";
    		ctx.fillRect(1, 1, this.canvas.width, this.canvas.height);
    		this.canvas.board.paintField();
  		},
        "paintField" : function() {
			// draw vertical lines
			var ctx = this.canvas.getContext("2d");
			ctx.save();
			ctx.lineWidth = 2;
			for ( var x = 0; x < this.canvas.width + 1; x+= this.canvas.width/size) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, this.canvas.height);
				ctx.stroke();
			}
			for ( var y = 0; y < this.canvas.height + 1; y += this.canvas.height/size) {
				ctx.moveTo(0, y);
				ctx.lineTo(this.canvas.width, y);
				ctx.stroke();
			}
			ctx.restore();
            for(var x=0; x<size; x++){
                for(var y=0; y<size; y++){
                    if( state.squares[x + y*size].piece != null ) {
                        this.canvas.board.paintDisc(x, y, state.squares[x + y*size].piece == piece.dark ? color.dark : color.light);
                    }
                }
            }
		},
		"paintDisc" : function(locX, locY, pieceColor) {
			var ctx = this.canvas.getContext("2d");
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = pieceColor;
			ctx.arc(locX * this.box.width + this.box.width/2, locY * this.box.height + this.box.height/2, this.box.width/2 - 2, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		},
		"snapshot" : function() {
			
			var snapShrink = this.snapshot_factor;
		
			var ctx = this.canvas.getContext("2d");
			var sourceData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

			var out = document.createElement("canvas");
			out.width = Math.floor(this.canvas.width/snapShrink);
			out.height = Math.floor(this.canvas.height/snapShrink);
			var outContext = out.getContext("2d");
			var outImageData = outContext.getImageData(0, 0, out.width, out.height); // empty
			var outData = outImageData.data;
			
			// copy over every N hor/vert pixel
			// which is inorder as rgba ints
			for (var x = 0; x < out.height; x++) {
				for (var y = 0; y < out.width; y++) {
       				var index = (x + y*out.width) * 4;
       				var src = ((x*snapShrink) + (y*snapShrink)*this.canvas.width) * 4;
					outData[index + 0] = sourceData[src + 0];
					outData[index + 1] = sourceData[src + 1];
					outData[index + 2] = sourceData[src + 2];
					outData[index + 3] = sourceData[src + 3];
				}
			}
			
			outContext.putImageData(outImageData, 0, 0);

			return out;
		}
	}
}

