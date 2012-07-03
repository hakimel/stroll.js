/*!
 * stroll.js 1.2 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Copyright (C) 2012 Hakim El Hattab, http://hakim.se
 */
(function( window, undefined ) {
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

	var	requestAnimationFrame = (function() {
			return	window.requestAnimationFrame
				||	window.webkitRequestAnimationFrame
				||	window.mozRequestAnimationFrame
				||	window.oRequestAnimationFrame
				||	window.msRequestAnimationFrame
				||	function( callback ) {
						window.setTimeout( callback, 1000 / 60 );
					};
		})();

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
		this.scrollDelegate = undefined;
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
		this.touch = {
			max: 0,
			value: 0,
			offset: 0,
			start: 0,
			previous: 0,
			lastMove: Date.now(),
			accellerateTimeout: null,
			isAccellerating: false,
			scrollTop: 0,
			velocity: 0
		};
		this.touch.swipe = this.onSwipe.bind( this, this.touch );

		List.apply( this, arguments );

		this.element.style.overflow = 'hidden';
	}

	TouchList.prototype = new List();

	TouchList.prototype.constructor = TouchList;

	TouchList.prototype.init = function() {
		this.touchStartDelegate = this.onTouchStart.bind( this, this.touch );
		this.touchMoveDelegate = this.onTouchMove.bind( this, this.touch );
		this.touchEndDelegate = this.onTouchEnd.bind( this, this.touch );
		this.element.addEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.addEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.addEventListener( 'touchend', this.touchEndDelegate, false );

		List.prototype.init.call( this );
	};

	TouchList.prototype.unInit = function() {
		this.element.removeEventListener( 'touchstart', this.touchStartDelegate, false );
		this.element.removeEventListener( 'touchmove', this.touchMoveDelegate, false );
		this.element.removeEventListener( 'touchend', this.touchEndDelegate, false );
		this.touchStartDelegate = undefined;
		this.touchMoveDelegate = undefined;
		this.touchEndDelegate = undefined;
	};

	TouchList.prototype.sync = function() {
		List.prototype.sync.call( this );

		this.touch.max = this.items[ this.items.length-1 ]._offsetBottom - this.listHeight;
	};

	TouchList.prototype.onTouchStart = function( touch, event ) {
		event.preventDefault();

		if( event.touches.length === 1 ) {
			touch.start		=
			touch.previous	=
			touch.value		= event.touches[0].clientY;
			touch.offset	= 0;
			touch.lastMove	= Date.now();
			touch.scrollTop	= this.element.scrollTop;

			if ( touch.velocity ) {
				touch.isAccellerating = true;
				touch.accellerateTimeout = window.setTimeout( function() {
					touch.isAccellerating = false;
					touch.velocity = 0;
				}, 500 );
			} else {
				touch.velocity = 0;
			}
		}
	};

	TouchList.prototype.onTouchMove = function( touch, event ) {
		if( event.touches.length === 1 ) {
			var	previous	= touch.value,
				lastMove	= touch.lastMove,
				value		= event.touches[0].clientY,
				now			= Date.now(),
				isSameDir	=  value > previous && touch.velocity < 0
							|| value < previous && touch.velocity > 0;

			if( touch.isAccellerating && isSameDir ) {
				window.clearTimeout( touch.accellerateTimeout );
				touch.velocity += ( value - previous ) / ( now - lastMove );
			} else {
				touch.isAccellerating = false;
				touch.velocity = 0;
			}

			touch.scrollTop	+= previous - value;
			touch.offset	 = touch.start - value;
			touch.previous	 = previous;
			touch.value		 = value;
			touch.lastMove	 = now;

			// ScrollTo
			this.element.scrollTop = Math.max( 0, Math.min( touch.max, touch.scrollTop ) );
		}
	};

	TouchList.prototype.onTouchEnd = function( touch, event ) {
		var	distance = Math.abs( touch.previous - touch.value ),
			now = Date.now();

		// Don't apply any velocity if the touch ended in a still state
		if( now - touch.lastMove > 200 || distance < 5 ) {
			touch.velocity = 0;
		} else if( !touch.isAccellerating ) {
			// Apply velocity based on the start position of the touch
			touch.velocity = touch.offset / ( now - touch.lastMove );
		}

		window.clearTimeout( touch.accellerateTimeout );

		// Do the scrolling
		if ( touch.velocity !== 0 ) {
			touch.swipe();
		}

		// If a swipe was captured, prevent event propagation
		if( Math.abs( touch.velocity ) > 4 || distance > 10 ) {
			event.preventDefault();
		}
	};

	TouchList.prototype.onSwipe = function( touch ) {
		// Decay velocity (based on fps)
		touch.velocity *= 0.95;

		// Cut off early, the last fraction of velocity doesn't have 
		// much impact on movement
		if( Math.abs( touch.velocity ) < 0.15 ) {
			touch.velocity = 0;
		}

		// Apply velocity to the current position
		touch.scrollTop			+= touch.velocity;
		// and scroll (this will trigger the update method)
		this.element.scrollTop	= Math.max( 0, Math.min( touch.max, touch.scrollTop ) );

		// loop onSwipe method until velocity hits 0
		if ( touch.velocity !== 0 ) {
			requestAnimationFrame( touch.swipe );
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

})( window );
