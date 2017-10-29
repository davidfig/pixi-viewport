const Plugin = require('./plugin')
const Ease = require('pixi-ease')
const exists = require('exists')

module.exports = class SnapZoom extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
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
        this.xIndependent = exists(this.x_scale)
        this.yIndependent = exists(this.y_scale)
        this.x_scale = this.xIndependent ? this.x_scale : this.y_scale
        this.y_scale = this.yIndependent ? this.y_scale : this.x_scale

        this.time = exists(options.time) ? options.time : 1000
        this.ease = options.ease || 'easeInOutSine'
        this.center = options.center
        this.stopOnResize = options.stopOnResize
        this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete : true
        this.interrupt = exists(options.interrupt) ? options.interrupt : true

        if (this.time == 0)
        {
            parent.container.scale.x = this.x_scale
            parent.container.scale.y = this.y_scale
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('fit')
            }
        }
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

    down()
    {
        this.snapping = null
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

        let oldCenter
        if (!this.center)
        {
            oldCenter = this.parent.center
        }
        if (!this.snapping)
        {
            if (this.parent.container.scale.x !== this.x_scale || this.parent.container.scale.y !== this.y_scale)
            {
                this.snapping = new Ease.to(this.parent.container.scale, { x: this.x_scale, y: this.y_scale }, this.time, { ease: this.ease })
                this.parent.emit('snap-zoom-start', this.parent)
            }
        }
        else if (this.snapping)
        {
            if (this.snapping.update(elapsed))
            {
                if (this.removeOnComplete)
                {
                    this.parent.removePlugin('snap-zoom')
                }
                this.parent.emit('snap-zoom-end', this.parent)
                this.snapping = null
            }
            const clamp = this.parent.plugins['clamp-zoom']
            if (clamp)
            {
                clamp.clamp()
            }
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

    resume()
    {
        this.snapping = null
        super.resume()
    }
}