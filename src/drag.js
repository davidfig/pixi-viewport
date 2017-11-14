const exists = require('exists')

const Plugin = require('./plugin')
module.exports = class Drag extends Plugin
{
    /**
     * enable one-finger touch to drag
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        this.moved = false
        this.wheelActive = exists(options.wheel) ? options.wheel : true
        this.wheelScroll = options.wheelScroll || 1
        this.reverse = options.reverse ? 1 : -1
        this.clampWheel = options.clampWheel
    }

    down(x, y)
    {
        if (this.paused)
        {
            return
        }
        const pointers = this.parent.pointers
        if (pointers.length === 1)
        {
            this.last = { x, y }
            return true
        }
    }

    get active()
    {
        return this.last ? true : false
    }

    move(x, y)
    {
        if (this.paused)
        {
            return
        }

        if (this.last)
        {
            const pointers = this.parent.pointers
            if (pointers.length === 1 || (pointers.length > 1 && !this.parent.plugins['pinch']))
            {
                const distX = x - this.last.x
                const distY = y - this.last.y
                if (this.moved || (this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY)))
                {
                    this.parent.container.x += distX
                    this.parent.container.y += distY
                    this.last = { x, y }
                    if (!this.moved)
                    {
                        this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
                    }
                    this.moved = true
                    this.parent.dirty = true
                }
            }
            else
            {
                this.moved = false
            }
        }
    }

    up()
    {
        if (this.last && this.moved)
        {
            this.parent.emit('drag-end', {screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
            this.moved = false
        }
        this.last = null
    }

    wheel(dx, dy)
    {
        if (this.paused)
        {
            return
        }

        if (this.wheelActive)
        {
            const wheel = this.parent.plugins['wheel']
            if (!wheel)
            {
                this.parent.container.x += dx * this.wheelScroll * this.reverse
                this.parent.container.y += dy * this.wheelScroll * this.reverse
                if (this.clampWheel)
                {
                    this.clamp()
                }
                this.parent.emit('wheel-scroll', this.parent)
                this.parent.dirty = true
                return true
            }
        }
    }

    resume()
    {
        this.last = null
        this.paused = false
    }

    clamp()
    {
console.log('clamping...')
        const oob = this.parent.OOB()
        const point = oob.cornerPoint
        if (this.clampWheel !== 'y')
        {
            if (oob.left)
            {
                this.parent.container.x = 0
            }
            else if (oob.right)
            {
                this.parent.container.x = -point.x
            }
        }
        if (this.clampWheel !== 'x')
        {
            if (oob.top)
            {
                this.parent.container.y = 0
            }
            else if (oob.bottom)
            {
                this.parent.container.y = -point.y
            }
        }
    }
}