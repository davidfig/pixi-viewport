const Plugin = require('./plugin')

module.exports = class Decelerate extends Plugin
{
    /**
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

    move(x, y, data)
    {
        const pointers = data.input.pointers
        if (pointers.length === 1 || (pointers.length > 1 && !this.parent.plugin('pinch')))
        {
            this.saved.push({ x: this.parent.container.x, y: this.parent.container.y, time: performance.now() })
            if (this.saved.length > 60)
            {
                this.saved.splice(0, 30)
            }
        }
    }

    up(x, y, data)
    {
        const pointers = data.input.pointers
        if (pointers.length === 0 && this.saved.length)
        {
            const now = performance.now()
            for (let save of this.saved)
            {
                if (save.time >= now - 100)
                {
                    const time = now - save.time
                    this.x = (this.parent.container.x - save.x) / time
                    this.y = (this.parent.container.y - save.y) / time
                    this.percentChangeX = this.percentChangeY = this.friction
                    break
                }
            }
        }
    }

    update(elapsed)
    {
        if (this.x)
        {
            this.parent.container.x += this.x * elapsed
            this.x *= this.percentChangeX
            if (Math.abs(this.x) < this.minSpeed)
            {
                this.x = 0
            }
        }
        if (this.y)
        {
            this.parent.container.y += this.y * elapsed
            this.y *= this.percentChangeY
            if (Math.abs(this.y) < this.minSpeed)
            {
                this.y = 0
            }
        }
    }

    reset()
    {
        this.x = this.y = null
    }
}