const exists = require('exists')

const Plugin = require('./plugin')

module.exports = class Decelerate extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
     * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.95
        this.bounce = options.bounce || 0.5
        this.minSpeed = typeof options.minSpeed !== 'undefined' ? options.minSpeed : 0.01
        this.saved = []
    }

    down()
    {
        this.saved = []
        this.x = this.y = false

    }

    move()
    {
        if (this.paused)
        {
            return
        }

        const count = this.parent.countDownPointers()
        if (count === 1 || (count > 1 && !this.parent.plugins['pinch']))
        {
            this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() })
            if (this.saved.length > 60)
            {
                this.saved.splice(0, 30)
            }
        }
    }

    up()
    {
        if (this.parent.countDownPointers() === 0 && this.saved.length)
        {
            const now = performance.now()
            for (let save of this.saved)
            {
                if (save.time >= now - 100)
                {
                    const time = now - save.time
                    this.x = (this.parent.x - save.x) / time
                    this.y = (this.parent.y - save.y) / time
                    this.percentChangeX = this.percentChangeY = this.friction
                    break
                }
            }
        }
    }

    /**
     * manually activate plugin
     * @param {object} options
     * @param {number} [options.x]
     * @param {number} [options.y]
     */
    activate(options)
    {
        if (exists(options.x))
        {
            this.x = options.x
            this.percentChangeX = this.friction
        }
        if (exists(options.y))
        {
            this.y = options.y
            this.percentChangeY = this.friction
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }

        let moved
        if (this.x)
        {
            this.parent.x += this.x * elapsed
            this.x *= this.percentChangeX
            if (Math.abs(this.x) < this.minSpeed)
            {
                this.x = 0
            }
            moved = true
        }
        if (this.y)
        {
            this.parent.y += this.y * elapsed
            this.y *= this.percentChangeY
            if (Math.abs(this.y) < this.minSpeed)
            {
                this.y = 0
            }
            moved = true
        }
        if (moved)
        {
            this.parent.dirty = true
            this.parent.emit('moved', this.parent)
        }
    }

    reset()
    {
        this.x = this.y = null
    }
}