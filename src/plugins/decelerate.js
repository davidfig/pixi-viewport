import { Plugin } from './plugin'

/**
 * @typedef {object} DecelerateOptions
 * @property {number} [friction=0.95] percent to decelerate after movement
 * @property {number} [bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
 * @property {number} [minSpeed=0.01] minimum velocity before stopping/reversing acceleration
 */

const decelerateOptions = {
    friction: 0.95,
    bounce: 0.8,
    minSpeed: 0.01
}

export class Decelerate extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {DecelerateOptions} [options]
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, decelerateOptions, options)
        this.saved = []
        this.reset()
        this.parent.on('moved', data => this.moved(data))
    }

    destroy()
    {
        this.parent
    }

    down()
    {
        this.saved = []
        this.x = this.y = false
    }

    isActive()
    {
        return this.x || this.y
    }

    move()
    {
        if (this.paused)
        {
            return
        }

        const count = this.parent.input.count()
        if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch')))
        {
            this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() })
            if (this.saved.length > 60)
            {
                this.saved.splice(0, 30)
            }
        }
    }

    moved(data)
    {
        if (this.saved.length)
        {
            const last = this.saved[this.saved.length - 1]
            if (data.type === 'clamp-x')
            {
                if (last.x === data.original.x)
                {
                    last.x = this.parent.x
                }
            }
            else if (data.type === 'clamp-y')
            {
                if (last.y === data.original.y)
                {
                    last.y = this.parent.y
                }
            }
        }
    }

    up()
    {
        if (this.parent.input.count() === 0 && this.saved.length)
        {
            const now = performance.now()
            for (let save of this.saved)
            {
                if (save.time >= now - 100)
                {
                    const time = now - save.time
                    this.x = (this.parent.x - save.x) / time
                    this.y = (this.parent.y - save.y) / time
                    this.percentChangeX = this.percentChangeY = this.options.friction
                    break
                }
            }
        }
    }

    /**
     * manually activate plugin
     * @param {object} options
     * @param {number} [options.x]
     * @param {number} [options.y]
     */
    activate(options)
    {
        options = options || {}
        if (typeof options.x !== 'undefined')
        {
            this.x = options.x
            this.percentChangeX = this.options.friction
        }
        if (typeof options.y !== 'undefined')
        {
            this.y = options.y
            this.percentChangeY = this.options.friction
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }

        let moved
        if (this.x)
        {
            this.parent.x += this.x * elapsed
            this.x *= this.percentChangeX
            if (Math.abs(this.x) < this.options.minSpeed)
            {
                this.x = 0
            }
            moved = true
        }
        if (this.y)
        {
            this.parent.y += this.y * elapsed
            this.y *= this.percentChangeY
            if (Math.abs(this.y) < this.options.minSpeed)
            {
                this.y = 0
            }
            moved = true
        }
        if (moved)
        {
            this.parent.emit('moved', { viewport: this.parent, type: 'decelerate' })
        }
    }

    reset()
    {
        this.x = this.y = null
    }
}