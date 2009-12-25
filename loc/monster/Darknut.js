dojo.provide("loc.monster.Darknut");
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
            base.y += this.color * 32;
        }
        return base;
    }
});

