const PIXI = require('pixi.js')
const Penner = require('penner')

module.exports = class Viewport extends PIXI.Container
{
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {PIXI.Rectangle} worldBoundaries
     * @param {object} [options]
     * @param {boolean} [options.dragToMove]
     * @param {boolean} [options.pinchToZoom] automatically turns on dragToMove
     * @param {boolean} [options.noOverDrag] stops scroll beyond boundaries
     * @param {boolean|number} [options.bounce=150] bounce back if pulled beyond boundaries, number is milliseconds to bounce back
     * @param {string} [options.bounceEase='linear'] easing function to use when bouncing (see https://github.com/bcherny/penner)
     * @param {boolean} [options.noUpdate] set to true to manually call update function, otherwise internally calls requestAnimationFrame
     * @param {number} [options.friction=0] percent to deaccelerate after movement (0 === no movement)
     */
    constructor(screenWidth, screenHeight, worldBoundaries, options)
    {
        super()
        this.options = options || {}
        if (this.options.bounce)
        {
            this.bounce = this.options.bounce
        }
        this.pointers = []
        this.listeners()
        this.hitArea = worldBoundaries
        this._worldBoundaries = worldBoundaries
        this.resize(screenWidth, screenHeight)
    }

    set worldBoundaries(value)
    {
        this._worldBoundaries = value
        this.hitArea = value
    }
    get worldBoundaries() { return this._worldBoundaries }

    set noOverDrag(value)
    {
        this.options.noOverDrag = value
        if (value) this.clamp()
        this.listeners()
    }
    get noOverDrag() { return this.options.noOverDrag }

    set pinchToZoom(value)
    {
        this.options.pinchToZoom = value
        this.listeners()
    }
    get pinchToZoom() { return this.options.pinchToZoom }

    set dragToMove(value)
    {
        this.options.dragToMove = value
        this.listeners()
    }
    get dragToMove() { return this.options.dragToMove }

    set bounce(value)
    {
        this.options.bounce = (value === true) ? 150 : value
        if (!value)
        {
            this.to = null
        }
        this.bounceEasing = Penner[this.options.bounceEase] || Penner['linear']
    }
    get bounce() { return this.options.bounce }

    set bounceEase(value)
    {
        this.options.bounceEase = value
        this.bounceEasing = Penner[value] || Penner['linear']
    }
    get bounceEase()
    {
        return this.options.bounceEase
    }

    set noUpdate(value) { this.options.noUpdate = value }
    get noUpdate() { return this.options.noUpdate }

    set friction(value) { this.options.friction = value }
    get friction() { return this.options.friction }

    listeners()
    {
        if (this.options.dragToMove || this.options.pinchToZoom)
        {
            if (!this.interactive)
            {
                this.interactive = true
                this.on('pointerdown', this.down.bind(this))
                this.on('pointermove', this.move.bind(this))
                this.on('pointerup', this.up.bind(this))
                this.on('pointercancel', this.up.bind(this))
                this.on('pointerupoutside', this.up.bind(this))
            }
        }
        else
        {
            if (this.interactive)
            {
                this.interactive = false
                this.removeListener('pointerdown', this.down.bind(this))
                this.removeListener('pointermove', this.move.bind(this))
                this.removeListener('pointerup', this.up.bind(this))
                this.removeListener('pointercancel', this.up.bind(this))
                this.removeListener('pointerupoutside', this.up.bind(this))
            }
        }
    }

    down(e)
    {
        this.deaccelerating = false
        this.to = null
        this.pointers.push({ id: e.data.pointerId, last: e.data.global })
        if (this.options.friction)
        {
            this.velocity = { time: performance.now() }
        }
    }

    resize(screenWidth, screenHeight)
    {
        this.w = screenWidth
        this.h = screenHeight
    }

    move(e)
    {
        if (this.pointers.length)
        {
            if (this.pointers.length === 1 || !this.pinchToZoom)
            {
                const last = this.pointers[0].last
                const pos = e.data.global
                this.x += (pos.x - last.x)
                this.y += (pos.y - last.y)
                if (this.options.friction)
                {
                    const now = performance.now()
                    const time = now - this.velocity.time
                    const velocity = { x: (pos.x - last.x) / time, y: (pos.y - last.y) / time }
                    this.velocity = { velocity, x: pos.x - last.x, y: pos.y - last.y, save: this.velocity.time, time }
                }
                this.pointers[0].last = { x: pos.x, y: pos.y }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
                this.inMove = true
            }
            else if (this.pinchToZoom)
            {
                this.inMove = false
                const first = this.pointers[0]
                const second = this.pointers[1]
                const last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                if (first.id === e.data.pointerId)
                {
                    first.last = { x: e.data.global.x, y: e.data.global.y }
                }
                else if (second.id === e.data.pointerId)
                {
                    second.last = { x: e.data.global.x, y: e.data.global.y }
                }
                if (last)
                {
                    const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 }
                    const oldPoint = this.toLocal(point)

                    const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                    const change = ((dist - last) / this.w) * this.scale.x
                    this.scale.x += change
                    this.scale.y += change

                    const newPoint = this.toGlobal(oldPoint)

                    this.x += point.x - newPoint.x
                    this.y += point.y - newPoint.y

                    if (this.lastCenter)
                    {
                        this.x += point.x - this.lastCenter.x
                        this.y += point.y - this.lastCenter.y
                    }
                    this.lastCenter = point
                }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
            }
        }
        else
        {
            this.inMove = false
        }
    }

    toWorld()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.toLocal(new PIXI.Point(x, y))
        }
        else
        {
            return this.toLocal(arguments[0])
        }
    }

    toScreen()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.toGlobal(new PIXI.Point(x, y))
        }
        else
        {
            const point = arguments[0]
            return this.toGlobal(point)
        }
    }

    clamp()
    {
        let point
        if (this.w / this.scale.x > this._worldBoundaries.width || this.x >= this._worldBoundaries.left)
        {
            this.x = this._worldBoundaries.left
        }
        else
        {
            point = this.toLocal(new PIXI.Point(this.w, this.h))
            if (point.x > this._worldBoundaries.right)
            {
                this.x += (point.x - this._worldBoundaries.right)
            }
        }
        if (this.h / this.scale.y > this._worldBoundaries.height || this.y >= this._worldBoundaries.top)
        {
            this.y = this._worldBoundaries.top
        }
        else
        {
            if (!point)
            {
                point = this.toLocal(new PIXI.Point(this.w, this.h))
            }
            if (point.y > this._worldBoundaries.bottom)
            {
                this.y += (point.y - this._worldBoundaries.bottom)
            }
        }
    }

    bounceStart()
    {
        let point
        let x = this.x
        let y = this.y
        if (this.w / this.scale.x > this._worldBoundaries.width || this.x >= this._worldBoundaries.left)
        {
            x = this._worldBoundaries.left
        }
        else
        {
            point = this.toLocal(new PIXI.Point(this.w, this.h))
            if (point.x > this._worldBoundaries.right)
            {
                x = this.x + (point.x - this._worldBoundaries.right)
            }
        }
        if (this.h / this.scale.y > this._worldBoundaries.height || this.y >= this._worldBoundaries.top)
        {
            y = this._worldBoundaries.top
        }
        else
        {
            if (!point)
            {
                point = this.toLocal(new PIXI.Point(0, this.h))
            }
            if (point.y > this._worldBoundaries.bottom)
            {
                y = this.y + (point.y - this._worldBoundaries.bottom)
            }
        }
        if (x !== this.x || y !== this.y)
        {
            this.to = { x: this.x, y: this.y, deltaX: x - this.x, deltaY: y - this.y, time: 0, last: performance.now() }
            if (!this.bouncing)
            {
                this.bouncing = true
                if (!this.options.noUpdate)
                {
                    requestAnimationFrame(this.update.bind(this))
                }
            }
        }
    }

    update(elapsed)
    {
        if (this.to)
        {
            const now = performance.now()
            elapsed = now - this.to.last
            this.to.last = now
            this.to.time += elapsed
            this.x = this.bounceEasing(this.to.time, this.to.x, this.to.deltaX, this.options.bounce)
            this.y = this.bounceEasing(this.to.time, this.to.y, this.to.deltaY, this.options.bounce)
            if (this.to.time >= this.options.bounce)
            {
                this.to = null
                this.bouncing = false
            }
            else if (!this.options.noUpdate)
            {
                requestAnimationFrame(this.update.bind(this))
            }
        }
        else if (this.velocity && this.velocity.save)
        {
            const time = performance.now() - this.velocity.save
            this.velocity.velocity.x = this.velocity.x / time
            this.velocity.velocity.y = this.velocity.y / time
        }
        else if (this.deaccelerating)
        {
            this.deaccelerating.x -= this.deaccelerating.x * this.options.friction * elapsed
            this.deaccelerating.y -= this.deaccelerating.y * this.options.friction * elapsed
            this.x += this.deaccelerating.x * elapsed
            this.y += this.deaccelerating.y * elapsed
        }
    }

    up(e)
    {
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].id === e.data.pointerId)
            {
                this.pointers.splice(i, 1)
            }
        }
        if (this.pointers.length < 2)
        {
            this.lastCenter = null
        }
        if (this.options.bounce && this.pointers.length === 0)
        {
            this.bounceStart()
        }
        if (!this.to && this.velocity)
        {
            this.deaccelerating = { x: this.velocity.velocity.x, y: this.velocity.velocity.y }
            this.velocity = null
        }
    }
}

/* global performance, requestAnimationFrame */