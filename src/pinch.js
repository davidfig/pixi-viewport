const Plugin = require('./plugin')

module.exports = class Pinch extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.noDrag] disable two-finger dragging
     * @param {number} [options.percent=1.0] percent to modify pinch speed
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp maximum width
     * @param {number} [options.maxHeight] clamp maximum height
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.percent = options.percent || 1.0
        this.noDrag = options.noDrag
        this.center = options.center
        this.minWidth = options.minWidth
        this.maxWidth = options.maxWidth
        this.minHeight = options.minHeight
        this.maxHeight = options.maxHeight
    }

    move(x, y, data)
    {
        if (this.paused)
        {
            return
        }

        const pointers = data.input.pointers
        if (pointers.length >= 2)
        {
            const first = pointers[0]
            const second = pointers[1]
            let last
            if (first.last && second.last)
            {
                last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
            }
            if (first.identifier === data.id)
            {
                first.last = { x, y }
            }
            else if (second.identifier === data.id)
            {
                second.last = { x, y }
            }
            if (last)
            {
                let oldPoint
                const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 }
                if (!this.center)
                {
                    oldPoint = this.parent.container.toLocal(point)
                }

                const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                const change = ((dist - last) / this.parent.screenWidth) * this.parent.container.scale.x * this.percent
                this.parent.container.scale.x += change
                this.parent.container.scale.y += change
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

                if (!this.noDrag && this.lastCenter)
                {
                    this.parent.container.x += point.x - this.lastCenter.x
                    this.parent.container.y += point.y - this.lastCenter.y
                }
                this.lastCenter = point
            }
            else
            {
                this.parent.emit('pinch-start', this.parent)
                this.pinching = true
            }
        }
    }

    up(x, y, data)
    {
        if (this.pinching)
        {
            const pointers = data.input.pointers
            if (pointers.length < 2)
            {
                this.lastCenter = null
                this.pinching = false
                this.parent.emit('pinch-end', this.parent)
            }
        }
    }
}