/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

// overworld enemies
dojo.provide("loc.Monster");
dojo.provide("loc.Armos");
dojo.provide("loc.Boulder");
dojo.provide("loc.Ghini");
dojo.provide("loc.Leever");
dojo.provide("loc.Lynel");
dojo.provide("loc.Moblin");
dojo.provide("loc.Octoroc");
dojo.provide("loc.Peahat");
dojo.provide("loc.Tectite");
dojo.provide("loc.Zola");

// dungeon enemies
dojo.provide("loc.Bubble");
dojo.provide("loc.Darknut");
dojo.provide("loc.Gel");
dojo.provide("loc.Gibdo");
dojo.provide("loc.Goriya");
dojo.provide("loc.Keese");
dojo.provide("loc.LikeLike");
dojo.provide("loc.PolsVoice");
dojo.provide("loc.Rope");
dojo.provide("loc.Stalfos");
dojo.provide("loc.Statue");
dojo.provide("loc.Trap");
dojo.provide("loc.Vire");
dojo.provide("loc.WallMaster");
dojo.provide("loc.Wizzrobe");
dojo.provide("loc.Zol");

dojo.require("loc.Sprite");
dojo.require("loc.Item");

dojo.declare("loc.Shooter", null, {
    attackState: 0,
    constructor: function shooter_constructor(args){
        dojo.mixin(this, args);
        this._proj = null; // my current projectile, if any
    },
    canAttack: function() {
        return (this.isMobile() && (this._state != this.attackState) && (this._proj == null));
    },
    changeState: function() {
        this.inherited(arguments);
        if (this._state == this.attackState && this._animElem == 0) {
            dojo.publish("monster.onAttack", [this.declaredClass, this.index]);
        }
    },
    _getProjectileArgs: function() {
        var projVector = {x:0,y:0};
        switch(this._facing) {
            case 0: // west
                projVector.x = -1;
                break;
            case 1: // north
                projVector.y = -1;
                break;
            case 2: // east
                projVector.x = 1;
                break;
            case 3: // south
                projVector.y = 1;
                break;
        }
        var args = {
            vector: projVector,
            pos: dojo.clone(this.pos),
            size: {w:8, h:8},
            scale: 1,
            color: 0,
            spriteSrc: "../res/items.png"
        };
        return args;
    },
    getProjectile: function() {
        if (!this.proj) {
            this.proj = new loc.Projectile(this._getProjectileArgs());
        }
        return this.proj;
    },
    killProjectile: function killProjectile() {
        if (this._proj) {
            if ('index' in this._proj) { delete game.items[this._proj.index]; }
            this._proj = null;
        }
    },
    isActive: function isActive() {
        return (this._state != this.attackState);
    },
    think: function() {
        this.inherited(arguments);
        if (Math.random() < 0.01 && this.canAttack()) {
            this.changeState( this.attackState );
        }
    }
});

dojo.declare("loc.Monster", loc.Sprite, {
    constructor: function sprite_constructor(args){
        window.imageCache.addImage("monsters", "../res/monsters.png");
        this.spriteSrc = "monsters";
        this._speed = 1;

        if ('color' in args) {
            this._color = args['color'];
        } else {
            this._color = 0;
        }
        var spawnTime = 10 + Math.random() * 30;
        this._stateDefs = [{}, /* default will be different for each derived class */
            { name: 'die', faceted:false, nextState: -1, canMove: false, anim: [
              [ {x:64,y:16,t:6},{x:80,y:16,t:3},{x:200,y:16,t:20} ]
            ]},
            { name: 'spawn', faceted: false, nextState: 0, canMove: false, anim: [
              [ {x:64,y:0,t:spawnTime},{x:80,y:0,t:3} ]
            ]}
        ];

        this._state = 2;        // start in "spawning" state
    },
    think: function(){
        // determine if I'm going to move, attack, or stand still; this is the AI
        // 5 possible actions: 0=move left, 1=move up, 2=move right, 3=move down, 4=stand still
        //   (some derived monster classes will have other actions, such as throwing a projectile)
        // action choice is strongly biased in favor of the most recent action. This should keep monsters from "analysis paralysis"
        if (this.isActive()) {
            if (Math.random() < 0.05) { /* biased against changing direction very often */
                switch (Math.floor(Math.random() * 5)) {
                  case game.constants.direction.left:
                      this.vector = {x:-1,y:0};
                      break;
                  case game.constants.direction.up:
                      this.vector = {x:0, y:-1};
                      break;
                  case game.constants.direction.right:
                      this.vector = {x:1, y:0};
                      break;
                  case game.constants.direction.down:
                      this.vector = {x:0, y:1};
                      break;
                }
            }
        }
    },
    die: function() {
        //soundManager.play('kill');
        this.changeState(1); // dying
    },
    draw: function(ctx){
        this.inherited(arguments);
    },
    reset: function reset(){
        this.inherited(arguments);
        this._defaultState = 2;
        this._state = 2;
        this._lastAction = -1;  // no previous action
    }
});

