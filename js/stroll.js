/*!
 * stroll.js 1.1 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	"use strict";

	// When a list is configured as 'live', this is how frequently 
	// the DOM will be polled for changes
	var LIVE_INTERVAL = 500;

	var IS_TOUCH_DEVICE = !!( 'ontouchstart' in window );

	// All of the lists that are currently bound
	var lists = [];

	// Set to true when there are lists to refresh
	var active = false;

	/**
	 * Updates all currently bound lists.
	 */
	function refresh() {
		if( active ) {
			requestAnimFrame( refresh );
			
			for( var i = 0, len = lists.length; i < len; i++ ) {
				lists[i].update();
			}
		}
	}

	/**
	 * Starts monitoring a list and applies classes to each of 
	 * its contained elements based on its position relative to 
	 * the list's viewport.
	 * 
	 * @param {HTMLElement} element 
	 * @param {Object} options Additional arguments;
	 * 	- live; Flags if the DOM should be repeatedly checked for changes
	 * 			repeatedly. Useful if the list contents is changing. Use 
	 * 			scarcely as it has an impact on performance.
	 */
	function add( element, options ) {
		// Only allow ul/ol
		if( !element.nodeName || /^(ul|li)$/i.test( element.nodeName ) === false ) {
			return false;
		}
		// Delete duplicates (but continue and re-bind this list to get the 
		// latest properties and list items)
		else if( contains( element ) ) {
			remove( element );
		}

		var list = IS_TOUCH_DEVICE ? new TouchList( element ) : new List( element );

		// Handle options
		if( options && options.live ) {
			list.syncInterval = setInterval( function() {
				list.sync.call( list );
			}, LIVE_INTERVAL );
		}

		// Synchronize the list with the DOM
		list.sync();

		// Add this element to the collection
		lists.push( list );

		// Start refreshing if this was the first list to be added
		if( lists.length === 1 ) {
			active = true;
			refresh();
		}
	}

	/**
	 * Stops monitoring a list element and removes any classes 
	 * that were applied to its list items.
	 * 
	 * @param {HTMLElement} element 
	 */
	function remove( element ) {
		for( var i = 0; i < lists.length; i++ ) {
			var list = lists[i];

			if( list.element == element ) {
				list.destroy();
				lists.splice( i, 1 );
				i--;
			}
		}

		// Stopped refreshing if the last list was removed
		if( lists.length === 0 ) {
			active = false;
		}
	}

	/**
	 * Checks if the specified element has already been bound.
	 */
	function contains( element ) {
		for( var i = 0, len = lists.length; i < len; i++ ) {
			if( lists[i].element == element ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Calls 'method' for each DOM element discovered in 
	 * 'target'.
	 * 
	 * @param target String selector / array of UL elements / 
	 * jQuery object / single UL element
	 * @param method A function to call for each element target
	 */
	function batch( target, method, options ) {
		var i, len;

		// Selector
		if( typeof target === 'string' ) {
			var targets = document.querySelectorAll( target );

			for( i = 0, len = targets.length; i < len; i++ ) {
				method.call( null, targets[i], options );
			}
		}
		// Array (jQuery)
		else if( typeof target === 'object' && typeof target.length === 'number' ) {
			for( i = 0, len = target.length; i < len; i++ ) {
				method.call( null, target[i], options );
			}
		}
		// Single element
		else if( target.nodeName ) {
			method.call( null, target, options );
		}
		else {
			throw 'Stroll target was of unexpected type.';
		}
	}

	/**
	 * Checks if the client is capable of running the library.
	 */
	function isCapable() {
		return !!document.body.classList;
	}

	/**
	 * The basic type of list; applies past & future classes to 
	 * list items based on scroll state.
	 */
	function List( element ) {
		this.element = element;
	}

	/** 
	 * Fetches the latest properties from the DOM to ensure that 
	 * this list is in sync with its contents. 
	 */
	List.prototype.sync = function() {
		this.items = Array.prototype.slice.apply( this.element.children );

		// Caching some heights so we don't need to go back to the DOM so much
		this.listHeight = this.element.offsetHeight;

		// One loop to get the offsets from the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			var item = this.items[i];
			item._offsetTop = item.offsetTop;
			item._offsetHeight = item.offsetHeight;
		}

		// Force an update
		this.update( true );
	}

	/** 
	 * Apply past/future classes to list items outside of the viewport
	 */
	List.prototype.update = function( force ) {
		var scrollTop = this.element.pageYOffset || this.element.scrollTop,
			scrollBottom = scrollTop + this.listHeight;

		// Quit if nothing changed
		if( scrollTop !== this.lastTop || force ) {
			this.lastTop = scrollTop;

			// One loop to make our changes to the DOM
			for( var i = 0, len = this.items.length; i < len; i++ ) {
				var item = this.items[i];
				var itemClass = item.className;

				// Above list viewport
				if( item._offsetTop + item._offsetHeight < scrollTop ) {
					// Exclusion via string matching improves performance
					if( itemClass.indexOf( 'past' ) === -1 ) {
						item.classList.add( 'past' );
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( itemClass.indexOf( 'future' ) === -1 ) {
						item.classList.add( 'future' );
					}
				}
				// Inside of list viewport
				else if( itemClass.length ) {
					item.classList.remove( 'past' );
					item.classList.remove( 'future' );
				}
			}
		}
	}

	/**
	 * Cleans up after this list and disposes of it.
	 */
	List.prototype.destroy = function() {
		clearInterval( this.syncInterval );

		for( var j = 0, len = this.items.length; j < len; j++ ) {
			var item = this.items[j];

			item.classList.remove( 'past' );
			item.classList.remove( 'future' );
		}
	}


	/**
	 * A list specifically for touch devices. Simulates the style 
	 * of scrolling you'd see on a touch device but does not rely 
	 * on webkit-overflow-scrolling.
	 */
	function TouchList( element ) {
		this.element = element;
		this.element.style.overflow = 'hidden';

		this.top = {
			value: 0,
			natural: 0
		};

		this.touch = {
			value: 0,
			offset: 0,
			start: 0,
			previous: 0
		};

		this.velocity = {
			value: 0,
			target: 0
		};
	}
	TouchList.prototype = new List();

	/** 
	 * Fetches the latest properties from the DOM to ensure that 
	 * this list is in sync with its contents. 
	 */
	TouchList.prototype.sync = function() {
		this.items = Array.prototype.slice.apply( this.element.children );

		// Caching some heights so we don't need to go back to the DOM so much
		this.listHeight = this.element.offsetHeight;

		// One loop to get the offsets from the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			var item = this.items[i];
			item._offsetHeight = item.offsetHeight;
			item._offsetTop = item.offsetTop;
			item._offsetBottom = item._offsetTop + item._offsetHeight;
			item._state = '';

			item.style.opacity = 1;
		}

		// Force an update
		this.update( true );

		this.bind();
	}

	TouchList.prototype.bind = function() {
		var scope = this;
		
		this.element.addEventListener( 'touchstart', function( event ) {
			scope.onTouchStart( event );
		}, false );

		this.element.addEventListener( 'touchmove', function( event ) {
			scope.onTouchMove( event );
		}, false );

		this.element.addEventListener( 'touchend', function( event ) {
			scope.onTouchEnd( event );
		}, false );
	}

	TouchList.prototype.onTouchStart = function( event ) {
		event.preventDefault();
		
		if( event.touches.length === 1 ) {
			this.velocity.value = 0;
			this.touch.offset = 0;
			this.touch.start = event.touches[0].clientY;
		}
	}

	TouchList.prototype.onTouchMove = function( event ) {
		if( event.touches.length === 1 ) {
			this.touch.previous = this.touch.value;
			this.touch.value = event.touches[0].clientY;
			this.touch.offset = Math.round( this.touch.start - this.touch.value );
			this.touch.lastMove = Date.now();

			this.velocity.target = ( this.touch.start - this.touch.value ) / 10;
		}
	}

	TouchList.prototype.onTouchEnd = function( event ) {
		// var speed = Math.abs( this.touch.value - this.touch.previous ) / this.listHeight;
		// this.velocity.value = this.touch.previous - this.touch.value;

		this.velocity.value = this.velocity.target; //* ( 1 - ( Math.min( Date.now() - this.touch.lastMove, 400 ) / 1000 ) );

		this.top.value += this.touch.offset;

		this.touch.offset = 0;
		this.touch.start = 0;
		this.touch.value = 0;
		
		if( Math.abs( this.velocity.value ) > 4 ) {
			event.stopImmediatePropagation();
			return false;
		}
	};

	/** 
	 * Apply past/future classes to list items outside of the viewport
	 */
	TouchList.prototype.update = function( force ) {

		var scrollTop = this.top.value + this.velocity.value + this.touch.offset;

		if( this.velocity.value || this.touch.offset ) {
			// Scroll the DOM and add on the offset from touch
			this.element.scrollTop = scrollTop;
			scrollTop = this.element.scrollTop;

			// Cache the currently set scroll top and touch offset
			this.top.value = scrollTop - this.touch.offset;
		}

		// Decay
		this.velocity.value *= 0.97;
		this.velocity.target *= 0.9;

		if( Math.abs( this.velocity.value ) < 0.15 ) {
			this.velocity.value = 0;
		}

		// Only proceed if the scroll position has changed
		if( scrollTop !== this.top.natural || force ) {
			console.log(1);
			this.top.natural = scrollTop;
			this.top.value = scrollTop - this.touch.offset;

			var scrollBottom = scrollTop + this.listHeight;
			
			// One loop to make our changes to the DOM
			for( var i = 0, len = this.items.length; i < len; i++ ) {
				var item = this.items[i];

				// Above list viewport
				if( item._offsetBottom < scrollTop ) {
					// Exclusion via string matching improves performance
					if( this.velocity.value >= 0 && item._state !== 'past' ) {
						item.classList.add( 'past' );
						item._state = 'past';
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( this.velocity.value <= 0 && item._state !== 'future' ) {
						item.classList.add( 'future' );
						item._state = 'future';
					}
				}
				// Inside of list viewport
				else if( item._state ) {
					if( item._state === 'past' ) item.classList.remove( 'past' );
					if( item._state === 'future' ) item.classList.remove( 'future' );
					item._state = '';
				}
			}
		}
	};


	/**
	 * Public API
	 */
	window.stroll = {
		/**
		 * Binds one or more lists for scroll effects.
		 * 
		 * @see #add()
		 */
		bind: function( target, options ) {
			if( isCapable() ) {
				batch( target, add, options );
			}
		},

		/**
		 * Unbinds one or more lists from scroll effects.
		 * 
		 * @see #remove()
		 */
		unbind: function( target ) {
			if( isCapable() ) {
				batch( target, remove );
			}
		}
	}

	window.requestAnimFrame = (function(){
	   return  window.requestAnimationFrame       ||
	 		  window.webkitRequestAnimationFrame ||
	 		  window.mozRequestAnimationFrame    ||
	 		  window.oRequestAnimationFrame      ||
	 		  window.msRequestAnimationFrame     ||
	 		  function( callback ){
	 			window.setTimeout(callback, 1000 / 60);
	 		  };
	 })()

})();