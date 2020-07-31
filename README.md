# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, mouse wheel zooming, decelerated dragging, follow target, aniamte, snap to point, snap to zoom, clamping, bouncing on edges, and move on mouse edges. See live example to try out all of these features.

All features are configurable and removable, so set up the viewport to be exactly what you need.

## Migration from pixi-viewport v3 to v4
Viewport needs to be imported or required as follows:
```js
import { Viewport } from 'pixi-viewport'

// or

const Viewport = require('pixi-viewport').Viewport
```
Plugins have been moved to their own object:
```js
// viewport.pausePlugin('drag')
viewport.plugins.pause('drag')

// viewport.resumePlugin('drag')
viewport.plugins.resume('drag')

// viewport.removePlugin('drag')
viewport.plugins.remove('drag')

// viewport.userPlugin('name', plugin, index)
viewport.plugins.add('name', plugin, index)
```

## Simple Example
```js
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

const app = new PIXI.Application()
document.body.appendChild(app.view)

// create viewport
const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,

    interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

// add the viewport to the stage
app.stage.addChild(viewport)

// activate plugins
viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()

// add a red box
const sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
sprite.tint = 0xff0000
sprite.width = sprite.height = 100
sprite.position.set(100, 100)
```

Using commonjs:
```js
const PIXI = require('pixi.js')
const Viewport = require('pixi-viewport').Viewport

// same code as above...
```

## Live Example
[https://davidfig.github.io/pixi-viewport/](https://davidfig.github.io/pixi-viewport/)

## API Documentation
[https://davidfig.github.io/pixi-viewport/jsdoc/](https://davidfig.github.io/pixi-viewport/jsdoc/)

## Installation

    yarn add pixi-viewport
or

    npm i pixi-viewport

or [grab the latest release](https://github.com/davidfig/pixi-viewport/releases/) and use it:

```html
<script src="/directory-to-file/pixi.js"></script>
<script src="/directory-to-file/pixi-viewport.js"></script>
<!-- or <script type="module" src="/directory-to-file/pixi-viewport.es.js"></script> -->
<script>
    const Viewport = new Viewport.Viewport(options)
</script>
```

## Build Examples
I've included a bunch of build examples in the docs/builds directory, including: [browserify](https://github.com/davidfig/pixi-viewport/tree/master/docs/builds/browserify), [rollup](https://github.com/davidfig/pixi-viewport/tree/master/docs/builds/rollup), [standalone (e.g., cdn)](https://github.com/davidfig/pixi-viewport/tree/master/docs/builds/standalone), [standalone (pixi.js v4)](https://github.com/davidfig/pixi-viewport/tree/master/docs/builds/standalone-v4), and [typescript](https://github.com/davidfig/pixi-viewport/tree/master/docs/builds/ts). You can see the live demos at [https://davidfig.github.io/pixi-viewport/builds/](https://davidfig.github.io/pixi-viewport/builds/).

## Tests

1. Clone repository
2. yarn install
3. yarn test (for Mocha test code)
4. yarn coverage (for Instanbul coverage)

## Development Recipe

1. clone repository
2. yarn install
3. yarn dev
4. open browser to http://localhost:10001

PRs are more than welcome!

## Other Libraries
If you liked pixi-viewport, please try my other open source libraries:
* [pixi-scrollbox](https://github.com/davidfig/pixi-scrollbox) - pixi.js scrollbox: a masked box that can scroll vertically or horizontally with scrollbars (uses pixi-viewport)
* [pixi-ease](https://github.com/davidfig/pixi-ease) - pixi.js animation library using easing functions
* [intersects](https://github.com/davidfig/intersects) - a simple collection of 2d collision/intersects functions. Supports points, circles, lines, axis-aligned boxes, and polygons

## license
MIT License
(c) 2020 [YOPEY YOPEY LLC](https://yopeyopey.com/) by David Figatner (david@yopeyopey.com)