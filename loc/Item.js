/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.provide("loc.Item");
dojo.require("loc.Sprite");


dojo.declare("loc.Item", loc.Sprite, {
    baseClass: "loc.Item",
    color: 0,
    weight: 1,
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
    }
});

loc.Item.getNamedSubtype = function(typename, args) {
    var item = null;

    switch (typename.toLowerCase()) {
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

    return item;
}

dojo.declare("loc.InventoryItem", null, {
    constructor: function invitem_constructor(args){
        dojo.mixin(this, args);
        this.size = {w: 8, h: 16};
    },
    drawIcon: function(ctx, xpos, ypos){
        var w = this.size.w*game.scale;
        var h = this.size.h*game.scale;
        var cut = this._stateDefs[this._defaultState].anim[0][0]; //_frames[0];
        var img = window.imageCache.getImage(this.spriteSrc);
        if (img) {
            ctx.drawImage(img, cut.x,cut.y,this.width,this.height, xpos,ypos, w,h);
        }
    },
    getProjectile: function(args) {
        return null;
    }
});

dojo.declare("loc.Sword", [loc.Item, loc.InventoryItem], {
    color: 0,
    constructor: function sword_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted:true, nextState: 0, canMove: false, anim: [
            [{x:80,y:0,t:1}], [{x:0,y:8,t:1}], [{x:32,y:0,t:1}], [{x:24,y:8,t:1}]
        ] }];
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor if need be
        base.x += this.color * 8;
        return base;
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
        var w = this.size.w*game.scale;
        var h = this.size.h*game.scale;
        var cut = {x: this.color*8, y:8};
        var img = window.imageCache.getImage(this.spriteSrc);
        if (img) {
            ctx.drawImage(img, cut.x,cut.y, this.size.w,this.size.h, xpos,ypos, w,h);
        }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        return new loc.SwordProj(args);
    }
});

dojo.declare("loc.Boomerang", [loc.Item, loc.InventoryItem], {
    color: 0,
    constructor: function boom_constructor(args){
        dojo.mixin(this, args);

        var ycut = 24 + 16 * this.color;
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:0,y:ycut,t:1}]
        ] }];

    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor if need be
        base.x += this.color * 8;
        return base;
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
        var w = this.size.w*game.scale;
        var h = this.size.h*game.scale;
        var cut = {x: 0, y: (24 + 16 * this.color)};
        var img = window.imageCache.getImage(this.spriteSrc);
        if (img) {
            ctx.drawImage(img, cut.x,cut.y, this.size.w,this.size.h, xpos,ypos, w,h);
        }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        return new loc.BoomProj(args);
    }
});

dojo.declare("loc.Bomb", [loc.Item, loc.InventoryItem], {
    color: 0,
    constructor: function bomb_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:64,y:24,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = 8 * game.scale;
            var h = 16 * game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 64,24, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        soundManager.play('bombDrop');
        var newPos = args.pos;
        if (args.vector.x < 0) { newPos.x -= 16; } else if (args.vector.x > 0) { newPos.x += 16; }
        if (args.vector.y < 0) { newPos.y -= 16; } else if (args.vector.y > 0) { newPos.y += 16; }
        dojo.mixin(args, {pos:newPos,vector:{x:0,y:0}});
        return new loc.BombDrop(args);
    }
});

dojo.declare("loc.Bow", [loc.Item, loc.InventoryItem], {
    arrowColor: -1,
    constructor: function box_constructor(args){
        dojo.mixin(this, args);
        this._frames = [{x:96,y:56,t:1}];
        this._arrowFrames = [{x:32,y:56,t:1},{x:40,y:56,t:1}];
    },
    drawIcon: function(ctx, xpos, ypos, drawMode){
        var w = 8 * game.scale;
        var h = 16 * game.scale;
        var cut = null;
        var dx = -4*game.scale;

        try {
            // if drawing in the top/inventory screen box, draw bow + arrow both (otherwise we only show the arrow)
            var img = window.imageCache.getImage(this.spriteSrc);
            if (drawMode == 1) {
                // only draw the bow if we actually HAVE it. If we have arrows but no bow yet, draw it that way

                cut = this._frames[0];
                ctx.drawImage(img, cut.x,cut.y,this.size.w,this.size.h, xpos+4*game.scale,ypos, w,h);
            } else {
                dx = 2*game.scale; // adjust the arrow position for the lower window
            }

            // draw arrow (if we have it)
            if (this.arrowColor > -1) {
                cut = this._arrowFrames[this.arrowColor];
                ctx.drawImage(img, cut.x,cut.y,this.size.w,this.size.h, xpos+dx,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        if (this.arrowColor > -1) {
            soundManager.play('arrow');
            dojo.mixin(args, {
                width: (args.vector.x != 0) ? 16 : 7,
                height: (args.vector.y != 0) ? 16 : 7,
                color: this.arrowColor
            });
            return new loc.ArrowProj(args);
        } else {
            return null;
        }
    }
});

dojo.declare("loc.Candle", [loc.Item, loc.InventoryItem], {
    color: 0,
    available: true,
    constructor: function candle_constructor(args){
        dojo.mixin(this, args);
        var xcut = 96 + 8 * this.color;
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:xcut,y:24,t:1}]
        ] }];
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor if need be
        base.x += this.color * 8;
        return base;
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var cut = {x: 96 + 8 * this.color, y: 24};
            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, cut.x,cut.y, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        // if we're color=0 (blue), check to see if we've been used already on this screen
        if (this.available || this.color) {
            this.available = false;
            soundManager.play('candle');
            return new loc.FlameProj(args);
        }
    },
    reset: function() {
        this.available = true;
    }
});

