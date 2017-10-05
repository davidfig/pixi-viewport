const Plugin = require('./plugin')

module.exports = class clamp extends Plugin
{
    /**
     * @param {string} [direction=all] (all, x, or y)
     */
    constructor(parent, direction)
    {
        super(parent)
        switch (direction)
        {
            case 'x':
                this.x = true
                break
            case 'y':
                this.y = true
                break
            default:
                this.x = this.y = true
                break
        }
        this.move()
    }

    move()
    {
        this.update()
    }

    update()
    {
        const oob = this.parent.OOB()
        const point = oob.cornerPoint
        const decelerate = this.parent.plugin('decelerate') || {}
        if (this.x)
        {
            if (oob.left)
            {
                this.parent.container.x = 0
                decelerate.x = 0
            }
            else if (oob.right)
            {
                this.parent.container.x += (point.x - this.parent.worldWidth)
                decelerate.x = 0
            }
        }
        if (this.y)
        {
            if (oob.top)
            {
                this.parent.container.y = 0
                decelerate.y = 0
            }
            else if (oob.bottom)
            {
                this.parent.container.y += (point.y - this.parent.worldHeight)
                decelerate.y = 0
            }
        }
    }
}