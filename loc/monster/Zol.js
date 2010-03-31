dojo.provide("loc.monster.Zol");
// note: module name doesn't have to match class name
dojo.declare("loc.Zol", loc.Monster, {
    constructor: function sprite_constructor(args){
        this._stateDefs[0] = { name: 'default', faceted:false, nextState: 0, canMove: true, anim: [
            [ {x:128,y:32,t:6},{x:144,y:32,t:6} ]
        ]};
        this._speed = 0.3;
    },
    die: function zol_die() {
        // overloaded because we need to spawn two 'child' Gels
        var pos1 = dojo.clone(this.getPos());
    	var child1 = new loc.Gel({'pos':pos1,'_state':0});
    	var child2 = new loc.Gel({'pos':this.getPos(),'_state':0});
    	game.insertMonster(child1);
    	game.insertMonster(child2);
    	
    	this.inherited(arguments);
    },
    dropItem: function zol_dropItem() {
    	// (should be in a virtual base class, not here)
    	return;
    }
});