dojo.declare("loc.Whistle", [loc.Item, loc.InventoryItem], {
    constructor: function whistle_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:64,y:40,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 64,40, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    use: function(){
        soundManager.play('whistle');
        console.log("TBD: spawn warping whirlwind");
    }
});

dojo.declare("loc.Bait", [loc.Item,loc.InventoryItem], {
    constructor: function bait_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:72,y:40,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 72,40, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        var newPos = args.pos;
        if (args.vector.x < 0) { newPos.x -= 16; } else if (args.vector.x > 0) { newPos.x += 16; }
        if (args.vector.y < 0) { newPos.y -= 16; } else if (args.vector.y > 0) { newPos.y += 16; }
        dojo.mixin(args, {pos:newPos,vector:{x:0,y:0}});
        return new loc.BaitDrop(args);
    }
});

dojo.declare("loc.Letter", [loc.Item,loc.InventoryItem], {
    constructor: function letter_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:80,y:40,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 80,40, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    use: function(){
        // TBD
        console.log("TODO: emit signal to game for NPCs to hear");
    }
});

dojo.declare("loc.Medicine", [loc.Item, loc.InventoryItem], {
    _active: false, width: 8, height: 16, color: 0,
    constructor: function medicine_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:88+8*this.color,y:40,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 88+8*this.color, 40, 8, 16, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }

        // implement healing
        if (this._active) {
            if (game.player.HP++ >= game.player.maxHP) {
                game.player.HP = game.player.maxHP;
                this._active = false;
                this._deplete();
            }
        }
    },
    _deplete: function() {
        if (this.color == 1) {
            // red turns to blue (i.e. it's half gone)
            this.color = 0;
        } else {
            // blue gets used up
            var replacement = new loc.Letter({pos:this.pos});
            delete game.player.inventory[6];
            game.player.inventory[6] = replacement;
        }
    },
    use: function(){
        if (!this._active && game.player.HP < game.player.maxHP) {
            this._active = true;
        }
    }
});

dojo.declare("loc.Wand", [loc.Item, loc.InventoryItem], {
    constructor: function wand_constructor(args){
        dojo.mixin(this, args);
        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:104,y:56,t:1}]
        ] }];
    },
    drawIcon: function(ctx, xpos, ypos){
        try {
            var w = this.size.w*game.scale;
            var h = this.size.h*game.scale;

            var img = window.imageCache.getImage(this.spriteSrc);
            if (img) {
                ctx.drawImage(img, 104,56, this.size.w,this.size.h, xpos,ypos, w,h);
            }
        } catch(e) {
            console.log("error drawing item icon:",e);
            game.stop();
        }
    },
    getProjectile: function(args) {
        dojo.mixin(args, {
            'width': 16, 'height': 16, 'size': {w: 16, h: 16}
        });
        soundManager.play('wand');
        return new loc.MagicProj(args);
    }
});



dojo.declare("loc.SelectIcon", loc.Item, {
    constructor: function sprite_constructor(args){
        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [ [{x:0,y:0,t:5}] ] }];
    }
});

