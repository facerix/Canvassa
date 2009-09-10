/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/
dojo.provide("loc.Sprite");

dojo.require("loc.ImageCache");
dojo.addOnLoad(function() {
    if (!window.imageCache) { window.imageCache = new loc.ImageCache(); }
});

dojo.declare("loc.Sprite", null, {
    pos: {x:0, y:0},
    size: {w:8, h:8},
    scale: 1,
    _facing: 1,      /* 0: West, 1: North, 2: East, 3: South */
    _speed: 4,
    _defaultState: 0,
    _state: 0,
    _animElem: 0,
    _animTime: 0,
    _stateDefs: [ { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [ [{x:0,y:0,t:5}] ] }],
    vector: {x:0,y:0},

    constructor: function sprite_constructor(args){
        if ('spriteSrc' in args) {
            if (!(window.imageCache.hasImage(args['spriteSrc']))) {
                window.imageCache.addImage( args['spriteSrc'], args['spriteSrc'] );
            }
        }
        dojo.mixin(this,args);

        this._startPosition = this.pos;
        //this.pos = dojo.clone(this._startPosition);
        this._halfw = this.size.w / 2;
        this._halfh = this.size.h / 2;
    },
    draw: function(ctx){
        var width = this.scale * this.size.w
        var height = this.scale * this.size.h;
        var xpos = this.pos.x;
        var ypos = this.pos.y;
        var xscaled = (xpos-this._halfw) * this.scale;
        var yscaled = (ypos-this._halfh) * this.scale;

        // animation tick count
        //console.log("draw(): _state ==",this._state);
        if (this.isActive()) { this._move() } ;
        var cut = this._animTick();
        var img = window.imageCache.getImage(this.spriteSrc);
        ctx.drawImage(img, cut.x,cut.y,this.size.w,this.size.h, xscaled,yscaled, width, height);

        /* debug:
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.arc(xpos*this.scale,ypos*this.scale,5,0,Math.PI*2,true);
        ctx.stroke();
        ctx.strokeRect(xscaled,yscaled,width,height);
        */
    },
    isActive: function isActive() {
        return true;
    },
    isMobile: function isMobile() {
        return this._stateDefs[this._state].canMove;
    },
    _currentAnim: function _currentAnim() {
        var anim = null;
        if (this._state < this._stateDefs.length) {
            stateDef = this._stateDefs[this._state];
            if (stateDef.faceted && this._facing < 4) {
                anim = stateDef.anim[this._facing];
            } else {
                anim = stateDef.anim[0];
            }
        } else {
            console.log("_currentAnim(): bad value for this._state (", this._state, ")");
        }
        return anim;
    },
    _animTick: function _animTick() {
        var currentAnim = this._currentAnim();
        var currentElem = null;
        var returnVal = {x:0,y:0,t:1};
        var nextState = (this._state in this._stateDefs && 'nextState' in this._stateDefs[this._state]) ? this._stateDefs[this._state].nextState : -1;
        if (!currentAnim) {
            console.warn("Couldn't get current animation details for this sprite:",this);
            this.changeState( nextState );
            return {x:999, y:999};
        } else {
            if (this._animElem in currentAnim) {
                currentElem = currentAnim[this._animElem];
                returnVal = {x: currentElem.x, y: currentElem.y};
            } else {
                console.warn("Couldn't get current animation element for this sprite:",this);
                this.changeState( nextState );
            }
        }

        // if moving or non-default anim, increment anim timer and determine next frame
        if (currentAnim && currentElem && this._animateCurrent()) {
            this._animTime++;
            if (this._animTime >= currentElem.t) {
                this._animElem++;
                if (this._animElem >= currentAnim.length) {
                    this.changeState( nextState );
                } else {
                    this._animTime = 0;
                }
            }
        }

        return returnVal;
    },
    _animateCurrent: function _animateCurrent() {
        return (this._state != this._defaultState || this.vector.x || this.vector.y);
    },
    canMove: function(vector){
        var can_move = true;
        var dx = this.pos.x + (vector.x * this._speed);
        var dy = this.pos.y + (vector.y * this._speed);
        this.moveability = '';
        if (vector.x > 0) {
            // check for rightward movement
            can_move &= (dx+this._halfw < game.constants.screenBound.right);
            can_move &= (game.map) ? (game.map.canWalk(dx+this._halfw, dy)) : true;
            if (!can_move) { this.moveability += 'x' }
        } else if (vector.x < 0) {
            // check for leftward movement
            can_move &= (dx-this._halfw > game.constants.screenBound.left);
            can_move &= (game.map) ? (game.map.canWalk(dx-this._halfw, dy)) : true;
            if (!can_move) { this.moveability += 'x' }
        }
        if (vector.y > 0) {
            // check for downward movement
            can_move &= (dy+this._halfh < game.constants.screenBound.bottom);
            can_move &= (game.map) ? (game.map.canWalk(dx,dy+this._halfh)) : true;
            if (!can_move) { this.moveability += 'y' }
        } else if (vector.y < 0) {
            // check for upward movement
            can_move &= (dy-this._halfh > game.constants.screenBound.top);
            can_move &= (game.map) ? (game.map.canWalk(dx,dy)) : true;
            if (!can_move) { this.moveability += 'y' }
        }
        return can_move;
    },
    moveVector: function(vec){
        this.vector = vec;
    },
    _move: function(){
        var dir = -1;
        if (this.vector.x > 0) {
            dir = game.constants.direction.right;
        } else if (this.vector.x < 0) {
            dir = game.constants.direction.left;
        } else if (this.vector.y > 0) {
            dir = game.constants.direction.down;
        } else if (this.vector.y < 0) {
            dir = game.constants.direction.up;
        }
        if (dir != -1) {
            this._facing = dir;
            if (this.isMobile() && this.canMove(this.vector)) {
                this.pos.x += this.vector.x * this._speed;
                this.pos.y += this.vector.y * this._speed;
            }
        }
    },
    die: function die() {
        if (1 in this._stateDefs) {
            this.changeState(1);
        }
    },
    stop: function stop() {
        this.vector = {x:0,y:0};
    },
    reset: function reset(){
        this.pos = dojo.clone(this._startPosition);
        this._facing = 1;
        this._state = this._defaultState;
        this._animElem = this._animTime = 0;
    },
    changeState: function changeState(index) {
        //console.log("changeState(",index,")");
        if (index == -1) {
            // this is a signal that the sprite is ready to be destroyed
            dojo.publish("sprite.onTerminate", [this.declaredClass, this.index]);
        } else if (index < this._stateDefs.length) {
            this._state = index;
            this._animElem = 0;
            this._animTime = 0;
        } else {
            console.log("Invalid state number:",index);
        }
    }
});

dojo.declare("loc.Pacman", loc.Sprite, {
    constructor: function sprite_constructor(args){
        window.imageCache.addImage("pacman", "../res/pac.png");
        this.spriteSrc = "pacman";
        this._stateDefs = [
            { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
              [ {x:0,y:0,t:5},{x:0,y:16,t:5} ],   /* facing==0 (left)  */
              [ {x:16,y:0,t:5},{x:16,y:16,t:5} ], /* facing==1 (up)    */
              [ {x:32,y:0,t:5},{x:32,y:16,t:5} ], /* facing==2 (right) */
              [ {x:48,y:0,t:5},{x:48,y:16,t:5} ]  /* facing==3 (down)  */
            ]},
            { name: 'die', faceted: false, nextState: -1, canMove: false, anim: [
              [ {x:0,y:32,t:2},{x:16,y:32,t:2},{x:32,y:32,t:2},{x:48,y:32,t:2},{x:64,y:32,t:20} ]
            ]}
        ];
    }
});
