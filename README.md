# stroll.js – because it scrolls, and trolls.

A collection of CSS list scroll effects. Pull requests welcome!

Curious about how this looks in action? [Check out the demo page](http://lab.hakim.se/scroll-effects/).

# Usage

The style of scroll effect is determined via the class that is set on the list. Once the class is set, stroll.js needs to be told to monitor that list via the bind method:

```
// Bind via selectors
stroll.bind( '#main ul' );

// Bind via element reference
stroll.bind( document.getElementById( 'some-list' ) );

// Bind via array of elements / jQuery object
stroll.bind( $( '#main .some-list' ) );
```

To disable the effect on an already bound list you can use the unbind method:

```
// Same target options as stroll.bind
stroll.unbind( selector/element/array );
```

# Contributors

- [Paul Irish](https://github.com/paulirish) - Perf improvements
- [Felix Gnass](http://github.com/fgnass) - Perf improvements
- [Kilian Ciuffolo](http://github.com/kilianc) - Fly & Fly Reverse effects
- [Dave Arel](http://github.com/davearel) - Fade effect
- [Erick Daniszewski](http://github.com/edaniszewski) - Twirl Effect

# License

MIT licensed

Copyright (C) 2011 Hakim El Hattab, http://hakim.se