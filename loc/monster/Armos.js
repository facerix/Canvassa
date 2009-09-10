dojo.provide("loc.monster.Armos");
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
            base.y += this.color * 16;
        }
        return base;
    },
    isActive: function isActive() {
        return this.inherited(arguments) && (this._state != 3 && this._state != 4);
    },
    wake: function wake() {
        this.changeState(4);
    }
});
