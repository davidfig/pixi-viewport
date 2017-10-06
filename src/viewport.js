const Events = require('eventemitter3')

const Drag = require('./drag')
const Pinch = require('./pinch')
const Clamp = require('./clamp')
const Decelerate = require('./decelerate')
const HitArea = require('./hit-area')
const Bounce = require('./bounce')
const Snap = require('./snap')
const Follow = require('./follow')

const PLUGIN_ORDER = ['hit-area', 'drag', 'pinch', 'follow', 'decelerate', 'bounce', 'snap', 'clamp']

module.exports = class Viewport extends Events
{
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
    {
        super()
        this.container = container
        this.pointers = []
        this.plugins = []
        options = options || {}
        this.screenWidth = options.screenWidth
        this.screenHeight = options.screenHeight
        this.worldWidth = options.worldWidth
        this.worldHeight = options.worldHeight
        this.threshold = typeof options.threshold === 'undefined' ? 5 : options.threshold
        this.maxFrameTime = options.maxFrameTime || 1000 / 60
    }

    /**
     * start requestAnimationFrame() loop to handle animations; alternatively, call update() manually on each frame
     */
    start()
    {
        this.running = performance.now()
        this.loop()
        return this
    }

    /**
     * loop through updates
     * @private
     */
    loop()
    {
        if (this.running)
        {
            const now = performance.now()
            let elapsed = now - this.running
            elapsed = elapsed > this.maxFrameTime ? this.maxFrameTime : elapsed
            this.update(elapsed)
            requestAnimationFrame(this.loop.bind(this))
        }
    }

    /**
     * update loop -- may be called manually or use start/stop() for Viewport to handle updates
     * @param {number} elapsed time in ms
     */
    update(elapsed)
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
     */
    stop()
    {
        this.running = false
        return this
    }

    /**
     * use this to set screen and world sizes--needed for most plugins
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {number} worldWidth
     * @param {number} worldHeight
     */
    resize(screenWidth, screenHeight, worldWidth, worldHeight)
    {
        this.screenWidth = screenWidth
        this.screenHeight = screenHeight
        this.worldWidth = worldWidth
        this.worldHeight = worldHeight
        for (let plugin of this.plugins)
        {
            if (plugin)
            {
                plugin.resize()
            }
        }
    }

    /**
     * add or remove mouse/touch listeners
     * @private
     */
    listeners()
    {
        if (this.plugin('drag') || this.plugin('pinch'))
        {
            if (!this.container.interactive)
            {
                this.container.interactive = true
                this.container.on('pointerdown', this.down.bind(this))
                this.container.on('pointermove', this.move.bind(this))
                this.container.on('pointerup', this.up.bind(this))
                this.container.on('pointercancel', this.up.bind(this))
                this.container.on('pointerupoutside', this.up.bind(this))
            }
        }
        else
        {
            if (this.container.interactive)
            {
                this.container.interactive = false
                this.container.removeListener('pointerdown', this.down.bind(this))
                this.container.removeListener('pointermove', this.move.bind(this))
                this.container.removeListener('pointerup', this.up.bind(this))
                this.container.removeListener('pointercancel', this.up.bind(this))
                this.container.removeListener('pointerupoutside', this.up.bind(this))
            }
        }
    }

    /**
     * handle down events
     * @private
     * @param {event} e
     */
    down(e)
    {
        // fixes a bug when highlighting
        if (e.data.identifier === 'MOUSE')
        {
            this.pointers = []
        }
        this.pointers.push({ id: e.data.pointerId, last: { x: e.data.global.x, y: e.data.global.y }, saved: [] })
        if (this.pointers.length === 1)
        {
            this.moved = false
        }
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].down(e)
            }
        }

    }

    checkThreshold(change)
    {
        if (Math.abs(change) >= this.threshold)
        {
            this.moved = true
            return true
        }
        return false
    }

    /**
     * handle move events
     * @private
     * @param {event} e
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
        if (this.pointers.length)
        {
            if (this.pointers.length > 1)
            {
                this.moved = true
            }
            else
            {
                const last = this.pointers[0].last
                const pos = e.data.global
                const distX = pos.x - last.x
                const distY = pos.y - last.y
                if (this.checkThreshold(distX) || this.checkThreshold(distY))
                {
                    this.moved = true
                }
            }
        }
    }

    /**
     * handle up events
     * @private
     * @param {event} e
     */
    up(e)
    {
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].id === e.data.pointerId)
            {
                if (this.pointers.length === 1 && !this.moved)
                {
                    this.emit('click', { screen: e.data.global, world: this.toWorld(e.data.global) })
                }
                this.pointers.splice(i, 1)
            }
        }
        for (let type of PLUGIN_ORDER)
        {
            if (this.plugins[type])
            {
                this.plugins[type].up(e)
            }
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
        return this.screenWidth / this.container.scale.x
    }

    /**
     * @type {number} screen width in world coordinates
     */
    get worldScreenHeight()
    {
        return this.screenHeight / this.container.scale.y
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
    }

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=container.width] in world coordinates; uses container.width if not provided
    * @param {boolean} [center] maintain the same center
     */
    fitWidth(width, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        width = width || this.container.width
        this.container.scale.x = this.screenWidth / width
        this.container.scale.y = this.container.scale.x
        if (center)
        {
            this.moveCenter(save)
        }
    }

    /**
     * change zoom so the height fits in the viewport
     * @param {number} [width=container.height] in world coordinates; uses container.width if not provided
    * @param {boolean} [center] maintain the same center
     */
    fitHeight(height, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        height = height || this.container.height
        this.container.scale.y = this.screenHeight / height
        this.container.scale.x = this.container.scale.y
        if (center)
        {
            this.moveCenter(save)
        }
    }

    /**
     * is container out of world bounds
     * @return { left:boolean, right: boolean, top: boolean, bottom: boolean, cornerPoint: PIXI.Point }
     */
    OOB()
    {
        const result = {}
        const point = result.cornerPoint = this.container.toLocal({ x: this.screenWidth, y: this.screenHeight })
        result.left = this.screenWidth / this.container.scale.x > this.worldWidth || this.container.x > 0
        result.right = point.x > this.worldWidth
        result.top = this.screenHeight / this.container.scale.y > this.worldHeight || this.container.y > 0
        result.bottom = point.y > this.worldHeight
        return result
    }

    /**
     * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
     * @param {number|PIXI.Point} x|point
     * @param {number} y
     */
    corner(/*x, y | point*/)
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
    }

    /**
     * move viewport's center; also clamps and resets decelerate and bounce (as needed)
     * @param {number|PIXI.Point} x|point
     * @param {number} y
     */
    // center(/*x, y | point */)
    // {
    //     const halfWidth = (this.screenWidth / 2) / this.container.scale.x
    //     const halfHeight = (this.screenHeight / 2) / this.container.scale.y
    //     if (arguments.length === 1)
    //     {
    //         this.container.position.set(arguments[0].x - halfWidth, arguments[0].y - halfHeight)
    //     }
    //     else
    //     {
    //         this.container.position.set(arguments[0] - halfWidth, arguments[1] - halfHeight)
    //     }
    //     this._reset()
    // }

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
        if (this.plugins['clamp'])
        {
            this.plugins['clamp'].update()
        }
    }

    // PLUGINS

    /**
     * removes installed plugin
     * @param {string} type of plugin (e.g., 'drag', 'pinch')
     */
    removePlugin(type)
    {
        this.plugins[type] = null
        this.listeners()
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
        this.listeners()
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
     * @param {number} [time] time to finish bounce
     * @param {string|function} [ease] ease function or name (see http://easings.net/ for supported names)
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
     * @param {object} [options]
     * @param {boolean} [options.clampScreen] clamp minimum zoom to size of screen
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp minimum width
     * @param {number} [options.maxHeight] clamp minimum height
     * @return {Viewport} this
     */
    pinch(options)
    {
        this.plugins['pinch'] = new Pinch(this, options)
        this.listeners()
        return this
    }

    /**
     * add a hitArea to the container -- useful when your container contains empty spaces that you'd like to drag or pinch
     * @param {PIXI.Rectangle} [rect] if no rect is provided, it will use the value of container.getBounds()
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
     * @param {number} [options.speed=1] speed (in world pixels/ms) to snap to location
     */
    snap(x, y, options)
    {
        this.plugins['snap'] = new Snap(this, x, y, options)
        return this
    }

    /**
     * follow a target
     * @param {PIXI.Point|PIXI.DisplayObject|object} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} options
     */
    follow(target, options)
    {
        this.plugins['follow'] = new Follow(this, target, options)
        return this
    }
}