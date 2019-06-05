import { Plugin } from './plugin'

/**
 * @typedef WheelOptions
 * @property {number} [percent=0.1] percent to scroll with each spin
 * @property {number} [smooth] smooth the zooming by providing the number of frames to zoom between wheel spins
 * @property {boolean} [interrupt=true] stop smoothing with any user input on the viewport
 * @property {boolean} [reverse] reverse the direction of the scroll
 * @property {PIXI.Point} [center] place this point at center during zoom instead of current mouse position
 */

const wheelOptions = {
    percet: 0.1,
    smooth: false,
    interrupt: true,
    reverse: false,
    center: null
}

export class Wheel extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {WheelOptions} [options]
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, wheelOptions, options)
    }

    down()
    {
        if (this.options.interrupt)
        {
            this.options.smoothing = null
        }
    }

    update()
    {
        if (this.options.smoothing)
        {
            const point = this.options.smoothingCenter
            const change = this.options.smoothing
            let oldPoint
            if (!this.options.center)
            {
                oldPoint = this.parent.toLocal(point)
            }
            this.parent.scale.x += change.x
            this.parent.scale.y += change.y
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' })
            const clamp = this.parent.plugins.get('clamp-zoom')
            if (clamp)
            {
                clamp.clamp()
            }
            if (this.options.center)
            {
                this.parent.moveCenter(this.options.center)
            }
            else
            {
                const newPoint = this.parent.toGlobal(oldPoint)
                this.parent.x += point.x - newPoint.x
                this.parent.y += point.y - newPoint.y
            }
            this.options.smoothingCount++
            if (this.options.smoothingCount >= this.options.smooth)
            {
                this.options.smoothing = null
            }
        }
    }

    wheel(e)
    {
        if (this.paused)
        {
            return
        }

        let point = this.parent.input.getPointerPosition(e)
        const sign = this.options.reverse ? -1 : 1
        const step = sign * -e.deltaY * (e.deltaMode ? 120 : 1) / 500
        const change = Math.pow(2, (1 + this.options.percent) * step)
        if (this.options.smooth)
        {
            const original = {
                x: this.options.smoothing ? this.options.smoothing.x * (this.options.smooth - this.options.smoothingCount) : 0,
                y: this.options.smoothing ? this.options.smoothing.y * (this.options.smooth - this.options.smoothingCount) : 0
            }
            this.options.smoothing = {
                x: ((this.parent.scale.x + original.x) * change - this.parent.scale.x) / this.options.smooth,
                y: ((this.parent.scale.y + original.y) * change - this.parent.scale.y) / this.options.smooth
            }
            this.options.smoothingCount = 0
            this.options.smoothingCenter = point
        }
        else
        {
            let oldPoint
            if (!this.options.center)
            {
                oldPoint = this.parent.toLocal(point)
            }
            this.parent.scale.x *= change
            this.parent.scale.y *= change
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' })
            const clamp = this.parent.plugins.get('clamp-zoom')
            if (clamp)
            {
                clamp.clamp()
            }
            if (this.options.center)
            {
                this.parent.moveCenter(this.options.center)
            }
            else
            {
                const newPoint = this.parent.toGlobal(oldPoint)
                this.parent.x += point.x - newPoint.x
                this.parent.y += point.y - newPoint.y
            }
        }
        this.parent.emit('moved', { viewport: this.parent, type: 'wheel' })
        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent})
        if (!this.parent.passiveWheel)
        {
            e.preventDefault()
        }
    }
}