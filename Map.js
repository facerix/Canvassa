/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

// The full map of Hyrule is 4096x1408, a matrix of 16x8 MapScreens (i.e. individual screen views)
// MapScreens are 256x176 pixels, or 16x11 cells of 16x16 size each
//  (MapScreens can thus be reduced to a 16x11 matrix of cells indexing into a map tile image)

dojo.provide("loc.MapScreen");
dojo.provide("loc.Map");


// HELPER FUNCTIONS AND CONSTANTS
function getCellTile(value) {
    return {x: parseInt(value/10), y: parseInt(value%10)};
}

function padstring(toPad,len,char,pos) {
    var padded = String(toPad);
    while (padded.length < len) {
        if (!pos)
            padded = char + padded;
        else
            padded += char;
    }

    return padded;
}

// END HELPERS / CONSTANTS


dojo.declare("loc.MapScreen", null, {
    enemies: [],
    items: [],
    tiles: [],
    currentCell: {x:0, y:0},
    cells: null,
    cellSize: 16,
    constructor: function(x,y, screenData){
        dojo.mixin(this, screenData);
        this.x = x;
        this.y = y;
        //if (!screenData) {return;}

        /*for (var i=0; i < 16; i++) {
            this.cells[i] = new Array(11);
            for (var j=0; j < 11; j++) {
                if (this.tiles[i] && 1==2) {
                    this.cells[i][j] = getCellTile(this.tiles[i][j]);
                } else {
                    this.cells[i][j] = {x: Math.floor(Math.random()*8), y: Math.floor(Math.random()*8)};
                }
            }
        }
        console.log("MapScreen.constructor() -- cells[0]:",this.cells[0]);
        */
    },

    getCells: function() {
        this.cells = new Array(16);
        for (var i=0; i < 16; i++) {
            this.cells[i] = new Array(11);
            for (var j=0; j < 11; j++) {
                if (this.tiles[i]) {
                    this.cells[i][j] = getCellTile(this.tiles[i][j]);
                } else {
                    this.cells[i][j] = {x: 0, y: 0};
                }
            }
        }
        return this.cells;
    },

    draw: function(ctx, mapImg, gridLines) {
        // clear previous mapscreen
        ctx.fillStyle = "rgb(0,0,0)";   // replace this with a call that creates the rgb function params from this.floorColor
        ctx.fillRect(0,0,512,352);

        // given a Canvas context & map tile image, draws this screen
        if (!this.cells) { this.getCells() };
        for (i=0; i < 16; i++) {
            for (j=0; j < 11; j++) {
                var xoffset = this.cells[i][j].x;
                var yoffset = this.cells[i][j].y;
                
                if (gridLines) {
                    ctx.strokeWidth = 0.5;
                    ctx.strokeStyle = "gray";
                    ctx.strokeRect(i*32,j*32,32,32);
                }

                if (!isNaN(xoffset+yoffset)) {
                    if (this.cellSize==16)
                        ctx.drawImage(mapImg, xoffset*16,yoffset*16,16,16, 
                            i*this.cellSize, j*this.cellSize, this.cellSize, this.cellSize);
                    else {
                        //console.log(xoffset,yoffset,i,j,_cellSize);
                        ctx.drawImage(mapImg, xoffset*16,yoffset*16,16,16, 
                            i*this.cellSize, j*this.cellSize, this.cellSize+2, this.cellSize+2);
                    }
                }
            }
        }
    },

    drawThumb: function(ctx, mapImg, x, y) {
        //console.log("drawThumb(",x,",",y,"):",this.cells);
        ctx.clearRect(x,y,64,44);

        // given a Canvas context & map tile image, draws this screen
        if (!this.cells) { this.getCells() };
        for (i=0; i < 16; i++) {
            for (j=0; j < 11; j++) {
                var xoffset = this.cells[i][j].x;
                var yoffset = this.cells[i][j].y;
                
                if (!isNaN(xoffset+yoffset))
                    ctx.drawImage(mapImg, xoffset*16,yoffset*16,16,16, x+i*4,y+j*4,4,4);
            }
        }
    },
    
    serialize: function(label) {
        var json = "{ // " + label + "\n";
        if (this.enemies) {
            json += "enemies: [\n";
            for (var i in this.enemies) {
                json += "\t" + dojo.toJson(this.enemies[i]) + ",\n";
            }
            json += "],\ntiles: [\n"
        }
        for (var i=0; i < 16; i++) {
            var row = "\t[";
            for (var j=0; j < 11; j++) {
                var xoffset = this.cells[i][j].x;
                var yoffset = this.cells[i][j].y;
                
                if (!isNaN(xoffset+yoffset))
                    row += padstring(xoffset * 10 + yoffset,2,'0') + ",";
            }
            json += row.slice(0,row.length-1) + "],\n";
        }
        return json + "]}";
    },
    
    cellIsWalkable: function(x,y) {
        var cellX = parseInt(x/16);
        var cellY = parseInt(y/16);
        if (cellX < 0) cellX = 0;
        if (cellX > 15) cellX = 15;
        if (cellY < 0) cellY = 0;
        if (cellY > 10) cellY = 10;
        
        var cell = this.cells[cellX][cellY];
        
        return ((cell.x == 0) || (cell.x == 1 && cell.y > 6) || (cell.x == 2 && cell.y > 6));
    },
    
    setCurrentCellTile: function(x,y) {
        //console.log('setting cell tile to '+x+','+y);
        if (this.cells[this.currentCell.x])
            this.cells[this.currentCell.x][this.currentCell.y] = {x:x,y:y};
    },

    setCellTile: function(cellX,cellY,tileX,tileY) {
        if (this.cells[cellX])
            this.cells[cellX][cellY] = {x:tileX,y:tileY};
    },
    
    cellIsType: function(x,y,type) {
        var cellX = parseInt(x/16);
        var cellY = parseInt(y/16);
        if (cellX < 0) cellX = 0;
        if (cellX > 15) cellX = 15;
        if (cellY < 0) cellY = 0;
        if (cellY > 10) cellY = 10;
        var thisTile = this.cells[cellX][cellY];
        var istype = false;

        switch (type)
        {
            case 'ground':
                istype = (thisTile.x == 0 && thisTile.y < 7);
                break;
                
            case 'water':
                istype = (thisTile.x > 3 && thisTile.x < 6 && thisTile.y > 5 && thisTile.y < 9);
                break;

            case 'entrance':
                istype = (thisTile.x == 1 && thisTile.y >= 6);
                break;
        }
        
        return istype;
    },
    
    _addEnemy: function(enemyDef) {
        if (this.enemies) {
            this.enemies.push(enemyDef);
        } else {
            this.enemies = [enemyDef];
        }
    }
});

