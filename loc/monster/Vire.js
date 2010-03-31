dojo.provide("loc.monster.Vire");
dojo.declare("loc.Vire", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:true, nextState: 0, canMove: true, anim: [
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:128,y:16,t:5},{x:144,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ],
            [ {x:96,y:16,t:5},{x:112,y:16,t:5} ]
        ]};
    },
    die: function vire_die() {
    	// overloaded because killing these spawns a pair of red keese
    	var pos1 = this.getPos();
    	var pos2 = this.getPos();
    	var child1 = new loc.Keese({'pos':pos1,'color':1});
    	var child2 = new loc.Keese({'pos':pos2,'color':1});
    	game.monsters.push(child1);
    	game.monsters.push(child2);

    	this.inherited(arguments);
    }
});