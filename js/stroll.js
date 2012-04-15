/**
 * @author Hakim El Hattab | http://hakim.se
 * @author Paul Irish | http://paulirish.com/
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


var Stroll = {
    bind: function(element) {

        var items = Array.prototype.slice.apply(element.children);

        // caching some heights so we don't need to go back to the DOM so much
        var listHeight = element.offsetHeight;

        // one loop to get the offsets from the DOM
        for( var i = 0; i < items.length; i++ ) {
            items[i]._offsetTop = items[i].offsetTop
            items[i]._offsetHeight = items[i].offsetHeight
        }

        return (function() {

            (function animloop(){
              requestAnimFrame( animloop );
              update();
            })();

            // apply past/future classes to list items outside of the viewport
            function update() {
                var scrollTop = element.pageYOffset || element.scrollTop,
                  scrollBottom = scrollTop + listHeight;

                // quit if nothing changed.
                if(scrollTop == element.lastTop ) return;
                element.lastTop = scrollTop;

                // one loop to make our changes to the DOM
                for( var i = 0, len = items.length; i < len; i++ ) {
                    var item = items[i];

                    if( item._offsetTop + item._offsetHeight < scrollTop ) {
                        item.classList.add('past');
                    }
                    else if( item._offsetTop > scrollBottom ) {
                        item.classList.add('future');
                    }
                    else {
                        item.classList.remove('past');
                        item.classList.remove('future');
                    }
                }
            }

        })();
    }
};
