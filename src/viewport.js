import * as PIXI from 'pixi.js'

import { InputManager } from './input-manager'
import { PluginManager } from './plugin-manager'
import { Drag } from './plugins/drag'
import { Pinch } from './plugins/pinch'
import { Clamp } from './plugins/clamp'
import { ClampZoom } from './plugins/clamp-zoom'
import { Decelerate } from './plugins/decelerate'
import { Bounce } from './plugins/bounce'
import { Snap } from './plugins/snap'
import { SnapZoom } from './plugins/snap-zoom'
import { Follow } from './plugins/follow'
import { Wheel } from './plugins/wheel'
import { MouseEdges } from './plugins/mouse-edges'
export { Plugin } from './plugins/plugin'

/**
 * @typedef {object} ViewportOptions
 * @property {number} [screenWidth=window.innerWidth]
 * @property {number} [screenHeight=window.innerHeight]
 * @property {number} [worldWidth=this.width]
 * @property {number} [worldHeight=this.height]
 * @property {number} [threshold=5] number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
 * @property {boolean} [passiveWheel=true] whether the 'wheel' event is set to passive
 * @property {boolean} [stopPropagation=false] whether to stopPropagation of events that impact the viewport
 * @property {HitArea} [forceHitArea] change the default hitArea from world size to a new value
 * @property {boolean} [noTicker] set this if you want to manually call update() function on each frame
 * @property {PIXI.Ticker} [ticker=PIXI.Ticker.shared] use this PIXI.ticker for updates
 * @property {PIXI.InteractionManager} [interaction=null] InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer postion relative to canvas location on screen
 * @property {HTMLElement} [divWheel=document.body] div to attach the wheel event
 * @property {boolean} [disableOnContextMenu] remove oncontextmenu=() => {} from the divWheel element
 */

const viewportOptions = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: null,
    worldHeight: null,
    threshold: 5,
    passiveWheel: true,
    stopPropagation: false,
    forceHitArea: null,
    noTicker: false,
    interaction: null,
    disableOnContextMenu: false
}

/**
 * Main class to use when creating a Viewport
 */
export class Viewport extends PIXI.Container
{
    /**
     * @param {ViewportOptions} [options]
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
     * @fires frame-end
     */
    constructor(options = {})
    {
        super()
        this.options = Object.assign({}, viewportOptions, options)

        // needed to pull this out of viewportOptions because of pixi.js v4 support (which changed from PIXI.ticker.shared to PIXI.Ticker.shared...sigh)
        if (options.ticker)
        {
            this.options.ticker = options.ticker
        }
        else
        {
            // to avoid Rollup transforming our import, save pixi namespace in a variable
            // from here: https://github.com/pixijs/pixi.js/issues/5757
            let ticker
            const pixiNS = PIXI
            if (parseInt(/^(\d+)\./.exec(PIXI.VERSION)[1]) < 5)
            {
                ticker = pixiNS.ticker.shared;
            }
            else
            {
                ticker = pixiNS.Ticker.shared;
            }
            this.options.ticker = options.ticker || ticker
        }

        /** @type {number} */
        this.screenWidth = this.options.screenWidth

        /** @type {number} */
        this.screenHeight = this.options.screenHeight

        this._worldWidth = this.options.worldWidth
        this._worldHeight = this.options.worldHeight
        this.forceHitArea = this.options.forceHitArea

        /**
         * number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
         * @type {number}
         */
        this.threshold = this.options.threshold

        this.options.divWheel = this.options.divWheel || document.body

        if (this.options.disableOnContextMenu)
        {
            this.options.divWheel.oncontextmenu = e => e.preventDefault()
        }

        if (!this.options.noTicker)
        {
            this.tickerFunction = () => this.update(this.options.ticker.elapsedMS)
            this.options.ticker.add(this.tickerFunction)
        }

        this.input = new InputManager(this)

        /**
         * Use this to add user plugins or access existing plugins (e.g., to pause, resume, or remove them)
         * @type {PluginManager}
         */
        this.plugins = new PluginManager(this)
    }

    /**
     * overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners
     * @param {(object|boolean)} [options] - Options parameter. A boolean will act as if all options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true. Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true. Should it destroy the base texture of the child sprite     */
    destroy(options)
    {
        if (!this.options.noTicker)
        {
            this.options.ticker.remove(this.tickerFunction)
        }
        this.input.destroy()
        super.destroy(options)
    }

