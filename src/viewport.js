const exists = require('exists')

const Drag = require('./drag')
const Pinch = require('./pinch')
const Clamp = require('./clamp')
const ClampZoom = require('./clamp-zoom')
const Decelerate = require('./decelerate')
const Bounce = require('./bounce')
const Snap = require('./snap')
const SnapZoom = require('./snap-zoom')
const Follow = require('./follow')
const Wheel = require('./wheel')
const MouseEdges = require('./mouse-edges')

const PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp']

class Viewport extends PIXI.Container
{
    /**
     * @extends PIXI.Container
     * @extends EventEmitter
     * @param {object} [options]
     * @param {number} [options.screenWidth=window.innerWidth]
     * @param {number} [options.screenHeight=window.innerHeight]
     * @param {number} [options.worldWidth=this.width]
     * @param {number} [options.worldHeight=this.height]
     * @param {number} [options.threshold = 5] number of pixels to move to trigger an input event (e.g., drag, pinch)
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for updates
     * @param {PIXI.InteractionManager} [options.interaction=null] InteractionManager, used to calculate pointer postion relative to
     * @param {HTMLElement} [options.divWheel=document.body] div to attach the wheel event
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires drag-remove
     * @fires pinch-start
     * @fires pinch-end
     * @fires pinch-remove
     * @fires snap-start
     * @fires snap-end
     * @fires snap-remove
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires snap-zoom-remove
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires bounce-remove
     * @fires wheel
     * @fires wheel-remove
     * @fires wheel-scroll
     * @fires wheel-scroll-remove
     * @fires mouse-edge-start
     * @fires mouse-edge-end
     * @fires mouse-edge-remove
     * @fires moved
     */
    constructor(options)
    {
        options = options || {}
        super()
        this.plugins = []
        this._screenWidth = options.screenWidth
        this._screenHeight = options.screenHeight
        this._worldWidth = options.worldWidth
        this._worldHeight = options.worldHeight
        this.hitAreaFullScreen = exists(options.hitAreaFullScreen) ? options.hitAreaFullScreen : true
        this.forceHitArea = options.forceHitArea
        this.threshold = exists(options.threshold) ? options.threshold : 5
        this.interaction = options.interaction || null
        this.listeners(options.divWheel || document.body)

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        this.touches = []

        this.ticker = options.ticker || PIXI.ticker.shared
        this.ticker.add(() => this.update())
    }

    /**
     * update animations
     * @private
     */
    update()
    {
        if (!this._pause)
        {
            for (let plugin of PLUGIN_ORDER)
            {
                if (this.plugins[plugin])
                {
                    this.plugins[plugin].update(this.ticker.elapsedMS)
                }
            }
            if (!this.forceHitArea)
            {
                this.hitArea.x = this.left
                this.hitArea.y = this.top
                this.hitArea.width = this.worldScreenWidth
                this.hitArea.height = this.worldScreenHeight
            }
        }
    }

    /**
     * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {number} [worldWidth]
     * @param {number} [worldHeight]
     */
    resize(screenWidth, screenHeight, worldWidth, worldHeight)
    {
        this._screenWidth = screenWidth || window.innerWidth
        this._screenHeight = screenHeight || window.innerHeight
        this._worldWidth = worldWidth
        this._worldHeight = worldHeight
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
     * screen width in screen pixels
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
     * screen height in screen pixels
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
     * world width in pixels
     * @type {number}
     */
    get worldWidth()
    {
        if (this._worldWidth)
        {
            return this._worldWidth
        }
        else
        {
            return this.width
        }
    }
    set worldWidth(value)
    {
        this._worldWidth = value
        this.resizePlugins()
    }

    /**
     * world height in pixels
     * @type {number}
     */
    get worldHeight()
    {
        if (this._worldHeight)
        {
            return this._worldHeight
        }
        else
        {
            return this.height
        }
    }
    set worldHeight(value)
    {
        this._worldHeight = value
        this.resizePlugins()
    }

    /**
     * add input listeners
     * @private
     */
    listeners(div)
    {
        this.interactive = true
        if (!this.forceHitArea)
        {
            this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight)
        }
        this.on('pointerdown', this.down)
        this.on('pointermove', this.move)
        this.on('pointerup', this.up)
        this.on('pointerupoutside', this.up)
        this.on('pointercancel', this.up)
        this.on('pointerout', this.up)
        div.addEventListener('wheel', (e) => this.handleWheel(e))
        this.leftDown = false
    }

    /**
     * handle down events
     * @private
     */
    down(e)
    {
        if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0)
        {
            this.leftDown = true
        }

        if (e.data.pointerType !== 'mouse')
        {
            this.touches.push(e.data.pointerId)
        }

