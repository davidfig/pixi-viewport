const Plugin = require('./plugin')

module.exports = class Drag extends Plugin
{
    constructor(parent)
    {
        super(parent)
    }

    down(x, y, data)
    {
        const pointers = data.input.pointers
        if (pointers.length === 1)
        {
            this.last = { x, y }
        }
    }

    move(x, y, data)
    {
        if (!this.last)
        {
            this.last = { x, y }
        }
        else
        {
            const pointers = data.input.pointers
            if (pointers.length === 1 || (pointers.length > 1 && !this.parent.plugin('pinch')))
            {
                const distX = x - this.last.x
                const distY = y - this.last.y
                if (this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY))
                {
                    this.parent.container.x += distX
                    this.parent.container.y += distY
                    this.last = { x, y }
                    this.inMove = true
                }
            }
        }
    }

    up()
    {
        this.last = null
    }
}