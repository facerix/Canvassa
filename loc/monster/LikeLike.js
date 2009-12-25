dojo.provide("loc.monster.LikeLike");
dojo.declare("loc.LikeLike", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:80,t:8} ]    //, {x:144,y:80,t:8} ]
        ]};
        this._speed = 1.5;
    }
});

