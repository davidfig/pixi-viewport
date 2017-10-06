# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, decelerated dragging, following target, snapping to point, clamping, bouncing on edges. See live example to try out these features.

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
     * @param {PIXI.Container} [container] to apply viewport
     * @param {number} [options]
     * @param {number} [options.screenWidth] these values are needed for clamp, bounce, and pinch plugins
     * @param {number} [options.screenHeight]
     * @param {number} [options.worldWidth]
     * @param {number} [options.worldHeight]
     * @param {number} [options.threshold=5] threshold for click
     * @param {number} [options.maxFrameTime=1000 / 60] maximum frame time for animations
     */
    constructor(container, options)

    /**
     * start requestAnimationFrame() loop to handle animations; alternatively, call update() manually on each frame
     */
    start()

    /**
     * update loop -- may be called manually or use start/stop() for Viewport to handle updates
     * @param {number} elapsed time in ms
     */
    update(elapsed)

    /**
     * stop loop
     */
    stop()

    /**
     * use this to set screen and world sizes--needed for most plugins
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {number} worldWidth
     * @param {number} worldHeight
     */
    resize(screenWidth, screenHeight, worldWidth, worldHeight)

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
     * @type {number} screen width in world coordinates
     */
    get worldScreenWidth()

    /**
     * @type {number} screen width in world coordinates
     */
    get worldScreenHeight()

    /**
     * get center of screen in world coordinates
     * @type {{x: number, y: number}}
     */
    get center()

    /**
     * move center of viewport to point
     * @param {number|PIXI.Point} x|point
     * @param {number} [y]
     */
    moveCenter(/*x, y | PIXI.Point*/)

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=container.width] in world coordinates; uses container.width if not provided
    * @param {boolean} [center] maintain the same center
     */
    fitWidth(width, center)

    /**
     * change zoom so the height fits in the viewport
     * @param {number} [width=container.height] in world coordinates; uses container.width if not provided
    * @param {boolean} [center] maintain the same center of the screen after zoom
     */
    fitHeight(height, center)

    /**
     * change zoom so it fits the entire world in the viewport
     * @param {boolean} [center] maintain the same center of the screen after zoom
     */
    fit(center)

    /**
     * is container out of world bounds
     * @return { left:boolean, right: boolean, top: boolean, bottom: boolean, cornerPoint: PIXI.Point }
     */
    OOB()

    /**
     * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
     * @param {number|PIXI.Point} x|point
     * @param {number} y
     */
    corner(/*x, y | point*/)

    /**
     * removes installed plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    removePlugin(type)

    /**
     * checks whether plugin is installed
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    plugin(type)

    /**
     * enable one-finger touch to drag
     * @return {Viewport} this
     */
    drag()

    /**
     * enable clamp to boundaries of world
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {string} [direction=all] (all, x, or y)
     * @return {Viewport} this
     */
    clamp(direction)

    /**
     * decelerate after a move
     * @param {object} [options]
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
     * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
     * @return {Viewport} this
     */
    decelerate(options)

    /**
     * bounce on borders
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} [options]
     * @param {number} [time] time to finish bounce
     * @param {string|function} [ease] ease function or name (see http://easings.net/ for supported names)
     * @return {Viewport} this
     */
    bounce(options)

    /**
     * enable pinch to zoom and two-finger touch to drag
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} [options]
     * @param {boolean} [options.clampScreen] clamp minimum zoom to size of screen
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp minimum width
     * @param {number} [options.maxHeight] clamp minimum height
     * @return {Viewport} this
     */
    pinch(options)

    /**
     * add a hitArea to the container -- useful when your container contains empty spaces that you'd like to drag or pinch
     * @param {PIXI.Rectangle} [rect] if no rect is provided, it will use the value of container.getBounds()
     */
    hitArea(rect)

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {number} [options.speed=1] speed (in world pixels/ms) to snap to location
     */
    snap(x, y, options)

    /**
     * follow a target
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     */
    follow(target, options)
```
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
