const PIXI = require('pixi.js')

const utils = require('./utils')
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
     * @param {number} [options.threshold=5] number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
     * @param {boolean} [options.passiveWheel=true] whether the 'wheel' event is set to passive
     * @param {boolean} [options.stopPropagation=false] whether to stopPropagation of events that impact the viewport
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {boolean} [options.noTicker] set this if you want to manually call update() function on each frame
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.Ticker.shared||PIXI.ticker.shared] use this PIXI.ticker for updates
     * @param {PIXI.InteractionManager} [options.interaction=null] InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer postion relative to canvas location on screen
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
     * @fires moved-end
     * @fires zoomed
     * @fires zoomed-end
     */
    constructor(options)
    {
        options = options || {}
        super()
        this.plugins = {}
        this.pluginsList = []
        this._screenWidth = options.screenWidth || window.innerWidth
        this._screenHeight = options.screenHeight || window.innerHeight
        this._worldWidth = options.worldWidth
        this._worldHeight = options.worldHeight
        this.hitAreaFullScreen = utils.defaults(options.hitAreaFullScreen, true)
        this.forceHitArea = options.forceHitArea
        this.passiveWheel = utils.defaults(options.passiveWheel, true)
        this.stopEvent = options.stopPropagation
        this.threshold = utils.defaults(options.threshold, 5)
        this.interaction = options.interaction || null
        this.div = options.divWheel || document.body
        this.listeners(this.div)
        this.div.oncontextmenu = e => e.preventDefault()

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        this.touches = []

        if (!options.noTicker)
        {
            this.ticker = options.ticker || (PIXI.Ticker ? PIXI.Ticker.shared : PIXI.ticker.shared)
            this.tickerFunction = () => this.update(this.ticker.elapsedMS)
            this.ticker.add(this.tickerFunction)
        }
    }

    /**
     * removes all event listeners from viewport
     * (useful for cleanup of wheel and ticker events when removing viewport)
     */
    removeListeners()
    {
        this.ticker.remove(this.tickerFunction)
        this.div.removeEventListener('wheel', this.wheelFunction)
    }

    /**
     * overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners
     */
    destroy(options)
    {
        super.destroy(options)
        this.removeListeners()
    }

    /**
     * update viewport on each frame
     * by default, you do not need to call this unless you set options.noTicker=true
     */
    update(elapsed)
    {
        if (!this.pause)
        {
            for (let plugin of this.pluginsList)
            {
                plugin.update(elapsed)
            }

            if (this.lastViewport)
            {
                // check for moved-end event
                if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y)
                {
                    this.moving = true
                }
                else
                {
                    if (this.moving)
                    {
                        this.emit('moved-end', this)
                        this.moving = false
                    }
                }
                // check for zoomed-end event
                if (this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y)
                {
                    this.zooming = true
                }
                else
                {
                    if (this.zooming)
                    {
                        this.emit('zoomed-end', this)
                        this.zooming = false
                    }
                }

            }

            if (!this.forceHitArea)
            {
                this.hitArea.x = this.left
                this.hitArea.y = this.top
                this.hitArea.width = this.worldScreenWidth
                this.hitArea.height = this.worldScreenHeight
            }
            this._dirty = this._dirty || !this.lastViewport ||
                this.lastViewport.x !== this.x || this.lastViewport.y !== this.y ||
                this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y
            this.lastViewport = {
                x: this.x,
                y: this.y,
                scaleX: this.scale.x,
                scaleY: this.scale.y
            }
        }
    }

    /**
     * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
     * @param {number} [screenWidth=window.innerWidth]
     * @param {number} [screenHeight=window.innerHeight]
     * @param {number} [worldWidth]
     * @param {number} [worldHeight]
     */
    resize(screenWidth, screenHeight, worldWidth, worldHeight)
    {
        this._screenWidth = screenWidth || window.innerWidth
        this._screenHeight = screenHeight || window.innerHeight
        if (worldWidth)
        {
            this._worldWidth = worldWidth
        }
        if (worldHeight)
        {
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
        for (let plugin of this.pluginsList)
        {
            plugin.resize()
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
     * get visible bounds of viewport
     * @return {object} bounds { x, y, width, height }
     */
    getVisibleBounds()
    {
        return { x: this.left, y: this.top, width: this.worldScreenWidth, height: this.worldScreenHeight }
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
        this.wheelFunction = (e) => this.handleWheel(e)
        div.addEventListener('wheel', this.wheelFunction, { passive: this.passiveWheel })
        this.isMouseDown = false
    }

    /**
     * handle down events
     * @private
     */
    down(e)
    {
        if (this.pause || !this.worldVisible)
        {
            return
        }
        if (e.data.pointerType === 'mouse')
        {
            this.isMouseDown = true
        }
        else
        {
            this.touches.push(e.data.pointerId)
        }

        if (this.countDownPointers() === 1)
        {
            this.last = e.data.global.clone()

            // clicked event does not fire if viewport is decelerating or bouncing
            const decelerate = this.plugins['decelerate']
            const bounce = this.plugins['bounce']
            if ((!decelerate || !decelerate.isActive()) && (!bounce || !bounce.isActive()))
            {
                this.clickedAvailable = true
            }
            else
            {
                this.clickedAvailable = false
            }
        }
        else
        {
            this.clickedAvailable = false
        }

        let stop
        for (let plugin of this.pluginsList)
        {
            if (plugin.down(e))
            {
                stop = true
            }
        }
        if (stop && this.stopEvent)
        {
            e.stopPropagation()
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
        if (this.pause || !this.worldVisible)
        {
            return
        }

        let stop
        for (let plugin of this.pluginsList)
        {
            if (plugin.move(e))
            {
                stop = true
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

        if (stop && this.stopEvent)
        {
            e.stopPropagation()
        }

    }

    /**
     * handle up events
     * @private
     */
    up(e)
    {
        if (this.pause || !this.worldVisible)
        {
            return
        }
        if (e.data.pointerType === 'mouse')
        {
            this.isMouseDown = false
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

        let stop
        for (let plugin of this.pluginsList)
        {
            if (plugin.up(e))
            {
                stop = true
            }
        }

        if (this.clickedAvailable && this.countDownPointers() === 0)
        {
            this.emit('clicked', { screen: this.last, world: this.toWorld(this.last), viewport: this })
            this.clickedAvailable = false
        }

        if (stop && this.stopEvent)
        {
            e.stopPropagation()
        }
    }

    /**
     * gets pointer position if this.interaction is set
     * @param {UIEvent} evt
     * @private
     */
    getPointerPosition(evt)
    {
        let point = new PIXI.Point()
        if (this.interaction)
        {
            this.interaction.mapPositionToPoint(point, evt.clientX, evt.clientY)
        }
        else
        {
            point.x = evt.clientX
            point.y = evt.clientY
        }
        return point
    }

    /**
     * handle wheel events
     * @private
     */
    handleWheel(e)
    {
        if (this.pause || !this.worldVisible)
        {
            return
        }

        // only handle wheel events where the mouse is over the viewport
        const point = this.toLocal(this.getPointerPosition(e))
        if (this.left <= point.x && point.x <= this.right && this.top <= point.y && point.y <= this.bottom)
        {
            let result
            for (let plugin of this.pluginsList)
            {
                if (plugin.wheel(e))
                {
                    result = true
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
        return this.screenWidth / this.scale.x
    }

    /**
     * screen height in world coordinates
     * @type {number}
     * @readonly
     */
    get worldScreenHeight()
    {
        return this.screenHeight / this.scale.y
    }

    /**
     * world width in screen coordinates
     * @type {number}
     * @readonly
     */
    get screenWorldWidth()
    {
        return this.worldWidth * this.scale.x
    }

    /**
     * world height in screen coordinates
     * @type {number}
     * @readonly
     */
    get screenWorldHeight()
    {
        return this.worldHeight * this.scale.y
    }

    /**
     * get center of screen in world coordinates
     * @type {PIXI.Point}
     */
    get center()
    {
        return new PIXI.Point(this.worldScreenWidth / 2 - this.x / this.scale.x, this.worldScreenHeight / 2 - this.y / this.scale.y)
    }
    set center(value)
    {
        this.moveCenter(value)
    }

    /**
     * move center of viewport to point
     * @param {(number|PIXI.Point)} x or point
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
     * @type {PIXI.Point}
     */
    get corner()
    {
        return new PIXI.Point(-this.x / this.scale.x, -this.y / this.scale.y)
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
     * @param {boolean} [scaleY=true] whether to set scaleY=scaleX
     * @param {boolean} [noClamp=false] whether to disable clamp-zoom
     * @return {Viewport} this
     */
    fitWidth(width, center, scaleY=true, noClamp)
    {
        let save
        if (center)
        {
            save = this.center
        }
        width = width || this.worldWidth
        this.scale.x = this.screenWidth / width

        if (scaleY)
        {
            this.scale.y = this.scale.x
        }

        const clampZoom = this.plugins['clamp-zoom']
        if (!noClamp && clampZoom)
        {
            clampZoom.clamp()
        }

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
     * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
     * @param {boolean} [noClamp=false] whether to disable clamp-zoom
     * @return {Viewport} this
     */
    fitHeight(height, center, scaleX=true, noClamp)
    {
        let save
        if (center)
        {
            save = this.center
        }
        height = height || this.worldHeight
        this.scale.y = this.screenHeight / height

        if (scaleX)
        {
            this.scale.x = this.scale.y
        }

        const clampZoom = this.plugins['clamp-zoom']
        if (!noClamp && clampZoom)
        {
            clampZoom.clamp()
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
    fitWorld(center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.scale.x = this.screenWidth / this.worldWidth
        this.scale.y = this.screenHeight / this.worldHeight
        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x
        }
        else
        {
            this.scale.x = this.scale.y
        }

        const clampZoom = this.plugins['clamp-zoom']
        if (clampZoom)
        {
            clampZoom.clamp()
        }

        if (center)
        {
            this.moveCenter(save)
        }
        return this
    }

    /**
     * change zoom so it fits the size or the entire world in the viewport
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {number} [width] desired width
     * @param {number} [height] desired height
     * @return {Viewport} this
     */
    fit(center, width, height)
    {
        let save
        if (center)
        {
            save = this.center
        }
        width = width || this.worldWidth
        height = height || this.worldHeight
        this.scale.x = this.screenWidth / width
        this.scale.y = this.screenHeight / height
        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x
        }
        else
        {
            this.scale.x = this.scale.y
        }
        const clampZoom = this.plugins['clamp-zoom']
        if (clampZoom)
        {
            clampZoom.clamp()
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
        const clampZoom = this.plugins['clamp-zoom']
        if (clampZoom)
        {
            clampZoom.clamp()
        }
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
     * @param {boolean} [options.noMove] zoom but do not move
     */
    snapZoom(options)
    {
        this.plugins['snap-zoom'] = new SnapZoom(this, options)
        this.pluginsSort()
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
     * NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
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
        return (this.isMouseDown ? 1 : 0) + this.touches.length
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
     * array of pointers that are down on the viewport
     * @private
     * @return {PIXI.InteractionTrackingData[]}
     */
    getPointers()
    {
        const results = []
        const pointers = this.trackedPointers
        for (let key in pointers)
        {
            results.push(pointers[key])
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
    }

    // PLUGINS

    /**
     * Inserts a user plugin into the viewport
     * @param {string} name of plugin
     * @param {Plugin} plugin - instantiated Plugin class
     * @param {number} [index=last element] plugin is called current order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
     */
    userPlugin(name, plugin, index=PLUGIN_ORDER.length)
    {
        this.plugins[name] = plugin
        const current = PLUGIN_ORDER.indexOf(name)
        if (current !== -1)
        {
            PLUGIN_ORDER.splice(current, 1)
        }
        PLUGIN_ORDER.splice(index, 0, name)
        this.pluginsSort()
    }

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
            this.pluginsSort()
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
     * sort plugins for updates
     * @private
     */
    pluginsSort()
    {
        this.pluginsList = []
        for (let plugin of PLUGIN_ORDER)
        {
            if (this.plugins[plugin])
            {
                this.pluginsList.push(this.plugins[plugin])
            }
        }
    }

    /**
     * enable one-finger touch to drag
     * @param {object} [options]
     * @param {string} [options.direction=all] direction to drag (all, x, or y)
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @param {number} [options.factor=1] factor to multiply drag to increase the speed of movement
     */
    drag(options)
    {
        this.plugins['drag'] = new Drag(this, options)
        this.pluginsSort()
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
     * @param {string} [options.underflow=center] (none OR (top/bottom/center and left/right/center) OR center) where to place world if too small for screen (e.g., top-right, center, none, bottomleft)
     * @return {Viewport} this
     */
    clamp(options)
    {
        this.plugins['clamp'] = new Clamp(this, options)
        this.pluginsSort()
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
        this.pluginsSort()
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
        this.pluginsSort()
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
        this.pluginsSort()
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
        this.pluginsSort()
        return this
    }

    /**
     * follow a target
     * NOTE: uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     * @return {Viewport} this
     */
    follow(target, options)
    {
        this.plugins['follow'] = new Follow(this, target, options)
        this.pluginsSort()
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
        this.pluginsSort()
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
        this.pluginsSort()
        return this
    }

    /**
     * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
     * @param {object} [options]
     * @param {number} [options.radius] distance from center of screen in screen pixels
     * @param {number} [options.distance] distance from all sides in screen pixels
     * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
     * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no bottom scroll)
     * @param {number} [options.left] alternatively, set left distance (leave unset for no left scroll)
     * @param {number} [options.right] alternatively, set right distance (leave unset for no right scroll)
     * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
     * @param {boolean} [options.reverse] reverse direction of scroll
     * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
     * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
     * @param {boolean} [options.allowButtons] allows plugin to continue working even when there's a mousedown event
     */
    mouseEdges(options)
    {
        this.plugins['mouse-edges'] = new MouseEdges(this, options)
        this.pluginsSort()
        return this
    }

    /**
     * pause viewport (including animation updates such as decelerate)
     * NOTE: when setting pause=true, all touches and mouse actions are cleared (i.e., if mousedown was active, it becomes inactive for purposes of the viewport)
     * @type {boolean}
     */
    get pause() { return this._pause }
    set pause(value)
    {
        this._pause = value
        this.lastViewport = null
        this.moving = false
        this.zooming = false
        if (value)
        {
            this.touches = []
            this.isMouseDown = false
        }
    }

    /**
     * move the viewport so the bounding box is visible
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    ensureVisible(x, y, width, height)
    {
        if (x < this.left)
        {
            this.left = x
        }
        else if (x + width > this.right)
        {
            this.right = x + width
        }
        if (y < this.top)
        {
            this.top = y
        }
        else if (y + height > this.bottom)
        {
            this.bottom = y + height
        }
    }
}

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
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
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag, snap, pinch, follow, bounce-x, bounce-y, clamp-x, clamp-y, decelerate, mouse-edges, wheel)
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#zoomed
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom)
 */

/**
 * fires when viewport stops moving for any reason
 * @event Viewport#moved-end
 * @type {Viewport}
 */

/**
 * fires when viewport stops zooming for any rason
 * @event Viewport#zoomed-end
 * @type {Viewport}
 */

if (typeof PIXI !== 'undefined')
{
    if (PIXI.extras)
    {
        PIXI.extras.Viewport = Viewport
    }
    else
    {
        PIXI.extras = { Viewport }
    }
}

module.exports = Viewport