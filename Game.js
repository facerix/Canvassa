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
dojo.require("loc.Map");

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
        this.projectiles = [];
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
                    newProj.index = game.projectiles.length;
                    game.projectiles.push(newProj);
                }
            }
        });
        this._playerListener = dojo.subscribe("player.onDie", function() { game.changeState( game.constants.states.dying ); });

        // build the misc GUI sprites
        this._selectIcon = new loc.SelectIcon({scale:this.scale, size:{w:8,h:8}, pos:{x:64, y:80}});

        // load map data
        this.map = new loc.Map({data: loc.gameData, ctx: this.map_ctx, 
            tileImg: window.imageCache.getImage("tiles"), scale: this.scale});

        // draw initial screen
        this.refresh();
    },
    main: function game_main() {
        // draw everything
        try {
            this.drawSprites();
        } catch(e) {
            console.log("error drawing sprites:",e);
            this.stop();
        }

        // update player, monster, and projectile positions if on the overworld/dungeon screens
        if (this.currentState == this.constants.states.overworld || this.currentState == this.constants.states.dungeon) {
            // handle enemy AI
            for (var i in this.monsters) {
                this.monsters[i].think();
            }

            // move all active projectiles
            for (var j in this.projectiles) {
                if ("updatePosition" in this.projectiles[j]) { this.projectiles[j].updatePosition(); }
            }

            // do sprite collision tests
            this.doHitTests();

            // check if the player is walking onto an adjacent screen
            this.checkBoundaries();
        }
    },
    checkBoundaries: function game_checkBoundaries() {
        // moving north / south?
        if (this.player.vector.y < 0 && (Math.abs(this.player.pos.y - this.constants.screenBound.top) <= 12) && (this.map.north())) {
            this.refresh();
            this.player.pos.y = this.constants.screenBound.bottom;
        } else if (this.player.vector.y > 0 && (Math.abs(this.player.pos.y - this.constants.screenBound.bottom) <= 12) && (this.map.south())) {
            this.refresh();
            this.player.pos.y = this.constants.screenBound.top;
        }

        // moving east / west?
        if (this.player.vector.x < 0 && (Math.abs(this.player.pos.x - this.constants.screenBound.left) <= 12) && (this.map.west())) {
            this.refresh();
            this.player.pos.x = this.constants.screenBound.right - this.player._halfw;
        } else if (this.player.vector.x > 0 && (Math.abs(this.player.pos.x - this.constants.screenBound.right) <= 12) && (this.map.east())) {
            this.refresh();
            this.player.pos.x = this.constants.screenBound.left + this.player._halfw;
        }

        
    },

    doHitTests: function game_doHitTests() {
        // we only care about collision detection if in overworld or dungeon modes
        if (this.currentState == 0 || this.currentState == 2) {
            // do sprite collision tests for Link
            var hits = this.hitTest(this.player.pos.x-8, this.player.pos.y-8, 16,16);

            // check to see if any monsters are touching the player; if so, he's hurt to the tune of their relative strength
            var i = 0; // loop counter
            for (i in hits[0]) {
                var attacker = hits[0][i];
                if (attacker.canAttack()) {
                    player.getHit(attacker.strength);
                    break;
                } else if (attacker.declaredClass == "Armos" && attacker._animState == 8) {
                    attacker.wake();
                }
            }

            // see if there is anything to pick up
            for each (var item in hits[1]) {
                this.player.getItem(item);
                delete game.items[item._index];
            }

            // if there are any projectiles in play, see if they hit anything, too
            for each (var proj in this.projectiles) {
                // player-owned projectiles can only damage enemies, and vice-versa, so check projectile type against hit target type
                if (proj.owner == this.player) {
                    hits = this.hitTest(proj.pos.x, proj.pos.y, proj.width, proj.height);

                    for (var e in hits[0]) {
                        proj.hit(hits[0][e]);
                    }

                    if (proj.declaredClass == 'loc.BoomProj' || proj.declaredClass == 'loc.ArrowProj') {
                        // boomerangs and arrows can also retrieve small items (hearts, rupees)
                        for each (var item in hits[1]) {
                            if (item.size == 0) {
                                player.getItem(item);
                                delete game.items[item._index];
                            }
                        }
                    } 
                }
            }

            // note: player class handles attack collision detection internally by making a call to game.hitTest(x,y,w,h)
        }
    },

    hitTest: function game_hitTest(x,y,w,h) {
        // check all active monsters to see if they are within the specified area; return a list of any that are
        //this.ctx.fillStyle = "rgba(255,64,0,.40)";
        //this.ctx.fillRect(x*game.scale,(y+64)*game.scale,w*game.scale,h*game.scale);
        //console.log("game.hitTest(%d,%d,%d,%d)", x, y, w, h);

        var enemies = []; items = [];
        for (var e in this.enemies) {
            var enemy = this.enemies[e];
            var dx = Math.abs(x-enemy.pos.x);
            var dy = Math.abs(y-enemy.pos.y);
            //console.log("test: [%o] -> [%d,%d] ? (dx: %d, dy: %d)",enemy.pos,x,y, dx,dy);
            if (dx <= w && dy <= h) {
                enemies.push(enemy);
            }
        }

        for (var i in this.items) {
            var item = this.items[i];
            item._index = i;
            var dx = Math.abs(x-item.pos.x);
            var dy = Math.abs(y-item.pos.y);
            //console.log("test: [%o] -> [%d,%d] ? (dx: %d, dy: %d)",item.pos,x,y, dx,dy);
            if (dx <= w && dy <= h) {
                items.push(item);
            }
        }

        return [enemies,items];
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

            case this.constants.states.inventory:
            case this.constants.states.map:
                // draw HUD in full-screen
                var img = window.imageCache.getImage("HUD");
                this.map_ctx.drawImage(img, 0,0,256,240, 0,0,256*this.scale,240*this.scale);
                break;

            case this.constants.states.overworld:
            case this.constants.states.dungeon:
            default:
                // draw HUD (status bar)
                var img = window.imageCache.getImage("HUD");
                this.map_ctx.drawImage(img, 0,175,256,64, 0,0,256*this.scale,64*this.scale);
                
                this.map_ctx.save();
                this.map_ctx.translate(0,64*this.scale);

                try {
                    if (this.map) {
                        this.map.draw(this.map_ctx);
                    } else {
                        this.map_ctx.fillStyle = "#FCD8A8";
                        this.map_ctx.fillRect(0,64,256*this.scale,176*this.scale);
                    }
                } catch(e) {
                    console.log("error drawing sprites:",e);
                    this.stop();
                    
                } finally {
                    this.map_ctx.restore();
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

            case this.constants.states.inventory:
            case this.constants.states.map:
                // draw HUD elements: location dot, equipped item, sword, and hearts
                this.player.drawInventory(this.ctx, 1);
                break;

            case this.constants.states.overworld:
            case this.constants.states.dungeon:
            default:
                // draw HUD elements: location dot, equipped item, sword, and hearts
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
                    for (var k in this.projectiles) {
                        this.projectiles[k].draw(this.ctx);
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
            this.drawBG();
        } else {
            console.log("Game.changeState() -- invalid state:", newState);
        }
    },
    setScreenBounds: function setScreenBounds(new_sb) {
        this.constants.screenBound = new_sb;
    },
    populateScreen: function game_populate() {
        // force garbage collection on last screen's items
        for (var i in this.items) {
            delete this.items[i];
        }

        // get any items defined by this screen's definition
        var itemDefs = this.map.currentScreen().items;
        for (var i in itemDefs) {
            var item = null;
            var args = {pos: itemDefs[i].position, color: itemDefs[i].color};
            switch (itemDefs[i].type.toLowerCase()) {
                case 'sword':
                    item = new loc.Sword(args);
                    break;
                case 'shield':
                    item = new loc.Shield(args);
                    break;
                case 'ring':
                    item = new loc.Ring(args);
                    break;
                case 'boomerang':
                    item = new loc.Boomerang(args);
                    break;
                case 'bomb':
                    item = new loc.Bomb(args);
                    break;
                case 'bow':
                    item = new loc.Bow(args);
                    break;
                case 'arrow':
                    item = new loc.Arrow(args);
                    break;
                case 'candle':
                    item = new loc.Candle(args);
                    break;
                case 'whistle':
                    item = new loc.Whistle(args);
                    break;
                case 'bait':
                    item = new loc.Bait(args);
                    break;
                case 'letter':
                    item = new loc.Letter(args);
                    break;
                case 'medicine':
                    item = new loc.Medicine(args);
                    break;
                case 'wand':
                    item = new loc.Wand(args);
                    break;
                case 'bigheart':
                    item = new loc.BigHeart(args);
                    break;
                case 'heart':
                    item = new loc.Heart(args);
                    break;
                case 'rupee':
                    args.amount = itemDefs[i].amount;
                    item = new loc.Rupee(args);
                    break;
                default:
                    break;
            }
            if (item) {
                item._index = i;
                this.items[i] = item;
            }
        }

        // force garbage collection on last screen's projectiles
        for (var i in this.projectiles) {
            delete this.projectiles[i];
        }

        // force garbage collection on last screen's enemies
        for (var e in this.monsters) {
            delete this.monsters[e];
        }
        
        // spawn new monsters for this screen
        var enemyDefs = dojo.clone(this.map.currentScreen().enemies);
        for (var e in enemyDefs) {
            var creature = null;
            var args = { pos:enemyDefs[e]['position'], scale: game.scale, size: {w:16,h:16}, color: enemyDefs[e]['color'], index: this.monsters.length };

            switch (enemyDefs[e]['type']) {
                case 'armos':
                    creature = new loc.Armos(args);
                    break;
                case 'ghini':
                    creature = new loc.Ghini(args);
                    break;
                case 'leever':
                    creature = new loc.Leever(args);
                    break;
                case 'lynel':
                    creature = new loc.Lynel(args);
                    break;
                case 'moblin':
                    creature = new loc.Moblin(args);
                    break;
                case 'octoroc':
                    creature = new loc.Octoroc(args);
                    break;
                case 'peahat':
                    creature = new loc.Peahat(args);
                    break;
                case 'rock':
                    creature = new loc.Boulder(args);
                    break;
                case 'tectite':
                    creature = new loc.Tectite(args);
                    break;
                case 'zola':
                    creature = new loc.Zola(enemyDefs[e]['position']);
                    break;
                default:
                    break;
            }
            if (creature) {
                creature._index = e;
                this.monsters[e] = creature;
            }
        }
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
    refresh: function game_refresh() {
        this.drawBG();
        this.populateScreen();
    },
    reset: function game_reset() {
        this.map.reset();
        this.player.reset();
        this.refresh();
    },
    _handleStartButton: function game_handleStart() {
        if (this._timerid) {
            switch (this.currentState) {
                case this.constants.states.gameover:
                    // restart the game (TODO: at some point we'll have to detect CONTINUE/SAVE/RETRY state)
                    this.reset();
                    break;

                case this.constants.states.overworld:
                    this.changeState(this.constants.states.inventory);
                    break;

                case this.constants.states.inventory:
                    this.changeState(this.constants.states.overworld);
                    break;

                case this.constants.states.dungeon:
                    this.changeState(this.constants.states.map);
                    break;

                case this.constants.states.map:
                    this.changeState(this.constants.states.dungeon);
                    break;

                case this.constants.states.dying:
                default:
                    // do nothing
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
