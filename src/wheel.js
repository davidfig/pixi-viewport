const Plugin = require('./plugin')

module.exports = class Wheel extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp maximum width
     * @param {number} [options.maxHeight] clamp maximum height
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.percent = options.percent || 0.1
        this.center = options.center
        this.minWidth = options.minWidth
        this.maxWidth = options.maxWidth
        this.minHeight = options.minHeight
        this.maxHeight = options.maxHeight
    }

    clamp()
    {
        let x = this.parent.container.scale.x, y = this.parent.container.scale.y
        if (this.minWidth && this.parent.worldScreenWidth < this.minWidth)
        {
            x = this.minWidth / this.parent.worldWidth
        }
        if (this.minHeight && this.parent.worldScreenHeight < this.minHeight)
        {
            y = this.minHeight / this.parent.worldHeight
        }
        if (this.maxWidth && this.parent.worldScreenWidth > this.maxWidth)
        {
            x = this.parent.screenWidth / this.parent.worldWidth
        }
        if (this.maxHeight && this.parent.worldScreenHeight > this.maxHeight)
        {
            y = this.parent.screenHeight / this.parent.worldHeight
        }
        this.parent.container.scale.set(x, y)
    }

    wheel(dx, dy, dz, data)
    {
        const change = dy > 0 ? 1 + this.percent : (1 - this.percent)
        let point = { x: data.x, y: data.y }
        let oldPoint
        if (!this.center)
        {
            oldPoint = this.parent.container.toLocal(point)
        }
        this.parent.container.scale.x *= change
        this.parent.container.scale.y *= change
        this.clamp()

        if (this.center)
        {
            this.parent.moveCenter(this.center)
        }
        else
        {
            const newPoint = this.parent.container.toGlobal(oldPoint)
            this.parent.container.x += point.x - newPoint.x
            this.parent.container.y += point.y - newPoint.y
        }
        data.event.preventDefault()
    }
}