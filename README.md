# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js

## Rationale
I wanted to improve my work on yy-viewport with a complete rewrite of a viewport/2D camera for use with pixi.js. I added options that I need in my games, including edges that bounce, deceleration, and highly configurable options to tweak the feel of the viewport. 

## Simple Example

    const Viewport = require('pixi-viewport')

    const container = new PIXI.Container()
    const viewport = new Viewport(container)

## Live Example
https://davidfig.github.io/pixi-viewport/

## Installation

    npm i pixi-viewport

## API Reference
```
    /**
     * @param {PIXI.Container} container
     * @param {object} [options]
     *
     * @param {number} [options.screenWidth]
     * @param {number} [options.screenHeight]
     * @param {PIXI.Rectangle} [options.worldBoundaries] - needed for hitArea replacement and options.noOverDrag or options.bounce

     * @param {boolean} [options.dragToMove]
     *
     * @param {boolean} [options.pinchToZoom] automatically turns on dragToMove
     *
     * @param {boolean} [options.noOverDrag] stops scroll beyond boundaries
     * @param {boolean} [options.noOverDragX] stops scroll beyond X boundaries
     * @param {boolean} [options.noOverDragY] stops scroll beyond Y boundaries
     * @param {boolean} [options.noOverZoom] don't zoom smaller than screen size
     * @param {object} [options.minZoom] {x, y} don't zoom smaller than world zoom x and/or y
     * @param {object} [options.maxZoom] {x, y} don't zoom larger than world zoom x and/or y
     *
     * @param {boolean||object} [options.bounce] bounce back if pulled beyond boundaries
     * @param {number} [options.bounce.time=150] number is milliseconds to bounce back
     * @param {string} [options.bounce.ease=easeInOutSine] easing function to use when bouncing (see https://github.com/bcherny/penner)
     *
     * @param {boolean|object} [options.decelerate] decelerate after scrolling
     * @param {number} [options.decelerate.friction=0.95] percent to decelerate after movement
     * @param {number} [options.decelerate.frictionBounce=0.5] percent to decelerate after movement while inside a bounce
     *
     * @param {number} [options.minVelocity=0.01] minimum velocity before stopping deceleration
     * @param {number} [options.threshold=5] minimum number of pixels to register a move
     *
     * @param {object} [options.snap] snap to location when not touched and not accelerating
     * @param {PIXI.Point} [options.snap.x] x-coordinate to snap to
     * @param {PIXI.Point} [options.snap.y] y-coordinate to snap to
     * @param {number} [options.snap.speed=1] speed (in world pixels/ms) to snap to location
     *
     * @param {boolean|object} [options.lockOn] keep camera centered on an object
     * @param {PIXI.DisplayObject|PIXI.Point} [options.lockOn.object] lock onto this object
     * @param {PIXI.Rectangle} [options.lockOn.frame] stay within this frame (in screen coordinates)
     *
     * @param {boolean} [options.noUpdate] turn off internal calls to requestAnimationFrame() -- update() must be called manually on each loop
     *
     * @emit {click} function click(x, y) in world coordinates - this is called on the up() after a touch/mouse press that doesn't move the threshold pixels
     */
    constructor(container, options)

    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     */
    resize(screenWidth, screenHeight)

    /**
     * change coordinates from screen to world
     * @param {number|PIXI.Point} x
     * @param {number} [y]
     * @returns {PIXI.Point}
     */
    toWorld()

    /**
     * change coordinates from world to screen
     * @param {number|PIXI.Point} x
     * @param {number} [y]
     * @returns {PIXI.Point}
     */
    toScreen()

    /**
     * call this manually if setting options.noUpdate = true
     */
    update()

    /**
     * move top-left corner of viewport to new coordinates
     * @param {number|PIXI.Point} x | point
     * @param {number} [y]
     */
    corner(/*x, y | point*/)
```
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
