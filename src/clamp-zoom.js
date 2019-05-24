import { Plugin } from './plugin'

export class ClampZoom extends Plugin
{
    /**
     * @private
     * @param {object} [options]
     * @param {number} [options.minWidth] minimum width
     * @param {number} [options.minHeight] minimum height
     * @param {number} [options.maxWidth] maximum width
     * @param {number} [options.maxHeight] maximum height
     */
    constructor(parent, options)
    {
        super(parent)
        this.minWidth = options.minWidth
        this.minHeight = options.minHeight
        this.maxWidth = options.maxWidth
        this.maxHeight = options.maxHeight
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
        if (this.minWidth && width < this.minWidth)
        {
            const original = this.parent.scale.x
            this.parent.fitWidth(this.minWidth, false, false, true)
            this.parent.scale.y *= this.parent.scale.x / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.maxWidth && width > this.maxWidth)
        {
            const original = this.parent.scale.x
            this.parent.fitWidth(this.maxWidth, false, false, true)
            this.parent.scale.y *= this.parent.scale.x / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.minHeight && height < this.minHeight)
        {
            const original = this.parent.scale.y
            this.parent.fitHeight(this.minHeight, false, false, true)
            this.parent.scale.x *= this.parent.scale.y / original
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
        if (this.maxHeight && height > this.maxHeight)
        {
            const original = this.parent.scale.y
            this.parent.fitHeight(this.maxHeight, false, false, true)
            this.parent.scale.x *= this.parent.scale.y / original
            this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' })
        }
    }
}
