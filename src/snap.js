const Plugin = require('./plugin')
const Ease = require('pixi-ease')

module.exports = class Snap extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.time=1000]
     * @param {number} [options.ease=EaseInOutSine]
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
    }

    down()
    {
        this.moving = null
    }

    up()
    {
        const decelerate = this.parent.plugins['decelerate']
        if (decelerate && (decelerate.x || decelerate.y))
        {
            decelerate.percentChangeX = decelerate.percentChangeY = this.friction
        }
    }

    update(elapsed)
    {
        if (!this.moving)
        {
            const decelerate = this.parent.plugins['decelerate']
            if (this.parent.pointers.length === 0 && (!decelerate || (!decelerate.x && !decelerate.y)))
            {
                this.moving = new Ease.to(this.parent.container, { x: this.x, y: this.y }, this.time, { ease: this.ease })
            }
        }
        else
        {
            if (this.moving.update(elapsed))
            {
                this.moving = null
            }
        }
    }
}