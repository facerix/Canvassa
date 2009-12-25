/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.require("loc.Map");
dojo.provide("loc.Mapper");


/* ----------------------------------------------------------
    event handlers (todo: implement some other, better way)
------------------------------------------------------------- */
var isIE = navigator.appName.toLowerCase().indexOf("explorer") > -1;
function attachListener(elementName, eventname, handler) {
    var el = document.getElementById(elementName);
    if ( el.addEventListener ) {
        el.addEventListener(eventname, handler, false);
    } else if ( document.attachEvent ) {
        el.attachEvent("on"+eventname, handler);
    } else {
        alert("Your browser will not work for this example.");
    }
};

function getRelativePosition(e,el) {
    var t = document.getElementById(el);
    var x = e.clientX+(window.pageXOffset||0);
    var y = e.clientY+(window.pageYOffset||0);
    do
        x-=t.offsetLeft+parseInt(t.style.borderLeftWidth||0),
        y-=t.offsetTop+parseInt(t.style.borderTopWidth||0);
    while (t=t.offsetParent);
    return {x:x,y:y};
}

function mapClick(e) {
    var position = getRelativePosition(e,'mapCanvas');

    cellX = Math.floor((position.x-6)/64);
    cellY = Math.floor((position.y-6)/44);
    mapper.setCurrentScreen(cellX,cellY);
}
attachListener('mapCanvas', 'click', mapClick);

function screenClick(e) {
    var position = getRelativePosition(e,'screenCanvas');

    cellX = Math.floor(position.x/32);
    cellY = Math.floor(position.y/32);
    
    switch (mapper.editTool) {
        case 0: // tile brush
            mapper.paintScreenCellTile(cellX,cellY);
            break;
        case 1: // tile fill
            mapper.fillScreenCellsWithTile(cellX,cellY);
            break;
        case 2: // sprite mode
            // if there's no sprite there, add a new one of the current type
            var sprites = mapper.map.currentScreen().enemies;
            var found = false;
            for (var i in sprites) {
                var spriteX = sprites[i].position.x/16 - 0.5;
                var spriteY = sprites[i].position.y/16 - 0.5;
                if ((Math.abs(spriteX - cellX) < 1) && (Math.abs(spriteY - cellY) < 1)) {
                    if (!mapper.currentSprite.type) {
                        delete sprites[i];
                    } else {
                        sprites[i].color = mapper.currentSprite.color;
                        sprites[i].type = mapper.currentSprite.type;
                    }
                    found = true
                    break;
                }
            }
            if (!found && mapper.currentSprite.type) {
                var newEnemy = {type:mapper.currentSprite.type, color: mapper.currentSprite.color, position: {x:cellX*16+8,y:cellY*16+8}};
                mapper.map.currentScreen()._addEnemy(newEnemy);
            }
            mapper.drawSprites();
            break;
    }
}
var mouseDown = false;
function screenMouseDown(e) {
    mouseDown=true;
    
    if (mapper.editTool == 2) {
        var clickpos = getRelativePosition(e,'screenCanvas');
        cellX = Math.floor(clickpos.x/32);
        cellY = Math.floor(clickpos.y/32);

        var sprites = mapper.map.currentScreen().enemies;
        selectedSprite = null;
        for (var i in sprites) {
            var spriteX = sprites[i].position.x/16 - 0.5;
            var spriteY = sprites[i].position.y/16 - 0.5;
            if ((Math.abs(spriteX - cellX) < 1) && (Math.abs(spriteY - cellY) < 1)) {
                selectedSprite = sprites[i];
                //console.log("clicked on sprite #" + i + ": " + selectedSprite.type);
                break;
            } //else {
            //    console.log("nothing there (" + cellX + "," + cellY + ")");
            //}
        }
    }
}
function screenMove(e) {
    if (mouseDown) {
        var position = getRelativePosition(e,'screenCanvas');
        cellX = Math.floor(position.x/32);
        cellY = Math.floor(position.y/32);

        if (mapper.editTool < 2) {
            mapper.paintScreenCellTile(cellX,cellY);
            
        } else if (mapper.editTool == 2 && selectedSprite) {
            selectedSprite.position = {x:cellX*16+8,y:cellY*16+8};
            mapper.drawSprites();
        }
    }
}
attachListener('spriteCanvas', 'mousedown', screenMouseDown);
attachListener('spriteCanvas', 'mouseup', function(e){mouseDown=false;selectedSprite=null});
attachListener('spriteCanvas', 'click', screenClick);
attachListener('spriteCanvas', 'mousemove', screenMove);


