import { Plugin } from './plugin'

/**
 * There are a few ways to use clampZoom
 * 1. minWidth, maxWidth, minHeight, maxHeight = this clamps the zoom to in world-screen-sized pixels;
 *    maxWidth/Height is used to clamp the zoom out; ie, the minimum size of the world in screen pixels;
 *    minWidth/Height is used to clamp the zoom in; ie, the maximum size of the world in screen pixels;
 *    if you set independent=true, then the aspect ratio is not maintained (it is by default)
 * 2. minScale, maxScale = the minimum and maximum scale the viewport can zoom to; scale.x always equals scale.y
 * 3. minScaleX, maxScaleX, minScaleY, maxScaleY = the minimum and maximum scale the viewport can zoom to;
 *    scale.x and scale.y are independent
 *
 * @typedef {object} ClampZoomOptions
 * @property {number} [minWidth] minimum width
 * @property {number} [maxWidth] maximum width
 * @property {number} [minHeight] minimum height
 * @property {number} [maxHeight] maximum height
 * @property {boolean} [independent] x and y scale are independent (only used for minimum/maximum width/height)
 *
 * @property {number} [minScale] minimum scale
 * @property {number} [maxScale] minimum scale
 *
 * @property {number} [minScaleX] minimum scale for x-axis
 * @property {number} [maxScaleX] maximum scale for x-axis
 * @property {number} [minScaleY] minimum scale for y-axis
 * @property {number} [maxScaleY] maximum scale for y-axis
 */

const clampZoomOptions = {
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    minScale: null,
    maxScale: null,
    independent: false,
}

export class ClampZoom extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {ClampZoomOptions} [options]
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, clampZoomOptions, options)
        this.clamp()
    }

    resize()
    {
        this.clamp()
    }

    clamp() {
        if (this.paused) {
            return
        }

        if (this.options.minWidth || this.options.minHeight || this.options.maxWidth || this.options.maxHeight) {
            let width = this.parent.worldScreenWidth
            let height = this.parent.worldScreenHeight
            if (this.options.minWidth !== null && width < this.options.minWidth) {
                const original = this.parent.scale.x
                this.parent.fitWidth(this.options.minWidth, false, false, true)
                if (!this.options.independent) {
                    this.parent.scale.y *= this.parent.scale.x / original
                }
                width = this.parent.worldScreenWidth
                height = this.parent.worldScreenHeight
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
            }
            if (this.options.maxWidth !== null && width > this.options.maxWidth) {
                const original = this.parent.scale.x
                this.parent.fitWidth(this.options.maxWidth, false, false, true)
                if (!this.options.independent) {
                    this.parent.scale.y *= this.parent.scale.x / original
                }
                width = this.parent.worldScreenWidth
                height = this.parent.worldScreenHeight
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
            }
            if (this.options.minHeight !== null && height < this.options.minHeight) {
                const original = this.parent.scale.y
                this.parent.fitHeight(this.options.minHeight, false, false, true)
                if (!this.options.independent) {
                    this.parent.scale.x *= this.parent.scale.y / original
                }
                width = this.parent.worldScreenWidth
                height = this.parent.worldScreenHeight
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
            }
            if (this.options.maxHeight !== null && height > this.options.maxHeight) {
                const original = this.parent.scale.y
                this.parent.fitHeight(this.options.maxHeight, false, false, true)
                if (!this.options.independent) {
                    this.parent.scale.x *= this.parent.scale.y / original
                }
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
            }
        }
        else if (this.options.minScale || this.options.maxScale) {
            let scale = this.parent.scale.x
            if (this.options.minScale !== null && scale < this.options.minScale) {
                scale = this.options.minScale
            }
            if (this.options.maxScale !== null && scale > this.options.maxScale) {
                scale = this.options.maxScale
            }
            if (scale !== this.parent.scale.x) {
                this.parent.scale.set(scale)
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
            }
        } else {
            if (this.options.minScaleX || this.options.maxScaleX) {
                let scaleX = this.parent.scale.x
                if (this.options.minScaleX !== null && scaleX < this.options.minScaleX) {
                    scaleX = this.options.minScaleX
                } else if (this.options.maxScaleX !== null && scaleX > this.options.maxScaleX) {
                    scaleX = this.options.maxScaleX
                }
            }
            if (this.options.minScaleY || this.options.maxScaleY) {
                let scaleY = this.parent.scale.Y
                if (this.options.minScaleY !== null && scaleY < this.options.minScaleY) {
                    scaleY = this.options.minScaleY
                } else if (this.options.maxScaleY !== null && scaleY > this.options.maxScaleY) {
                    scaleY = this.options.maxScaleY
                }
            }
        }
    }

    reset() {
        this.clamp()
    }
}
