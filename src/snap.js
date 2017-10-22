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
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
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
        this.x = x
        this.y = y
        this.center = options.center
        this.stopOnResize = options.stopOnResize
        this.interrupt = exists(options.interrupt) ? options.interrupt : true
        this.removeOnComplete = options.removeOnComplete
        if (this.center)
        {
            this.originalX = x
            this.originalY = y
            this.x = (this.parent.worldScreenWidth / 2 - x) * this.parent.container.scale.x
            this.y = (this.parent.worldScreenHeight / 2 - y) * this.parent.container.scale.y
        }
    }

    resize()
    {
        if (this.center)
        {
            this.x = (this.parent.worldScreenWidth / 2 - this.originalX) * this.parent.container.scale.x
            this.y = (this.parent.worldScreenHeight / 2 - this.originalY) * this.parent.container.scale.y
            this.snapping = null
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
        if (!this.snapping && (this.parent.container.x !== this.x || this.parent.container.y !== this.y))
        {
            this.snapping = new Ease.to(this.parent.container, { x: this.x, y: this.y }, this.time, { ease: this.ease })
            this.parent.emit('snap-start', this.parent)
        }
        else if (this.snapping && this.snapping.update(elapsed))
        {
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('snap')
            }
            this.parent.emit('snap-end', this.parent)
            this.snapping = null
        }
    }

    resume()
    {
        this.snapping = null
        super.resume()
    }
}