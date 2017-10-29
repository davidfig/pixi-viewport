const Plugin = require('./plugin')
const Ease = require('pixi-ease')
const exists = require('exists')

module.exports = class SnapZoom extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} value (a height or width -- only required if direction!=all)
     * @param {object} options
     * @param {string} [options.direction=all] (all, x, or y)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    constructor(parent, value, options)
    {
        super(parent)
        options = options || {}
        switch (options.direction)
        {
            case 'x':
                this.value = parent._screenWidth / value
                break
            case 'y':
                this.value = parent._screenHeight / value
                break
            default:
                this.x = this.parent._screenWidth / this.parent._worldWidth
                this.y = this.parent._screenHeight / this.parent._worldHeight
                break
        }
        this.time = exists(options.time) ? options.time : 1000
        this.ease = options.ease || 'easeInOutSine'
        this.center = options.center
        this.stopOnResize = options.stopOnResize
        this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete : true
        this.interrupt = exists(options.interrupt) ? options.interrupt : true
        
        if (this.time == 0)
        {
            parent.container.scale.x = this.x || this.value
            parent.container.scale.y = this.y || this.value
            
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('fit')
            }
        }
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
            if (this.x && this.parent.container.scale.x !== this.x)
            {
                this.snapping = new Ease.to(this.parent.container.scale, { x: this.x, y: this.y }, this.time, { ease: this.ease })
            }
            else if (this.parent.container.scale.x !== this.value)
            {
                this.snapping = new Ease.to(this.parent.container.scale, { x: this.value, y: this.value }, this.time, { ease: this.ease })
            }
            
            this.parent.emit('snap-zoom-start', this.parent)
        }
        else if (this.snapping && this.snapping.update(elapsed))
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

    resume()
    {
        this.snapping = null
        super.resume()
    }
}