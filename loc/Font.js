/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.provide("loc.Font");
dojo.require("loc.ImageCache");

dojo.declare("loc.Font", null, {
    timerid: 0,
    initialized: false,
    teletype: false,
    constructor: function font_constructor(args){
        dojo.mixin(this, args);
        this.fontImg = new Image();
        this.fontImg.src = '../res/font.png';
        this.fontImg.onload = function(){
            this.initialized = true;
        }
        //if (!(window.imageCache.hasImage("font"))) { window.imageCache.addImage("font", "../res/font.png"); };
        //this.imgSrc = "font"
    },

    drawText: function font_drawText(ctx, text, x, y, scale, wrap) {
        var dx = dy = 0;
        if (!scale) { scale = 1; }
        for (var i=0; i<text.length; i++) {
            switch (text[i]) {
                case ' ':
                    dx += 8;
                    break;
                case '\n':
                    dx = 0;
                    dy += 8;
                    break;
                default:
                    cut = this._getCharOffset(text[i].toLowerCase());
                    if (cut.x >= 0 && cut.y >= 0) {
                        //var img = window.imageCache.getImage(this.imgSrc);
                        //ctx.drawImage(img, cut.x,cut.y,8,8, (x+dx)*scale,(y+dy)*scale, 8*scale, 8*scale);
                        ctx.drawImage(this.fontImg, cut.x,cut.y,8,8, (x+dx)*scale,(y+dy)*scale, 8*scale, 8*scale);
                    }
                    dx += 8;
                    break;
            }
        }
    },

    _getCharOffset: function font_getCharOffset(char) {
        var x = y = 0;
        var ascii = char.charCodeAt(0);

        switch (ascii) {
            case 46: // "."
                x = 288;
                break;
            case 44: // ","
                x = 296;
                break;
            case 33: // "!"
                x = 304;
                break;
            case 63: // "?"
                x = 312;
                break;
            case 39: // "'"
                x = 320;
                break;
            case 45: // "-"
                x = 328;
                break;
            default:
                if (ascii >= 48 && ascii <= 57) {
                    // it's a number
                    x = parseInt(char) * 8;
                } else if (ascii >= 97 && ascii <= 122) {
                    // it's a letter
                    x = (ascii-87) * 8;
                }
                break;
        }

        return {x:x, y:y};
    }

}); // end of loc.Font class
