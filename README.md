# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, mouse wheel zooming, decelerated dragging, follow target, animate, snap to point, snap to zoom, clamping, bouncing on edges, and move on mouse edges. See the live examples below to try out all of these features.

All features are configurable and removable, so set up the viewport to be exactly what you need.

## Support pixi-viewport!
With your support, I can make pixi-viewport even better! Please consider making a donation:
<a href="https://opencollective.com/pixi-viewport/donate" target="_blank">
  <img src="https://opencollective.com/pixi-viewport/donate/button@2x.png?color=blue" width=300 style="margin-top: 0.5rem; display: block"/>
</a>

## v5+
Moves pixi-viewport to pixi.js v7 (thanks [@cuire](https://github.com/cuire)!).

NOTE: there is a breaking change since pixi-viewport moved to pixi's new event system. `options.interaction` is removed and you need pass `options.events` to the viewport for it to work properly. The events object can be found at pixi's `renderer.events` or `app.renderer.events`.

```js
const viewport = new Viewport({ events: renderer.events });

// or
// const viewport = new Viewport({ events: app.renderer.events });
```

## v4.30.0+
This project was migrated to Typescript (thanks [@ShukantPal](https://github.com/ShukantPal)!). All functionality should be the same. The live Example has been updated.

## Live Examples
* New: [https://davidfig.github.io/pixi-viewport/](https://davidfig.github.io/pixi-viewport/) (using [flems.io](https://flems.io))
* Original:  [https://davidfig.github.io/pixi-viewport/original/](https://davidfig.github.io/pixi-viewport/original)

## API Documentation
[https://davidfig.github.io/pixi-viewport/jsdoc/](https://davidfig.github.io/pixi-viewport/jsdoc/)

## Simple Example
```js
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

// or with require
// const PIXI = require('pixi.js')
// const Viewport = require('pixi-viewport').Viewport

const app = new PIXI.Application()
document.body.appendChild(app.view)

// create viewport
const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,

    events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
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

## Installation

    yarn add pixi-viewport
or

    npm i pixi-viewport

or [grab the latest release](https://github.com/davidfig/pixi-viewport/releases/) and use it:

```html
<script src="/directory-to-file/pixi.js"></script>
<script src="/directory-to-file/viewport.min.js"></script>
<!-- or <script type="module" src="/directory-to-file/esm/viewport.es.js"></script> -->
<script>
    const Viewport = new pixi_viewport.Viewport(options)
</script>
```

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

## Tests

1. Clone repository
2. yarn install
3. yarn test (for Mocha test code)
4. yarn coverage (for Instanbul coverage)

## Development Recipe

1. clone repository
2. yarn install
3. yarn dev
4. open browser to http://localhost:5173

PRs are more than welcome!

## Other Libraries
If you liked pixi-viewport, please try my other open source libraries:
* [pixi-scrollbox](https://github.com/davidfig/pixi-scrollbox) - pixi.js scrollbox: a masked box that can scroll vertically or horizontally with scrollbars (uses pixi-viewport)
* [pixi-ease](https://github.com/davidfig/pixi-ease) - pixi.js animation library using easing functions
* [intersects](https://github.com/davidfig/intersects) - a simple collection of 2d collision/intersects functions. Supports points, circles, lines, axis-aligned boxes, and polygons

## license
MIT License
(c) 2023 [YOPEY YOPEY LLC](https://yopeyopey.com/) by David Figatner (david@yopeyopey.com)
