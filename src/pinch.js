const Plugin = require('./plugin')

module.exports = class Pinch extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.clampScreen] clamp minimum zoom to size of screen
     * @param {number} [options.minWidth] clamp minimum width
     * @param {number} [options.minHeight] clamp minimum height
     * @param {number} [options.maxWidth] clamp minimum width
     * @param {number} [options.maxHeight] clamp minimum height
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.clampScreen = options.clampScreen
        this.minWidth = options.minWidth
        this.maxWidth = options.maxWidth
        this.minHeight = options.minHeight
        this.maxHeight = options.maxHeight
    }

    clamp()
    {
        let x = this.parent.container.scale.x, y = this.parent.container.scale.y
        const width = this.parent.container.scale.x * this.parent.worldWidth
        const height = this.parent.container.scale.y * this.parent.worldHeight
        if (this.minZoom)
        {
            if (this.minWidth && width < this.minWidth)
            {
                x = this.minWidth / this.parent.worldWidth
            }
            if (typeof this.minHeight !== 'undefined' && height < this.minHeight)
            {
                y = this.minHeight / this.parent.worldHeight
            }
        }
        if (this.maxZoom)
        {
            if (typeof this.maxWidth !== 'undefined' && width > this.maxWidth)
            {
                x = this.maxWidth / this.parent.worldWidth
            }
            if (typeof this.maxHeight !== 'undefined' && height > this.maxHeight)
            {
                y = this.maxHeight / this.worldHeight
            }
        }
        if (this.clampScreen)
        {
            if (width < this.parent.screenWidth)
            {
                x = this.parent.screenWidth / this.parent.worldWidth
            }
            if (height < this.parent.screenHeight)
            {
                y = this.parent.screenHeight / this.parent.worldHeight
            }
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
                const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 }
                const oldPoint = this.parent.container.toLocal(point)

                const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                const change = ((dist - last) / this.parent.screenWidth) * this.parent.container.scale.x
                this.parent.container.scale.x += change
                this.parent.container.scale.y += change

                if (this.clampScreen || this.minWidth || this.maxWidth || this.minHeight || this.maxHeight)
                {
                    this.clampZoom()
                }
                const newPoint = this.parent.container.toGlobal(oldPoint)

                this.parent.container.x += point.x - newPoint.x
                this.parent.container.y += point.y - newPoint.y

                if (this.lastCenter)
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