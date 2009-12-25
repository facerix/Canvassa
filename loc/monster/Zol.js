dojo.provide("loc.monster.Zol");
// note: module name doesn't have to match class name
dojo.declare("loc.Zol", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:32,t:6},{x:144,y:32,t:6} ]
        ]};
        this._speed = 0.3;
    }
});
