/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.provide("loc.Item");
dojo.require("loc.Sprite");


dojo.declare("loc.Item", loc.Sprite, {
    color: 0,
    constructor: function sprite_constructor(args){
        if (!("spriteSrc" in args)) {
            args['spriteSrc'] = "items";
        }
        if (!(window.imageCache.hasImage(args['spriteSrc']))) {
            window.imageCache.addImage( args['spriteSrc'], "../res/"+args['spriteSrc']+".png" );
        }
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: false, anim: [ [{x:0,y:0,t:5}] ] }];
    },
    toString: function item_str(){
        return this.declaredClass + " [Color: " + this.color + "; Position: " + this.pos.x + "," + this.pos.y + "]";
    },
});

dojo.declare("loc.InventoryItem", null, {
    constructor: function invitem_constructor(args){
        dojo.mixin(this, args);
    },
    drawIcon: function(ctx, xpos, ypos){
        var w = this.width*game.scale;
        var h = this.height*game.scale;
        var cut = this._frames[0];
        var img = window.imageCache.getImage(this.spriteSrc);
        if (img) {
            this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: false, anim: [ [{x:0,y:0,t:5}] ] }];
            ctx.drawImage(img, cut.x,cut.y,this.width,this.height, xpos,ypos, w,h);
        }
    }
});

dojo.declare("loc.Sword", [loc.Item, loc.InventoryItem], {
    color: 0,
    constructor: function sword_constructor(args){
        dojo.mixin(this, args);
        this.width = 8; this.height = 16; this.size = {w:8, h: 16};
        /* (size is determined for me by my thrower, because it depends on the direction
            he's facing; it's provided as part of the args mixin) */

        this.vel = {x: this.vector.x * 5, y: this.vector.y * 5};

        this._stateDefs = [ { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [{x:80,y:0,t:1},{x:96,y:0,t:1},{x:112,y:0,t:1}],
            [{x:0,y:8,t:1},{x:8,y:8,t:1},{x:48,y:8,t:1}],
            [{x:32,y:0,t:1},{x:48,y:0,t:1},{x:64,y:0,t:1}],
            [{x:24,y:8,t:1},{x:32,y:8,t:1},{x:40,y:8,t:1}],
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        var w = this.width*game.scale;
        var h = this.height*game.scale;
        var cut = {x: this.color*8, y:8};
        var img = window.imageCache.getImage(this.spriteSrc);
        if (img) {
            ctx.drawImage(img, cut.x,cut.y, this.width,this.height, xpos,ypos, w,h);
        }
    }
});



dojo.declare("loc.SelectIcon", loc.Item, {
    constructor: function sprite_constructor(args){
        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [ [{x:0,y:0,t:5}] ] }];
    }
});

dojo.declare("loc.Heart", loc.Item, {
    constructor: function(args){
        this.width = 7; this.height = 8; this.size = {w:7,h:8};
        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: false,
            anim: [ [{x:0,y:0,t:10},{x:24,y:0,t:10}] ] }];
    },
    _animateCurrent: function heart_animateCurrent() {
        return true;
    }
});

dojo.declare("loc.Rupee", loc.Item, {
    amount: 1,
    constructor: function(args){
        this.width = 8; this.height = 16; this.size = {w: 8, h: 16};
        var anim = [];
        if (this.amount == 1) {
            anim = [{x:112,y:24,t:6},{x:120,y:24,t:6},{x:128,y:24,t:2}];
        } else if (this.amount == 5) {
            anim = [{x:120,y:24,t:6},{x:128,y:24,t:2}];
        } else {
            anim = [{x:112,y:24,t:100}];
        }
        this._stateDefs[0].anim[0] = anim;
    },
    _animateCurrent: function heart_animateCurrent() {
        return true;
    }
});


dojo.declare("loc.Projectile", loc.Item, {
    owner: null,
    vel: {x:0,y:0},
    power: 1,
    width: 8,
    height: 8,
    constructor: function(args){
        dojo.mixin(this, args);
    },
    updatePosition: function() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // check to see if I've gone off the edge of the screen
        var offscreen = true;
        if (this.vel.x < 0) {
            // moving left
            offscreen &= (this.pos.x < game.constants.screenBound.left);
        }
        if (this.vel.x > 0) {
            // moving right
            offscreen &= (this.pos.x > game.constants.screenBound.right);
        }
        if (this.vel.y < 0) {
            // moving up
            offscreen &= (this.pos.y < game.constants.screenBound.top);
        }
        if (this.vel.y > 0) {
            // moving down
            offscreen &= (this.pos.y > game.constants.screenBound.bottom);
        }

        if (offscreen) {
            this.terminate();
        }
    },
    hit: function(enemy){
        enemy.getHit(this.power);
        this.terminate();
    },
    terminate: function(){
        if (this.owner) {
            this.owner.killProjectile();
        } else if ('index' in this) {
            delete game.projectiles[this.index];
        }
    }
});

dojo.declare("loc.RockProj", loc.Projectile, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x: this.vector.x * 6, y: this.vector.y * 6};
        this.width = 8;
        this.height = 10;

        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [ [{x:152,y:0,t:2}] ] }];
    }
});

dojo.declare("loc.ArrowProj", loc.Projectile, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x: this.vector.x * 4, y: this.vector.y * 4};

        this._stateDefs = [ { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [{x:80,y:58,t:2}], // west
            [{x:32,y:56,t:2}], // north
            [{x:64,y:58,t:2}], // east
            [{x:48,y:56,t:2}], // south
        ] }];
    }
});

