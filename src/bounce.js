const Ease = require('pixi-ease')

const Plugin = require('./plugin')

module.exports = class Bounce extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease='easeInOutSine'] ease function or name (see http://easings.net/ for supported names)
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.time = options.time || 150
        this.ease = options.ease || 'easeInOutSine'
        this.friction = option.friction || 0.5
    }

    down()
    {
        this.toX = this.toY = null
    }

    up()
    {
        this.bounce()
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }

        this.bounce()
        if (this.toX)
        {
            if (this.toX.update(elapsed))
            {
                this.toX = null
            }
        }
        if (this.toY)
        {
            if (this.toY.update(elapsed))
            {
                this.toY = null
            }
        }
    }

    bounce()
    {
        if (this.paused)
        {
            return
        }

        let oob
        let decelerate = this.parent.plugin('decelerate')
        if (decelerate && (decelerate.x || decelerate.y))
        {
            if ((decelerate.x && decelerate.percentChangeX === decelerate.friction) || (decelerate.y && decelerate.percentChangeY === decelerate.friction))
            {
                oob = this.parent.OOB()
                if (oob.left || oob.right)
                {
                    decelerate.percentChangeX = this.friction
                }
                if (oob.top || oob.bottom)
                {
                    decelerate.percentChangeY = this.friction
                }
            }
        }
        const pointers = this.parent.input.pointers
        decelerate = decelerate || {}
        if (pointers.length === 0 && ((!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)))
        {
            oob = oob || this.parent.OOB()
            const point = oob.cornerPoint
            if (!this.toX && !decelerate.x)
            {
                if (oob.left)
                {
                    this.toX = new Ease.to(this.parent.container, { x: 0 }, this.time, { ease: this.ease })
                }
                else if (oob.right)
                {
                    this.toX = new Ease.to(this.parent.container, { x: -point.x }, this.time, { ease: this.ease })
                }
            }
            if (!this.toY && !decelerate.y)
            {
                if (oob.top)
                {
                    this.toY = new Ease.to(this.parent.container, { y: 0 }, this.time, { ease: this.ease })
                }
                else if (oob.bottom)
                {
                    this.toY = new Ease.to(this.parent.container, { y: -point.y }, this.time, { ease: this.ease })
                }
            }
        }
    }

    reset()
    {
        this.toX = this.toY = null
    }
}