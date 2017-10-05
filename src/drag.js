const Plugin = require('./plugin')

module.exports = class Drag extends Plugin
{
    constructor(parent)
    {
        super(parent)
    }

    move(e)
    {
        if (this.parent.pointers.length === 1 || (this.parent.pointers.length > 1 && !this.parent.plugin('pinch')))
        {
            const last = this.parent.pointers[0].last
            const pos = e.data.global
            const distX = pos.x - last.x
            const distY = pos.y - last.y
            if (this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY))
            {
                this.parent.container.x += distX
                this.parent.container.y += distY
                this.parent.pointers[0].last = { x: pos.x, y: pos.y }
                this.inMove = true
            }
        }
    }
}