dojo.declare("loc.SwordProj", loc.Projectile, {
    constructor: function(args){
        dojo.mixin(this, args);
        /* (size is determined for me by my thrower, because it depends on the direction
            he's facing; it's provided as part of the args mixin) */

        this.vel = {x: this.vector.x * 5, y: this.vector.y * 5};

        this._stateDefs = [ { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [{x:80,y:0,t:1},{x:96,y:0,t:1},{x:112,y:0,t:1}],
            [{x:0,y:8,t:1},{x:8,y:8,t:1},{x:48,y:8,t:1}],
            [{x:32,y:0,t:1},{x:48,y:0,t:1},{x:64,y:0,t:1}],
            [{x:24,y:8,t:1},{x:32,y:8,t:1},{x:40,y:8,t:1}],
        ] }];
    }
});

dojo.declare("loc.MagicProj", loc.Projectile, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x: this.vector.x * 5, y: this.vector.y * 5};
        this.power = 3;
        this.width = 16; this.height = 16;

        this._stateDefs = [ { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [{x:96,y:72,t:2},{x:112,y:72,t:2},{x:128,y:72,t:2}],
            [{x:0,y:72,t:2},{x:16,y:72,t:2},{x:32,y:72,t:2}],
            [{x:144,y:72,t:2},{x:160,y:72,t:2},{x:176,y:72,t:2}],
            [{x:48,y:72,t:2},{x:64,y:72,t:2},{x:80,y:72,t:2}],
        ] }];
    }
});

dojo.declare("loc.BoomProj", loc.Projectile, {
    color: 0,
    speed: 3,
    power: 1,
    _returning: false,
    constructor: function boomProj_constructor(args){
        dojo.mixin(this, args);
        this.vel = {x: this.vector.x * this.speed, y: this.vector.y * this.speed};
        this.width = 8; this.height = 8;
        this.apogee = (this.color==0) ? 100 : 180;

        var ycut = 28 + 16 * this.color;
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: true, anim: [
            [{x:0,y:ycut,t:1},{x:8,y:ycut,t:1},{x:16,y:ycut,t:1},{x:24,y:ycut,t:1},
             {x:32,y:ycut,t:1},{x:40,y:ycut,t:1},{x:48,y:ycut,t:1},{x:56,y:ycut,t:1}]
        ] }];
    },
    updatePosition: function boomProj_updatePosition() {
        //if (soundManager.sounds.boomerang.playState==0) {
        //    soundManager.play('boomerang');
        //}

        // move me to the next point on my current trajectory
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // check to see if I've gone off the edge of the screen
        var offscreen = true;
        if (this.vel.x < 0) {
            // moving left; check left edge
            offscreen &= (this.pos.x <= game.constants.screenBound.left);
        }
        if (this.vel.x > 0) {
            // moving right; check right edge
            offscreen &= (this.pos.x >= game.constants.screenBound.right);
        }
        if (this.vel.y < 0) {
            // moving up; check top edge
            offscreen &= (this.pos.y <= game.constants.screenBound.top);
        }
        if (this.vel.y > 0) {
            // moving down; check bottom edge
            offscreen &= (this.pos.y >= game.constants.screenBound.bottom);
        }

        // calculate distance from my owner (set in the constructor via dojo.mixin() args)
        var dx = this.owner.pos.x - this.pos.x;
        var dy = this.owner.pos.y - this.pos.y;
        var distance = Math.sqrt(dx*dx + dy*dy); // thanks, Pythagorus!
        if (this._returning) {
            // if we're already returning, check to see if we're close enough to our owner to be caught
            if (distance <= 8) {
                this.owner.catchItem();
                this.terminate();
            }
        } else if (offscreen || distance >= this.apogee) {
            this._returning = true;
        }

        // calculate return velocity, if we're on the return path
        if (this._returning) {
            // change my vector to match the direction from me to my owner; valid values are -1, 0, or 1
            this.vector = {x: (dx) ? dx/Math.abs(dx) : 0, y: (dy) ? dy/Math.abs(dy) : 0};

            if (dx && dy) {
                // vector is on a diagonal; I need to calculate both x and y components of velocity
                var slope = dy / dx;
                this.vel.x = Math.sqrt((this.speed*this.speed) / (slope*slope + 1)) * this.vector.x;
                this.vel.y = this.vel.x * slope;
            } else if (dx) {
                // dx only: horizontal vector
                this.vel = {x: this.speed * this.vector.x, y: 0};
            } else {
                // dy only: vertical vector
                this.vel = {x: 0, y: this.speed * this.vector.y};
            }
        }
    },
    hit: function(enemy) {
        /*
        var action = 0;       // 0 = ignore; 1 = kill; 2 = stun
        switch (enemy.declaredClass) {
            case "Armos":
                if (!enemy.isAsleep()) {
                    action = 2;
                }
                break;

            case "Gel":
            case "Rope":
                action = 1;   // kill small enemies
                break;

            case "Peahat":
                if (enemy.isResting()) {
                    action = 2;
                }

            default:
                // default to stun
                action = 2;
        }

        if (action == 1) {
            enemy.die();
            this.terminate();
        } else if (action == 2) {
            enemy.stun(100);
            this.terminate();
        }
        */
    }
});
