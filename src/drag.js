const Plugin = require('./plugin')

module.exports = class Drag extends Plugin
{
    constructor(parent)
    {
        super(parent)
        this.moved = false
    }

    down(x, y, data)
    {
        if (this.paused)
        {
            return
        }
        const pointers = data.input.pointers
        if (pointers.length === 1)
        {
            this.last = { x, y }
        }
    }

    move(x, y, data)
    {
        if (this.paused)
        {
            return
        }

        if (this.last)
        {
            const pointers = data.input.pointers
            if (pointers.length === 1 || (pointers.length > 1 && !this.parent.plugins['pinch']))
            {
                const distX = x - this.last.x
                const distY = y - this.last.y
                if (this.moved || (this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY)))
                {
                    this.parent.container.x += distX
                    this.parent.container.y += distY
                    this.last = { x, y }
                    if (!this.moved)
                    {
                        this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
                    }
                    this.moved = true
                    this.parent.dirty = true
                }
            }
            else
            {
                this.moved = false
            }
        }
    }

    up()
    {
        if (this.last && this.moved)
        {
            this.parent.emit('drag-end', {screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
            this.moved = false
        }
        this.last = null
    }

    resume()
    {
        this.last = null
        this.paused = false
    }
}
