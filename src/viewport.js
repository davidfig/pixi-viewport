const Loop = require('yy-loop')
const Input = require('yy-input')

const Drag = require('./drag')
const Pinch = require('./pinch')
const Clamp = require('./clamp')
const ClampZoom = require('./clamp-zoom')
const Decelerate = require('./decelerate')
const HitArea = require('./hit-area')
const Bounce = require('./bounce')
const Snap = require('./snap')
const Follow = require('./follow')
const Wheel = require('./wheel')

const PLUGIN_ORDER = ['hit-area', 'drag', 'pinch', 'wheel', 'follow', 'decelerate', 'bounce', 'snap', 'clamp-zoom', 'clamp']

module.exports = class Viewport extends Loop
{
    /**
     * @param {PIXI.Container} [container] to apply viewport
     * @param {number} [options]
     * @param {HTMLElement} [options.div=document.body] use this div to create the mouse/touch listeners
     * @param {number} [options.screenWidth] these values are needed for clamp, bounce, and pinch plugins
     * @param {number} [options.screenHeight]
     * @param {number} [options.worldWidth]
     * @param {number} [options.worldHeight]
     * @param {number} [options.threshold=5] threshold for click
     * @param {number} [options.maxFrameTime=1000 / 60] maximum frame time for animations
     * @param {number} [options.preventDefault] call preventDefault after listeners
     * @param {boolean} [options.pauseOnBlur] pause when app loses focus
     * @param {boolean} [options.noListeners] manually call touch/mouse callback down/move/up
     */
    constructor(container, options)
    {
        options = options || {}
        super({ pauseOnBlur: options.pauseOnBlur, maxFrameTime: options.maxFrameTime })
        this.container = container
        this.pointers = []
        this.plugins = []
        this._screenWidth = options.screenWidth
        this._screenHeight = options.screenHeight
        this._worldWidth = options.worldWidth
        this._worldHeight = options.worldHeight
        this.threshold = typeof options.threshold === 'undefined' ? 5 : options.threshold
        this.maxFrameTime = options.maxFrameTime || 1000 / 60
        if (!options.noListeners)
        {
            this.listeners(options.div || document.body, options.threshold, options.preventDefault)
        }
        this.interval(this.updateFrame.bind(this))
    }

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
     * update frame for animations
     * @private
     */
    updateFrame(elapsed)
    {
        for (let plugin of PLUGIN_ORDER)
        {
            if (this.plugins[plugin])
            {
                this.plugins[plugin].update(elapsed)
            }
        }
    }

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
    {
        this._screenWidth = screenWidth
        this._screenHeight = screenHeight
        if (worldWidth)
        {
            this._worldWidth = worldWidth
            this._worldHeight = worldHeight
        }
        this.resizePlugins()
    }

    /**
     * called after a worldWidth/Height change
     * @private
     */
    resizePlugins()
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].resize()
            }
        }
    }

    /**
     * @type {number}
     */
    get screenWidth()
    {
        return this._screenWidth
    }
    set screenWidth(value)
    {
        this._screenWidth = value
    }

    /**
     * @type {number}
     */
    get screenHeight()
    {
        return this._screenHeight
    }
    set screenHeight(value)
    {
        this._screenHeight = value
    }

    /**
     * @type {number}
     */
    get worldWidth()
    {
        return this._worldWidth
    }
    set worldWidth(value)
    {
        this._worldWidth = value
        this.resizePlugins()
    }

    /**
     * @type {number}
     */
    get worldHeight()
    {
        return this._worldHeight
    }
    set worldHeight(value)
    {
        this._worldHeight = value
        this.resizePlugins()
    }

    /**
     * add or remove mouse/touch listeners
     * @private
     */
    listeners(div, threshold, preventDefault)
    {
        this.input = new Input(div, { threshold, preventDefault })
        this.input.on('down', this.down, this)
        this.input.on('move', this.move, this)
        this.input.on('up', this.up, this)
        this.input.on('click', this.click, this)
        this.input.on('wheel', this.handleWheel, this)
    }

    /**
     * handle down events
     * @private
     */
    down()
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].down(...arguments)
            }
        }

    }

    /**
     * whether change exceeds threshold
     * @private
     * @param {number} change
     */
    checkThreshold(change)
    {
        if (Math.abs(change) >= this.threshold)
        {
            return true
        }
        return false
    }

    /**
     * handle move events
     * @private
     */
    move()
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].move(...arguments)
            }
        }
    }

    /**
     * handle up events
     * @private
     */
    up()
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].up(...arguments)
            }
        }
    }

    /**
     * handle wheel events
     * @private
     */
    handleWheel()
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].wheel(...arguments)
            }
        }
    }

    /**
     * handle click events
     * @private
     * @param {number} x
     * @param {number} y
     */
    click(x, y)
    {
        const point = { x, y }
        this.emit('click', { screen: point, world: this.toWorld(point) })
    }

    /**
     * change coordinates from screen to world
     * @param {number|PIXI.Point} x
     * @param {number} [y]
     * @returns {PIXI.Point}
     */
    toWorld()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.container.toLocal({ x, y })
        }
        else
        {
            return this.container.toLocal(arguments[0])
        }
    }

    /**
     * change coordinates from world to screen
     * @param {number|PIXI.Point} x
     * @param {number} [y]
     * @returns {PIXI.Point}
     */
    toScreen()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.container.toGlobal({ x, y })
        }
        else
        {
            const point = arguments[0]
            return this.container.toGlobal(point)
        }
    }

    /**
     * @type {number} screen width in world coordinates
     */
    get worldScreenWidth()
    {
        return this._screenWidth / this.container.scale.x
    }

    /**
     * @type {number} screen height in world coordinates
     */
    get worldScreenHeight()
    {
        return this._screenHeight / this.container.scale.y
    }

    /**
     * get center of screen in world coordinates
     * @type {{x: number, y: number}}
     */
    get center()
    {
        return { x: this.worldScreenWidth / 2 - this.container.x / this.container.scale.x, y: this.worldScreenHeight / 2 - this.container.y / this.container.scale.y }
    }

    /**
     * move center of viewport to point
     * @param {number|PIXI.Point} x|point
     * @param {number} [y]
     * @return {Viewport} this
     */
    moveCenter(/*x, y | PIXI.Point*/)
    {
        let x, y
        if (!isNaN(arguments[0]))
        {
            x = arguments[0]
            y = arguments[1]
        }
        else
        {
            x = arguments[0].x
            y = arguments[0].y
        }
        this.container.position.set((this.worldScreenWidth / 2 - x) * this.container.scale.x, (this.worldScreenHeight / 2 - y) * this.container.scale.y)
        return this
    }

    /**
     * top-left corner
     * @type {{x: number, y: number}
     */
    get corner()
    {
        return { x: -this.container.x / this.container.scale.x, y: -this.container.y / this.container.scale.y }
    }

    /**
     * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
     * @param {number|PIXI.Point} x|point
     * @param {number} y
     * @return {Viewport} this
     */
    moveCorner(/*x, y | point*/)
    {
        if (arguments.length === 1)
        {
            this.container.position.set(arguments[0].x, arguments[0].y)
        }
        else
        {
            this.container.position.set(arguments[0], arguments[1])
        }
        this._reset()
        return this
    }

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=this._worldWidth] in world coordinates
     * @param {boolean} [center] maintain the same center
     * @return {Viewport} this
     */
    fitWidth(width, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        width = width || this._worldWidth
        this.container.scale.x = this._screenWidth / width
        this.container.scale.y = this.container.scale.x
        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * change zoom so the height fits in the viewport
     * @param {number} [height=this._worldHeight] in world coordinates
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    fitHeight(height, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        height = height || this._worldHeight
        this.container.scale.y = this._screenHeight / height
        this.container.scale.x = this.container.scale.y
        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * change zoom so it fits the entire world in the viewport
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    fit(center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.container.scale.x = this._screenWidth / this._worldWidth
        this.container.scale.y = this._screenHeight / this._worldHeight
        if (this.container.scale.x < this.container.scale.y)
        {
            this.container.scale.y = this.container.scale.x
        }
        else
        {
            this.container.scale.x = this.container.scale.y
        }
        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * is container out of world bounds
     * @return { left:boolean, right: boolean, top: boolean, bottom: boolean }
     * @private
     */
    OOB()
    {
        const result = {}
        result.left = this.left < 0
        result.right = this.right > this._worldWidth
        result.top = this.top < 0
        result.bottom = this.bottom > this._worldHeight
        result.cornerPoint = {
            x: this._worldWidth * this.container.scale.x - this._screenWidth,
            y: this._worldHeight * this.container.scale.y - this._screenHeight
        }
        return result
    }

    /**
     * world coordinates of the right edge of the screen
     * @type {number}
     */
    get right()
    {
        return -this.container.x / this.container.scale.x + this.worldScreenWidth
    }

    /**
     * world coordinates of the left edge of the screen
     * @type {number}
     */
    get left()
    {
        return -this.container.x / this.container.scale.x
    }

    /**
     * world coordinates of the top edge of the screen
     * @type {number}
     */
    get top()
    {
        return -this.container.y / this.container.scale.y
    }

    /**
     * world coordinates of the bottom edge of the screen
     * @type {number}
     */
    get bottom()
    {
        return -this.container.y / this.container.scale.y + this.worldScreenHeight
    }

    /**
     * clamps and resets bounce and decelerate (as needed) after manually moving viewport
     * @private
     */
    _reset()
    {
        if (this.plugins['bounce'])
        {
            this.plugins['bounce'].reset()
            this.plugins['bounce'].bounce()
        }
        if (this.plugins['decelerate'])
        {
            this.plugins['decelerate'].reset()
        }
        if (this.plugins['snap'])
        {
            this.plugins['snap'].reset()
        }
        if (this.plugins['clamp'])
        {
            this.plugins['clamp'].update()
        }
        if (this.plugins['clamp-zoom'])
        {
            this.plugins['clamp-zoom'].clamp()
        }
    }

    // PLUGINS

    /**
     * removes installed plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    removePlugin(type)
    {
        if (this.plugins[type])
        {
            this.plugins[type].onRemove()
            this.plugins[type] = null
        }
    }

    /**
     * checks whether plugin is installed
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    plugin(type)
    {
        return this.plugins[type]
    }

    /**
     * enable one-finger touch to drag
     * @return {Viewport} this
     */
    drag()
    {
        this.plugins['drag'] = new Drag(this)
        return this
    }

    /**
     * enable clamp to boundaries of world
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {string} [direction=all] (all, x, or y)
     * @return {Viewport} this
     */
    clamp(direction)
    {
        this.plugins['clamp'] = new Clamp(this, direction)
        return this
    }

    /**
     * decelerate after a move
     * @param {object} [options]
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
     * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
     * @return {Viewport} this
     */
    decelerate(options)
    {
        this.plugins['decelerate'] = new Decelerate(this, options)
        return this
    }

    /**
     * bounce on borders
     * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} [options]
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease='easeInOutSine'] ease function or name (see http://easings.net/ for supported names)
     * @return {Viewport} this
     */
    bounce(options)
    {
        this.plugins['bounce'] = new Bounce(this, options)
        return this
    }

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
    {
        this.plugins['pinch'] = new Pinch(this, options)
        return this
    }

    /**
     * add a hitArea to the container -- useful when your container contains empty spaces that you'd like to drag or pinch
     * @param {PIXI.Rectangle} [rect] if no rect is provided, it will use the value of container.getBounds()
     * @return {Viewport} this
     */
    hitArea(rect)
    {
        this.plugins['hit-area'] = new HitArea(this, rect)
        return this
    }

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {boolean} [options.center] move the center of the camera to {x, y} (if false, move the top left corner to {x, y})
     * @param {number} [options.time=1000]
     * @param {string|function} [ease='easeInOutSine'] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.stopOnResize] Stops performing the snap upon resizing
     * @param {boolean} [options.dragInterrupt] Allows users to stop the snapping by dragging (via the 'drag' plugin)
     * @param {boolean} [options.zoomInterrupt] Allows users to stop the snapping by zooming (via the 'wheel' or 'pinch'  plugins)
     * @param {boolean} [options.remove] Removes this plugin after having completed the operation
     * @return {Viewport} this
     */
    snap(x, y, options)
    {
        this.plugins['snap'] = new Snap(this, x, y, options)
        return this
    }

    /**
     * follow a target
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     * @return {Viewport} this
     */
    follow(target, options)
    {
        this.plugins['follow'] = new Follow(this, target, options)
        return this
    }

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
    {
        this.plugins['wheel'] = new Wheel(this, options)
        return this
    }

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
    {
        this.plugins['clamp-zoom'] = new ClampZoom(this, options)
        return this
    }
}
