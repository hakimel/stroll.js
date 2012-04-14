/**
 * @author Hakim El Hattab | http://hakim.se
 * @author Paul Irish | http://paulirish.com/
 */

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


// we're using a WeakMap polyfill to associate elements and data with elements
// http://code.google.com/p/es-lab/source/browse/trunk/src/ses/WeakMap.js
var weakmap = new WeakMap();

var Stroll = {
    bind: function(element) {

        // cache items so we don't look each time.
        var items = element.querySelectorAll( 'li' );
        weakmap.set( element, {
            items : items
        } );

        // caching some heights so we don't need to go back to the DOM so much
        var listHeight = element.offsetHeight;
        var itemHeight = items[0].offsetHeight; // assumes all heights same

        return (function() {

            (function animloop(){
              requestAnimFrame( animloop );
              update();
            })();

            // apply past/future classes to list items outside of the viewport
            function update() {
                var scrollTop = element.pageYOffset || element.scrollTop,
                	scrollBottom = scrollTop + listHeight;

                var elemObj = weakmap.get(element);

                // quit if nothing changed.
                if( scrollTop != elemObj.lastTop ) {
	                elemObj.lastTop = scrollTop;

	                var items = elemObj.items;

	                // one loop to get the offsets from the DOM
	                for( var i = 0, len = items.length; i < len; i++ ) {

	                    // this offsetTop call is the perf killer.
	                    weakmap.set( items[i], {
	                        offset : items[i].offsetTop
	                    } );
	                }

	                // one loop to make our changes to the DOM
	                for( var j = 0, len = items.length; j < len; j++ ) {
						var item = items[j],
	                        offsetTop = weakmap.get( item ).offset;

	                    if( offsetTop + itemHeight < scrollTop ) {
	                        item.classList.add('past');
	                    } 
	                    else if( offsetTop > scrollBottom ) {
	                        item.classList.add('future');
	                    } 
	                    else {
	                        item.classList.remove('past');
	                        item.classList.remove('future');
	                    }
	                }
	            }
            }

        })();
    }
};