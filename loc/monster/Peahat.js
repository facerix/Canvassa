dojo.provide("loc.monster.Peahat");
dojo.declare("loc.Peahat", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:32,y:32,t:2},{x:48,y:32,t:2} ]
        ]};
        this._stateDefs[2].nextState = 5;  // after spawning, start in 'starting' state rather than default state
        this._stateDefs[3] = { name: 'stopping', faceted:false, nextState: 4, canMove: true, anim: [
            [ {x:32,y:32,t:2},{x:48,y:32,t:2},
              {x:32,y:32,t:2},{x:48,y:32,t:2},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:9},{x:48,y:32,t:9} ]
        ]};
        this._stateDefs[4] = { name: 'resting', faceted:false, nextState: 5, canMove: false, anim: [
            [ {x:32,y:32,t:90} ]
        ]};
        this._stateDefs[5] = { name: 'starting', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:32,y:32,t:9},{x:48,y:32,t:9},
              {x:32,y:32,t:9},{x:48,y:32,t:9},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:8},{x:48,y:32,t:8},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:7},{x:48,y:32,t:7},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:6},{x:48,y:32,t:6},
              {x:32,y:32,t:5},{x:48,y:32,t:5},
              {x:32,y:32,t:4},{x:48,y:32,t:4},
              {x:32,y:32,t:3},{x:48,y:32,t:3},
              {x:32,y:32,t:2},{x:48,y:32,t:2} ]
        ]};
    },
    isActive: function isActive() {
        return this.inherited(arguments) && (this._state != 4);
    },
    changeState: function changeState(index) {
        this.inherited(arguments);
        if (index == 4) {
            // stopped: set vector to 0,0
            this.vector = {x:0,y:0};

        } else if (index == 5) {
            // start moving: set initial vector
            this.vector.x = (Math.random()) - 0.5;
            this.vector.y = (Math.random()) - 0.5;
        }
    },
    think: function think() {
        // first, check if I'm moving and stuck to a wall; if so, bounce me
        var info = this.canMove(this.vector);
        switch (this.moveability) {
            case 'x':
                this.vector.x *= -1;
                break;
            case 'y':
                this.vector.y *= -1;
                break;
            case 'xy':
                this.vector.x *= -1;
                this.vector.y *= -1;
                break;
            default:
                break;
        }

        if (this.isActive()) {
            switch (this._state) {
                case 0: // default
                    if (Math.random() < 0.001 && this.isActive()) {
                        // if we meet all the above criteria, start slowing down to rest
                        this.changeState(3);
                    } else {
                        // move; decide if I need to change my vector at all
                        if (Math.random() > 0.99) {
                            this.vector.x = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                            this.vector.y = (Math.random()+0.75) * (Math.random() < 0.5 ? -0.75 : 0.75);
                        }
                    }
                    break;

                case 3: // slowing down
                    this.vector.x /= 1.01;
                    this.vector.y /= 1.01;
                    break;

                case 5: // speeding up
                    this.vector.x *= 1.01;
                    this.vector.y *= 1.01;
                    break;

                default:
                    break;
            }
        }
    }
});
