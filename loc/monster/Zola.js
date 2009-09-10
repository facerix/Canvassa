dojo.provide("loc.monster.Zola");
dojo.declare("loc.Zola", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: false, anim: [
            [ {x:0,y:128,t:50} ],
            [ {x:16,y:128,t:50} ],
            [ {x:0,y:128,t:50} ],
            [ {x:0,y:128,t:50} ]
        ]};
        this._stateDefs[3] = { name: 'diving', faceted:false, nextState: 4, canMove: false, anim: [
            [ {x:32,y:128,t:8},{x:48,y:128,t:5},{x:80,y:144,t:80} ]
        ]};
        this._stateDefs[4] = { name: 'underwater', faceted:false, nextState: 5, canMove: true, anim: [
            [ {x:900,y:900,t:120} ]
        ]};
        this._stateDefs[5] = { name: 'surfacing', faceted:false, nextState: 0, canMove: false, anim: [
            [ {x:48,y:128,t:9},{x:32,y:128,t:9},
              {x:48,y:128,t:9},{x:32,y:128,t:9},
              {x:48,y:128,t:9},{x:32,y:128,t:9} ]
        ]};
        this._surfaceTimer = 0;
    },
    think: function think() {
        this.inherited(arguments);
        if (this._state == 0) {
            this._surfaceTimer++;
            if (this._surfaceTimer > 200) {
                this._surfaceTimer = 0;
                this.changeState(3);
            }
        }
    }
});