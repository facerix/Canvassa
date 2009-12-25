dojo.provide("loc.monster.Gel");
dojo.declare("loc.Gel", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:96,y:32,t:2},{x:112,y:32,t:2} ]
        ]};
        this._speed = this.scale;
    },
    think: function gel_think(){
        if (this.isActive()) {
            if (Math.random() < 0.0005) {
                switch (Math.floor(Math.random() * 5)) {
                  case game.constants.direction.left:
                      this.vector = {x:-1,y:0};
                      break;
                  case game.constants.direction.up:
                      this.vector = {x:0, y:-1};
                      break;
                  case game.constants.direction.right:
                      this.vector = {x:1, y:0};
                      break;
                  case game.constants.direction.down:
                      this.vector = {x:0, y:1};
                      break;
                }
            }
        }
    }
});