function tileClick(e) {
    var position = getRelativePosition(e,'tileCanvas');

    cellX = Math.floor(position.x/32);
    cellY = Math.floor(position.y/32);
    mapper.setCurrentTile(cellX,cellY);
}
attachListener('tileCanvas', 'click', tileClick);


function spriteClick(e) {
    var position = getRelativePosition(e,'spriteTileCanvas');
    cellX = Math.floor(position.x/32);
    cellY = Math.floor(position.y/32);
    mapper.setCurrentSprite(cellX,cellY);
}
attachListener('spriteTileCanvas', 'click', spriteClick);




dojo.declare("loc.Mapper", null, {
    mapContext: null,
    screenContext: null,
    spriteContext: null,
    spriteTileContext: null,
    tileContext: null,

    _timerid: 0,
    mapImg: null,    /* (placeholder for the map image) */
    spriteImg: null,    /* (placeholder for the map image) */
    currentTile: {x:0, y:0},
    currentSprite: {type:'', color:0},
    map: null,
    editTool: 0,   /* (paintbrush) */
    editorTools: {0: "paintbrush", 1: "floodfill", 2: "sprite"},

    constructor: function(args) {
        // required arguments: x,y, screenData
        dojo.mixin(this, args);

        // init big map canvas
        this.mapCanvas = dojo.byId(this.mapCanvasID);
        if (this.mapCanvas.getContext){
            this.mapContext = this.mapCanvas.getContext('2d');
        } else {
            this.noCanvas();
        }
        
        // init screen canvas
        var screen = dojo.byId(this.screenCanvasID);
        if (screen.getContext){
            this.screenContext = screen.getContext('2d');
        } else {
            this.noCanvas();
        }

        // init tile canvas
        var tiles = dojo.byId(this.tileCanvasID);
        if (tiles.getContext){
            this.tileContext = tiles.getContext('2d');
        } else {
            this.noCanvas();
        }

        // init sprite canvas
        var sprites = dojo.byId(this.spriteCanvasID);
        if (sprites.getContext){
            this.spriteContext = sprites.getContext('2d');
        } else {
            this.noCanvas();
        }
        
        // init sprite tile canvas
        var spriteTiles = dojo.byId(this.spriteTileCanvasID);
        if (spriteTiles.getContext){
            this.spriteTileContext = spriteTiles.getContext('2d');
        } else {
            this.noCanvas();
        }

        // init map & tools
        this.map = new loc.Map({data: loc.gameData, ctx: this.mapContext, tileImg: this.mapImg, scale: this.scale});
        //this.setCurrentScreen(0,0);
        this.setCurrentTile(0,0);
        this.setCurrentSprite(0,0);
        this.drawMap();
    },

    drawMap: function mapper_drawMap() {
        if (this.mapContext) {
            this.mapContext.clearRect(0,0,1024,352);

            // draw all map screen thumbnails
            //this.map.drawAll(this.mapContext);
        }
    },

    refreshTiles: function mapper_refreshTiles() {
        if (this.tileContext) {
            this.tileContext.drawImage(this.mapImg, 0,0, 160,160, 0,0, 320,320);
        }
    },
    
    refreshSprites: function mapper_refreshSprites() {
        if (this.spriteTileContext) {
            this.spriteTileContext.clearRect(0,0,155,352);
            this.spriteTileContext.drawImage(this.spriteImg, 0,0, 48,96, 0,0, 96,192);
        }
    },

    setCurrentScreen: function mapper_setCurrentScreen(x,y) {
        console.log("setCurrentScreen(",x,",",y,")");
        if (this.mapContext) {
            // un-highlight the old screen thumbnail...
            i = this.map.current.x;
            j = this.map.current.y;
            //this.mapContext.strokeStyle = "black";
            //this.mapContext.strokeWidth = 1.0;
            //this.mapContext.strokeRect(i*64,j*44,64,44);
            //this.mapContext.clearRect(i*64,j*44,64,44);
            this.map.drawScreenThumb(this.mapContext, i, j);
            
            // set the new screen
            this.map.current = {x: x, y: y};

            // ...and highlight the new one
            this.map.drawScreenThumb(this.mapContext, x, y, true);
            //this.mapContext.strokeStyle = "red";
            //this.mapContext.strokeWidth = 4.0;
            //this.mapContext.clearRect(x*64,y*44,64,44);
            //this.mapContext.strokeRect(x*64,y*44,64,44);
        }
        if (this.screenContext){
            //this.screenContext.clearRect(0,0,512,352);
            this.map.draw(this.screenContext, true);
        }
        if (this.spriteContext){
            this.drawSprites();
        }
    },

    drawSprites: function mapper_drawSprites() {
        this.spriteContext.clearRect(0,0,512,352);

        var toDraw = this.map.currentScreen().enemies;
        for (var i in toDraw) {
            var tileX = toDraw[i].color * 16;
            var tileY = 0;
            var posX = toDraw[i].position.x - 8;
            var posY = toDraw[i].position.y - 8;
            switch (toDraw[i].type) {
                case 'armos':
                    break;
                case 'ghini':
                    tileX = 32;
                    tileY = 64;
                    break;
                case 'leever':
                    tileY = 48;
                    break;
                case 'lynel':
                    tileY = 80;
                    break;
                case 'moblin':
                    tileY = 64;
                    break;
                case 'octoroc':
                    tileY = 16;
                    break;
                case 'peahat':
                    tileX = 32;
                    tileY = 32;
                    break;
                case 'rock':
                    tileX = 32;
                    tileY = 48;
                    break;
                case 'tectite':
                    tileY = 32;
                    break;
                case 'zola':
                    tileX = 32;
                    tileY = 16;
                    break;
                default:
                    break;
            }
            //console.log("drawing sprite " + tileX + "," + tileY + "at position " + posX + "," + posY);
            this.spriteContext.drawImage(this.spriteImg, tileX,tileY, 16,16, posX*2,posY*2, 32,32);
        }
    },
    
    setCurrentScreenCell: function mapper_setCurrentScreenCell(x,y) {
        if (this.screenContext){
            // re-draw the map screen
            this.map.draw(this.screenContext, this.mapImg, true);

            // set the new screen cell...
            this.map.currentScreen().currentCell = {x: x, y: y};

            // ...and highlight it
            screenContext.strokeStyle = "red";
            screenContext.strokeWidth = 4.0;
            screenContext.strokeRect(x*32,y*32,32,32);
        }
    },
    
    paintScreenCellTile: function mapper_paintScreenCellTile(x,y) {
        if (this.screenContext){
            // set this screen cell's tile to the currently selected one
            this.map.setScreenCellTile(x,y, this.currentTile.x, this.currentTile.y);
            
            // re-draw the map screen
            this.map.draw(this.screenContext, this.mapImg, true);

            // and re-draw the screen thumbnail on the big map
            if (this.mapContext){
                this.map.drawScreenThumb(this.mapContext, this.map.current.x, this.map.current.y);
            }
        }
    },
    
    fillScreenCellsWithTile: function mapper_fillScreenCellsWithTile(cellX,cellY) {
        if (this.screenContext){
            // fill the specified cell with the current tile, then recurse to fill any neighbors with the same pattern
            this._fillCellHelper(cellX,cellY);
            
            // re-draw the map screen
            this.map.draw(this.screenContext, this.mapImg, true);
            
            // and re-draw the screen thumbnail on the big map
            if (this.mapContext){
                this.map.drawScreenThumb(this.mapContext, this.map.current.x, this.map.current.y);
            }
        }
    },
    
    _fillCellHelper: function _mapper_fillCellHelper(cellX,cellY) {
        var thisScreen = this.map.currentScreen();
        var oldTile = thisScreen.cells[cellX][cellY];

        // set my tile
        thisScreen.setCellTile(cellX,cellY, this.currentTile.x,this.currentTile.y);

        // check neighbor to the N
        if (cellY > 0) {
            if (thisScreen.cells[cellX][cellY-1].x == oldTile.x && thisScreen.cells[cellX][cellY-1].y == oldTile.y) {
                this._fillCellHelper(cellX, cellY-1);
            }
        }
        
        // check neighbor to the E
        if (cellX < 15) {
            if (thisScreen.cells[cellX+1][cellY].x == oldTile.x && thisScreen.cells[cellX+1][cellY].y == oldTile.y) {
                this._fillCellHelper(cellX+1, cellY);
            }
        }
        
        // check neighbor to the S
        if (cellY < 10) {
            if (thisScreen.cells[cellX][cellY+1].x == oldTile.x && thisScreen.cells[cellX][cellY+1].y == oldTile.y) {
                this._fillCellHelper(cellX, cellY+1);
            }
        }
        
        // check neighbor to the W
        if (cellX > 0) {
            if (thisScreen.cells[cellX-1][cellY].x == oldTile.x && thisScreen.cells[cellX-1][cellY].y == oldTile.y) {
                this._fillCellHelper(cellX-1, cellY);
            }
        }
    },
    
    setCurrentTile: function mapper_setCurrentTile(x,y) {
        if (this.tileContext){
            // redraw the tile palette
            this.refreshTiles();
            
            // set the new tile...
            this.currentTile = {x: x, y: y};

            // ...and highlight it
            this.tileContext.strokeStyle = "red";
            this.tileContext.strokeWidth = 4.0;
            this.tileContext.strokeRect(x*32,y*32,32,32);
        }
    },
    
    setCurrentSprite: function mapper_setCurrentSprite(x,y) {
        if (this.spriteTileContext){
            // redraw the tile palette
            this.refreshSprites();
            
            // set the new sprite...
            var sType = null;
            var nColor = x;
            if (x <= 2) {
                switch (y) {
                    case 0:
                        sType = 'armos';
                        break;
                    case 1:
                        if (x > 1) {
                            sType = 'zola';
                            nColor = 0;
                        } else {
                            sType = 'octoroc';
                        }
                        break;
                    case 2:
                        if (x > 1) {
                            sType = 'peahat';
                            nColor = 0;
                        } else {
                            sType = 'tectite';
                        }
                        break;
                    case 3:
                        if (x > 1) {
                            sType = 'rock';
                            nColor = 0;
                        } else {
                            sType = 'leever';
                        }
                        break;
                    case 4:
                        if (x > 1) {
                            sType = 'ghini';
                            nColor = 0;
                        } else {
                            sType = 'moblin';
                        }
                        break;
                    case 5:
                        if (x < 2) {
                            sType = 'lynel';
                        }
                        break;
                }
            }
            this.currentSprite = {type: sType, color: nColor};
            console.log("Changed sprite to " + sType + " (color: " + nColor + ")");

            // ...and highlight it
            this.spriteTileContext.strokeStyle = "red";
            this.spriteTileContext.strokeWidth = 4.0;
            this.spriteTileContext.strokeRect(x*32,y*32,32,32);
        }
    },
    
    noCanvas: function mapper_noCanvas() {
        clearInterval(this.timerid);
        document.writeln("<p>Sorry, but I couldn't seem to get an HTML &lt;canvas&gt; context. I'm really very <em>terribly</em> sorry. Maybe you should go out and get a newer, standards-compliant browser, eh?</p>");
        document.writeln("<p>Here are a couple:<ul>");
        document.writeln("<li><a href='http://www.getfirefox.com'>Mozilla Firefox</a></li>");
        document.writeln("<li><a href='http://www.google.com/chrome'>Google Chrome</a></li>");
        document.writeln("<li><a href='http://www.opera.com/'>Opera</a></li>");
        document.writeln("</ul></p>");
    }
}); // end of loc.Mapper