// -------- overworld enemies --------

dojo.declare("loc.Armos", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._defaultState = 3;
        this._state = 3;

        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:16,y:0,t:5},{x:16,y:16,t:5} ],
            [ {x:32,y:0,t:5},{x:32,y:16,t:5} ],
            [ {x:16,y:0,t:5},{x:16,y:16,t:5} ],
            [ {x:16,y:0,t:5},{x:16,y:16,t:5} ]
        ]};
        this._stateDefs[3] = { name:'stone', faceted:false, nextState: 3, canMove: false, anim: [
            [ {x:0,y:0,t:10} ]
        ]};
        this._stateDefs[4] = { name: 'waking', faceted:false, nextState: 0, canMove: false, anim: [
            [ {x:0,y:0,t:3},{x:16,y:0,t:1},
              {x:0,y:0,t:3},{x:16,y:0,t:1},
              {x:0,y:0,t:3},{x:16,y:0,t:1},
              {x:0,y:0,t:2},{x:16,y:0,t:2},
              {x:0,y:0,t:2},{x:16,y:0,t:2},
              {x:0,y:0,t:2},{x:16,y:0,t:2},
              {x:0,y:0,t:1},{x:16,y:0,t:3},
              {x:0,y:0,t:1},{x:16,y:0,t:3},
              {x:0,y:0,t:1},{x:16,y:0,t:3} ]
        ]};
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 3 || this._state == 4) {
            base.y += this._color * 16;
        }
        return base;
    },
    isActive: function isActive() {
        return (this._state != 3 && this._state != 4);
    },
    wake: function wake() {
        this.changeState(4);
    }
});

dojo.declare("loc.Boulder", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:48,y:0,t:4},{x:48,y:16,t:4} ]
        ]};
        this.vector.y = Math.random() * 0.5 + 2;
    },
    canMove: function(vector){
        return true;
    },
    think: function think() {
        if (this.pos.y > 300) {
            // remove after I go off the bottom of the screen
            dojo.publish("sprite.onTerminate", [this.declaredClass, this.index]);
        } else if (this._state == 0 && this._animTime == 0) {
            this.vector.x = (Math.random() * 3) - 1.5;
        }
    }
});

dojo.declare("loc.Ghini", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:112,y:176,t:1} ],
            [ {x:128,y:176,t:1} ],
            [ {x:144,y:176,t:1} ],
            [ {x:112,y:176,t:1} ]
        ]};
        this._speed = 0.8;
    }
});

