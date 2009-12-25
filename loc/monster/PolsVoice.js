dojo.provide("loc.monster.PolsVoice");
dojo.declare("loc.PolsVoice", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:112,t:5},{x:80,y:112,t:5} ]
        ]};
        this._speed = 1.5;
    }
});