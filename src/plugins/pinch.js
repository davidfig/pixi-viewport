import { Plugin } from './plugin'

/**
 * @typedef {object} PinchOptions
 * @property {boolean} [noDrag] disable two-finger dragging
 * @property {number} [percent=1.0] percent to modify pinch speed
 * @property {PIXI.Point} [center] place this point at center during zoom instead of center of two fingers
 */

const pinchOptions = {
    noDrag: false,
    percent: 1.0,
    center: null
}

export class Pinch extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {PinchOptions} [options]
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, pinchOptions, options)
    }

    down()
    {
        if (this.parent.input.count() >= 2)
        {
            this.active = true
            return true
        }
    }

    move(e)
    {
        if (this.paused || !this.active)
        {
            return
        }

        const x = e.data.global.x
        const y = e.data.global.y

        const pointers = this.parent.input.touches
        if (pointers.length >= 2)
        {
            const first = pointers[0]
            const second = pointers[1]
            const last = (first.last && second.last) ? Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2)) : null
            if (first.id === e.data.pointerId)
            {
                first.last = { x, y, data: e.data }
            }
            else if (second.id === e.data.pointerId)
            {
                second.last = { x, y, data: e.data }
            }
            if (last)
            {
                let oldPoint
                const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 }
                if (!this.options.center)
                {
                    oldPoint = this.parent.toLocal(point)
                }
                const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                const change = ((dist - last) / this.parent.screenWidth) * this.parent.scale.x * this.options.percent
                this.parent.scale.x += change
                this.parent.scale.y += change
                this.parent.emit('zoomed', { viewport: this.parent, type: 'pinch' })
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
                    this.parent.emit('moved', { viewport: this.parent, type: 'pinch' })
                }
                if (!this.options.noDrag && this.lastCenter)
                {
                    this.parent.x += point.x - this.lastCenter.x
                    this.parent.y += point.y - this.lastCenter.y
                    this.parent.emit('moved', { viewport: this.parent, type: 'pinch' })
                }
                this.lastCenter = point
                this.moved = true
            }
            else
            {
                if (!this.pinching)
                {
                    this.parent.emit('pinch-start', this.parent)
                    this.pinching = true
                }
            }
            return true
        }
    }

    up()
    {
        if (this.pinching)
        {
            if (this.parent.input.touches.length <= 1)
            {
                this.active = false
                this.lastCenter = null
                this.pinching = false
                this.moved = false
                this.parent.emit('pinch-end', this.parent)
                return true
            }
        }
    }
}