dojo.declare("loc.Leever", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:0,y:144,t:5},{x:16,y:144,t:5} ]
        ]};
        this._stateDefs[2] = { name: 'startup', faceted:false, nextState: 5, canMove: false, anim: [
            [ {x:80,y:144,t:40} ]
        ]};
        this._stateDefs[3] = { name: 'digging', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:32,y:144,t:8},{x:48,y:144,t:5},{x:64,y:144,t:5},{x:80,y:144,t:20} ]
        ]};
        this._stateDefs[4] = { name: 'tunneling', faceted:false, nextState: 5, canMove: true, anim: [
            [ {x:80,y:144,t:80} ]
        ]};
        this._stateDefs[5] = { name: 'surfacing', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:144,t:5},{x:48,y:144,t:8},{x:32,y:144,t:5} ]
        ]};
        this._surfaceTimer = 0;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 16;
        }
        return base;
    },
    _animateCurrent: function _animateCurrent() {
        return true;
    },
    changeState: function changeState(index) {
        this.inherited(arguments);
        //console.log("changeState(",index,")");
    },
    think: function think() {
        this.inherited(arguments);
        if (this._state == 0) {
            this._surfaceTimer++;
            if (this._surfaceTimer > 200) {
                this._surfaceTimer = 0;
                this.changeState(3);
            }
        } else if (this._state == 4 && this._color == 1) {
            // red leevers can move while tunneling; blue ones don't
            this.vector = {x:0, y:0};
        }
    }
});

dojo.declare("loc.Lynel", [loc.Monster, loc.Shooter], {
    constructor: function sprite_constructor(args){
        this.attackState = 3;
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:0,y:240,t:5},{x:0,y:256,t:5} ],
            [ {x:16,y:240,t:5},{x:16,y:256,t:5} ],
            [ {x:32,y:240,t:5},{x:32,y:256,t:5} ],
            [ {x:48,y:240,t:5},{x:48,y:256,t:5} ]
        ]};
        this.attackState = 3;
        this._stateDefs[3] = { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:0,y:240,t:2},{x:0,y:256,t:13} ],
            [ {x:16,y:240,t:2},{x:16,y:256,t:13} ],
            [ {x:32,y:240,t:2},{x:32,y:256,t:13} ],
            [ {x:48,y:240,t:2},{x:48,y:256,t:13} ]
        ]};
        this._speed = 0.9;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    },
    getProjectile: function() {
        var args = this._getProjectileArgs()

        args.width = (args.vector.x != 0) ? 16 : 7;
        args.height = (args.vector.y != 0) ? 16 : 7;
        args.size = {w: args.width, h: args.height};
        return new loc.SwordProj(args);
    }
});

dojo.declare("loc.Moblin", [loc.Monster, loc.Shooter], {
    constructor: function sprite_constructor(args){
        this.attackState = 3;
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:0,y:176,t:5},{x:0,y:192,t:5} ],
            [ {x:16,y:176,t:5},{x:16,y:192,t:5} ],
            [ {x:32,y:176,t:5},{x:32,y:192,t:5} ],
            [ {x:48,y:176,t:5},{x:48,y:192,t:5} ]
        ]};
        this._stateDefs[3] = { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:0,y:176,t:9} ],
            [ {x:16,y:176,t:9} ],
            [ {x:32,y:176,t:9} ],
            [ {x:48,y:176,t:9} ]
        ]};
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    },
    getProjectile: function() {
        var args = this._getProjectileArgs()

        args.width = (args.vector.x != 0) ? 16 : 5;
        args.height = (args.vector.y != 0) ? 16 : 5;
        args.size = {w: args.width, h: args.height};
        return new loc.ArrowProj(args);
    }
});

dojo.declare("loc.Octoroc", [loc.Monster, loc.Shooter], {
    constructor: function sprite_constructor(args){
        this.attackState = 3;
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:0,y:48,t:5},{x:0,y:64,t:5} ],   /* facing==0 (left) */
            [ {x:16,y:64,t:5},{x:16,y:48,t:5} ], /* facing==1 (up)   */
            [ {x:32,y:48,t:5},{x:32,y:64,t:5} ], /* facing==2 (right) */
            [ {x:48,y:64,t:5},{x:48,y:48,t:5} ]  /* facing==3 (down) */
        ]};
        this._stateDefs[3] = { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:0,y:48,t:5},{x:0,y:64,t:10},{x:0,y:48,t:5} ],
            [ {x:16,y:64,t:5},{x:16,y:48,t:10},{x:16,y:64,t:5} ],
            [ {x:32,y:48,t:5},{x:32,y:64,t:10},{x:32,y:48,t:5} ],
            [ {x:48,y:64,t:5},{x:48,y:48,t:10},{x:48,y:64,t:5} ]
        ]};
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    },
    getProjectile: function() {
        var args = this._getProjectileArgs()
        args.size.h = 10;
        return new loc.RockProj(args);
    }
});

