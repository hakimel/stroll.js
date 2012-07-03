/*!
 * stroll.js 1.2 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Copyright (C) 2012 Hakim El Hattab, http://hakim.se
 */
(function(){

	"use strict";

	var _slice = [].slice;

	// When a list is configured as 'live', this is how frequently 
	// the DOM will be polled for changes
	var SYNC_INTERVAL = 500;

	var IS_TOUCH_DEVICE = !!( 'ontouchstart' in window );

	// All of the lists that are currently bound
	var lists = [];

	var	STATE_NULL		= null,
		STATE_PAST		= 'past',
		STATE_FUTURE	= 'future';

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

		var list = IS_TOUCH_DEVICE
			? new TouchList( element, options )
			: new List( element, options );

		// Add this element to the collection
		lists.push( list );
	}

	/**
	 * Stops monitoring a list element and removes any classes 
	 * that were applied to its list items.
	 * 
	 * @param {HTMLElement} element 
	 */
	function remove( element ) {
		for( var list, i = 0, len = lists.length; i < len; i++ ) {
			list = lists[i];

			if( list && list.element === element ) {
				list.destroy();
				lists.splice( i, 1 );
				i--;
			}
		}
	}

	/**
	 * Checks if the specified element has already been bound.
	 */
	function contains( element ) {
		for( var list, i = 0, len = lists.length; i < len; i++ ) {
			list = lists[i];

			if( list && list.element === element ) {
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
	function List( element, options ) {
		options = options || {};

		this.element = element;
		this.lock = false;

		if ( this.element ) {
			this.init();

			if ( !options.live ) {
				this.sync();
			} else {
				var doSync = (function() {
					this.sync();
					this.syncTimeout = window.setTimeout( doSync, SYNC_INTERVAL );
				}).bind( this );
				doSync();
			}
		}
	}

	List.prototype.init = function() {
		this.scrollDelegate = this.update.bind( this );
		this.element.addEventListener( 'scroll', this.scrollDelegate, false );
	};

	List.prototype.unInit = function() {
		this.element.removeEventListener( 'scroll', this.scrollDelegate, false );
		this.scrollDelegate = null;
	};

	/** 
	 * Fetches the latest properties from the DOM to ensure that 
	 * this list is in sync with its contents. 
	 */
	List.prototype.sync = function() {
		this.items = _slice.apply( this.element.children );

		// Caching some heights so we don't need to go back to the DOM so much
		this.listHeight = this.element.offsetHeight;

		// One loop to get the offsets from the DOM
		for( var item, items = this.items, i = 0, len = items.length; i < len; i++ ) {
			item = items[i];
			item._offsetHeight = item.offsetHeight;
			item._offsetTop = item.offsetTop;
			item._offsetBottom = item._offsetTop + item._offsetHeight;
			item._state = STATE_NULL;
		}

		// Force an update
		this.update( true );
	};

	/** 
	 * Apply past/future classes to list items outside of the viewport
	 */
	List.prototype.update = function( force ) {
		var scrollTop = this.element.pageYOffset || this.element.scrollTop,
			scrollBottom = scrollTop + this.listHeight;

		// Quit if nothing changed
		if( !this.lock && scrollTop !== this.lastTop || force ) {
			this.lock = true;
			this.lastTop = scrollTop;

			// One loop to make our changes to the DOM
			for( var item, items = this.items, i = 0, len = items.length; i < len; i++ ) {
				item = items[i];

				// Above list viewport
				if( item._offsetBottom < scrollTop ) {
					// Exclusion via string matching improves performance
					if( item._state !== STATE_PAST ) {
						item._state = STATE_PAST;
						item.classList.add( STATE_PAST );
						item.classList.remove( STATE_FUTURE );
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( item._state !== STATE_FUTURE ) {
						item._state = STATE_FUTURE;
						item.classList.add( STATE_FUTURE );
						item.classList.remove( STATE_PAST );
					}
				}
				// Inside of list viewport
				else if( item._state ) {
					if( item._state === STATE_PAST ) item.classList.remove( STATE_PAST );
					if( item._state === STATE_FUTURE ) item.classList.remove( STATE_FUTURE );
					item._state = STATE_NULL;
				}
			}

			this.lock = false;
		}
	};

	/**
	 * Cleans up after this list and disposes of it.
	 */
	List.prototype.destroy = function() {
		if ( this.syncTimeout ) {
			window.clearTimeout( this.syncTimeout );
			this.syncTimeout = null;
		}

		for( var item, items = this.items, i = 0, len = items.length; i < len; i++ ) {
			item = items[i];

			item.classList.remove( STATE_PAST );
			item.classList.remove( STATE_FUTURE );
		}

		this.unInit();
	};


	/**
	 * A list specifically for touch devices. Simulates the style 
	 * of scrolling you'd see on a touch device but does not rely 
	 * on webkit-overflow-scrolling since that makes it impossible 
	 * to read the up-to-date scroll position.
	 */
	function TouchList( element, options ) {
		List.apply( this, arguments );

		this.element.style.overflow = 'hidden';

		this.top = {
			value: 0,
			natural: 0
		};

		this.touch = {
			value: 0,
			offset: 0,
			start: 0,
			previous: 0,
			lastMove: Date.now(),
			accellerateTimeout: -1,
			isAccellerating: false,
			isActive: false
		};

		this.velocity = 0;
	}
	TouchList.prototype = new List();
	TouchList.prototype.constructor = TouchList;

	TouchList.prototype.init = function() {
		this.touchStartDelegate = this.onTouchStart.bind( this );
		this.touchMoveDelegate = this.onTouchMove.bind( this );
		this.touchEndDelegate = this.onTouchEnd.bind( this );
		this.element.addEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.addEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.addEventListener( 'touchend', this.touchEndDelegate, false );
	};

	TouchList.prototype.unInit = function() {
		this.element.removeEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.removeEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.removeEventListener( 'touchend', this.touchEndDelegate, false );
		this.touchStartDelegate = null;
		this.touchMoveDelegate = null;
		this.touchEndDelegate = null;
	};

	/** 
	 * Fetches the latest properties from the DOM to ensure that 
	 * this list is in sync with its contents. This is typically 
	 * only used once (per list) at initialization.
	 */
	TouchList.prototype.sync = function() {
		this.items = _slice.apply( this.element.children );

		this.listHeight = this.element.offsetHeight;

		// One loop to get the properties we need from the DOM
		for( var item, items = this.items, i = 0, len = items.length; i < len; i++ ) {
			item = items[i];
			item._offsetHeight = item.offsetHeight;
			item._offsetTop = item.offsetTop;
			item._offsetBottom = item._offsetTop + item._offsetHeight;
			item._state = STATE_NULL;

			// Animating opacity is a MAJOR performance hit on mobile so we can't allow it
			item.style.opacity = 1;
		}

		this.top.natural = this.element.scrollTop;
		this.top.value = this.top.natural;
		this.top.max = item._offsetBottom - this.listHeight;

		// Force an update
		this.update( true );
	};

	TouchList.prototype.onTouchStart = function( event ) {
		event.preventDefault();

		if( event.touches.length === 1 ) {
			this.touch.isActive = true;
			this.touch.start = event.touches[0].clientY;
			this.touch.previous = this.touch.start;
			this.touch.value = this.touch.start;
			this.touch.offset = 0;

			if( this.velocity ) {
				this.touch.isAccellerating = true;

				var scope = this;

				this.touch.accellerateTimeout = setTimeout( function() {
					scope.touch.isAccellerating = false;
					scope.velocity = 0;
				}, 500 );
			}
			else {
				this.velocity = 0;
			}
		}
	};

	TouchList.prototype.onTouchMove = function( event ) {
		if( event.touches.length === 1 ) {
			var previous = this.touch.value;

			this.touch.value = event.touches[0].clientY;
			this.touch.lastMove = Date.now();

			var sameDirection = ( this.touch.value > this.touch.previous && this.velocity < 0 )
								|| ( this.touch.value < this.touch.previous && this.velocity > 0 );

			if( this.touch.isAccellerating && sameDirection ) {
				clearInterval( this.touch.accellerateTimeout );

				// Increase velocity significantly
				this.velocity += ( this.touch.previous - this.touch.value ) / 10;
			}
			else {
				this.velocity = 0;

				this.touch.isAccellerating = false;
				this.touch.offset = Math.round( this.touch.start - this.touch.value );
			}

			this.touch.previous = previous;
		}
	};

	TouchList.prototype.onTouchEnd = function( event ) {
		var distanceMoved = this.touch.start - this.touch.value;

		if( !this.touch.isAccellerating ) {
			// Apply velocity based on the start position of the touch
			this.velocity = ( this.touch.start - this.touch.value ) / 10;
		}

		// Don't apply any velocity if the touch ended in a still state
		if( Date.now() - this.touch.lastMove > 200 || Math.abs( this.touch.previous - this.touch.value ) < 5 ) {
			this.velocity = 0;
		}

		this.top.value += this.touch.offset;

		// Reset the variables used to determne swipe speed
		this.touch.offset = 0;
		this.touch.start = 0;
		this.touch.value = 0;
		this.touch.isActive = false;
		this.touch.isAccellerating = false;

		clearInterval( this.touch.accellerateTimeout );

		// If a swipe was captured, prevent event propagation
		if( Math.abs( this.velocity ) > 4 || Math.abs( distanceMoved ) > 10 ) {
			event.preventDefault();
		}
	};

	/** 
	 * Apply past/future classes to list items outside of the viewport
	 */
	TouchList.prototype.update = function( force ) {
		// Determine the desired scroll top position
		var scrollTop = this.top.value + this.velocity + this.touch.offset;

		// Only scroll the list if there's input
		if( this.velocity || this.touch.offset ) {
			// Scroll the DOM and add on the offset from touch
			this.element.scrollTop = scrollTop;

			// Keep the scroll value within bounds
			scrollTop = Math.max( 0, Math.min( this.element.scrollTop, this.top.max ) );

			// Cache the currently set scroll top and touch offset
			this.top.value = scrollTop - this.touch.offset;
		}

		// If there is no active touch, decay velocity
		if( !this.touch.isActive || this.touch.isAccellerating ) {
			this.velocity *= 0.95;
		}

		// Cut off early, the last fraction of velocity doesn't have 
		// much impact on movement
		if( Math.abs( this.velocity ) < 0.15 ) {
			this.velocity = 0;
		}

		// Only proceed if the scroll position has changed
		if( !this.lock && scrollTop !== this.top.natural || force ) {
			this.lock = true;
			this.top.natural = scrollTop;
			this.top.value = scrollTop - this.touch.offset;

			var scrollBottom = scrollTop + this.listHeight;

			// One loop to make our changes to the DOM
			for( var item, items = this.items, i = 0, len = items.length; i < len; i++ ) {
				item = items[i];

				// Above list viewport
				if( item._offsetBottom < scrollTop ) {
					// Exclusion via string matching improves performance
					if( this.velocity <= 0 && item._state !== STATE_PAST ) {
						item.classList.add( STATE_PAST );
						item.classList.remove( STATE_FUTURE );
						item._state = STATE_PAST;
					}
				}
				// Below list viewport
				else if( item._offsetTop > scrollBottom ) {
					// Exclusion via string matching improves performance
					if( this.velocity >= 0 && item._state !== STATE_FUTURE ) {
						item.classList.add( STATE_FUTURE );
						item.classList.remove( STATE_PAST );
						item._state = STATE_FUTURE;
					}
				}
				// Inside of list viewport
				else if( item._state ) {
					if( item._state === STATE_PAST ) item.classList.remove( STATE_PAST );
					if( item._state === STATE_FUTURE ) item.classList.remove( STATE_FUTURE );
					item._state = STATE_NULL;
				}
			}

			this.lock = false;
		}
	};


	/**
	 * Public API
	 */
	window.stroll = isCapable()
		? {
			/**
			 * Binds one or more lists for scroll effects.
			 * 
			 * @see #add()
			 */
			bind: function( target, options ) {
				batch( target, add, options );
			},

			/**
			 * Unbinds one or more lists from scroll effects.
			 * 
			 * @see #remove()
			 */
			unbind: function( target ) {
				batch( target, remove );
			}
		}
		: {
			bind: function() {},
			unbind: function() {}
		};

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

})();