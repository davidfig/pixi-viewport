const Plugin = require('./plugin')

module.exports = class HitArea extends Plugin
{
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