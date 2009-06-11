/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.provide("loc.Game");
dojo.require("loc.Player");
dojo.require("loc.Monster");
dojo.require("loc.Font");
//dojo.require("loc.Map");

dojo.declare("loc.Game", null, {
    constructor: function game_constructor(args){
        this.map_ctx = args['map_context'];
        this.map_ctx.fillStyle = "#FCD8A8";
        this.ctx = args['sprite_context'];
        this.scale = args['scale'];
        this.currDirKey = 0;
        this.allowTurbo = false;
        this.aButton = false;
        this.bButton = false;
        this.interval = 30;

        this.constants = {};
        this.constants.direction = { left: 0, up: 1, right: 2, down: 3 };
        this.constants.states = { overworld: 0, inventory: 1, dungeon: 2, map: 3, dying: 4, gameover: 5, cheat: 99, 
                                  enum: [0,1,2,3,4,5,99] };
        this.constants.screenBound = args['screenBounds'];
        this.currentState = 0;
        this.player = new loc.Player({
            pos:{x:128,y:88}, scale:this.scale, size:{w:16,h:16}
        });
        this.monsters = [];
        this.items = [];
        this.font = new loc.Font();
        this.spriteListener = dojo.subscribe("sprite.onTerminate", function(spriteClass, index) {
            //console.log("caught sprite.onTerminate(",spriteClass, index, ")");
            if (spriteClass == "loc.Player") {
                game.over();
            } else {
                if (index != 'undefined' && game.monsters[index]) {
                    delete game.monsters[index];
                }
            }
        });
        this.projectileListener = dojo.subscribe("monster.onAttack", function(spriteClass, index) {
            //console.log("caught monster.onAttack(",spriteClass, index, ")");
            if (index != 'undefined' && game.monsters[index]) {
                var newProj = game.monsters[index].getProjectile();
                if (newProj) {
                    //console.log("got projectile:", newProj);
                    newProj.index = game.items.length;
                    game.items.push(newProj);
                }
            }
        });
        this._playerListener = dojo.subscribe("player.onDie", function() { game.changeState( game.constants.states.dying ); });

        // build the misc GUI sprites
        //window.imageCache.addImage( "HUD", "../res/hud.png" );
        this._selectIcon = new loc.SelectIcon({scale:this.scale, size:{w:8,h:8}, pos:{x:64, y:80}});

        // load map data
        //this.map = new loc.Map(loc.gameData, this.map_ctx);
    },
    main: function game_main() {
        // draw everything
        try {
            this.drawBG();
            this.drawSprites();
        } catch(e) {
            console.log("error drawing sprites:",e);
            this.stop();
        }

        // update player, monster, and projectile positions if on the overworld/dungeon screens
        //if (this.currentState == 0 || this.currentState == 2) {
            // handle enemy AI
            for (var i in this.monsters) {
                this.monsters[i].think();
            }

            // move all active projectiles
            for (var j in this.items) {
                if ("updatePosition" in this.items[j]) { this.items[j].updatePosition(); }
            }

            // do sprite collision tests
            //this.doHitTests();
        //}
    },
    drawBG: function game_drawBG() {
        switch (this.currentState) {
            case this.constants.states.dying:
                this.map_ctx.fillStyle = "rgba(255,0,0,0.1)";
                this.map_ctx.fillRect(0,0,256*this.scale,240*this.scale);
                break;

            case this.constants.states.gameover:
                // clear the map canvas & draw the "continue/save/retry?" screen
                this.map_ctx.fillStyle = "black";
                this.map_ctx.fillRect(0,0, 256*this.scale, 240*this.scale);

                // draw the three options (continue / save / retry) using the default font
                //this.font.drawText(this.map_ctx, "continue\n\n\nsave\n\n\nretry", 80,80, this.scale);

                // for now, display a simpler message directing the player to refresh the page
                this.font.drawText(this.map_ctx, "GAME OVER", 92,88, this.scale);
                this.font.drawText(this.map_ctx, "Press START to try again.", 28,104, this.scale);

                break;

            default:
                if (this.map) {
                    this.map.draw(this.map_ctx);
                } else {
                    this.map_ctx.fillStyle = "#FCD8A8";
                    this.map_ctx.fillRect(0,64,256*this.scale,176*this.scale);
                }
                
        } // end switch
    },
    drawSprites: function game_drawSprites() {
        // clear the sprite canvas
        this.ctx.clearRect(0,0,256*this.scale,240*this.scale);
        //console.log("game.drawSprites(currentState:",this.currentState,")");

        switch (this.currentState) {
            case this.constants.states.gameover:
                // draw the selector icon for the currently-selected option (continue, save, retry)
                //this._selectIcon.pos = {x: 64, y: 80};
                //this._selectIcon.draw(this.ctx)

                //var x = 64*game.scale;
                //var y = 80*game.scale; // TODO: adjust this according to the selected option (when save & retry are actual options)
                //var size = 8*game.scale;
                //spriteCanvas.drawImage(__itemsImg, 0,0,8,8, x,y, size,size);

                break;

            default:
                // draw HUD (status bar)
                var img = window.imageCache.getImage("HUD");
                this.ctx.drawImage(img, 0,175,256,64, 0,0,256*this.scale,64*this.scale);
                
                // draw location dot, equipped item, sword, and hearts
                this.player.drawInventory(this.ctx, 0);

                this.ctx.save();
                this.ctx.translate(0,64*this.scale);
                
                try {
                    // draw monsters
                    for (var i in this.monsters) {
                        this.monsters[i].draw(this.ctx);
                    }

                    // draw items and projectiles
                    for (var j in this.items) {
                        this.items[j].draw(this.ctx);
                    }

                    // draw player
                    if (this.player) {
                        this.player.draw(this.ctx);
                    }

                } catch(e) {
                    console.log("error drawing sprites:",e);
                    this.stop();
                    
                } finally {
                    this.ctx.restore();
                }
                break;
        } // end switch
    },
    changeState: function game_changeState(newState) {
        if (newState in this.constants.states.enum) {
            this.currentState = newState;
        } else {
            console.log("Game.changeState() -- invalid state:", newState);
        }
    },
    setScreenBounds: function setScreenBounds(new_sb) {
        this.constants.screenBound = new_sb;
    },
    start: function game_start(interval_override) {
        if (interval_override) { this.interval = interval_override; }

        // start the main game loop
        if (!this._timerid) {
            this._timerid = setInterval("game.main()", this.interval);
        } else {
            console.log("Already started.");
        }
    },
    stop: function game_stop() {
        // stop the main game loop
        clearInterval( this._timerid );
        this._timerid = null;
    },
    setScale: function setScale(size) {
        if (size > 0 && size < 5) {
            this.scale = size;
            this.player.scale = size;
            //this.player.reset();

            for (var i in this.monsters) {
                this.monsters[i].scale = size;
            }
        }
    },
    keyDown: function game_keyDown(keyCode) {
        if (this.currDirKey == keyCode) { return; }
        var dx = dy = 0;
        switch(keyCode){
            case 39: // right
                dx = 1;
                break;
            case 37: // left
                dx = -1;
                break;
            case 38: // up
                dy = -1;
                break;
            case 40: // down
                dy = 1;
                break;

            case 88: // X (A button)
                if (!this.aButton || this.allowTurbo) {
                    this.aButton = true;
                    this.player.attack();
                }
                break;
            case 90: // Z (B button)
                if (!this.bButton || this.allowTurbo) {
                    this.bButton = true;
                    this.player.useItem();
                }
                break;

            case 219: // select
                this._togglePause();
                break;
            case 221: // start
                this._handleStartButton();
                break;

            default:
                //console.log("key pressed:", keyCode);
                break;
        }
        if (dx != 0 || dy != 0) {
            this.player.moveVector({x:dx,y:dy});
            this.currDirKey = keyCode;
        }
    },
    keyUp: function game_keyUp(keyCode) {
        switch(keyCode){
            case 39: // right
            case 37: // left
            case 38: // up
            case 40: // down
                if (this.currDirKey != keyCode) { return; }
                this.currDirKey = 0;
                this.player.stop();
                break;

            case 88: // X (A button)
                this.aButton = false;
                break;
            case 90: // Z (B button)
                this.bButton = false;
                break;

            case 219: // select
            case 221: // start
                // pass
                break;

            default:
                break;
        }
    },
    over: function game_over() {
        this.changeState( this.constants.states.gameover );
    },
    reset: function game_reset() {
        console.log("todo: reset the game back to its initial state");
    },
    _handleStartButton: function game_handleStart() {
        if (this._timerid) {
            switch (this.currentState) {
                case this.constants.states.gameover:
                    this.reset();
                    break;
                case this.constants.states.dying:
                    // pass
                    break;
                default:
                    console.log("todo: switch from overworld/dungeon to map/inventory");
                    break;
            } // end switch
        } // end if
    },
    _togglePause: function game_togglePause() {
        // todo: make the little pause sound
        if (this._timerid) {
            this.stop();
        } else {
            this.start();
        }
    }
});
