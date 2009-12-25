dojo.provide("loc.monster.Lynel");
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
            base.y += this.color * 32;
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

