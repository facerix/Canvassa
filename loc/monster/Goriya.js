dojo.provide("loc.monster.Goriya");
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
            base.y += this.color * 32;
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