    /**
     * update viewport on each frame
     * by default, you do not need to call this unless you set options.noTicker=true
     * @param {number} elapsed time in milliseconds since last update
     */
    update(elapsed)
    {
        if (!this.pause)
        {
            this.plugins.update(elapsed)

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
                this._hitAreaDefault = new PIXI.Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight)
                this.hitArea = this._hitAreaDefault
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
            this.emit('frame-end', this)
        }
    }

    /**
     * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
     * @param {number} [screenWidth=window.innerWidth]
     * @param {number} [screenHeight=window.innerHeight]
     * @param {number} [worldWidth]
     * @param {number} [worldHeight]
     */
    resize(screenWidth = window.innerWidth, screenHeight = window.innerHeight, worldWidth, worldHeight)
    {
        this.screenWidth = screenWidth
        this.screenHeight = screenHeight
        if (typeof worldWidth !== 'undefined')
        {
            this._worldWidth = worldWidth
        }
        if (typeof worldHeight !== 'undefined')
        {
            this._worldHeight = worldHeight
        }
        this.plugins.resize()
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
            return this.width / this.scale.x
        }
    }
    set worldWidth(value)
    {
        this._worldWidth = value
        this.plugins.resize()
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
            return this.height / this.scale.y
        }
    }
    set worldHeight(value)
    {
        this._worldHeight = value
        this.plugins.resize()
    }

    /**
     * get visible bounds of viewport
     * @returns {PIXI.Rectangle}
     */
    getVisibleBounds()
    {
        return new PIXI.Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight)
    }

    /**
     * change coordinates from screen to world
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {PIXI.Point}
     */
    toWorld(x, y)
    {
        if (arguments.length === 2)
        {
            return this.toLocal(new PIXI.Point(x, y))
        }
        else
        {
            return this.toLocal(x)
        }
    }

    /**
     * change coordinates from world to screen
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {PIXI.Point}
     */
    toScreen(x, y)
    {
        if (arguments.length === 2)
        {
            return this.toGlobal(new PIXI.Point(x, y))
        }
        else
        {
            return this.toGlobal(x)
        }
    }

    /**
     * screen width in world coordinates
     * @type {number}
     */
    get worldScreenWidth()
    {
        return this.screenWidth / this.scale.x
    }

    /**
     * screen height in world coordinates
     * @type {number}
     */
    get worldScreenHeight()
    {
        return this.screenHeight / this.scale.y
    }

    /**
     * world width in screen coordinates
     * @type {number}
     */
    get screenWorldWidth()
    {
        return this.worldWidth * this.scale.x
    }

    /**
     * world height in screen coordinates
     * @type {number}
     */
    get screenWorldHeight()
    {
        return this.worldHeight * this.scale.y
    }

    /**
     * center of screen in world coordinates
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
    moveCenter()
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
        this.plugins.reset()
        this.dirty = true
        return this
    }

    /**
     * top-left corner of Viewport
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
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {Viewport} this
     */
    moveCorner(x, y)
    {
        if (arguments.length === 1)
        {
            this.position.set(-x.x * this.scale.x, -x.y * this.scale.y)
        }
        else
        {
            this.position.set(-x * this.scale.x, -y * this.scale.y)
        }
        this.plugins.reset()
        return this
    }

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=this.worldWidth] in world coordinates
     * @param {boolean} [center] maintain the same center
     * @param {boolean} [scaleY=true] whether to set scaleY=scaleX
     * @param {boolean} [noClamp] whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitWidth(width, center, scaleY = true, noClamp)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.scale.x = this.screenWidth / width

        if (scaleY)
        {
            this.scale.y = this.scale.x
        }

        const clampZoom = this.plugins.get('clamp-zoom')
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
     * @param {number} [height=this.worldHeight] in world coordinates
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
     * @param {boolean} [noClamp] whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitHeight(height, center, scaleX = true, noClamp)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.scale.y = this.screenHeight / height

        if (scaleX)
        {
            this.scale.x = this.scale.y
        }

        const clampZoom = this.plugins.get('clamp-zoom')
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
     * @param {boolean} center maintain the same center of the screen after zoom
     * @returns {Viewport} this
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

        const clampZoom = this.plugins.get('clamp-zoom')
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
     * @param {number} [width=this.worldWidth] desired width
     * @param {number} [height=this.worldHeight] desired height
     * @returns {Viewport} this
     */
    fit(center, width = this.worldWidth, height = this.worldHeight)
    {
        let save
        if (center)
        {
            save = this.center
        }
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
        const clampZoom = this.plugins.get('clamp-zoom')
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
     * zoom viewport to specific value
     * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    setZoom(scale, center)
    {
        let save
        if (center)
        {
            save = this.center
        }
        this.scale.set(scale)
        const clampZoom = this.plugins.get('clamp-zoom')
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
     * @return {Viewport} this
     */
    zoomPercent(percent, center)
    {
        return this.setZoom(this.scale.x + this.scale.x * percent, center)
    }

    /**
     * zoom viewport by increasing/decreasing width by a certain number of pixels
     * @param {number} change in pixels
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    zoom(change, center)
    {
        this.fitWidth(change + this.worldScreenWidth, center)
        return this
    }

    /**
     * changes scale of viewport and maintains center of viewport--same as calling setScale(scale, true)
     * @type {number}
     */
    set scaled(scale)
    {
        this.setZoom(scale, true)
    }
    get scaled()
    {
        return this.scale.x
    }

    /**
     * @param {SnapZoomOptions} options
     */
    snapZoom(options)
    {
        this.plugins.add('snap-zoom', new SnapZoom(this, options))
        return this
    }

    /**
     * is container out of world bounds
     * @returns {OutOfBounds}
     */
    OOB()
    {
        return {
            left: this.left < 0,
            right: this.right > this._worldWidth,
            top: this.top < 0,
            bottom: this.bottom > this._worldHeight,
            cornerPoint: new PIXI.Point(
                this._worldWidth * this.scale.x - this.screenWidth,
                this._worldHeight * this.scale.y - this.screenHeight
            )
        }
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
        this.plugins.reset()
    }

    /**
     * world coordinates of the left edge of the screen
     * @type { number }
     */
    get left()
    {
        return -this.x / this.scale.x
    }
    set left(value)
    {
        this.x = -value * this.scale.x
        this.plugins.reset()
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
        this.plugins.reset()
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
        this.plugins.reset()
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
     * NOTE: if not set then hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
     * @returns {HitArea}
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
            this._forceHitArea = null
            this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight)
        }
    }

    /**
     * enable one-finger touch to drag
     * NOTE: if you expect users to use right-click dragging, you should enable viewport.options.disableOnContextMenu to avoid the context menu popping up on each right-click drag
     * @param {DragOptions} [options]
     * @returns {Viewport} this
     */
    drag(options)
    {
        this.plugins.add('drag', new Drag(this, options))
        return this
    }

    /**
     * clamp to world boundaries or other provided boundaries
     * NOTES:
     *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
     *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {ClampOptions} [options]
     * @returns {Viewport} this
     */
    clamp(options)
    {
        this.plugins.add('clamp', new Clamp(this, options))
        return this
    }

    /**
     * decelerate after a move
     * NOTE: this fires 'moved' event during deceleration
     * @param {DecelerateOptions} [options]
     * @return {Viewport} this
     */
    decelerate(options)
    {
        this.plugins.add('decelerate', new Decelerate(this, options))
        return this
    }

    /**
     * bounce on borders
     * NOTES:
     *    screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     *    fires 'moved', 'bounce-x-start', 'bounce-y-start', 'bounce-x-end', and 'bounce-y-end' events
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
        this.plugins.add('bounce', new Bounce(this, options))
        return this
    }

    /**
     * enable pinch to zoom and two-finger touch to drag
     * @param {PinchOptions} [options]
     * @return {Viewport} this
     */
    pinch(options)
    {
        this.plugins.add('pinch', new Pinch(this, options))
        return this
    }

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {SnapOptions} [options]
     * @return {Viewport} this
     */
    snap(x, y, options)
    {
        this.plugins.add('snap', new Snap(this, x, y, options))
        return this
    }

    /**
     * follow a target
     * NOTES:
     *    uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
     *    options.acceleration is not perfect as it doesn't know the velocity of the target
     *    it adds acceleration to the start of movement and deceleration to the end of movement when the target is stopped
     *    fires 'moved' event
     * @param {PIXI.DisplayObject} target to follow
     * @param {FollowOptions} [options]
     * @returns {Viewport} this
     */
    follow(target, options)
    {
        this.plugins.add('follow', new Follow(this, target, options))
        return this
    }

    /**
     * zoom using mouse wheel
     * @param {WheelOptions} [options]
     * @return {Viewport} this
     */
    wheel(options)
    {
        this.plugins.add('wheel', new Wheel(this, options))
        return this
    }

    /**
     * enable clamping of zoom to constraints
     * @param {ClampZoomOptions} [options]
     * @return {Viewport} this
     */
    clampZoom(options)
    {
        this.plugins.add('clamp-zoom', new ClampZoom(this, options))
        return this
    }

    /**
     * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
     * NOTE: fires 'moved' event
     * @param {MouseEdgesOptions} [options]
     */
    mouseEdges(options)
    {
        this.plugins.add('mouse-edges', new MouseEdges(this, options))
        return this
    }

    /**
     * pause viewport (including animation updates such as decelerate)
     * @type {boolean}
     */
    get pause()
    {
        return this._pause
    }
    set pause(value)
    {
        this._pause = value
        this.lastViewport = null
        this.moving = false
        this.zooming = false
        if (value)
        {
            this.input.pause()
        }
    }

    /**
     * move the viewport so the bounding box is visible
     * @param {number} x - left
     * @param {number} y - top
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
 * fires when viewport stops moving
 * @event Viewport#moved-end
 * @type {Viewport}
 */

/**
 * fires when viewport stops zooming
 * @event Viewport#zoomed-end
 * @type {Viewport}
 */

 /**
 * fires at the end of an update frame
 * @event Viewport#frame-end
 * @type {Viewport}
 */

/** @typedef HitArea {(PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle)} */

/**
 * @typedef {Object} OutOfBounds
 * @private
 * @property {boolean} left
 * @property {boolean} right
 * @property {boolean} top
 * @property {boolean} bottom
 * @property {PIXI.Point} cornerPoint
 */

/**
 * @typedef {Object} LastViewport
 * @private
 * @property {number} x
 * @property {number} y
 * @property {number} scaleX
 * @property {number} scaleY
 */