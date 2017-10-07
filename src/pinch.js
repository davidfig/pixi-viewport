const Plugin = require('./plugin')

module.exports = class Pinch extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.noDrag] disable two-finger dragging
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
        this.noDrag = options.noDrag
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

    move(e)
    {
        if (this.parent.pointers.length >= 2)
        {
            const first = this.parent.pointers[0]
            const second = this.parent.pointers[1]
            const last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
            if (first.id === e.data.pointerId)
            {
                first.last = { x: e.data.global.x, y: e.data.global.y }
            }
            else if (second.id === e.data.pointerId)
            {
                second.last = { x: e.data.global.x, y: e.data.global.y }
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
                const change = ((dist - last) / this.parent.screenWidth) * this.parent.container.scale.x
                this.parent.container.scale.x += change
                this.parent.container.scale.y += change
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

                if (!this.noDrag && this.lastCenter)
                {
                    this.parent.container.x += point.x - this.lastCenter.x
                    this.parent.container.y += point.y - this.lastCenter.y
                }
                this.lastCenter = point
            }
        }
    }

    up()
    {
        if (this.parent.pointers.length < 2)
        {
            this.lastCenter = null
        }
    }
}