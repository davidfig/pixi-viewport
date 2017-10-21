const Plugin = require('./plugin')

module.exports = class HitArea extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {PIXI.Rectangle} [rect] if no rect is provided, it will use the value of container.getBounds()
     */
    constructor(parent, rect)
    {
        super(parent)
        this.rect = rect
        this.resize()
    }

    resize()
    {
        this.parent.container.hitArea = this.rect || this.parent.container.getBounds()
    }
}