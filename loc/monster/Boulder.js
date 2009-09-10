dojo.provide("loc.monster.Boulder");
dojo.declare("loc.Boulder", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:48,y:0,t:4},{x:48,y:16,t:4} ]
        ]};
        this.vector.y = Math.random() * 0.5 + 2;
    },
    canMove: function(vector){
        return true;
    },
    think: function think() {
        if (this.pos.y > 300) {
            // remove after I go off the bottom of the screen
            dojo.publish("sprite.onTerminate", [this.declaredClass, this.index]);
        } else if (this._state == 0 && this._animTime == 0) {
            this.vector.x = (Math.random() * 3) - 1.5;
        }
    }
});
