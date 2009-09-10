dojo.provide("loc.monster.Gibdo");
dojo.declare("loc.Gibdo", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:112,t:9},{x:112,y:112,t:9} ]
        ]};
        this._speed = 0.7;
    }
});
