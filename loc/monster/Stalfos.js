dojo.provide("loc.monster.Stalfos");
dojo.declare("loc.Stalfos", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:32,t:6},{x:80,y:32,t:6} ]
        ]};
        this._speed = 0.8;
    }
});
