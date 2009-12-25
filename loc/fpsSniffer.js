/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.require("loc.SpriteCache");
dojo.provide("loc.fpsSniffer");

dojo.declare("loc.fpsSniffer", null, {
    constructor: function fpsSniffer_constructor(args){
        if (!window.spriteCache) { window.spriteCache = new loc.SpriteCache(); }
        if (!window.spriteCache.hasImage('progressBar')) {
            window.spriteCache.addImage( 'progressBar', 'loc/res/bar.png' );
        }
        this._frames = 0;
        this._startTime = 0;
        if ('context' in args) { this.ctx = args['context']; } else { alert('No canvas context provided. Cannot run FPS test.'); };
        if ('x' in args) { this.x = args['x']; } else { this.x = 0 };
        if ('y' in args) { this.y = args['y']; } else { this.y = 0 };
        if ('width' in args) { this.w = args['width']; } else { this.w = 256; };
        if ('height' in args) { this.h = args['height']; } else { this.h = 40; };
    },
    test: function(){
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
        this._startTime = (new Date).getTime();
        this._timer = setInterval(dojo.hitch(this, "_drawFrame"), 10);
    },
    frames: function(){
        if (this._frames) {
            return this._frames;
        } else {
            return 0;
        }
    },
    fps: function(){
        if (this._frames) {
            return this._frames/5;
        } else {
            return 0;
        }
    },
    _drawFrame: function _drawFrame() {
        this._frames++;
        var _time = (new Date).getTime() - this._startTime;
        var img = window.spriteCache.getImage('progressBar');
        //console.log("_drawFrame(",_time,")");
        
        this.ctx.drawImage(img,this.x+10,this.y+10,(this.w-20)*_time/5000,(this.h-20));
        if (_time >= 5000) {
            clearInterval(this._timer);
            dojo.publish("fpsSniffer:done");
        }
    }    
});
