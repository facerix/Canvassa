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
dojo.require("loc.Sounds");
//dojo.require("loc.SoundStub");

var game;   // global, defined elsewhere as the instance of this class

dojo.declare("loc.Game", null, {
    map: null,
    map_ctx: null,
    ctx: null,
    scale: 1,
    currDirKey: 0,
    allowTurbo:  false,
    aButton:  false,
    bButton:  false,
    interval:  30,
    constants: {},
    currentState: 'title',
    monsters: [],
    items: [],
    projectiles: [],
    _nextWarpTo: 0,
    _whistleWarps: [
       {'screenX':7,'screenY':3,'posX':128,'posY':88},
       {'screenX':12,'screenY':3,'posX':128,'posY':88},
       {'screenX':4,'screenY':7,'posX':128,'posY':88},
       {'screenX':5,'screenY':4,'posX':128,'posY':88},
       {'screenX':11,'screenY':0,'posX':128,'posY':88},
       {'screenX':2,'screenY':2,'posX':128,'posY':88},
       {'screenX':2,'screenY':4,'posX':128,'posY':120},
       {'screenX':13,'screenY':6,'posX':128,'posY':40},
       {'screenX':5,'screenY':0,'posX':128,'posY':88}
    ],
    constructor: function game_constructor(args){
        this.map_ctx = args.map_context;
        this.map_ctx.fillStyle = "#FCD8A8";
        this.ctx = args.sprite_context;
        this.scale = args.scale;
        this.constants.direction = { left: 0, up: 1, right: 2, down: 3 };
        this.constants.states = { overworld: 'overworld',
                                  inventory: 'inventory',
                                  dungeon: 'dungeon',
                                  map: 'map',
                                  dying: 'dying',
                                  gameover: 'gameover',
                                  title: 'title',
                                  menu: 'menu',
                                  loading: 'loading',
                                  cheat: 'cheat',
                                  unpausable: {'gameover':0,'title':1,'menu':2,'loading':3} };
        this.constants.screenBound = args.screenBounds;
        this.player = new loc.Player({
            scale:this.scale, size:{w:16,h:16}
        });
        this.font = new loc.Font();
        this.spriteListener = dojo.subscribe("sprite.onTerminate", function(spriteClass, baseClass, index) {
            //console.log("caught sprite.onTerminate(",spriteClass, baseClass, index, ")");
            switch (baseClass) {
                case "loc.Player":
                    game.over();
                    break;
                case "loc.Monster":
                    if (index != 'undefined') {
                        delete game.monsters[index];
                    }
                    break;
                case "loc.Item":
                    if (index != 'undefined') {
                        delete game.items[index];
                    }
                    break;
                case "loc.Projectile":
                    if (index != 'undefined') {
                        delete game.projectiles[index];
                    }
                    break;
                default:
                    console.log("caught unknown type of sprite.onTerminate(",spriteClass, baseClass, index, ")");
                    break;
            }
        });
        this.projectileListener = dojo.subscribe("monster.onAttack", function(spriteClass, index) {
            //console.log("caught monster.onAttack(",spriteClass, index, ")");
            if (index != 'undefined' && game.monsters[index]) {
                var newProj = game.monsters[index].getProjectile();
                if (newProj) {
                    game.insertProjectile(newProj);
                }
            }
        });
        this._playerListener = dojo.subscribe("player.onDie", function() { game.changeState( game.constants.states.dying ); });
        this._warpListener = dojo.subscribe("whistle.onEnd", function() { game.warp(); });

        // build the misc GUI sprites
        this._selectIcon = new loc.SelectIcon({scale:this.scale, size:{w:8,h:8}, pos:{x:64, y:80}});

        // change to title screen, until quest is selected/loaded
        this.changeState(this.constants.states.title);
    },
    loadQuest: function game_loadQuest(gameData) {
        window.questData = gameData;

        // load map data
        this.map = new loc.Map({data: gameData, ctx: this.map_ctx,
            tileImg: window.imageCache.getImage("tiles"), scale: this.scale});

        // draw initial screen
        this.setupMapScreen();

        // setup the player according to the quest data
        this.player.pos = dojo.clone(gameData.startPosition);

        // only change state when the map is fully ready
        game.changeState(game.constants.states.overworld);
    },
    _handleSelectButton: function game_handleSelect() {
        if (this.currentState == this.constants.states.gameover) {
            // cycle through the "game over" options: continue, save, retry
        } else {
            this._togglePause();
        }
    },
    _handleStartButton: function game_handleStart() {
        if (this._timerid) {
            switch (this.currentState) {
                case this.constants.states.title:
                    this.changeState(this.constants.states.menu);
                    break;

                case this.constants.states.menu:
                    // load Quest1 (TODO: actually check for selected quest and load the correct one)
                    dojo.xhrGet( {
                        url: 'loc/quests/_quest1.js',
                        handleAs: "json",
                        preventCache: false,
                        load: function(response){
                            game.loadQuest(response);
                        },
                        error: function(response, ioArgs) {
                            console.log("Error getting quest data:", response, ioArgs);
                        }
                    });
                    break;

                case this.constants.states.gameover:
                    // restart the game (TODO: detect CONTINUE/SAVE/RETRY state and act appropriately)
                    this.changeState(this.constants.states.overworld);
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
                    break;
                    
                default:
                    // do nothing
                    break;

            } // end switch
        } // end if
    },
    _togglePause: function game_togglePause() {
        if (this.currentState in this.constants.states.unpausable) { return; }

        // todo: make the little pause sound
        if (this._timerid) {
            this.font.drawText(this.map_ctx, "PAUSED", 104,4, this.scale);
            soundManager.pauseAll();
            this.stop();
        } else {
            this.map_ctx.fillStyle = "black";
            this.map_ctx.fillRect(104,4, 48*this.scale, 8*this.scale);
            this.start();
            soundManager.resumeAll();
        }
    },
    _cheat: function() {
        soundManager.play('special');
        soundManager.play('item');
        this.player.HP = 32;
        this.player.maxHP = 32;
        this.player._sword = 2;
        this.player._tunic = 2;
        this.player._rupees = 999;
        this.player._maxBombs = 99;
        this.player._bombs = 99;

        this.player.inventory = {
            0: new loc.Boomerang({pos:{x:0,y:0},color:1}),
            1: new loc.Bomb({pos:{x:0,y:0}}),
            2: new loc.Bow({pos:{x:0,y:0},arrowColor:1}),
            3: new loc.Candle({pos:{x:0,y:0},color:1}),
            4: new loc.Whistle({pos:{x:0,y:0}}),
            5: new loc.Bait({pos:{x:0,y:0}}),
            6: new loc.Medicine({pos:{x:0,y:0},color:1}),
            7: new loc.Wand({pos:{x:0,y:0}})
        };
    },
    main: function game_main() {
        var i = 0; // loop counter
        
        // draw everything
        if (game.map) {
            try {
                game.drawSprites();
            } catch(e) {
                console.error("error drawing sprites:",e,"[in game_main()]");
                game.stop();
            }

            // update player, monster, and projectile positions if on the overworld/dungeon screens
            if (game.currentState == game.constants.states.overworld || game.currentState == game.constants.states.dungeon) {
                // handle enemy AI
                for (i in game.monsters) {
                    game.monsters[i].think();
                }

                // move all active projectiles
                for (i in game.projectiles) {
                    if ("updatePosition" in game.projectiles[i]) { game.projectiles[i].updatePosition(); }
                }

                // do sprite collision tests
                game.doHitTests();

                // check if the player is walking onto an adjacent screen
                game.checkBoundaries();
            }
        } else {
            // no map defined yet; that means we're still on the title/menu/loading/etc screens
            // (do whatever input checks we need to do here)
        }
    },
    checkBoundaries: function game_checkBoundaries() {
        // moving north / south?
        if (this.player.vector.y < 0 && (Math.abs(this.player.pos.y - this.constants.screenBound.top) <= 12) && (this.map.north())) {
            this.setupMapScreen();
            this.player.pos.y = this.constants.screenBound.bottom;
        } else if (this.player.vector.y > 0 && (Math.abs(this.player.pos.y - this.constants.screenBound.bottom) <= 12) && (this.map.south())) {
            this.setupMapScreen();
            this.player.pos.y = this.constants.screenBound.top;
        }

        // moving east / west?
        if (this.player.vector.x < 0 && (Math.abs(this.player.pos.x - this.constants.screenBound.left) <= 12) && (this.map.west())) {
            this.setupMapScreen();
            this.player.pos.x = this.constants.screenBound.right - this.player._halfw;
        } else if (this.player.vector.x > 0 && (Math.abs(this.player.pos.x - this.constants.screenBound.right) <= 12) && (this.map.east())) {
            this.setupMapScreen();
            this.player.pos.x = this.constants.screenBound.left + this.player._halfw;
        }
    },
    doHitTests: function game_doHitTests() {
        var i = 0; var j = 0; // loop counters
        var hits = null; var attacker = null; var item = null; var proj = null;
        var dx = 0; var dy = 0; // projectile offsets
        
        // we only care about collision detection if in overworld or dungeon modes
        if (this.currentState == this.constants.states.overworld || this.currentState == this.constants.states.dungeon) {
            // do sprite collision tests for Link
            hits = this.hitTest(this.player.pos.x-8, this.player.pos.y-8, 16,16);

            // check to see if any monsters are touching the player; if so, he's hurt to the tune of their relative strength
            for (i in hits[0]) {
                attacker = hits[0][i];
                if (attacker.canAttack()) {
                    game.player.getHit(attacker.strength);
                    break;
                } else if (attacker.declaredClass == "loc.Armos" && !attacker.isActive()) {
                    attacker.wake();
                }
            }

            // see if there is anything to pick up
            for (i in hits[1]) {
                item = hits[1][i];
                this.player.getItem(item);
                this.map.currentScreen().removeItem(item.declaredClass);
                delete game.items[item._index];
            }

            // if there are any projectiles in play, see if they hit anything, too
            for (i in this.projectiles) {
                proj = this.projectiles[i];
                // player-owned projectiles can only damage enemies, and vice-versa, so check projectile type against hit target type
                if (proj.owner == this.player) {
                    // player projectiles
                    hits = this.hitTest(proj.pos.x, proj.pos.y, proj.size.w, proj.size.h);

                    for (j in hits[0]) {
                        proj.hit(hits[0][j]);
                    }

                    if (proj.declaredClass == 'loc.BoomProj' || proj.declaredClass == 'loc.ArrowProj') {
                        //console.log("checking projectile's item hitlist:",proj, hits);
                        // boomerangs and arrows can also retrieve small items (hearts, rupees)
                        for (j in hits[1]) {
                            item = hits[1][j];
                            if (item.size === 0) {
                                //console.log("getting item:",item);
                                this.player.getItem(item);
                                delete game.items[item._index];
                            }
                        }
                    }
                } else {
                    // enemy projectiles
                    dx = Math.abs(proj.pos.x-this.player.pos.x);
                    dy = Math.abs(proj.pos.y-this.player.pos.y);
                    if (dx <= proj.size.w && dy <= proj.size.h) {
                        proj.hit(this.player);
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
        //console.log("game.hitTest(%d,%d,%d,%d)", x, y, w, h, this.monsters, this.items);

        var enemyHits = []; var itemHits = [];
        var dx = 0; var dy = 0; // projectile offsets

        for (var e in this.monsters) {
            var enemy = this.monsters[e];
            dx = Math.abs(x-enemy.pos.x);
            dy = Math.abs(y-enemy.pos.y);
            //console.log("test: [%o] -> [%d,%d] ? (dx: %d, dy: %d)",enemy.pos,x,y, dx,dy);
            if (dx <= w && dy <= h && enemy.canGetHit()) {
                enemyHits.push(enemy);
            }
        }

        for (var i in this.items) {
            var item = this.items[i];
            item.index = i;
            dx = Math.abs(x-item.pos.x);
            dy = Math.abs(y-item.pos.y);
            //console.log("test: [%o] -> [%d,%d] ? (dx: %d, dy: %d)",item.pos,x,y, dx,dy);
            if (dx <= w && dy <= h) {
                itemHits.push(item);
            }
        }

        return [enemyHits,itemHits];
    },
    drawBG: function game_drawBG() {
        var img = null; // cached image holder
        switch (this.currentState) {
            case this.constants.states.title:
                // draw title screen
                img = window.imageCache.getImage("title");
                this.map_ctx.drawImage(img, 0,0,256,240, 0,0,256*this.scale,240*this.scale);
                break;

            case this.constants.states.menu:
                // draw menu screen
                img = window.imageCache.getImage("select");
                this.map_ctx.drawImage(img, 0,0,256,240, 0,0,256*this.scale,240*this.scale);

                // TODO: draw names/stats of available quests/savegames
                this.font.drawText(this.map_ctx, "Quest 1", 72,88, this.scale);

                break;

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
                img = window.imageCache.getImage("HUD");
                this.map_ctx.drawImage(img, 0,0,256,240, 0,0,256*this.scale,240*this.scale);
                break;

            //case this.constants.states.overworld:
            //case this.constants.states.dungeon:
            default:
                // draw HUD (status bar)
                img = window.imageCache.getImage("HUD");
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
                    console.error("error drawing sprites:",e, "[in game_drawBG(default)]");
                    this.stop();

                } finally {
                    this.map_ctx.restore();
                }

        } // end switch
    },
    drawSprites: function game_drawSprites() {
        var i = 0; // loop counter
        var debug_pos = null;
        
        // clear the sprite canvas
        this.ctx.clearRect(0,0,256*this.scale,240*this.scale);
        //console.log("game.drawSprites(currentState:",this.currentState,")");

        switch (this.currentState) {
            case this.constants.states.title:
            case this.constants.states.loading:
                break;

            case this.constants.states.menu:
                // TODO: draw heart selector (see gameover state below)
                break;

            case this.constants.states.dying:
                this.ctx.save();
                this.ctx.translate(0,64*this.scale);

                try {
                    // draw monsters
                    //for (var i in this.monsters) {
                    //    this.monsters[i].draw(this.ctx);
                    //}

                    // draw player
                    if (this.player) {
                        this.player.draw(this.ctx);
                    }

                } catch(e) {
                    console.error("error drawing sprites:",e,"[in game_drawSprites(dying)]");
                    this.stop();

                } finally {
                    this.ctx.restore();
                }
                break;

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

            //case this.constants.states.overworld:
            //case this.constants.states.dungeon:
            default:
                // draw HUD elements: location dot, equipped item, sword, and hearts
                if (this.player) {
                    this.player.drawInventory(this.ctx, 0);
                }

                this.ctx.save();
                this.ctx.translate(0,64*this.scale);

                try {
                    // draw monsters
                    if (this.monsters) {
                        for (i in this.monsters) {
                            debug_pos = "monsters:"+i;
                            this.monsters[i].draw(this.ctx);
                        }
                    }

                    // draw items and projectiles
                    for (i in this.items) {
                        debug_pos = "items:"+i;
                        this.items[i].draw(this.ctx);
                    }
                    for (i in this.projectiles) {
                        debug_pos = "projectiles:"+i;
                        this.projectiles[i].draw(this.ctx);
                    }

                    // draw player
                    if (this.player) {
                        debug_pos = "player";
                        this.player.draw(this.ctx);
                    }

                } catch(ex) {
                    console.error("Error drawing game sprites:",ex,"[in game_drawSprites(default): debug pos:",debug_pos,"]");
                    console.debug("monsters[",i,"] is:",this.monsters[i]);
                    this.stop();

                } finally {
                    this.ctx.restore();
                }
                break;
        } // end switch
    },
    changeState: function game_changeState(newState) {
        if (newState in this.constants.states) {
            // trigger sounds?
            if (newState == this.constants.states.title) {
                soundManager.stopAll();
                soundManager.play('title');
            } else if (newState == this.constants.states.dying) {
                soundManager.stopAll();
                soundManager.play('die');
            } else if (newState == this.constants.states.gameover) {
                soundManager.stopAll();
                soundManager.play('gameover');
            } else if (this.currentState == this.constants.states.title) {
                soundManager.stop('title');
            } else if (this.currentState == this.constants.states.menu) {
                if (newState == this.constants.states.overworld) {
                    soundManager.play('bgmStart');
                } else if (newState == this.constants.states.dungeon) {
                    soundManager.play('dungeonBgmStart');
                }
            }

            // do the state change
            this.currentState = newState;
            this.drawBG();

        } else {
            console.log("Game.changeState() -- invalid state:", newState);
        }
    },
    setScreenBounds: function setScreenBounds(new_sb) {
        this.constants.screenBound = new_sb;
    },
    resetScreen: function game_reset_screen() {
        var i = 0; // loop counter
        for (i in this.monsters) {
            delete this.monsters[i];
        }
        for (i in this.projectiles) {
            delete this.projectiles[i];
        }
        for (i in this.items) {
            delete this.items[i];
        }
        this.monsters = [];
        this.projectiles = [];
        this.items = [];
        this.ctx.clearRect(0,0,256*this.scale,240*this.scale);
    },
    populateScreen: function game_populate() {
        // force garbage collection on last screen's enemies, projectiles, and items
        this.resetScreen();

        // get any items defined by this screen's definition
        var itemDefs = this.map.currentScreen().items;
        for (var i in itemDefs) {
            var args = dojo.mixin({}, itemDefs[i]);
            var item = loc.Item.getNamedSubtype(itemDefs[i].type, args);
            if (item) {
                item._index = i;
                this.items[i] = item;
            } else {
                console.warn('failed to create item:',args);
            }
        }

        // spawn new monsters for this screen
        var enemyDefs = dojo.clone(this.map.currentScreen().enemies);
        for (var e in enemyDefs) {
            var newArgs = dojo.mixin({ scale: game.scale, size: {w:16,h:16}, index: this.monsters.length }, enemyDefs[e]);
            var enemy = loc.Monster.getNamedSubtype(enemyDefs[e].type, newArgs);
            if (enemy) {
                enemy._index = e;
                this.monsters[e] = enemy;
            }
        }
    },
    insertItem: function game_insertItem(itm) {
        if (itm) {
            if (!("_index" in itm) || !(itm._index)) {
                itm._index = this.items.length;
            }
            this.items.push(itm);
        }
    },
    insertMonster: function game_insertMonster(mnstr) {
        if (mnstr) {
            mnstr.index = this.monsters.length;
            this.monsters.push(mnstr);
        }
    },
    insertProjectile: function game_insertProjectile(proj) {
        if (proj) {
            proj.index = this.projectiles.length;
            this.projectiles.push(proj);
        }
    },
    start: function game_start(interval_override) {
        if (interval_override) { this.interval = interval_override; }

        // start the main game loop
        if (!this._timerid) {
            this._timerid = setInterval(game.main, this.interval);
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
        // handle start/select first; they're universals
        if (keyCode == 219) {
            // select
            this._handleSelectButton();
            return;
        } else if (keyCode == 221) {
            // start
            this._handleStartButton();
            return;
        }

        switch(this.currentState) {
            case this.constants.states.overworld:
            case this.constants.states.dungeon:
                if (this.currDirKey == keyCode) { return; }
                var dx = 0; var dy = 0;
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

                    default:
                        //console.log("key pressed:", keyCode);
                        break;
                }
                if (dx !== 0 || dy !== 0) {
                    this.player.moveVector({x:dx,y:dy});
                    this.currDirKey = keyCode;
                }

                break;

            case this.constants.states.inventory:
            case this.constants.states.map:
                switch(keyCode){
                    case 39: // right
                        this.player.changeItem(1);
                           break;
                    case 37: // left
                        this.player.changeItem(-1);
                        break;
                    case 38: // up
                        this.player.changeItem(-4);
                        break;
                    case 40: // down
                        this.player.changeItem(4);
                        break;

                    default:
                        break;
                }


                break;

            case this.constants.states.gameover:
                // handle Continue/Save/Retry option selection
                break;

            default:
                // do nothing in any other state
        }
    },
    keyUp: function game_keyUp(keyCode) {
        if (this.currentState in this.constants.states.unpausable) { return; }

        window.konami.check_input(keyCode);
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
    setupMapScreen: function game_setupMapScreen() {
        this.player.killProjectile();
        this.populateScreen();
        this.drawBG();
    },
    reset: function game_reset() {
        this.resetScreen();
        this.player.reset();
        if (!this._timerid) { this.start(); }  // unpause if paused
        this.changeState(this.constants.states.title);
    },
    paused: function game_paused() {
        return (!this._timerid);
    },
    warp: function game_warp() {
        var warpTo = this._whistleWarps[this._nextWarpTo++];
        if (this._nextWarpTo >= this._whistleWarps.length) { this._nextWarpTo = 0; }

        this.warpTo(warpTo.screenX, warpTo.screenY, 0, warpTo.posX, warpTo.posY);
    },
    warpTo: function game_warpTo(x,y,z,posX,posY) {
        this.map.setCurrentScreen(x,y); // ignore z (map z-index/layer) for now

        // move the player to the specified position, or the questData default if not specified
        this.player.pos.x = (posX) ? posX : window.questData.startPosition.x;
        this.player.pos.y = (posY) ? posY : window.questData.startPosition.y;

        game.setupMapScreen();
    }
});
