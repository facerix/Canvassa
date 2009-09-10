/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

dojo.provide("loc.ImageCache");

dojo.declare("loc.ImageCache", null, {
    constructor: function ImageCache_constructor(args) {
        this._sprites = {};
        this._loadStatus = {};
    },
    addImage: function addImage(name,src) {
        if (name in this._sprites) { 
            //console.log("Spritesheet",name,"is already in the cache");
            return;
        } else {
            //console.log("Got image spec:",name,src);
            this._sprites[name] = new Image();
            this._loadStatus[name] = false;
            this._sprites[name].src = src;
            this._sprites[name].onload = dojo.hitch(this, function() { 
                this._loadStatus[name] = true;
                //console.log("image "+name+" loaded. (this.ready:",this.ready(),")");
                if (this.ready()) {
                    dojo.publish("loc.ImageCache.onReady",[]);
                }
            });
        }
    },
    hasImage: function hasImage(name) { return (name in this._sprites); },
    getImage: function getImage(name) {
        if (name in this._sprites) {
            return this._sprites[name];
        } else {
            console.error("Image name '", name, "' not found");
            return null;
        }
    },
    ready: function ready() {
        var retVal = true;
        for (var id in this._sprites) {
            if (id in this._loadStatus) {
                retVal &= this._loadStatus[id];
            } else {
                return false;
            }
        }
        return retVal;
    }
});
