const Plugin = require('./plugin')
const Ease = require('pixi-ease')
const exists = require('exists')

module.exports = class Fit extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} value (a height or width -- only required if direction!=all)
     * @param {object} options
     * @param {string} [options.direction=all] (all, x, or y)
     * @param {boolean} [options.center] maintain the same center
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
     *
     * @event fit-start(Viewport) emitted each time a fit animation starts
     * @event fit-end(Viewport) emitted each time fit reaches its target
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
        this.time = options.time == 0 ? 0 : 1000
        this.ease = options.ease || 'easeInOutSine'
        if (options.center)
        {
            this.center = parent.center
        }
        this.stopOnResize = options.stopOnResize
        this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete : true
        
        if (this.time == 0)
        {
            if (this.x)
            {
                parent.container.scale.x = this.x
                parent.container.scale.y = this.y
            }
            else
            {
                parent.container.scale.x = this.value
                parent.container.scale.y = this.value
            }
            
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('fit')
            }
        }
    }

    reset()
    {
        this.fitting = null
    }

    down()
    {
        this.fitting = null
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }
        if (this.center)
        {
            this.center = this.parent.center
        }
        if (!this.fitting)
        {
            if (this.x && this.parent.container.scale.x !== this.x)
            {
                this.fitting = new Ease.to(this.parent.container.scale, { x: this.x, y: this.y }, this.time, { ease: this.ease })
            }
            else if (this.parent.container.scale.x !== this.value)
            {
                this.fitting = new Ease.to(this.parent.container.scale, { x: this.value, y: this.value }, this.time, { ease: this.ease })
            }
            
            this.parent.emit('fit-start', this.parent)
        }
        else if (this.fitting && this.fitting.update(elapsed))
        {
            if (this.removeOnComplete)
            {
                this.parent.removePlugin('fit')
            }
            this.parent.emit('fit-end', this.parent)
            this.fitting = null
        }
        if (this.center)
        {
            this.parent.moveCenter(this.center)
        }
    }

    resume()
    {
        this.fitting = null
        super.resume()
    }
}