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
     * @param {boolean} [options.center] snap to the center of the camera instead of the top-left corner of viewport
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete=true] removes this plugin after snapping is complete
     *
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-end(Viewport) emitted each time snap reaches its target
     */
    constructor(parent, x, y, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.8
        this.time = options.time || 1000
        this.ease = options.ease || 'easeInOutSine'
        this.targetX = x
        this.targetY = y
        this.center = options.center
        if (!this.center)
        {
            // Always target the center, and calculate the new top-left corner to target upon resizing
            this.originalTargetX = this.targetX
            this.originalTargetY = this.targetY
            
            this.resize()
        }
        this.originalCenter = this.parent.center
        this.interrupt = exists(options.interrupt) ? options.interrupt : true
        this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete: true
    }

    reset()
    {
        this.snapping = null
    }

    resize()
    {
        if (!this.center)
        {
            this.targetX = this.parent.container.scale.x * (this.parent.worldScreenWidth / 2 - this.originalTargetX)
            this.targetY = this.parent.container.scale.y * (this.parent.worldScreenHeight / 2 - this.originalTargetY)
            this.snapping = null
            this.originalCenter = this.parent.center
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
            var finished = this.snapping.update(elapsed)
            
            this.parent.moveCenter(this.originalCenter)
            
            if (finished)
            {
                if (this.removeOnComplete)
                {
                    this.parent.removePlugin('snap')
                    console.log('snap-end')
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