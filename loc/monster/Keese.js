dojo.provide("loc.monster.Keese");
dojo.declare("loc.Keese", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:0,t:3},{x:112,y:0,t:3} ]
        ]};
        // initial velocity
        this.vector.x = (Math.random()+0.5) * (Math.random() < 0.5 ? -1 : 1);
        this.vector.y = (Math.random()+0.5) * (Math.random() < 0.5 ? -1 : 1);
    },
    _animTick: function _animTick() {
        var base = this.inherited(arguments);
        // recolor all sprites except the die and spawn ones
        if (this._state == 0 || this._state > 2) {
            base.x += this.color * 32;
        }
        return base;
    },
    think: function think() {
        if (this.isActive() && this._state == 0) {
            if (Math.random() < 0.01 && this.isActive() || !this.canMove(this.vector)) {
                // if we meet all the above criteria, change direction
                this.vector.x = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                this.vector.y = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
            }
        }
    }
});
