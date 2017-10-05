const Plugin = require('./plugin')

module.exports = class Snap extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.speed=1] speed (in world pixels/ms) to snap to location
     * @param {number} [options.acceleration=0.01] acceleration in world pixels/ms
     */
    constructor(parent, x, y, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.8
        this.speed = options.speed || 1
        this.acceleration = options.acceleration || 0.005
        this.x = x
        this.y = y
    }

    down()
    {
        this.speedX = this.speedY = 0
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
        const decelerate = this.parent.plugins['decelerate']
        if (this.parent.pointers.length === 0 && (!decelerate || (!decelerate.x && !decelerate.y)))
        {
            if (this.x !== this.parent.container.x)
            {
                const sign = (this.parent.container.x < this.x) ? 1 : -1
                this.parent.container.x += this.speedX * elapsed * sign
                if ((sign === 1 && this.parent.container.x > this.x) || (sign === -1 && this.parent.container.x < this.x))
                {
                    this.parent.container.x = this.x
                }
                if (this.speedX < this.speed)
                {
                    this.speedX += this.acceleration * elapsed
                    this.speedX = (this.speedX > this.speed) ? this.speed : this.speedX
                }
            }
            if (this.y !== this.parent.container.y)
            {
                const sign = (this.parent.container.y < this.y) ? 1 : -1
                this.parent.container.y += this.speedY * elapsed * sign
                if ((sign === 1 && this.parent.container.y > this.y) || (sign === -1 && this.parent.container.y < this.y))
                {
                    this.parent.container.y = this.y
                }
                if (this.speedY < this.speed)
                {
                    this.speedY += this.acceleration * elapsed
                    this.speedY = (this.speedY > this.speed) ? this.speed : this.speedY
                }
            }
        }
    }
}