dojo.declare("loc.Heart", loc.Item, {
    constructor: function(args){
        dojo.mixin(this, {
            'width': 7, 'height': 8, 'size': {w:7,h:8}, 'weight': 0
        });
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
        dojo.mixin(this, {
            'width': 8, 'height': 16, 'size': {w: 8, h: 16}, 'weight': 0
        });

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
    _animateCurrent: function rupee_animateCurrent() {
        return true;
    }
});

dojo.declare("loc.Fairy", loc.Item, {
    constructor: function(args){
        dojo.mixin(this, {
            'width': 8, 'height': 16, 'size': {w: 8, h: 16}, 'weight': 0, '_speed': 1, 'vector':{x:1,y:-1}
        });

        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: true,
            anim: [ [{x:72,y:8,t:3},{x:80,y:8,t:3}] ] }];
    },
    _animateCurrent: function fairy_animateCurrent() {
        return true;
    },
    draw: function fairy_draw(ctx) {
        // move -- no think() or updatePosition() for items, so do it here
        this._move();

        this.inherited(arguments);
    },
    _move: function fairy_move() {
        this.pos.x += this.vector.x * this._speed;
        this.pos.y += this.vector.y * this._speed;

        var willToMove = Math.random();
        if (willToMove < 0.1) { /* 90% bias against changing direction */
            switch (Math.floor(Math.random() * 2)) {
                case 0: // change X vector
                    this.vector.x = Math.floor(Math.random() * 3) - 1;
                    break;
                case 1: // change Y vector
                    this.vector.y = Math.floor(Math.random() * 3) - 1;
                    break;
            }
        }

        // if completely stopped, force to start moving again
        if (this.vector.x == this.vector.y == 0) {
            this.vector.x = 1; this.vector.y = 1;
        }
    }
});

dojo.declare("loc.BigHeart", loc.Item, {
    constructor: function(args){
        this.width = 16; this.height = 16; this.size = {w:16,h:16}; this.weight = 2;
        this._stateDefs = [ { name: 'default', faceted:false, nextState: 0, canMove: false,
            anim: [ [{x:56,y:8,t:1}] ] }];
    },
    _animateCurrent: function heart_animateCurrent() {
        return true;
    }
});

dojo.declare("loc.Projectile", loc.Item, {
    baseClass: "loc.Projectile",
    owner: null,
    vel: {x:0,y:0},
    power: 1,
    width: 8,
    height: 8,
    size: {w:8,h:8},
    constructor: function(args){
        dojo.mixin(this, args);
        this.size.h = this.height;
        this.size.w = this.width;
    },
    updatePosition: function() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // check to see if I've gone off the edge of the screen
        var offscreen = false;
        if (this.vel.x < 0) {
            // moving left
            offscreen |= (this.pos.x < game.constants.screenBound.left);
        }
        if (this.vel.x > 0) {
            // moving right
            offscreen |= (this.pos.x > game.constants.screenBound.right);
        }
        if (this.vel.y < 0) {
            // moving up
            offscreen |= (this.pos.y < game.constants.screenBound.top);
        }
        if (this.vel.y > 0) {
            // moving down
            offscreen |= (this.pos.y > game.constants.screenBound.bottom);
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
            this.owner.killProjectile(this);
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
    },
    terminate: function swordProj_terminate() {
        game.insertProjectile(new loc.SwordFlashNW({'pos':this.getPos(),'owner':this.owner}));
        game.insertProjectile(new loc.SwordFlashSW({'pos':this.getPos(),'owner':this.owner}));
        game.insertProjectile(new loc.SwordFlashNE({'pos':this.getPos(),'owner':this.owner}));
        game.insertProjectile(new loc.SwordFlashSE({'pos':this.getPos(),'owner':this.owner}));

        this.inherited(arguments);
    }
});

dojo.declare("loc.Explod", loc.Projectile, {
    timeout: -1,
    constructor: function(args){
        dojo.mixin(this, args);
    },
    hit: function explor_hit() {
        // do nothing
    },
    updatePosition: function() {
        if (this.timeout-- == 0) {
            this.terminate();
        }
        this.inherited(arguments);
    },
    _animateCurrent: function heart_animateCurrent() {
        return true;
    }
});

dojo.declare("loc.SwordFlashNW", loc.Explod, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.width = 8; this.height = 10;
        this.vel = {x: -3, y: -3}; this.timeout = 10;
        this._stateDefs = [ { faceted:false, nextState: 0, canMove: true,
            anim: [ [{x:152,y:11,t:1},{x:160,y:11,t:1}] ] }];
    }
});

dojo.declare("loc.SwordFlashSW", loc.Explod, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.width = 8; this.height = 10;
        this.vel = {x: -3, y: 3}; this.timeout = 10;
        this._stateDefs = [ { faceted:false, nextState: 0, canMove: true,
            anim: [ [{x:152,y:22,t:1},{x:160,y:22,t:1}] ] }];
    }
});

dojo.declare("loc.SwordFlashNE", loc.Explod, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.width = 8; this.height = 10;
        this.vel = {x: 3, y: -3}; this.timeout = 10;
        this._stateDefs = [ { faceted:false, nextState: 0, canMove: true,
            anim: [ [{x:152,y:33,t:1},{x:160,y:33,t:1}] ] }];
    }
});

