const Plugin = require('./plugin')

module.exports = class Wheel extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {boolean} [options.reverse] reverse the direction of the scroll
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     *
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.percent = options.percent || 0.1
        this.center = options.center
        this.reverse = options.reverse
    }

    wheel(e)
    {
        if (this.paused)
        {
            return
        }

        let change
        if (this.reverse)
        {
            change = e.deltaY > 0 ? 1 + this.percent : 1 - this.percent
        }
        else
        {
            change = e.deltaY > 0 ? 1 - this.percent : 1 + this.percent
        }
        let point = { x: e.clientX, y: e.clientY }
        let oldPoint
        if (!this.center)
        {
            oldPoint = this.parent.toLocal(point)
        }
        this.parent.scale.x *= change
        this.parent.scale.y *= change
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
            const newPoint = this.parent.toGlobal(oldPoint)
            this.parent.x += point.x - newPoint.x
            this.parent.y += point.y - newPoint.y
        }
        e.preventDefault()
        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent})
    }
}