/**
 * @author Hakim El Hattab | http://hakim.se
 */
var Stroll = {
	bind: function( element ) {
		return (function(){

			element.addEventListener( 'scroll', update, false );

			update();

			// Applies past/future classes to list items outside of the 
			// list viewport
			function update() {
				var scrollTop = element.pageYOffset || element.scrollTop,
					scrollBottom = scrollTop + element.offsetHeight;

				var items = element.querySelectorAll( 'li' );

				for( var i = 0, len = items.length; i < len; i++ ) {
					var item = items[i];

					if( item.offsetTop + item.offsetHeight < scrollTop ) {
						item.classList.add( 'past' );
					}
					else if( item.offsetTop > scrollBottom ) {
						item.classList.add( 'future' );
					}
					else {
						item.classList.remove( 'past' );
						item.classList.remove( 'future' );
					}
				}
			}

		})();
	}
};

