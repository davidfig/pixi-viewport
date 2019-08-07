import { Plugin } from './plugin'
import ease from '../ease'

/**
 * @typedef SnapOptions
 * @property {boolean} [topLeft] snap to the top-left of viewport instead of center
 * @property {number} [friction=0.8] friction/frame to apply if decelerate is active
 * @property {number} [time=1000]
 * @property {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {boolean} [interrupt=true] pause snapping with any user input on the viewport
 * @property {boolean} [removeOnComplete] removes this plugin after snapping is complete
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 * @property {boolean} [forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
 */

const snapOptions = {
    topLeft: false,
    friction: 0.8,
    time: 1000,
    ease: 'easeInOutSine',
    interrupt: true,
    removeOnComplete: false,
    removeOnInterrupt: false,
    forceStart: false
}

export class Snap extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {SnapOptions} [options]
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     * @event snap-remove(Viewport) emitted if snap plugin is removed
     */
    constructor(parent, x, y, options={})
    {
        super(parent)
        this.options = Object.assign({}, snapOptions, options)
        this.ease = ease(options.ease, 'easeInOutSine')
        this.x = x
        this.y = y
        if (this.options.forceStart)
        {
            this.snapStart()
        }
    }

    snapStart()
    {
        this.percent = 0
        this.snapping = { time: 0 }
        const current = this.options.topLeft ? this.parent.corner : this.parent.center
        this.deltaX = this.x - current.x
        this.deltaY = this.y - current.y
        this.startX = current.x
        this.startY = current.y
        this.parent.emit('snap-start', this.parent)
    }

    wheel()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('snap')
        }
    }

    down()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('snap')
        }
        else if (this.options.interrupt)
        {
            this.snapping = null
        }
    }

    up()
    {
        if (this.parent.input.count() === 0)
        {
            const decelerate = this.parent.plugins.get('decelerate')
            if (decelerate && (decelerate.x || decelerate.y))
            {
                decelerate.percentChangeX = decelerate.percentChangeY = this.options.friction
            }
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
        if (!this.snapping)
        {
            const current = this.options.topLeft ? this.parent.corner : this.parent.center
            if (current.x !== this.x || current.y !== this.y)
            {
                this.snapStart()
            }
        }
        else
        {
            const snapping = this.snapping
            snapping.time += elapsed
            let finished, x, y
            if (snapping.time > this.options.time)
            {
                finished = true
                x = this.startX + this.deltaX
                y = this.startY + this.deltaY
            }
            else
            {
                const percent = this.ease(snapping.time, 0, 1, this.options.time)
                x = this.startX + this.deltaX * percent
                y = this.startY + this.deltaY * percent
            }
            if (this.options.topLeft)
            {
                this.parent.moveCorner(x, y)
            }
            else
            {
                this.parent.moveCenter(x, y)
            }
            this.parent.emit('moved', { viewport: this.parent, type: 'snap' })
            if (finished)
            {
                if (this.options.removeOnComplete)
                {
                    this.parent.plugins.remove('snap')
                }
                this.parent.emit('snap-end', this.parent)
                this.snapping = null
            }
        }
    }
}