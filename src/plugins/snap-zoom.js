import { Plugin } from './plugin'
import ease from '../ease'

/**
 * @typedef {Object} SnapZoomOptions
 * @property {number} [width=0] the desired width to snap (to maintain aspect ratio, choose only width or height)
 * @property {number} [height=0] the desired height to snap (to maintain aspect ratio, choose only width or height)
 * @property {number} [time=1000] time for snapping in ms
 * @property {(string|function)} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {PIXI.Point} [center] place this point at center during zoom instead of center of the viewport
 * @property {boolean} [interrupt=true] pause snapping with any user input on the viewport
 * @property {boolean} [removeOnComplete] removes this plugin after snapping is complete
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 * @property {boolean} [forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
 * @property {boolean} [noMove] zoom but do not move
 */

const snapZoomOptions = {
    width: 0,
    height: 0,
    time: 1000,
    ease: 'easeInOutSine',
    center: null,
    interrupt: true,
    removeOnComplete: false,
    removeOnInterrupts: false,
    forceStart: false,
    noMove: false
}
export class SnapZoom extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {SnapZoomOptions} options
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, snapZoomOptions, options)
        this.ease = ease(this.options.ease)
        if (this.options.width > 0)
        {
            this.xScale = parent.screenWidth / this.options.width
        }
        if (this.options.height > 0)
        {
            this.yScale = parent.screenHeight / this.options.height
        }
        this.xIndependent = this.xScale ? true : false
        this.yIndependent = this.yScale ? true : false
        this.xScale = this.xIndependent ? this.xScale : this.yScale
        this.yScale = this.yIndependent ? this.yScale : this.xScale

        if (this.options.time === 0)
        {
            parent.container.scale.x = this.xScale
            parent.container.scale.y = this.yScale
            if (this.options.removeOnComplete)
            {
                this.parent.plugins.remove('snap-zoom')
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
        this.snapping = { time: 0, startX: scale.x, startY: scale.y, deltaX: this.xScale - scale.x, deltaY: this.yScale - scale.y }
        this.parent.emit('snap-zoom-start', this.parent)
    }

    resize()
    {
        this.snapping = null

        if (this.options.width > 0)
        {
            this.xScale = this.parent.screenWidth / this.options.width
        }
        if (this.options.height > 0)
        {
            this.yScale = this.parent.screenHeight / this.options.height
        }
        this.xScale = this.xIndependent ? this.xScale : this.yScale
        this.yScale = this.yIndependent ? this.yScale : this.xScale
    }

    wheel()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('snap-zoom')
        }
    }

    down()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('snap-zoom')
        }
        else if (this.options.interrupt)
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
        if (this.options.interrupt && this.parent.input.count() !== 0)
        {
            return
        }

        let oldCenter
        if (!this.options.center && !this.options.noMove)
        {
            oldCenter = this.parent.center
        }
        if (!this.snapping)
        {
            if (this.parent.scale.x !== this.xScale || this.parent.scale.y !== this.yScale)
            {
                this.createSnapping()
            }
        }
        else if (this.snapping)
        {
            const snapping = this.snapping
            snapping.time += elapsed
            if (snapping.time >= this.options.time)
            {
                this.parent.scale.set(this.xScale, this.yScale)
                if (this.options.removeOnComplete)
                {
                    this.parent.plugins.remove('snap-zoom')
                }
                this.parent.emit('snap-zoom-end', this.parent)
                this.snapping = null
            }
            else
            {
                this.parent.scale.x = this.ease(snapping.time, snapping.startX, snapping.deltaX, this.options.time)
                this.parent.scale.y = this.ease(snapping.time, snapping.startY, snapping.deltaY, this.options.time)
            }
            const clamp = this.parent.plugins.get('clamp-zoom')
            if (clamp)
            {
                clamp.clamp()
            }
            if (!this.options.noMove)
            {
                if (!this.options.center)
                {
                    this.parent.moveCenter(oldCenter)
                }
                else
                {
                    this.parent.moveCenter(this.options.center)
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
