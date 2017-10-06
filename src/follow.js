const Plugin = require('./plugin')

module.exports = class Follow extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     */
    constructor(parent, target, options)
    {
        super(parent)
        options = options || {}
        this.speed = options.speed || 0
        this.target = target
        this.radius = options.radius
    }

    update()
    {
        if (this.radius)
        {
            const center = this.parent.center
            const distance = Math.sqrt(Math.pow(this.target.y - center.y, 2) + Math.pow(this.target.x - center.x, 2))
            if (distance > this.radius)
            {
                const angle = Math.atan2(this.target.y - center.y, this.target.x - center.x)
                this.parent.moveCenter(this.target.x - Math.cos(angle) * this.radius, this.target.y - Math.sin(angle) * this.radius)
            }
        }
        else if (this.speed)
        {
            const center = this.parent.center
            const deltaX = this.target.x - center.x
            const deltaY = this.target.y - center.y
            if (deltaX || deltaY)
            {
                const angle = Math.atan2(this.target.y - center.y, this.target.x - center.x)
                const changeX = Math.cos(angle) * this.speed
                const changeY = Math.sin(angle) * this.speed
                const x = Math.abs(changeX) > Math.abs(deltaX) ? this.target.x : center.x + changeX
                const y = Math.abs(changeY) > Math.abs(deltaY) ? this.target.y : center.y + changeY
                this.parent.moveCenter(x, y)
            }
        }
        else
        {
            this.parent.moveCenter(this.target.x, this.target.y)
        }
    }
}