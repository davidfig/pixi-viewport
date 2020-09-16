import { Plugin } from './plugin'

/**
 * the default event listener for 'wheel' event is document.body. Use `Viewport.options.divWheel` to change this default
 * @typedef WheelOptions
 * @property {number} [percent=0.1] percent to scroll with each spin
 * @property {number} [smooth] smooth the zooming by providing the number of frames to zoom between wheel spins
 * @property {boolean} [interrupt=true] stop smoothing with any user input on the viewport
 * @property {boolean} [reverse] reverse the direction of the scroll
 * @property {PIXI.Point} [center] place this point at center during zoom instead of current mouse position
 * @property {number} [lineHeight=20] scaling factor for non-DOM_DELTA_PIXEL scrolling events
 */

const wheelOptions = {
    percent: 0.1,
    smooth: false,
    interrupt: true,
    reverse: false,
    center: null,
    lineHeight: 20
}

export class Wheel extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {WheelOptions} [options]
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    constructor(parent, options = {}) {
        super(parent)
        this.options = Object.assign({}, wheelOptions, options)
    }

    down() {
        if (this.options.interrupt) {
            this.smoothing = null
        }
    }

    update() {
        if (this.smoothing) {
            const point = this.smoothingCenter
            const change = this.smoothing
            let oldPoint
            if (!this.options.center) {
                oldPoint = this.parent.toLocal(point)
            }
            this.parent.scale.x += change.x
            this.parent.scale.y += change.y
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' })
            const clamp = this.parent.plugins.get('clamp-zoom', true)
            if (clamp) {
                clamp.clamp()
            }
            if (this.options.center) {
                this.parent.moveCenter(this.options.center)
            }
            else {
                const newPoint = this.parent.toGlobal(oldPoint)
                this.parent.x += point.x - newPoint.x
                this.parent.y += point.y - newPoint.y
            }
            this.parent.emit('moved', { viewport: this.parent, type: 'wheel' })
            this.smoothingCount++
            if (this.smoothingCount >= this.options.smooth) {
                this.smoothing = null
            }
        }
    }

    wheel(e) {
        if (this.paused) {
            return
        }

        let point = this.parent.input.getPointerPosition(e)
        const sign = this.options.reverse ? -1 : 1
        const step = sign * -e.deltaY * (e.deltaMode ? this.options.lineHeight : 1) / 500
        const change = Math.pow(2, (1 + this.options.percent) * step)
        if (this.options.smooth) {
            const original = {
                x: this.smoothing ? this.smoothing.x * (this.options.smooth - this.smoothingCount) : 0,
                y: this.smoothing ? this.smoothing.y * (this.options.smooth - this.smoothingCount) : 0
            }
            this.smoothing = {
                x: ((this.parent.scale.x + original.x) * change - this.parent.scale.x) / this.options.smooth,
                y: ((this.parent.scale.y + original.y) * change - this.parent.scale.y) / this.options.smooth
            }
            this.smoothingCount = 0
            this.smoothingCenter = point
        }
        else {
            let oldPoint
            if (!this.options.center) {
                oldPoint = this.parent.toLocal(point)
            }
            this.parent.scale.x *= change
            this.parent.scale.y *= change
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' })
            const clamp = this.parent.plugins.get('clamp-zoom', true)
            if (clamp) {
                clamp.clamp()
            }
            if (this.options.center) {
                this.parent.moveCenter(this.options.center)
            }
            else {
                const newPoint = this.parent.toGlobal(oldPoint)
                this.parent.x += point.x - newPoint.x
                this.parent.y += point.y - newPoint.y
            }
        }
        this.parent.emit('moved', { viewport: this.parent, type: 'wheel' })
        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent })
        if (!this.parent.options.passiveWheel) {
            return true
        }
    }
}
