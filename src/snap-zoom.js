import * as utils from './utils'
import { Plugin } from './plugin'

export class SnapZoom extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
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
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.width = options.width
        this.height = options.height
        if (this.width > 0)
        {
            this.x_scale = parent._screenWidth / this.width
        }
        if (this.height > 0)
        {
            this.y_scale = parent._screenHeight / this.height
        }
        this.xIndependent = utils.exists(this.x_scale)
        this.yIndependent = utils.exists(this.y_scale)
        this.x_scale = this.xIndependent ? this.x_scale : this.y_scale
        this.y_scale = this.yIndependent ? this.y_scale : this.x_scale

        this.time = utils.defaults(options.time, 1000)
        this.ease = utils.ease(options.ease, 'easeInOutSine')
        this.center = options.center
        this.noMove = options.noMove
        this.stopOnResize = options.stopOnResize
        this.removeOnInterrupt = options.removeOnInterrupt
        this.removeOnComplete = utils.defaults(options.removeOnComplete, true)
        this.interrupt = utils.defaults(options.interrupt, true)
        if (this.time === 0)
        {
            parent.container.scale.x = this.x_scale
            parent.container.scale.y = this.y_scale
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('snap-zoom')
            }
        }
        else if (options.forceStart)
        {
            this.createSnapping()
        }
    }

    createSnapping()
    {
        const scale = this.parent.scale
        this.snapping = { time: 0, startX: scale.x, startY: scale.y, deltaX: this.x_scale - scale.x, deltaY: this.y_scale - scale.y }
        this.parent.emit('snap-zoom-start', this.parent)
    }

    resize()
    {
        this.snapping = null

        if (this.width > 0)
        {
            this.x_scale = this.parent._screenWidth / this.width
        }
        if (this.height > 0)
        {
            this.y_scale = this.parent._screenHeight / this.height
        }
        this.x_scale = this.xIndependent ? this.x_scale : this.y_scale
        this.y_scale = this.yIndependent ? this.y_scale : this.x_scale
    }

    reset()
    {
        this.snapping = null
    }

    wheel()
    {
        if (this.removeOnInterrupt)
        {
            this.parent.removePlugin('snap-zoom')
        }
    }

    down()
    {
        if (this.removeOnInterrupt)
        {
            this.parent.removePlugin('snap-zoom')
        }
        else if (this.interrupt)
        {
            this.snapping = null
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }
        if (this.interrupt && this.parent.countDownPointers() !== 0)
        {
            return
        }

        let oldCenter
        if (!this.center && !this.noMove)
        {
            oldCenter = this.parent.center
        }
        if (!this.snapping)
        {
            if (this.parent.scale.x !== this.x_scale || this.parent.scale.y !== this.y_scale)
            {
                this.createSnapping()
            }
        }
        else if (this.snapping)
        {
            const snapping = this.snapping
            snapping.time += elapsed
            if (snapping.time >= this.time)
            {
                this.parent.scale.set(this.x_scale, this.y_scale)
                if (this.removeOnComplete)
                {
                    this.parent.removePlugin('snap-zoom')
                }
                this.parent.emit('snap-zoom-end', this.parent)
                this.snapping = null
            }
            else
            {
                const snapping = this.snapping
                this.parent.scale.x = this.ease(snapping.time, snapping.startX, snapping.deltaX, this.time)
                this.parent.scale.y = this.ease(snapping.time, snapping.startY, snapping.deltaY, this.time)
            }
            const clamp = this.parent.plugins['clamp-zoom']
            if (clamp)
            {
                clamp.clamp()
            }
            if (!this.noMove)
            {
                if (!this.center)
                {
                    this.parent.moveCenter(oldCenter)
                }
                else
                {
                    this.parent.moveCenter(this.center)
                }
            }
        }
    }

    resume()
    {
        this.snapping = null
        super.resume()
    }
}