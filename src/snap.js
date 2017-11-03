const Plugin = require('./plugin')
const Ease = require('pixi-ease')
const exists = require('exists')

module.exports = class Snap extends Plugin
{
    /**
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
     *
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     */
    constructor(parent, x, y, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.8
        this.time = options.time || 1000
        this.ease = options.ease || 'easeInOutSine'
        this.x = x
        this.y = y
        this.topLeft = options.topLeft
        this.originalCenter = this.parent.center
        this.interrupt = exists(options.interrupt) ? options.interrupt : true
        this.removeOnComplete = options.removeOnComplete
        this.calculateTarget()
    }

    reset()
    {
        this.snapping = null
    }

    resize()
    {
        this.calculateTarget()
    }


    calculateTarget()
    {
        if (!this.topLeft)
        {
            /* Finds target center based on the given originalTarget point (the top left corner)
             * DOES NOT WORK WHEN the snap-zoom plugin is working simultaneously because this.parent.container.scale.x and y are
             * constantly changing, therefore worldScreenWidth and worldScreenHeight are constantly changing, and the pixi-ease
             * library does not support constantly changing values
             */
            this.originalCenter = this.parent.center
            this.targetX = this.parent.worldScreenWidth / 2 + this.originalTargetX
            this.targetY = this.parent.worldScreenHeight / 2 + this.originalTargetY
        }
    }

    down()
    {
        this.snapping = null
    }

    up()
    {
        if (this.parent.input.pointers.length === 0)
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
        if (this.interrupt && this.parent.input.pointers.length !== 0)
        {
            return
        }
        let center = this.parent.center
        if (!this.snapping && (center.x !== this.targetX || center.y !== this.targetY))
        {
            this.snapping = new Ease.to(this.originalCenter, { x: this.targetX, y: this.targetY }, this.time, { ease: this.ease })
            this.parent.emit('snap-start', this.parent)
        }
        else if (this.snapping)
        {
            if (this.parent.scale.x !== this.lastScaleX || this.parent.scale.y !== this.lastScaleY)
            {
                this.snapping = new Ease.to(this.originalCenter, { x: this.targetX, y: this.targetY }, this.time, { ease: this.eaes })
                this.parent.emit('snap-restart', this.parent)
            }
            const finished = this.snapping.update(elapsed)

            this.parent.moveCenter(this.originalCenter)

            if (finished)
            {
                if (this.removeOnComplete)
                {
                    this.parent.removePlugin('snap')
                }
                this.parent.emit('snap-end', this.parent )
                this.snapping = null
            }
        }
    }

    resume()
    {
        this.snapping = null
        super.resume()
    }
}