dojo.provide("loc.monster.WallMaster");
dojo.declare("loc.WallMaster", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:112,t:20},{x:144,y:112,t:20} ]
        ]};
        this._speed = 0.6
    }
});