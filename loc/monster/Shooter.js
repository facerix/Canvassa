dojo.provide("loc.monster.Shooter");

dojo.declare("loc.Shooter", null, {
    attackState: 0,
    constructor: function shooter_constructor(args){
        dojo.mixin(this, args);
        this._proj = null; // my current projectile, if any
    },
    canAttack: function() {
        return this.inherited(arguments) && (this._proj == null);
    },
    changeState: function() {
        this.inherited(arguments);
        if (this._state == this.attackState && this._animElem == 0) {
            dojo.publish("monster.onAttack", [this.declaredClass, this.index]);
        }
    },
    _getProjectileArgs: function() {
        var projVector = {x:0,y:0};
        switch(this._facing) {
            case 0: // west
                projVector.x = -1;
                break;
            case 1: // north
                projVector.y = -1;
                break;
            case 2: // east
                projVector.x = 1;
                break;
            case 3: // south
                projVector.y = 1;
                break;
        }
        var args = {
            vector: projVector,
            pos: dojo.clone(this.pos),
            size: {w:8, h:8},
            scale: 1,
            color: 0,
            spriteSrc: "items"
        };
        return args;
    },
    getProjectile: function() {
        console.log(this.declaredClass,'[',this.index,"].getProjectile()");
        if (!this.proj) {
            this.proj = new loc.Projectile(this._getProjectileArgs());
        }
        return this.proj;
    },
    killProjectile: function killProjectile() {
        if (this._proj) {
            if ('index' in this._proj) { delete game.items[this._proj.index]; }
            this._proj = null;
        }
    },
    isActive: function isActive() {
        return this.inherited(arguments) && (this._state != this.attackState);
    },
    think: function() {
        this.inherited(arguments);
        if (Math.random() < 0.01 && this.canAttack()) {
            this.changeState( this.attackState );
        }
    }
});
