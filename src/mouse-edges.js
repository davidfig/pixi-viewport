const utils =  require('./utils')
const Plugin = require('./plugin')

module.exports = class MouseEdges extends Plugin
{
    /**
     * Scroll viewport when mouse hovers near one of the edges.
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.radius] distance from center of screen in screen pixels
     * @param {number} [options.distance] distance from all sides in screen pixels
     * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
     * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
     * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
     * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
     * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
     * @param {boolean} [options.reverse] reverse direction of scroll
     * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
     * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
     *
     * @event mouse-edge-start(Viewport) emitted when mouse-edge starts
     * @event mouse-edge-end(Viewport) emitted when mouse-edge ends
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.options = options
        this.reverse = options.reverse ? 1 : -1
        this.noDecelerate = options.noDecelerate
        this.linear = options.linear
        this.radiusSquared = Math.pow(options.radius, 2)
        this.resize()
        this.speed = options.speed || 8
    }

    resize()
    {
        const options = this.options
        const distance = options.distance
        if (utils.exists(distance))
        {
            this.left = distance
            this.top = distance
            this.right = window.innerWidth - distance
            this.bottom = window.innerHeight - distance
        }
        else if (!this.radius)
        {
            this.left = utils.exists(options.left) ? options.left : null
            this.top = utils.exists(options.top) ? options.top : null
            this.right = utils.exists(options.right) ? window.innerWidth - options.right : null
            this.bottom = utils.exists(options.bottom) ? window.innerHeight - options.bottom : null
        }
    }

    down()
    {
        this.horizontal = this.vertical = null
    }

    move(e)
    {
        if ((e.data.identifier !== 'MOUSE' && e.data.identifier !== 1) || e.data.buttons !== 0)
        {
            return
        }
        const x = e.data.global.x
        const y = e.data.global.y

        if (this.radiusSquared)
        {
            const center = this.parent.toScreen(this.parent.center)
            const distance = Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2)
            if (distance >= this.radiusSquared)
            {
                const angle = Math.atan2(center.y - y, center.x - x)
                if (this.linear)
                {
                    this.horizontal = Math.round(Math.cos(angle)) * this.speed * this.reverse * (60 / 1000)
                    this.vertical = Math.round(Math.sin(angle)) * this.speed * this.reverse * (60 / 1000)
                }
                else
                {
                    this.horizontal = Math.cos(angle) * this.speed * this.reverse * (60 / 1000)
                    this.vertical = Math.sin(angle) * this.speed * this.reverse * (60 / 1000)
                }
            }
            else
            {
                if (this.horizontal)
                {
                    this.decelerateHorizontal()
                }
                if (this.vertical)
                {
                    this.decelerateVertical()
                }
                this.horizontal = this.vertical = 0
            }
        }
        else
        {
            if (utils.exists(this.left) && x < this.left)
            {
                this.horizontal = 1 * this.reverse * this.speed * (60 / 1000)
            }
            else if (utils.exists(this.right) && x > this.right)
            {
                this.horizontal = -1 * this.reverse * this.speed * (60 / 1000)
            }
            else
            {
                this.decelerateHorizontal()
                this.horizontal = 0
            }
            if (utils.exists(this.top) && y < this.top)
            {
                this.vertical = 1 * this.reverse * this.speed * (60 / 1000)
            }
            else if (utils.exists(this.bottom) && y > this.bottom)
            {
                this.vertical = -1 * this.reverse * this.speed * (60 / 1000)
            }
            else
            {
                this.decelerateVertical()
                this.vertical = 0
            }
        }
    }

    decelerateHorizontal()
    {
        const decelerate = this.parent.plugins['decelerate']
        if (this.horizontal && decelerate && !this.noDecelerate)
        {
            decelerate.activate({ x: (this.horizontal * this.speed * this.reverse) / (1000 / 60) })
        }
    }

    decelerateVertical()
    {
        const decelerate = this.parent.plugins['decelerate']
        if (this.vertical && decelerate && !this.noDecelerate)
        {
            decelerate.activate({ y: (this.vertical * this.speed * this.reverse) / (1000 / 60)})
        }
    }

    up()
    {
        if (this.horizontal)
        {
            this.decelerateHorizontal()
        }
        if (this.vertical)
        {
            this.decelerateVertical()
        }
        this.horizontal = this.vertical = null
    }

    update()
    {
        if (this.paused)
        {
            return
        }

        if (this.horizontal || this.vertical)
        {
            const center = this.parent.center
            if (this.horizontal)
            {
                center.x += this.horizontal * this.speed
            }
            if (this.vertical)
            {
                center.y += this.vertical * this.speed
            }
            this.parent.moveCenter(center)
            this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' })
        }
    }
}