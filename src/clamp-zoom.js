const Plugin = require('./plugin')

module.exports = class ClampZoom extends Plugin
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
            this.parent.fitWidth(this.minWidth)
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
        }
        if (this.maxWidth && width > this.maxWidth)
        {
            this.parent.fitWidth(this.maxWidth)
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
        }
        if (this.minHeight && height < this.minHeight)
        {
            this.parent.fitHeight(this.minHeight)
            width = this.parent.worldScreenWidth
            height = this.parent.worldScreenHeight
        }
        if (this.maxHeight && height > this.maxHeight)
        {
            this.parent.fitHeight(this.maxHeight)
        }
    }
}
