dojo.provide("loc.monster.Vire");
dojo.declare("loc.Vire", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:128,y:16,t:5},{x:144,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ]
        ]};
    }
});