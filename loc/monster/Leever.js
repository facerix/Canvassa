dojo.provide("loc.monster.Leever");
dojo.declare("loc.Leever", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:0,y:144,t:5},{x:16,y:144,t:5} ]
        ]};
        this._stateDefs[2] = { name: 'startup', faceted:false, nextState: 5, canMove: false, anim: [
            [ {x:80,y:144,t:40} ]
        ]};
        this._stateDefs[3] = { name: 'digging', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:32,y:144,t:8},{x:48,y:144,t:5},{x:64,y:144,t:5},{x:80,y:144,t:20} ]
        ]};
        this._stateDefs[4] = { name: 'tunneling', faceted:false, nextState: 5, canMove: true, anim: [
            [ {x:80,y:144,t:80} ]
        ]};
        this._stateDefs[5] = { name: 'surfacing', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:144,t:5},{x:48,y:144,t:8},{x:32,y:144,t:5} ]
        ]};
        this._surfaceTimer = 0;
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.y += this.color * 16;
        }
        return base;
    },
    _animateCurrent: function _animateCurrent() {
        return true;
    },
    changeState: function changeState(index) {
        this.inherited(arguments);
        //console.log("changeState(",index,")");
    },
    think: function think() {
        this.inherited(arguments);
        if (this._state == 0) {
            this._surfaceTimer++;
            if (this._surfaceTimer > 200) {
                this._surfaceTimer = 0;
                this.changeState(3);
            }
        } else if (this._state == 4 && this.color == 1) {
            // red leevers can move while tunneling; blue ones don't
            this.vector = {x:0, y:0};
        }
    }
});
