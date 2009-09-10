dojo.provide("loc.monster._base");

dojo.require("loc.Sprite");
dojo.require("loc.Item");

dojo.declare("loc.Monster", loc.Sprite, {
    _speed: 1,
    _state: 2,  /* start in "spawning" state */
    _hurtTimer: 0,
    _stunTimer: 0,
    color: 0,
    spriteSrc: "monsters",
    strength: 1,
    HP: 1,
    constructor: function sprite_constructor(args){
        window.imageCache.addImage("monsters", "../res/monsters.png");
        dojo.mixin(this, args);
        var spawnTime = 10 + Math.random() * 30;
        this._stateDefs = [{}, /* default will be different for each derived class */
            { name: 'die', faceted:false, nextState: -1, canMove: false, anim: [
              [ {x:64,y:16,t:6},{x:80,y:16,t:3},{x:200,y:16,t:20} ]
            ]},
            { name: 'spawn', faceted: false, nextState: 0, canMove: false, anim: [
              [ {x:64,y:0,t:spawnTime},{x:80,y:0,t:3} ]
            ]}
        ];
    },
    _animTick: function monster_animTick() {
        if (this._stunTimer > 0) { this._stunTimer--; }
        return this.inherited(arguments);
    },
    _animateCurrent: function _animateCurrent() {
        return this.inherited(arguments) && (this._stunTimer % 3 == 0);
    },
    think: function(){
        // determine if I'm going to move, attack, or stand still; this is the AI
        // 5 possible actions: 0=move left, 1=move up, 2=move right, 3=move down, 4=stand still
        //   (some derived monster classes will have other actions, such as throwing a projectile)
        // action choice is strongly biased in favor of the most recent action. This should keep monsters from "analysis paralysis"
        if (this.isActive()) {
            if (Math.random() < 0.05) { /* biased against changing direction very often */
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
    },
    changeState: function monster_changeState(state) {
        this._stunTimer = 0;
        this.inherited(arguments);
    },
    die: function monster_die() {
        //soundManager.play('kill');
        this.changeState(1); // dying
    },
    getHit: function monster_getHit(damage) {
        if (!this._hurtTimer) {
            this.HP -= damage;
            //this._hurtTimer = 10;
            if (this.HP <= 0) {
                this.die();
            }
        }
    },
    canAttack: function() {
        return this.isMobile() && this.isActive();
    },
    isMobile: function monster_isMobile(){
        return this.inherited(arguments) && (this._stunTimer == 0);
    },
    isActive: function monster_isActive(){
        return this.inherited(arguments) && (this._stunTimer == 0);
    },
    reset: function monster_reset(){
        this.inherited(arguments);
        this._defaultState = 2;
        this._state = 2;
        this._lastAction = -1;  // no previous action
    },
    stun: function monster_stun(duration){
        this.stop();
        this._stunTimer = duration;
    }
});


loc.Monster.getNamedSubtype = function(typename, args) {
    var monster = null;

    switch (typename.toLowerCase()) {
        case 'armos':
            monster = new loc.Armos(args);
            break;
        case 'ghini':
            monster = new loc.Ghini(args);
            break;
        case 'leever':
            monster = new loc.Leever(args);
            break;
        case 'lynel':
            monster = new loc.Lynel(args);
            break;
        case 'moblin':
            monster = new loc.Moblin(args);
            break;
        case 'octoroc':
            monster = new loc.Octoroc(args);
            break;
        case 'peahat':
            monster = new loc.Peahat(args);
            break;
        case 'rock':
            monster = new loc.Boulder(args);
            break;
        case 'tectite':
            monster = new loc.Tectite(args);
            break;
        case 'zola':
            monster = new loc.Zola(args);
            break;
        default:
            break;
    }

    return monster;
}
