const Plugin = require('./plugin')

module.exports = class Wheel extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {boolean} [options.reverse] reverse the direction of the scroll
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp maximum width
     * @param {number} [options.maxHeight] clamp maximum height
     *
     * @event wheel({wheel: {dx, dy, dz}, viewport})
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
        this.reverse = options.reverse
    }

    wheel(dx, dy, dz, data)
    {
        if (this.paused)
        {
            return
        }

        let change
        if (this.reverse)
        {
            change = dy > 0 ? 1 + this.percent : 1 - this.percent
        }
        else
        {
            change = dy > 0 ? 1 - this.percent : 1 + this.percent
        }
        let point = { x: data.x, y: data.y }
        let oldPoint
        if (!this.center)
        {
            oldPoint = this.parent.container.toLocal(point)
        }
        this.parent.container.scale.x *= change
        this.parent.container.scale.y *= change
        const clamp = this.parent.plugins['clamp-zoom']
        if (clamp)
        {
            clamp.clamp()
        }

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
        this.parent.emit('wheel', { wheel: {dx, dy, dz}, viewport: this.parent})
    }
}