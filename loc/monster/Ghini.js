dojo.provide("loc.monster.Ghini");
dojo.declare("loc.Ghini", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:112,y:176,t:1} ],
            [ {x:128,y:176,t:1} ],
            [ {x:144,y:176,t:1} ],
            [ {x:112,y:176,t:1} ]
        ]};
        this._speed = 0.8;
    }
});
