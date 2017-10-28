# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, decelerated dragging, following target, snapping to point, clamping, bouncing on edges. See live example to try out these features.

## Rationale
I wanted to improve my work on yy-viewport with a complete rewrite of a viewport/2D camera for use with pixi.js. I added options that I need in my games, including edges that bounce, deceleration, and highly configurable options to tweak the feel of the viewport. 

## Simple Example
```js
    const Viewport = require('pixi-viewport')

    const container = new PIXI.Container()
    const viewport = new Viewport(container, 
    {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 1000,
        worldHeight: 1000
    })

    // activate plugins with the following plugins
    viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()
        .bounce()

    // starts an automatic update loop for animations related to the viewport
    viewport
        .start()
```

## Live Example
https://davidfig.github.io/pixi-viewport/

## Installation

    npm i pixi-viewport

## API Reference
```js
    /**
     * @param {PIXI.Container} container to apply viewport
     * @param {number} [options]
     * @param {HTMLElement} [options.div=document.body] use this div to create the mouse/touch listeners
     * @param {number} [options.screenWidth] these values are needed for clamp, bounce, and pinch plugins
     * @param {number} [options.screenHeight]
     * @param {number} [options.worldWidth]
     * @param {number} [options.worldHeight]
     * @param {number} [options.threshold=5] threshold for click
     * @param {number} [options.maxFrameTime=1000 / 60] maximum frame time for animations
     * @param {boolean} [options.pauseOnBlur] pause when app loses focus
     * @param {boolean} [options.noListeners] manually call touch/mouse callback down/move/up
     * @param {number} [options.preventDefault] call preventDefault after listeners
     *
     * @event click({screen: {x, y}, world: {x, y}, viewport}) emitted when viewport is clicked
     * @event drag-start({screen: {x, y}, world: {x, y}, viewport}) emitted when a drag starts
     * @event drag-end({screen: {x, y}, world: {x, y}, viewport}) emitted when a drag ends
     * @event pinch-start(viewport) emitted when a pinch starts
     * @event pinch-end(viewport) emitted when a pinch ends
     * @event snap-start(viewport) emitted each time a snap animation starts
     * @event snap-end(viewport) emitted each time snap reaches its target
     * @event bounce-start-x(viewport) emitted when a bounce on the x-axis starts
     * @event bounce.end-x(viewport) emitted when a bounce on the x-axis ends
     * @event bounce-start-y(viewport) emitted when a bounce on the y-axis starts
     * @event bounce-end-y(viewport) emitted when a bounce on the y-axis ends
     * @event wheel({wheel: {dx, dy, dz}, viewport})
     */
    constructor(container, options)

    /**
     * start requestAnimationFrame() loop to handle animations; alternatively, call update() manually on each frame
     * @inherited from yy-loop
     */
    // start()

    /**
     * update loop -- may be called manually or use start/stop() for Viewport to handle updates
     * @inherited from yy-loop
     */
    // update()

    /**
     * stop loop
     * @inherited from yy-loop
     */
    // stop()

    /**
     * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {number} [worldWidth]
     * @param {number} [worldHeight]
     */
    resize(screenWidth, screenHeight, worldWidth, worldHeight)

    /**
     * @type {number}
     */
    get screenWidth()

    /**
     * @type {number}
     */
    get screenHeight()

    /**
     * @type {number}
     */
    get worldWidth()

    /**
     * @type {number}
     */
    get worldHeight()

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
     * @type {number} screen height in world coordinates
     */
    get worldScreenHeight()

    /**
     * @type {number} world width in screen coordinates
     */
    get screenWorldWidth()

    /**
     * @type {number} world height in screen coordinates
     */
    get screenWorldHeight()

    /**
     * get center of screen in world coordinates
     * @type {{x: number, y: number}}
     */
    get center()

    /**
     * move center of viewport to point
     * @param {number|PIXI.Point} x|point
     * @param {number} [y]
     * @return {Viewport} this
     */
    moveCenter(/*x, y | PIXI.Point*/)

    /**
     * top-left corner
     * @type {{x: number, y: number}
     */
    get corner()

    /**
     * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
     * @param {number|PIXI.Point} x|point
     * @param {number} y
     * @return {Viewport} this
     */
    moveCorner(/*x, y | point*/)

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=this._worldWidth] in world coordinates
     * @param {boolean} [center] maintain the same center
     * @return {Viewport} this
     */
    fitWidth(width, center)

    /**
     * change zoom so the height fits in the viewport
     * @param {number} [height=this._worldHeight] in world coordinates
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    fitHeight(height, center)

    /**
     * change zoom so it fits the entire world in the viewport
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    fit(center)

    /**
     * world coordinates of the right edge of the screen
     * @type {number}
     */
    get right()

    /**
     * world coordinates of the left edge of the screen
     * @type {number}
     */
    get left()

    /**
     * world coordinates of the top edge of the screen
     * @type {number}
     */
    get top()

    /**
     * world coordinates of the bottom edge of the screen
     * @type {number}
     */
    get bottom()

    /**
     * removes installed plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    removePlugin(type)

    /**
     * pause plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    pausePlugin(type)

    /**
     * resume plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    resumePlugin(type)

    /**
     * enable one-finger touch to drag
     * @return {Viewport} this
     */
    drag()

    /**
     * enable clamp to boundaries of world
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} options
     * @param {string} [options.direction=all] (all, x, or y)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
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
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease='easeInOutSine'] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen     *
     * @return {Viewport} this
     */
    bounce(options)

    /**
     * enable pinch to zoom and two-finger touch to drag
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {number} [options.percent=1.0] percent to modify pinch speed
     * @param {boolean} [options.noDrag] disable two-finger dragging
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp maximum width
     * @param {number} [options.maxHeight] clamp maximum height
     * @return {Viewport} this
     */
    pinch(options)

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {boolean} [options.center] snap to the center of the camera instead of the top-left corner of viewport
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.time=1000]
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @return {Viewport} this
     */
    snap(x, y, options)

    /**
     * follow a target
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     * @return {Viewport} this
     */
    follow(target, options)

    /**
     * zoom using mouse wheel
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {boolean} [options.reverse] reverse the direction of the scroll
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp maximum width
     * @param {number} [options.maxHeight] clamp maximum height
     * @return {Viewport} this
     */
    wheel(options)

    /**
     * enable clamping of zoom to constraints
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} [options]
     * @param {number} [options.minWidth] minimum width
     * @param {number} [options.minHeight] minimum height
     * @param {number} [options.maxWidth] maximum width
     * @param {number} [options.maxHeight] maximum height
     * @return {Viewport} this
     */
    clampZoom(options)
```
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
