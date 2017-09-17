const PIXI = require('pixi.js')
const Penner = require('penner')

const Counter = require('console-counter')

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
     * @param {boolean} [options.decelerate] decelerate after scrolling
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {boolean} [options.noTicker] don't use PIXI.ticker.shared to call update; if set to true, .update() must be called manually during each loop
     */
    constructor(screenWidth, screenHeight, worldBoundaries, options)
    {
        super()
        this.options = options || {}
        if (this.options.bounce)
        {
            this.bounce = this.options.bounce
        }
        this.options.friction = this.options.friction || 0.95
        this.pointers = []
        this.listeners()
        this.hitArea = worldBoundaries
        this._worldBoundaries = worldBoundaries
        this.resize(screenWidth, screenHeight)
        if (!this.options.noTicker)
        {
            PIXI.ticker.shared.add(this.update, this)
        }
        this.counter = new Counter({ side: 'bottomleft' })
        this.saved = []
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
        this.to = null
        this.pointers.push({ id: e.data.pointerId, last: e.data.global })
        this.saved = []
        this.decelerate = null
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
                const distX = pos.x - last.x
                const distY = pos.y - last.y
                this.x += distX
                this.y += distY
                if (this.options.friction)
                {
                    this.saved.push({ x: this.x, y: this.y, time: performance.now() })
                    if (this.saved.length > 60)
                    {
                        this.saved.splice(0, 30)
                    }
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
        let point, changeX, changeY
        if (this.w / this.scale.x > this._worldBoundaries.width || this.x >= this._worldBoundaries.left)
        {
            this.x = this._worldBoundaries.left
            changeX = true
        }
        else
        {
            point = this.toLocal(new PIXI.Point(this.w, this.h))
            if (point.x > this._worldBoundaries.right)
            {
                this.x += (point.x - this._worldBoundaries.right)
                changeX = true
            }
        }
        if (this.h / this.scale.y > this._worldBoundaries.height || this.y >= this._worldBoundaries.top)
        {
            this.y = this._worldBoundaries.top
            changeY = true
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
                changeY = true
            }
        }
        return { x: changeX, y: changeY }
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
            }
            return true
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
        }
        else if (this.decelerate)
        {
            const now = performance.now()
            elapsed = now - this.decelerate.time
            this.decelerate.time = now
            const deltaX = this.decelerate.x * elapsed
            const deltaY = this.decelerate.y * elapsed
            this.x += deltaX
            this.y += deltaY
            this.decelerate.x = this.options.friction * this.decelerate.x
            if (Math.abs(this.decelerate.x) <= 0.001)
            {
                this.decelerate.x = 0
            }
            this.decelerate.y = this.options.friction * this.decelerate.y
            if (Math.abs(this.decelerate.y) <= 0.001)
            {
                this.decelerate.y = 0
            }
            if (this.decelerate.x === 0 && this.decelerate.y === 0)
            {
                this.decelerate = null
            }
            else
            {
                this.counter.log(this.decelerate.x, this.decelerate.y)
            }
            if (this.options.noOverDrag)
            {
                const result = this.clamp()
                if (result.x)
                {
                    this.decelerate.x = 0
                }
                if (result.y)
                {
                    this.decelerate.y = 0
                }
            }
            else if (this.options.bounce)
            {
                if (this.bounceStart())
                {
                    this.decelerate = null
                }
            }
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
        if (!this.to && this.options.decelerate && this.saved.length)
        {
            const now = performance.now()
            for (let save of this.saved)
            {
                if (save.time >= now - 100)
                {
                    const time = now - save.time
                    const x = (this.x - save.x) / time
                    const y = (this.y - save.y) / time
                    this.decelerate = { x, y, time: now }
                    return
                }
            }
        }
    }
}

/* global performance */