dojo.provide("loc.monster.Tectite");
dojo.declare("loc.Tectite", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:16,y:112,t:15},{x:0,y:112,t:10} ]
        ]};
        this._stateDefs[3] = { name: 'jump', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:0,y:112,t:50} ]
        ]};
        this._stateDefs[4] = { name: 'jump_end', faceted:false, nextState: 0, canMove: false, anim: [
            [ {x:16,y:112,t:14} ]
        ]};
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.x += this.color * 32;
        }
        return base;
    },
    _animateCurrent: function _animateCurrent() {
        return true;
    },
    changeState: function changeState(index) {
        if (index == 3) {
            // initiate jump... give myself a starting velocity
            this.vector = {x: (Math.random() * 4)-2, y: (Math.random() * 4)-2};
        } else if (index == 4) {
            // ending jump... reset velocity to null
            this.vector = {x:0,y:0};
        }
        this.inherited(arguments);
    },
    think: function(){
        if (Math.random() < 0.005 && this._state == 0 && this.isActive()) {
            // if we meet all the above criteria, jump.
            this.changeState(3);
        }
    }
});