        if (this.countDownPointers() === 1)
        {
            this.last = { x: e.data.global.x, y: e.data.global.y }

            // clicked event does not fire if viewport is decelerating or bouncing
            const decelerate = this.plugins['decelerate']
            const bounce = this.plugins['bounce']
            if ((!decelerate || (!decelerate.x && !decelerate.y)) && (!bounce || (!bounce.toX && !bounce.toY)))
            {
                this.clickedAvailable = true
            }
        }
        else
        {
            this.clickedAvailable = false
        }

        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].down(e)
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
    move(e)
    {
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].move(e)
            }
        }

        if (this.clickedAvailable)
        {
            const distX = e.data.global.x - this.last.x
            const distY = e.data.global.y - this.last.y
            if (this.checkThreshold(distX) || this.checkThreshold(distY))
            {
                this.clickedAvailable = false
            }
        }
    }

    /**
     * handle up events
     * @private
     */
    up(e)
    {
        if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0)
        {
            this.leftDown = false
        }

        if (e.data.pointerType !== 'mouse')
        {
            for (let i = 0; i < this.touches.length; i++)
            {
                if (this.touches[i] === e.data.pointerId)
                {
                    this.touches.splice(i, 1)
                    break
                }
            }
        }

        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].up(e)
            }
        }

        if (this.clickedAvailable && this.countDownPointers() === 0)
        {
            this.emit('clicked', { screen: this.last, world: this.toWorld(this.last), viewport: this })
            this.clickedAvailable = false
        }
    }

    /**
     * handle wheel events
     * @private
     */
    handleWheel(e)
    {
        // only handle wheel events where the mouse is over the viewport
        const point = this.toLocal({ x: e.clientX, y: e.clientY })
        if (this.left <= point.x && point.x <= this.right && this.top <= point.y && point.y <= this.bottom)
        {
            let result
            for (let type of PLUGIN_ORDER)
            {
                if (this.plugins[type])
                {
                    if (this.plugins[type].wheel(e))
                    {
                        result = true
                    }
                }
            }
            return result
        }
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
            return this.toLocal({ x, y })
        }
        else
        {
            return this.toLocal(arguments[0])
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
            return this.toGlobal({ x, y })
        }
        else
        {
            const point = arguments[0]
            return this.toGlobal(point)
        }
    }

    /**
     * screen width in world coordinates
     * @type {number}
     * @readonly
     */
    get worldScreenWidth()
    {
        return this._screenWidth / this.scale.x
    }

    /**
     * screen height in world coordinates
     * @type {number}
     * @readonly
     */
    get worldScreenHeight()
    {
        return this._screenHeight / this.scale.y
    }

    /**
     * world width in screen coordinates
     * @type {number}
     * @readonly
     */
    get screenWorldWidth()
    {
        return this._worldWidth * this.scale.x
    }

    /**
     * world height in screen coordinates
     * @type {number}
     * @readonly
     */
    get screenWorldHeight()
    {
        return this._worldHeight * this.scale.y
    }

    /**
     * get center of screen in world coordinates
     * @type {PIXI.PointLike}
     */
    get center()
    {
        return { x: this.worldScreenWidth / 2 - this.x / this.scale.x, y: this.worldScreenHeight / 2 - this.y / this.scale.y }
    }
    set center(value)
    {
        this.moveCenter(value)
    }

    /**
     * move center of viewport to point
     * @param {(number|PIXI.PointLike)} x or point
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
        this.position.set((this.worldScreenWidth / 2 - x) * this.scale.x, (this.worldScreenHeight / 2 - y) * this.scale.y)
        this._reset()
        return this
    }

    /**
     * top-left corner
     * @type {PIXI.PointLike}
     */
    get corner()
    {
        return { x: -this.x / this.scale.x, y: -this.y / this.scale.y }
    }
    set corner(value)
    {
        this.moveCorner(value)
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
            this.position.set(-arguments[0].x * this.scale.x, -arguments[0].y * this.scale.y)
        }
        else
        {
            this.position.set(-arguments[0] * this.scale.x, -arguments[1] * this.scale.y)
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
        this.scale.x = this._screenWidth / width
        this.scale.y = this.scale.x
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
        this.scale.y = this._screenHeight / height
        this.scale.x = this.scale.y
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
    fitWorld(center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.scale.x = this._screenWidth / this._worldWidth
        this.scale.y = this._screenHeight / this._worldHeight
        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x
        }
        else
        {
            this.scale.x = this.scale.y
        }
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
        this.scale.x = this._screenWidth / this._worldWidth
        this.scale.y = this._screenHeight / this._worldHeight
        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x
        }
        else
        {
            this.scale.x = this.scale.y
        }
        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * zoom viewport by a certain percent (in both x and y direction)
     * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} the viewport
     */
    zoomPercent(percent, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        const scale = this.scale.x + this.scale.x * percent
        this.scale.set(scale)
        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * zoom viewport by increasing/decreasing width by a certain number of pixels
     * @param {number} change in pixels
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} the viewport
     */
    zoom(change, center)
    {
        this.fitWidth(change + this.worldScreenWidth, center)
        return this
    }

    /**
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
     */
    snapZoom(options)
    {
        this.plugins['snap-zoom'] = new SnapZoom(this, options)
        return this
    }

    /**
     * @private
     * @typedef OutOfBounds
     * @type {object}
     * @property {boolean} left
     * @property {boolean} right
     * @property {boolean} top
     * @property {boolean} bottom
     */

    /**
     * is container out of world bounds
     * @return {OutOfBounds}
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
            x: this._worldWidth * this.scale.x - this._screenWidth,
            y: this._worldHeight * this.scale.y - this._screenHeight
        }
        return result
    }

    /**
     * world coordinates of the right edge of the screen
     * @type {number}
     */
    get right()
    {
        return -this.x / this.scale.x + this.worldScreenWidth
    }
    set right(value)
    {
        this.x = -value * this.scale.x + this.screenWidth
        this._reset()
    }

    /**
     * world coordinates of the left edge of the screen
     * @type {number}
     */
    get left()
    {
        return -this.x / this.scale.x
    }
    set left(value)
    {
        this.x = -value * this.scale.x
        this._reset()
    }

    /**
     * world coordinates of the top edge of the screen
     * @type {number}
     */
    get top()
    {
        return -this.y / this.scale.y
    }
    set top(value)
    {
        this.y = -value * this.scale.y
        this._reset()
    }

    /**
     * world coordinates of the bottom edge of the screen
     * @type {number}
     */
    get bottom()
    {
        return -this.y / this.scale.y + this.worldScreenHeight
    }
    set bottom(value)
    {
        this.y = -value * this.scale.y + this.screenHeight
        this._reset()
    }
    /**
     * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
     * @type {boolean}
     */
    get dirty()
    {
        return this._dirty
    }
    set dirty(value)
    {
        this._dirty = value
    }

    /**
     * permanently changes the Viewport's hitArea
     * <p>NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)</p>
     * @type {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)}
     */
    get forceHitArea()
    {
        return this._forceHitArea
    }
    set forceHitArea(value)
    {
        if (value)
        {
            this._forceHitArea = value
            this.hitArea = value
        }
        else
        {
            this._forceHitArea = false
            this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight)
        }
    }

    /**
     * count of mouse/touch pointers that are down on the viewport
     * @private
     * @return {number}
     */
    countDownPointers()
    {
        return (this.leftDown ? 1 : 0) + this.touches.length
    }

    /**
     * array of touch pointers that are down on the viewport
     * @private
     * @return {PIXI.InteractionTrackingData[]}
     */
    getTouchPointers()
    {
        const results = []
        const pointers = this.trackedPointers
        for (let key in pointers)
        {
            const pointer = pointers[key]
            if (this.touches.indexOf(pointer.pointerId) !== -1)
            {
                results.push(pointer)
            }
        }
        return results
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
        this.dirty = true
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
            this.plugins[type] = null
            this.emit(type + '-remove')
        }
    }

    /**
     * pause plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    pausePlugin(type)
    {
        if (this.plugins[type])
        {
            this.plugins[type].pause()
        }
    }

    /**
     * resume plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    resumePlugin(type)
    {
        if (this.plugins[type])
        {
            this.plugins[type].resume()
        }
    }

    /**
     * enable one-finger touch to drag
     * @param {object} [options]
     * @param {string} [options.direction=all] direction to drag (all, x, or y)
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=10] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    drag(options)
    {
        this.plugins['drag'] = new Drag(this, options)
        return this
    }

    /**
     * clamp to world boundaries or other provided boundaries
     * NOTES:
     *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
     *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {object} [options]
     * @param {(number|boolean)} [options.left] clamp left; true=0
     * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
     * @param {(number|boolean)} [options.top] clamp top; true=0
     * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
     * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @return {Viewport} this
     */
    clamp(options)
    {
        this.plugins['clamp'] = new Clamp(this, options)
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
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
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
     * @return {Viewport} this
     */
    pinch(options)
    {
        this.plugins['pinch'] = new Pinch(this, options)
        return this
    }

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {boolean} [options.topLeft] snap to the top-left of viewport instead of center
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
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
     * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
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

    /**
     * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
     * @param {object} [options]
     * @param {number} [options.radius] distance from center of screen in screen pixels
     * @param {number} [options.distance] distance from all sides in screen pixels
     * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
     * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
     * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
     * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
     * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
     * @param {boolean} [options.reverse] reverse direction of scroll
     * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
     * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
     */
    mouseEdges(options)
    {
        this.plugins['mouse-edges'] = new MouseEdges(this, options)
        return this
    }

    /**
     * pause viewport (including animation updates such as decelerate)
     * @type {boolean}
     */
    get pause() { return this._pause }
    set pause(value)
    {
        this._pause = value
        this.interactive = !value
    }
}

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#moved
 * @type {Viewport}
 */

PIXI.extras.Viewport = Viewport

module.exports = Viewport