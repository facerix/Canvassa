dojo.provide("loc.monster.Bubble");
dojo.declare("loc.Bubble", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:64,y:128,t:1},{x:80,y:128,t:1},{x:96,y:128,t:1},{x:112,y:128,t:1} ]
        ]};
        this._speed = 1.2;
        this.vector = {x: (Math.random()) - 0.5, y: (Math.random()) - 0.5};
    },
    think: function think() {
        // first, check if I'm moving and stuck to a wall; if so, bounce me
        var info = this.canMove(this.vector);
        switch (this.moveability) {
            case 'x':
                this.vector.x *= -0.2;
                break;
            case 'y':
                this.vector.y *= -0.2;
                break;
            case 'xy':
                this.vector.x *= -0.5;
                this.vector.y *= -0.5;
                break;
            default:
                break;
        }

        if (this.isActive()) {
            // move; decide if I need to change my vector at all
            if (Math.random() < 0.005) {
                this.vector.x = (Math.random() + 0.5) * (Math.random() < 0.5 ? -1:1);
                this.vector.y = (Math.random() + 0.5) * (Math.random() < 0.5 ? -1:1);
            }
        }
    }
});
