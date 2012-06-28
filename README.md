# stroll.js – because it scrolls, and trolls.

A collection of CSS list scroll effects. Works in browsers with support for CSS 3D transforms including a special touch-enabled mode for iOS & Android 4.x.

Curious about how this looks in action? [Check out the demo page](http://lab.hakim.se/scroll-effects/).

## Usage

The style of scroll effect is determined via the class that is set on the list. Once the class is set, stroll.js needs to be told to monitor that list via the bind method:


```javascript
// Bind via selectors
stroll.bind( '#main ul' );

// Bind via element reference
stroll.bind( document.getElementById( 'some-list' ) );

// Bind via array of elements / jQuery object
stroll.bind( $( '#main .some-list' ) );
```


You can provide an additional parameter with more options:


```javascript
// Makes stroll.js monitor changes to the DOM (like adding or resizing items). 
// This is taxing on performance, so use scarcely. Defaults to false.
stroll.bind( '#main ul', { live: true } );
```


To disable the effect on an already-bound list, you can use `stroll.unbind()`:


```javascript
// Same target options as stroll.bind
stroll.unbind( selector/element/array );
```

## History

#### 1.2 (master/beta)
- Mobile support (iOS/Android 4+)
- New effects

#### 1.1
- Optimizations
- New API
- New effects

#### 1.0
- Initial release

## Contributors

- [Paul Irish](https://github.com/paulirish) - Perf improvements
- [Felix Gnass](http://github.com/fgnass) - Perf improvements
- [Kilian Ciuffolo](http://github.com/kilianc) - Fly & Fly Reverse effects
- [Dave Arel](http://github.com/davearel) - Fade effect
- [Erick Daniszewski](http://github.com/edaniszewski) - Twirl Effect

## License

MIT licensed

Copyright (C) 2011 Hakim El Hattab, http://hakim.se