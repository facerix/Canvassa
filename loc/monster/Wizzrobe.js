dojo.provide("loc.monster.Wizzrobe");

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
            base.y += this.color * 32;
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