dojo.declare("loc.Peahat", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:32,y:32,t:2},{x:48,y:32,t:2} ]
        ]};
        this._stateDefs[2].nextState = 5;  // after spawning, start in 'starting' state rather than default state
        this._stateDefs[3] = { name: 'stopping', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:32,y:32,t:2},{x:48,y:32,t:2},
              {x:32,y:32,t:2},{x:48,y:32,t:2},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:9},{x:48,y:32,t:9} ]
        ]};
        this._stateDefs[4] = { name: 'resting', faceted:false, nextState: 5, canMove: false, anim: [
            [ {x:32,y:32,t:90} ]
        ]};
        this._stateDefs[5] = { name: 'starting', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:32,y:32,t:9},{x:48,y:32,t:9},
              {x:32,y:32,t:9},{x:48,y:32,t:9},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:2},{x:48,y:32,t:2} ]
        ]};
    },
    isActive: function isActive() {
        return (this._state != 4);
    },
    changeState: function changeState(index) {
        this.inherited(arguments);
        if (index == 4) {
            // stopped: set vector to 0,0
            this.vector = {x:0,y:0};

        } else if (index == 5) {
            // start moving: set initial vector
            this.vector.x = (Math.random()) - 0.5;
            this.vector.y = (Math.random()) - 0.5;
        }
    },
    think: function think() {
        // first, check if I'm moving and stuck to a wall; if so, bounce me
        var info = this.canMove(this.vector);
        switch (this.moveability) {
            case 'x':
                this.vector.x *= -1;
                break;
            case 'y':
                this.vector.y *= -1;
                break;
            case 'xy':
                this.vector.x *= -1;
                this.vector.y *= -1;
                break;
            default:
                break;
        }

        if (this.isActive()) {
            switch (this._state) {
                case 0: // default
                    if (Math.random() < 0.001 && this.isActive()) {
                        // if we meet all the above criteria, start slowing down to rest
                        this.changeState(3);
                    } else {
                        // move; decide if I need to change my vector at all
                        if (Math.random() > 0.99) {
                            this.vector.x = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                            this.vector.y = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                        }
                    }
                    break;

                case 3: // slowing down
                    this.vector.x /= 1.01;
                    this.vector.y /= 1.01;
                    break;

                case 5: // speeding up
                    this.vector.x *= 1.01;
                    this.vector.y *= 1.01;
                    break;

                default:
                    break;
            }
        }
    }
});

dojo.declare("loc.Tectite", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:16,y:112,t:15},{x:0,y:112,t:10} ]
        ]};
        this._stateDefs[3] = { name: 'jump', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:0,y:112,t:50} ]
        ]};
        this._stateDefs[4] = { name: 'jump_end', faceted:false, nextState: 0, canMove: false, anim: [
            [ {x:16,y:112,t:14} ]
        ]};
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.x += this._color * 32;
        }
        return base;
    },
    _animateCurrent: function _animateCurrent() {
        return true;
    },
    changeState: function changeState(index) {
        if (index == 3) {
            // initiate jump... give myself a starting velocity
            this.vector = {x: (Math.random() * 4)-2, y: (Math.random() * 4)-2};
        } else if (index == 4) {
            // ending jump... reset velocity to null
            this.vector = {x:0,y:0};
        }
        this.inherited(arguments);
    },
    think: function(){
        if (Math.random() < 0.005 && this._state == 0 && this.isActive()) {
            // if we meet all the above criteria, jump.
            this.changeState(3);
        }
    }
});