dojo.declare("loc.Map", null, {
    current: {x:0, y:0},
    data: null,
    screens: [],
    tileImg: null,
    constructor: function map_constructor(args){
        dojo.mixin(this, args);
        if (!this.data) {
            console.error("Missing map data in Map.constructor() argument list.");
            return;
        }
        if (!this.tileImg) {
            console.error("Missing map tile image in Map.constructor() argument list.");
            return;
        }

        this.setCurrentScreen(this.data.startScreen.x, this.data.startScreen.y);

        // init map
        this.screens = new Array(16);
        for (var i=0; i < 16; i++) {
            this.screens[i] = new Array(8);
            for (var j=0; j < 8; j++) {
                var screenDefs = dojo.clone(this.data.screenDefs[i][j]);
                screenDefs.cellSize = this.scale*16;
                this.screens[i][j] = new loc.MapScreen(i,j, screenDefs);
            }
        }
    },
        
    currentScreen: function map_getCurrent() {
        return this.screens[this.current.x][this.current.y];
    },

    setCurrentScreen: function map_setCurrent(x,y) {
        this.current.x = x; this.current.y = y;
    },
    
    draw: function(ctx, gridLines) {
        // given a Canvas context, draws the current map cell-by-cell
        //console.log("Overworld map coords:"+this.current.x+','+this.current.y+" -- offset:"+this.current.x*256+','+this.current.y*176);
        this.screens[this.current.x][this.current.y].draw(ctx, this.tileImg, gridLines);
    },
    
    setScreenCellTile: function(cellX,cellY,tileX,tileY) {
        var thisScreen = this.screens[this.current.x][this.current.y];
        thisScreen.currentCell = {x:cellX, y:cellY};
        thisScreen.setCurrentCellTile(tileX, tileY);
    },
    
    _drawingX: 0,
    _drawingY: 0,
    _thumbsCtx: null,
    _timerid: null,
    _drawNextThumb: function map_drawNextThumb() {
        this._thumbsCtx.strokeRect(this._drawingX*64, this._drawingY*44, 64,44);
        //console.log("nextThumb:",this._drawingX,this._drawingY);
        this.screens[this._drawingX][this._drawingY].drawThumb(this._thumbsCtx, this.tileImg, this._drawingX*64, this._drawingY*44);

        // increment counters and queue up the next call, or clear the timer if we're done
        if (this._drawingY < 7) {
            this._drawingY++;
        } else {
            if (this._drawingX < 15) {
                this._drawingX++;
                this._drawingY = 0;
            } else {
                this._drawingX = this._drawingY = 0;
                clearInterval(this._timerid);
                this._timeid = null;
                return;
            }
        }
        if (this._drawingX && this._drawingY) {
            this._timerid = setInterval("mapper.map._drawNextThumb()", 500);
        }
    },

    drawAll: function(ctx) {
        // given a Canvas context, draws the entire map screen-by-screen (for overview map, or mapper tool)
        /*this._thumbsCtx = ctx;
        this._drawingX = this._drawingY = 0;
        if (!this._timerid) {
            this._timerid = setInterval("mapper.map._drawNextThumb()", 500);
        } else {
            console.log("Already started.");
        }*/

        for (var i=0; i<16; i++) {
            for (var j=0; j<8; j++) {
                ctx.strokeRect(i*64,j*44,64,44);
                this.screens[i][j].drawThumb(ctx, this.tileImg, i*64, j*44);
            }
        }
    },
    
    drawScreenThumb: function(ctx, x, y, selected) {
        // given x,y coordinates and a canvas context, draws the specified map screen
        //console.log("drawScreenThumb(",x,',',y,"):",this.screens[x][y]);
        ctx.strokeRect(x*64,y*44,64,44);
        this.screens[x][y].drawThumb(ctx, this.tileImg, x*64, y*44);

        if (selected) {
            ctx.fillStyle = "rgba(20,20,20,0.3)";
            ctx.fillRect(x*64,y*44,64,44);
        }
    },
    
    serialize: function() {
        var json = "[";
        for (i=0; i < 16; i++) {
            var column = "\n[ // column " + i + "\n";
            for (j=0; j < 8; j++) {
                column += this.screens[i][j].serialize("screen "+i+","+j) + ",\n";
            }
            json += column.slice(0,column.length-1) + "\n],";
        }
        return json + "\n],";
    },
    
    north: function(){
        if (this.current.y > 0) {
            //console.log("moving north...");
            this.current.y--;
            return true
        } else {
            return false;
        }
    },
    
    south: function(){
        if (this.current.y < 7) {
            //console.log("moving south...");
            this.current.y++;
            return true
        } else {
            return false;
        }
    },
    
    east: function(){
        if (this.current.x < 15) {
            //console.log("moving east...");
            this.current.x++;
            return true
        } else {
            return false;
        }
    },
    
    west: function(){
        if (this.current.x > 0) {
            //console.log("moving west...");
            this.current.x--;
            return true
        } else {
            return false;
        }
    },
    
    reset: function(){
        this.setCurrentScreen(this.data.startScreen.x, this.data.startScreen.y);
    },
    
    canWalk: function(x,y){
        return this.screens[this.current.x][this.current.y].cellIsWalkable(x,y);
    }
});
