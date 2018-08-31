const Plugin = require('./plugin')

module.exports = class Wheel extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {number} [options.smooth] smooth the zooming by providing the maximum percent/frame (which should be less than options.percent)
     * @param {boolean} [options.interrupt=true] stop smoothing with any user input on the viewport
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
        this.smooth = options.smooth
        this.interrupt = typeof options.interrupt === 'undefined' ? true : options.interrupt
    }

    down()
    {
        if (this.interrupt)
        {
            this.smoothing = false
        }
    }

    update()
    {
        if (this.smoothing)
        {
            let smooth = Math.abs(this.smoothing) < this.smooth ? this.smoothing : Math.sign(this.smoothing) * this.smooth
            this.smoothing -= smooth
            this.zoom(1 + smooth, this.smoothingPoint)
        }
    }

    zoom(change, point)
    {
        let oldPoint
        if (!this.center)
        {
            oldPoint = this.parent.toLocal(point)
        }
        this.parent.scale.x *= change
        this.parent.scale.y *= change
        this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' })
        const clamp = this.parent.plugins['clamp-zoom']
        if (clamp)
        {
            clamp.clamp()
            this.smoothing = false
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
    }

    wheel(e)
    {
        if (this.paused)
        {
            return
        }

        let point = this.parent.getPointerPosition(e)
        let sign
        if (this.reverse)
        {
            sign = e.deltaY > 0 ? 1 : -1
        }
        else
        {
            sign = e.deltaY < 0 ? 1 : -1
        }
        if (this.smooth)
        {
            this.smoothing = this.percent * sign
            this.smoothingPoint = point
        }
        else
        {
            const change = 1 + this.percent * sign
            this.zoom(change, point)
        }
        this.parent.emit('moved', { viewport: this.parent, type: 'wheel' })
        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent})
        e.preventDefault()
    }
}