dojo.declare("loc.Zola", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:0,y:128,t:50} ],
            [ {x:16,y:128,t:50} ],
            [ {x:0,y:128,t:50} ],
            [ {x:0,y:128,t:50} ]
        ]};
        this._stateDefs[3] = { name: 'diving', faceted:false, nextState: 4, canMove: false, anim: [
            [ {x:32,y:128,t:8},{x:48,y:128,t:5},{x:80,y:144,t:80} ]
        ]};
        this._stateDefs[4] = { name: 'underwater', faceted:false, nextState: 5, canMove: true, anim: [
            [ {x:900,y:900,t:120} ]
        ]};
        this._stateDefs[5] = { name: 'surfacing', faceted:false, nextState: 0, canMove: false, anim: [
            [ {x:48,y:128,t:9},{x:32,y:128,t:9},
              {x:48,y:128,t:9},{x:32,y:128,t:9},
              {x:48,y:128,t:9},{x:32,y:128,t:9} ]
        ]};
        this._surfaceTimer = 0;
    },
    think: function think() {
        this.inherited(arguments);
        if (this._state == 0) {
            this._surfaceTimer++;
            if (this._surfaceTimer > 200) {
                this._surfaceTimer = 0;
                this.changeState(3);
            }
        }
    }
});

// -------- end of overworld enemies --------

// -------- dungeon enemies --------

dojo.declare("loc.Bubble", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:128,t:1},{x:80,y:128,t:1},{x:96,y:128,t:1},{x:112,y:128,t:1} ]
        ]};
        this._speed = 1.2;
        this.vector = {x: (Math.random()) - 0.5, y: (Math.random()) - 0.5};
    },
    think: function think() {
        // first, check if I'm moving and stuck to a wall; if so, bounce me
        var info = this.canMove(this.vector);
        switch (this.moveability) {
            case 'x':
                this.vector.x *= -0.2;
                break;
            case 'y':
                this.vector.y *= -0.2;
                break;
            case 'xy':
                this.vector.x *= -0.5;
                this.vector.y *= -0.5;
                break;
            default:
                break;
        }

        if (this.isActive()) {
            // move; decide if I need to change my vector at all
            if (Math.random() < 0.005) {
                this.vector.x = (Math.random() + 0.5) * (Math.random() < 0.5 ? -1:1);
                this.vector.y = (Math.random() + 0.5) * (Math.random() < 0.5 ? -1:1);
            }
        }
    }
});

dojo.declare("loc.Darknut", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:64,y:48,t:6},{x:64,y:64,t:6} ],
            [ {x:80,y:48,t:6},{x:80,y:64,t:6} ],
            [ {x:96,y:48,t:6},{x:96,y:64,t:6} ],
            [ {x:112,y:48,t:6},{x:112,y:64,t:6} ]
        ]};
        this._speed = 1.1;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    }
});

dojo.declare("loc.Gel", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:32,t:2},{x:112,y:32,t:2} ]
        ]};
        this._speed = this.scale;
    },
    think: function gel_think(){
        if (this.isActive()) {
            if (Math.random() < 0.0005) {
                switch (Math.floor(Math.random() * 5)) {
                  case game.constants.direction.left:
                      this.vector = {x:-1,y:0};
                      break;
                  case game.constants.direction.up:
                      this.vector = {x:0, y:-1};
                      break;
                  case game.constants.direction.right:
                      this.vector = {x:1, y:0};
                      break;
                  case game.constants.direction.down:
                      this.vector = {x:0, y:1};
                      break;
                }
            }
        }
    }
});

dojo.declare("loc.Gibdo", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:112,t:9},{x:112,y:112,t:9} ]
        ]};
        this._speed = 0.7;
    }
});

