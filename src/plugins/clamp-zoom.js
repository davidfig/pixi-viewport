import { Plugin } from './plugin'

/**
 * @typedef {object} ClampZoomOptions
 * @property {number} [minWidth] minimum width
 * @property {number} [minHeight] minimum height
 * @property {number} [maxWidth] maximum width
 * @property {number} [maxHeight] maximum height
 */

const clampZoomOptions = {
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null
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

    clamp()
    {
        if (this.paused)
        {
            return
        }

        let width = this.parent.worldScreenWidth
        let height = this.parent.worldScreenHeight
        if (this.options.minWidth !== null && width < this.options.minWidth)
        {
            const original = this.parent.scale.x
            this.parent.fitWidth(this.options.minWidth, false, false, true)
            this.parent.scale.y *= this.parent.scale.x / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.options.maxWidth !== null && width > this.options.maxWidth)
        {
            const original = this.parent.scale.x
            this.parent.fitWidth(this.options.maxWidth, false, false, true)
            this.parent.scale.y *= this.parent.scale.x / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.options.minHeight !== null && height < this.options.minHeight)
        {
            const original = this.parent.scale.y
            this.parent.fitHeight(this.options.minHeight, false, false, true)
            this.parent.scale.x *= this.parent.scale.y / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.options.maxHeight !== null && height > this.options.maxHeight)
        {
            const original = this.parent.scale.y
            this.parent.fitHeight(this.options.maxHeight, false, false, true)
            this.parent.scale.x *= this.parent.scale.y / original
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
    }

    reset()
    {
        this.clamp()
    }
}