dojo.declare("loc.SwordFlashSE", loc.Explod, {
    constructor: function(args){
        dojo.mixin(this, args);
        this.width = 8; this.height = 10;
        this.vel = {x: 3, y: 3}; this.timeout = 10;
        this._stateDefs = [ { faceted:false, nextState: 0, canMove: true,
            anim: [ [{x:152,y:44,t:1},{x:160,y:44,t:1}] ] }];
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
        if (soundManager.sounds.boomerang.playState==0) {
            soundManager.play('boomerang');
        }

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
                delete game.projectiles[this.index];
                //this.terminate();
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
        var action = 0;       // 0 = ignore; 1 = kill; 2 = stun
        switch (enemy.declaredClass) {
            case "loc.Armos":
                if (enemy.isActive()) {
                    action = 2;  // stun only if awake
                }
                break;

            case "loc.Gel":
            case "loc.Rope":
                action = 1;   // kill small enemies
                break;

            case "loc.Peahat":
                if (enemy.isResting()) {
                    action = 2;   // stun only if at rest
                }
                break;

            default:
                // default to stun
                action = 2;
        }

        if (action == 1) {
            enemy.die();
            this.terminate();
        } else if (action == 2) {
            enemy.stun(250);
            this.terminate();
        }
    }
});

dojo.declare("loc.FlameProj", loc.Projectile, {
    _timer: 50,
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x: this.vector.x * 0.2, y: this.vector.y * 0.2};
        this.power = 3;
        this.width = 16; this.height = 16;
        this.size = {w:16,h:16};

        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: true, anim: [
            [ {x:104,y:40,t:6},{x:120,y:40,t:6} ]
        ] }];
    },
    updatePosition: function flameProj_updatePosition() {
        if (this._timer-- == 42) {
            // stop moving (arrest my velocity)
            this.vel = {x:0,y:0};
            this.vector = {x:0,y:0};
        }
        if (this._timer <= 0) {
            // timeout and remove
            delete game.projectiles[this.index];
        }
        this.inherited(arguments);
    },
    _animateCurrent: function _animateCurrent() {
        return true;
    }
});

dojo.declare("loc.BombDrop", loc.Projectile, {
    _timer: 30,
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x:0, y:0};
        this.power = 0;
        this.width = 8; this.height = 16;
        this.size = {w:8,h:16};

        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [ {x:64,y:24,t:18} ]
        ] }];
    },
    updatePosition: function bombDrop_updatePosition() {
        // check timeout and explode (spawn several ExplodProj objects) if expired
        if (this._timer-- <= 0) {
            soundManager.play('bombBoom');
            var x1 = this.pos.x - 20;
            var x2 = this.pos.x - 4;
            var x3 = this.pos.x + 12;

            // explosions #1&2: left 16px from the bomb, 8px up and 8px down
            var ex = new loc.ExplodProj({pos:{x:x1,y:this.pos.y-8}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);
            ex = new loc.ExplodProj({pos:{x:x1,y:this.pos.y+8}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);

            // explosions #3-5: same x-pos as the bomb, 16px up, center, and 16px down
            ex = new loc.ExplodProj({pos:{x:x2,y:this.pos.y-16}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);
            ex = new loc.ExplodProj({pos:{x:x2,y:this.pos.y}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);
            ex = new loc.ExplodProj({pos:{x:x2,y:this.pos.y+16}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);

            // explosions #6&7: right 16px from the bomb, 8px up and 8px down
            ex = new loc.ExplodProj({pos:{x:x3,y:this.pos.y-8}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);
            ex = new loc.ExplodProj({pos:{x:x3,y:this.pos.y+8}, owner:this.owner, index: game.projectiles.length});
            game.projectiles.push(ex);

            // remove the bomb
            delete game.projectiles[this.index];
        } else {
            this.inherited(arguments);
        }
    }
});

dojo.declare("loc.ExplodProj", loc.Projectile, {
    spriteSrc: "monsters",
    constructor: function(args){
        dojo.mixin(this, args);
        this.vel = {x:0, y:0};
        this.power = 8;
        this.width = 16; this.height = 16;
        this.size = {w:16,h:16};
        this.spriteSrc = "monsters";

        this._stateDefs = [ { name: 'default', faceted: false, nextState: -1, canMove: false, anim: [
            [ {x:64,y:0,t:3},{x:80,y:0,t:3} ]
        ] }];
    },
    _animateCurrent: function explodProj_animateCurrent() {
        return true;
    }
});

dojo.declare("loc.BaitDrop", loc.Projectile, {
    constructor: function(args){
        dojo.mixin(this, args);
        dojo.mixin(this, {
          vel: {x:0, y:0},
          power: 0,
          width: 8, height: 16,
          size: {w:8, h:16}
        });

        this._stateDefs = [ { name: 'default', faceted: false, nextState: 0, canMove: false, anim: [
            [{x:72,y:40,t:1}]
        ] }];
    },
    updatePosition: function baitDrop_updatePosition() {
        // TBD: check timeout and fade away if expired (or does it not expire?)
    }
});