dojo.declare("loc.Goriya", [loc.Monster, loc.Shooter], {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:64,y:240,t:5},{x:64,y:256,t:5} ],
            [ {x:80,y:240,t:5},{x:80,y:256,t:5} ],
            [ {x:96,y:240,t:5},{x:96,y:256,t:5} ],
            [ {x:112,y:240,t:5},{x:112,y:256,t:5} ]
        ]};
        this._stateDefs[3] = { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:64,y:256,t:10} ],
            [ {x:80,y:256,t:10} ],
            [ {x:96,y:256,t:10} ],
            [ {x:112,y:256,t:10} ]
        ]};
        this._stateDefs[4] = { name: 'catchProj', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:64,y:256,t:10} ],
            [ {x:80,y:256,t:10} ],
            [ {x:96,y:256,t:10} ],
            [ {x:112,y:256,t:10} ]
        ]};
        this.attackState = 3;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    },
    getProjectile: function() {
        this._proj = new loc.BoomProj(this._getProjectileArgs());
        this._proj.owner = this;
        return this._proj;
    },
    catchItem: function catchItem() {
        this.changeState(4);
    }
});

dojo.declare("loc.Keese", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:0,t:3},{x:112,y:0,t:3} ]
        ]};
        // initial velocity
        this.vector.x = (Math.random()+0.5) * (Math.random() < 0.5 ? -1 : 1);
        this.vector.y = (Math.random()+0.5) * (Math.random() < 0.5 ? -1 : 1);
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.x += this._color * 32;
        }
        return base;
    },
    think: function think() {
        if (this.isActive() && this._state == 0) {
            if (Math.random() < 0.01 && this.isActive() || !this.canMove(this.vector)) {
                // if we meet all the above criteria, change direction
                this.vector.x = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                this.vector.y = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
            }
        }
    }
});

dojo.declare("loc.LikeLike", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:80,t:8} ]    //, {x:144,y:80,t:8} ]
        ]};
        this._speed = 1.5;
    }
});

dojo.declare("loc.PolsVoice", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:112,t:5},{x:80,y:112,t:5} ]
        ]};
        this._speed = 1.5;
    }
});

dojo.declare("loc.Rope", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:128,y:48,t:7},{x:128,y:64,t:7} ],
            [ {x:128,y:48,t:7},{x:128,y:64,t:7} ],
            [ {x:144,y:48,t:7},{x:144,y:64,t:7} ],
            [ {x:128,y:48,t:7},{x:128,y:64,t:7} ]
        ]};
        this._speed = 0.8;
    }
});

dojo.declare("loc.Stalfos", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:32,t:6},{x:80,y:32,t:6} ]
        ]};
        this._speed = 0.8;
    }
});

dojo.declare("loc.Vire", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:128,y:16,t:5},{x:144,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ]
        ]};
    }
});

dojo.declare("loc.WallMaster", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:112,t:20},{x:144,y:112,t:20} ]
        ]};
        this._speed = 0.6
    }
});


dojo.declare("loc.Wizzrobe", [loc.Monster, loc.Shooter], {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:64,y:176,t:5},{x:64,y:192,t:5} ],
            [ {x:80,y:176,t:5},{x:80,y:192,t:5} ],
            [ {x:96,y:176,t:5},{x:96,y:192,t:5} ],
            [ {x:64,y:176,t:5},{x:64,y:192,t:5} ]
        ]};
        this.attackState = 3;
        this._stateDefs[3] = { name: 'attack', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:64,y:176,t:2} ],
            [ {x:80,y:176,t:2} ],
            [ {x:96,y:176,t:2} ],
            [ {x:64,y:176,t:2} ]
        ]};
        //this._speed = 1.1;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this._color * 32;
        }
        return base;
    },
    getProjectile: function() {
        var args = this._getProjectileArgs()
        args.width = args.height = 16;
        args.size = {w: 16, h: 16};
        return new loc.MagicProj(args);
    }
});

dojo.declare("loc.Zol", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:32,t:6},{x:144,y:32,t:6} ]
        ]};
        this._speed = 0.3;
    }
});

// -------- end of dungeon enemies --------
