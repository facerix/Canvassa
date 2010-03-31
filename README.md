THE LEGEND OF CANVASSA
======================

### An open-source, Javascript+Dojo clone of the original "Legend of Zelda" game for the NES ###

Overview
--------
* Uses HTML5 Canvas (and ExplorerCanvas in Internet Explorer)
* Currently depends on Dojo toolkit base library (but not Dijit)
* Author: Ryan Corradini
* website: http://buyog.com/code/
* email: ryancorradini@yahoo.com
* Twitter: http://twitter.com/buyog
* license: Free to use & modify, but please keep this credits message


Version Notes
--------------

_2010/03/31_

Lots of small, incremental changes in the past few months. Game is more or less playable in its current state.


_2009/12/25_

Some of the (many) updates in this checkin:
- added text to the page describing the game controls
- (re)implemented sounds
- made killed monsters leave behind hearts and rupees (fairies and clocks come later)
- added the sword projectile "flash" effect
- fixed bug: Reset button is broken
- fixed bug: erase "PAUSED" from notification area when unpausing


_2009/06/10_

This is a preliminary sandboxed checkin, primarily repackaged for sharing on Github.
It is not at all complete, but as of the first checkin, the basic preloading and sprite engines are in place.

There are currently two entry points:
- index.html -- the main game will be invoked from here; right now it's just the player on an empty screen.
- bestiary.html -- test harness that allows you to spawn the various enemy types into a canvas to observe their AIs.

Note also that sprite collision isn't yet enabled in the initial checkin. However, it has been added in subsequent checkins; see Git checkin logs for details.

------------

Still a lot of things on the overworld that need to be fixed/implemented; see http://github.com/buyog/Canvassa/issues for details.
