/**
 * Applies descriptive classes to list items based on their 
 * position relative to their parent lists' scroll state.
 * 
 * Demo: http://lab.hakim.se/scroll-effects/
 * 
 * @author Hakim El Hattab | http://hakim.se
 * @author Paul Irish | http://paulirish.com
 * @author Felix Gnass | http://fgnass.github.com
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

(function(){
	// Will be exposed in global scope
	var Stroll = {};

	var elements = [];

	(function animloop() {
		requestAnimFrame( animloop );
		
		for( var i = 0, len = elements.length; i < len; i++ ) {
			elements[i].update();
		}

	})();

	/**
	 * Binds one or multiple targets for scroll effects.
	 * @param  {[type]} target [description]
	 * @return {[type]}        [description]
	 */
	Stroll.bind = function( target ) {
		// Selector
		if( typeof target === 'string' ) {
			var targets = document.querySelectorAll( target );

			for( j = 0; j < targets.length; j++ ) {
				bindElement( targets[j] );
			}
		}
		// Array (jQuery)
		else if( typeof target === 'object' && typeof target.length === 'number' ) {
			for( j = 0; j < target.length; j++ ) {
				bindElement( target[j] );
			}
		}
		// Single element
		else if( target.nodeName && target.nodeName === 'UL' ) {
			bindElement( target );
		}
		else {
			throw 'Stroll target was of unexpected type.';
		}
	};

	function bindElement( element ) {
		var items = Array.prototype.slice.apply( element.children );

		// caching some heights so we don't need to go back to the DOM so much
		var listHeight = element.offsetHeight;

		// one loop to get the offsets from the DOM
		for( var i = 0, len = items.length; i < len; i++ ) {
			items[i]._offsetTop = items[i].offsetTop;
			items[i]._offsetHeight = items[i].offsetHeight;
		}

		// Apply past/future classes to list items outside of the viewport
		elements.push( {
			update: function() {
				var scrollTop = element.pageYOffset || element.scrollTop,
					scrollBottom = scrollTop + listHeight;

				// Quit if nothing changed
				if( scrollTop !== element.lastTop ) {
					element.lastTop = scrollTop;

					// One loop to make our changes to the DOM
					for( var i = 0, len = items.length; i < len; i++ ) {
						var item = items[i];

						// Above list viewport
						if( item._offsetTop + item._offsetHeight < scrollTop ) {
							item.classList.add( 'past' );
						}
						// Below list viewport
						else if( item._offsetTop > scrollBottom ) {
							item.classList.add( 'future' );
						}
						// Inside of list viewport
						else {
							item.classList.remove( 'past' );
							item.classList.remove( 'future' );
						}
					}
				}
			}
		} )
	};

	window.Stroll = Stroll;

})();
