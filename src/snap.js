const Plugin = require('./plugin')
const utils =  require('./utils')

module.exports = class Snap extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
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
     *
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     * @event snap-remove(Viewport) emitted if snap plugin is removed
     */
    constructor(parent, x, y, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.8
        this.time = options.time || 1000
        this.ease = utils.ease(options.ease, 'easeInOutSine')
        this.x = x
        this.y = y
        this.topLeft = options.topLeft
        this.interrupt = utils.defaults(options.interrupt, true)
        this.removeOnComplete = options.removeOnComplete
        this.removeOnInterrupt = options.removeOnInterrupt
        if (options.forceStart)
        {
            this.startEase()
        }
    }

    snapStart()
    {
        this.percent = 0
        this.snapping = { time: 0 }
        const current = this.topLeft ? this.parent.corner : this.parent.center
        this.deltaX = this.x - current.x
        this.deltaY = this.y - current.y
        this.startX = current.x
        this.startY = current.y
        this.parent.emit('snap-start', this.parent)
    }

    wheel()
    {
        if (this.removeOnInterrupt)
        {
            this.parent.removePlugin('snap')
        }
    }

    down()
    {
        if (this.removeOnInterrupt)
        {
            this.parent.removePlugin('snap')
        }
        else if (this.interrupt)
        {
            this.snapping = null
        }
    }

    up()
    {
        if (this.parent.countDownPointers() === 0)
        {
            const decelerate = this.parent.plugins['decelerate']
            if (decelerate && (decelerate.x || decelerate.y))
            {
                decelerate.percentChangeX = decelerate.percentChangeY = this.friction
            }
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
        if (!this.snapping)
        {
            const current = this.topLeft ? this.parent.corner : this.parent.center
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
            if (snapping.time > this.time)
            {
                finished = true
                x = this.startX + this.deltaX
                y = this.startY + this.deltaY
            }
            else
            {
                const percent = this.ease(snapping.time, 0, 1, this.time)
                x = this.startX + this.deltaX * percent
                y = this.startY + this.deltaY * percent
            }
            if (this.topLeft)
            {
                this.parent.moveCorner(x, y)
            }
            else
            {
                this.parent.moveCenter(x, y)
            }
            this.parent.emit('moved', this.parent)
            if (finished)
            {
                if (this.removeOnComplete)
                {
                    this.parent.removePlugin('snap')
                }
                this.parent.emit('snap-end', this.parent)
                this.snapping = null
            }
        }
    }
}