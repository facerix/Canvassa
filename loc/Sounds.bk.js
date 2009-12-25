/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/
dojo.provide("loc.Sounds");

/*
dojo.require("dojo.io.script");

dojo.addOnLoad(function(){
    dojo.io.script.get({
        url:"../../../sndmgr/script/soundmanager2-nodebug-jsmin.js",
        error: function(response, ioArgs){
            alert("Failed to load SoundManager. No sounds available.");
        },
        load: function(response, ioArgs){
            console.log("Loaded SoundManager. Now initializing sounds...");
            init_sounds();
        }
    });
});
*/

// setup sound manager
function init_sounds() {
    soundManager.url = '/code/sndmgr/swf/';
    soundManager.onload = function() {
      var snd = soundManager.createSound({
        id: 'title',
        url: ('loc/res/snd/titleStart.mp3'),
        volume: 50,
        stream: true
      });

      snd = soundManager.createSound({
        id: 'bgmStart',
        url: ('loc/res/snd/bgmStart.mp3'),
        volume: 50,
        stream: true,
        onfinish: loopBgm
      });

      snd = soundManager.createSound({
        id: 'bgm',
        url: ('loc/res/snd/bgm.mp3'),
        volume: 50,
        stream: true,
        onfinish: loopBgm
      });

      snd = soundManager.createSound({
        id: 'dungeonBgm',
        url: ('loc/res/snd/dungeonBgm.mp3'),
        volume: 50,
        stream: true,
        onfinish: loopDungeonBgm
      });

      snd = soundManager.createSound({
        id: 'gameover',
        url: ('loc/res/snd/gameover.mp3'),
        volume: 50,
        stream: true,
        onfinish: loopGameover
      });

      snd = soundManager.createSound({
        id: 'item',
        stream: false,
        url: ('loc/res/snd/item.mp3')
      });

      snd = soundManager.createSound({
        id: 'sword',
        stream: false,
        url: ('loc/res/snd/sword.mp3')
      });

      snd = soundManager.createSound({
        id: 'swordshoot',
        url: ('loc/res/snd/sword2.mp3')
      });

      snd = soundManager.createSound({
        id: 'heart',
        url: ('loc/res/snd/heart.mp3')
      });

      snd = soundManager.createSound({
        id: 'hit',
        url: ('loc/res/snd/hit.mp3')
      });

      snd = soundManager.createSound({
        id: 'kill',
        url: ('loc/res/snd/kill.mp3')
      });

      snd = soundManager.createSound({
        id: 'die',
        url: ('loc/res/snd/die.mp3'),
        volume: 50,
        stream: true
      });

      snd = soundManager.createSound({
        id: 'hurt',
        url: ('loc/res/snd/hurt.mp3')
      });

      snd = soundManager.createSound({
        id: 'rupee',
        url: ('loc/res/snd/rupee.mp3')
      });

      snd = soundManager.createSound({
        id: 'special',
        url: ('loc/res/snd/fairy.mp3')
      });

      snd = soundManager.createSound({
        id: 'arrow',
        url: ('loc/res/snd/arrow.mp3')
      });

      snd = soundManager.createSound({
        id: 'boomerang',
        url: ('loc/res/snd/boomer.mp3')
      });

      snd = soundManager.createSound({
        id: 'bombDrop',
        url: ('loc/res/snd/bombDrop.mp3')
      });

      snd = soundManager.createSound({
        id: 'bombBoom',
        url: ('loc/res/snd/bombBoom.mp3')
      });

      snd = soundManager.createSound({
        id: 'candle',
        url: ('loc/res/snd/candle.mp3')
      });

      snd = soundManager.createSound({
        id: 'wand',
        url: ('loc/res/snd/wand.mp3')
      });

      snd = soundManager.createSound({
        id: 'whistle',
        url: ('loc/res/snd/flute.mp3'),
        onfinish: spawnWhirlwind
      });

      soundManager.play('title');
    }
}

function loopTitle() {
    soundManager.play('title');
}
function loopBgm() {
    soundManager.play('bgm');
}
function loopDungeonBgm() {
    soundManager.play('dungeonBgm');
}
function loopGameover() {
    soundManager.play('gameover');
}
function spawnWhirlwind() {
    dojo.publish("whistle.onSummonWind", []);
}

// init now
init_sounds();
