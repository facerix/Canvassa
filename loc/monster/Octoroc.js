dojo.provide("loc.monster.Octoroc");
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
            base.y += this.color * 32;
        }
        return base;
    },
    getProjectile: function() {
        var args = this._getProjectileArgs()
        args.size.h = 10;
        return new loc.RockProj(args);
    }
});