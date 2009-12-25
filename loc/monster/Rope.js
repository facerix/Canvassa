dojo.provide("loc.monster.Rope");
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
