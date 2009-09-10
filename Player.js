/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.require("loc.Sprite");
dojo.require("loc.Item");
dojo.provide("loc.Player");

dojo.declare("loc.Player", loc.Sprite, {
    _rupees: 0,
    _keys: 0,
    _bombs: 0,
    _maxBombs: 8,
    _shield: 0, /* default shield=0, large shield=1, mirror shield=2 */
    _tunic: 0,  /* 0: green, 1: blue, 2: red */
    _item: 0,   /* currently-held item (i.e. position within the this.inventory array) */
    _sword: -1, /* start without a sword */
    _arrow: -1, /* start without any arrows */
    _newItem: {}, /* keeps track of any item I'm holding up */
    _hurtTimer: 0,
    HP: 6,     /* what's my starting HP? (each heart is actually 2 HP, each half-heart is one... this way we avoid floats) */
    maxHP: 6,  /* how many pieces of heart do I have? (3 hearts * 2 halves each: 6) */
    startingPosition: {x: 128, y:88},
    inventory: {  /* smaller inventory items */
        0: null, /*new loc.Boomerang({pos:{x:0,y:0},color:1}),*/
        1: null, /*new loc.Bomb({pos:{x:0,y:0}}),*/
        2: null, /*new loc.Bow({pos:{x:0,y:0},arrowColor:0}),*/
        3: null, /*new loc.Candle({pos:{x:0,y:0},color:0}),*/
        4: null, /*new loc.Whistle({pos:{x:0,y:0}}),*/
        5: null, /*new loc.Bait({pos:{x:0,y:0}}),*/
        6: null, /*new loc.Letter({pos:{x:0,y:0}}),*/
        7: null, /*new loc.Wand({pos:{x:0,y:0}})*/
    },
    tools: {  /* larger inventory items, cannot be equipped and used directly */
        0: null,  /* raft            */
        1: null,  /* magic book      */
        2: null,  /* ladder          */
        3: null,  /* power bracelet  */
    },
    triforces: {  /* retrieved triforce shards */
        0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
    },

    constructor: function sprite_constructor(args){
        this._speed = 3;
        if (!(window.imageCache.hasImage("link"))) { window.imageCache.addImage("link", "../res/link.png"); };
        this.spriteSrc = "link"
        this.pos = dojo.clone(this.startingPosition);

        dojo.mixin(this,args);
        this._stateDefs = [
                { name: 'stand/walk', faceted:true, nextState: 0, canMove: true, anim: [
                  [ {x:0,y:0,t:5},{x:0,y:16,t:5} ],   /* facing==0 (left)  */
                  [ {x:16,y:0,t:5},{x:16,y:16,t:5} ], /* facing==1 (up)    */
                  [ {x:32,y:0,t:5},{x:32,y:16,t:5} ], /* facing==2 (right) */
                  [ {x:48,y:0,t:5},{x:48,y:16,t:5} ]  /* facing==3 (down)  */
                ]},
                { name: 'die', faceted: false, nextState: -1, canMove: false, anim: [
                  [ {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:2},
                    {x:0,y:0,t:2},{x:16,y:0,t:2},{x:32,y:0,t:2},{x:48,y:0,t:20},
                    {x:160,y:16,t:6},{x:176,y:16,t:3},{x:192,y:16,t:35} ]
                ]},
                { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
                  [ {x:128,y:0,t:6} ],   /* facing==0 (left)  */
                  [ {x:144,y:0,t:6} ], /* facing==1 (up)    */
                  [ {x:160,y:0,t:6} ], /* facing==2 (right) */
                  [ {x:176,y:0,t:6} ]  /* facing==3 (down)  */
                ]},
                { name: 'smallItem', faceted:false, nextState: 0, canMove: false, anim: [
                  [ {x:128,y:16,t:30} ]
                ]},
                { name: 'bigItem', faceted:false, nextState: 0, canMove: false, anim: [
                  [ {x:144,y:16,t:30} ]
                ]},
                { name: 'catch', faceted:true, nextState: 0, canMove: false, anim: [
                  [ {x:128,y:0,t:6} ],
                  [ {x:144,y:0,t:6} ],
                  [ {x:160,y:0,t:6} ],
                  [ {x:176,y:0,t:6} ]
                ]}
            ];

        this._shield = 0;      // default shield=0; large shield=1; mirror shield=2
        this._tunic = 0;       // 0 = green; 1 = blue; 2 = red
    },
    _animTick: function _animTick() {
        // decrement the "hurt" counter, if active
        if (this._hurtTimer) { this._hurtTimer--; }

        // apply anim frame offsets if applicable
        var dx = dy = 0;
        switch (this._state) {
            case 0:
                // default stand/walk: offset X position for shield, then flow into default for tunic coloring
                if (this._shield>0) { dx = 64; }

            default:
                // offset for the ring you're wearing, if any
                if (this._tunic > 0) {
                    dy += 32*this._tunic;
                }
                break;
        }
        var retVal = this.inherited(arguments);
        return {x: retVal.x+dx, y: retVal.y+dy};
    },
    drawInventory: function(ctx,mode){
        // set up some constants
        var itemWidth = halfHeight = 8 * this.scale;
        var itemHeight = 16 * this.scale;
        var yoffset = 0;
        

        // if we're viewing the inventory screen, draw what we've got
        if (mode==1) {
            // offset the HUD portion of inventory
            yoffset = 175*this.scale;

            // first row
            for (var itemIndex=0; itemIndex < 4; itemIndex++) {
                if (this.inventory[itemIndex]) {
                    this.inventory[itemIndex].drawIcon(ctx, (132+24*itemIndex)*this.scale, 55*this.scale, 1);
                }
            }

            // second row
            for (itemIndex; itemIndex < 8; itemIndex++) {
                if (this.inventory[itemIndex]) {
                    this.inventory[itemIndex].drawIcon(ctx, (36+24*itemIndex)*this.scale, 71*this.scale, 1);
                }
            }
            
            // selector
            //ctx.strokeStyle = "rgb(68,0,189)";
            ctx.strokeStyle = "rgb(189,68,0)";
            var selx = sely = 0;
            if (this._item < 4) {
                selx = 128+24*this._item;
                sely = 55;
            } else {
                selx = 32+24*this._item;
                sely = 71;
            }
            ctx.beginPath();
            ctx.moveTo(selx*this.scale,sely*this.scale);
            ctx.lineTo((selx+2)*this.scale,sely*this.scale);
            ctx.moveTo((selx+14)*this.scale,sely*this.scale);
            ctx.lineTo((selx+16)*this.scale,sely*this.scale);
            ctx.lineTo((selx+16)*this.scale,(sely+2)*this.scale);
            ctx.moveTo((selx+16)*this.scale,(sely+14)*this.scale);
            ctx.lineTo((selx+16)*this.scale,(sely+16)*this.scale);
            ctx.lineTo((selx+14)*this.scale,(sely+16)*this.scale);
            ctx.moveTo((selx+2)*this.scale,(sely+16)*this.scale);
            ctx.lineTo(selx*this.scale,(sely+16)*this.scale);
            ctx.lineTo(selx*this.scale,(sely+14)*this.scale);
            ctx.moveTo(selx*this.scale,(sely+2)*this.scale);
            ctx.lineTo(selx*this.scale,sely*this.scale);
            ctx.closePath()
            ctx.stroke();
        }

        // -- HUD portion of inventory (available in both modes) --

        // draw my position on the overworld map (map starts at x:16,y:24, and is w:64,h:32; dot is 3x3 on a 4x4 matrix of mapscreens)
        var currMapScreen = (game.map && 'currentScreen' in game.map) ? game.map.currentScreen() : {x:1,y:1};
        var xpos = (currMapScreen.x * 4 + 16) * this.scale;
        var ypos = (currMapScreen.y * 4 + 24) * this.scale;
        var dotSize = 3 * this.scale;
        switch (this._tunic) {
          case 0:
            ctx.fillStyle = "rgb(144,213,0)";
            break;
          case 1:
            ctx.fillStyle = "rgb(184,184,248)";
            break;
          case 2:
            ctx.fillStyle = "rgb(248,56,0)";
            break;
        }
        ctx.fillRect(xpos,ypos+yoffset,dotSize,dotSize);
        
        // draw counts for my rupees, keys, and bombs
        game.font.drawText(ctx, this._rupees+"", (this._rupees < 100)?104:96,23+yoffset, this.scale);
        game.font.drawText(ctx, this._keys+"", 104,39+yoffset, this.scale);
        game.font.drawText(ctx, this._bombs+"", 104,47+yoffset, this.scale);
        
        // draw my currently-equipped item
        if (this.inventory[this._item]) {
            // draw it in the B[] box in the HUD
            this.inventory[this._item].drawIcon(ctx, 128*game.scale, 32*game.scale+yoffset);

            // if on the inventory screen, draw it in the "use B for this" box
            if (mode==1) {
                this.inventory[this._item].drawIcon(ctx, 68*game.scale, 56*game.scale);
            }
        }
        
        // draw my current sword (image x/y cut: this._sword*8,8)
        if (this._sword>=0) {
            ctx.drawImage(window.imageCache.getImage('items'), this._sword*8,8,8,16, 152*game.scale, 32*game.scale+yoffset, itemWidth, itemHeight);
        }
        
        // draw hearts for my current HP/MaxHP (first row of hearts starts at x:176,y:48)
        xpos = 176 * game.scale; dx=0;
        ypos =  48 * game.scale; dy=0;
        for (var x=2; x <= this.maxHP; x+=2) {
            if (x > 16) { dx = -64*game.scale; dy = -8*game.scale; }
            
            // draw the next heart
            var diff = x - Math.ceil(this.HP);
            var offset = 0;
            if (diff > 1) {
                // draw an empty heart
                offset = 16;
            } else if (diff == 1) {
                // draw a half-full heart
                offset = 8;
            }
            ctx.drawImage(window.imageCache.getImage('items'), offset,0,8,8, xpos+dx, ypos+dy+yoffset, itemWidth, halfHeight);
            
            // shift drawing position to next heart
            xpos += itemWidth;
        }
    },
    die: function die() {
        dojo.publish("player.onDie", []);
        this.inherited(arguments);
    },
    reset: function reset(){
        this.inherited(arguments);
        this.HP = 6; this.maxHP = 6;
        this._shield = 0; this._tunic = 0; this._sword = -1;
        this._item = 0; this._newItem = {}; this._arrow = -1;
        this._rupees = 0; this._keys = 0;
        this._bombs = 0; this._maxBombs = 8;
        this.pos = dojo.clone(this.startingPosition);
        //this.inventory = this._getInventory();
        //this.tools = this._getTools();
        //this.triforces = this._getTriforceShards();
    },
    attack: function player_attack() {
        if (!this._proj) {
            this.changeState(2);

            var args = {
                vector: this._getAttackVector(),
                pos: dojo.clone(this.pos),
                scale: this.scale,
                spriteSrc: "items",
                index: game.projectiles.length,
                owner: this
            }
            args.width = (args.vector.x != 0) ? 16 : 7;
            args.height = (args.vector.y != 0) ? 16 : 7;
            args.size = {w: args.width, h: args.height};

            this._proj = new loc.SwordProj(args);
            game.projectiles.push(this._proj);
        }
    },
    _getAttackVector: function player_attackVector() {
        var v = this.vector;
        if (v.x == 0 && v.y == 0) {
            switch (this._facing) {
                case game.constants.direction.left:
                    v = {x: -1, y: 0};
                    break;
                case game.constants.direction.up:
                    v = {x: 0, y: -1};
                    break;
                case game.constants.direction.right:
                    v = {x: 1, y: 0};
                    break;
                case game.constants.direction.down:
                    v = {x: 0, y: 1};
                    break;
            }
        }
        return v;
    },
    useItem: function player_useItem() {
        var itm = this.inventory[this._item];
        if (itm) {  // only if we actually HAVE a current item
            if ('use' in itm) {
                //this.changeState(2);
                itm.use();
            } else if ('getProjectile' in itm) {
                if (this._proj == null) {
                    // check any 'cost' associated with this projectile type
                    var canUse = true;
                    switch (itm.declaredClass) {
                        case 'loc.Bow':
                            if (this._rupees) {
                                canUse = true;
                                this._rupees--;
                            } else {
                                canUse = false;
                            }
                            break;
                        default:
                            break;
                    }

                    if (canUse) {
                        this.changeState(2);
                        var vec = this._getAttackVector();
                        var args = {
                            vector: vec,
                            pos: dojo.clone(this.pos),
                            scale: this.scale,
                            color: itm.color,
                            spriteSrc: "items",
                            index: game.projectiles.length,
                            owner: this
                        }
                        var newProj = itm.getProjectile(args);
                        if (newProj) {
                            this._proj = newProj;
                            game.projectiles.push(newProj);
                        }
                    }
                }
            } else {
                console.log("I don't know how to use this item:",itm);
            }
        }
    },
    catchItem: function player_catchItem(){
        this.changeState(5);
    },
    changeItem: function(offset){
        var newIndex = this._item+8;
        //soundManager.play('rupee');

        do {
            newIndex += offset; // try the next position
            if (this.inventory[(newIndex % 8)]) {
                // special case: the Arrow item isn't selectable without the Bow
                if (this.inventory[(newIndex % 8)].declaredClass != 'Arrow') {
                    this._item = (newIndex % 8);
                    return;
                }
            }
        } while ((newIndex % 8) != this._item)
    },
    getItem: function player_getItem(item){
        if (this._state == 0) {
            switch (item.declaredClass) {
                case "loc.Heart":
                    //soundManager.play('heart');
                    this.HP = Math.min(this.HP+2, this.maxHP);
                    break;
                case "loc.Rupee":
                    //soundManager.play('rupee');
                    this._rupees = Math.min(this._rupees+item.amount,255);
                    break;

                case "loc.Bomb":
                    //soundManager.play('special');
                    if (!this.inventory[1]) {
                        this.inventory[1] = item;
                    }
                    this._bombs = Math.min(this._bombs+4,this._maxBombs);
                    break;

                default:
                    console.log("getting item: %o", item);
                    //soundManager.pauseAll();
                    //soundManager.play('item');
                    this._newItem = item;
                    this.changeState(3);    // or 4 if it's a large item
            }
        }
    },
    getHit: function player_getHit(damage) {
        if (!this._hurtTimer) {
            this.HP -= damage;
            this._hurtTimer = 50;
            if (this.HP <= 0) {
                this.die();
            }
        }
    },
    killProjectile: function player_killProj() {
        if (this._proj) {
            if ('index' in this._proj) { delete game.projectiles[this._proj.index]; }
            this._proj = null;
        }
    }
});