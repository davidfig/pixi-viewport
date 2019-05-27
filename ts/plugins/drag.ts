import * as PIXI from 'pixi.js'

import { Viewport } from '../viewport'
import { Plugin } from './plugin'
import { Wheel } from './wheel'
import { Decelerate } from './decelerate'

interface LastDrag
{
    x: number
    y: number
    parent: PIXI.Point
}

export interface DragOptions
{
    /** direction to drag */
    direction?: string

    /** use wheel to scroll in y direction (unless wheel plugin is active) */
    wheel?: boolean

    /** number of pixels to scroll with each wheel spin */
    wheelScroll?: number

    /** reverse the direction of the wheel scroll */
    reverse?: boolean

    /** clamp wheel(to avoid weird bounce with mouse wheel) */
    clampWheel?: boolean | string

    /** where to place world if too small for screen */
    underflow?: string

    /** factor to multiply drag to increase the speed of movement */
    factor?: number

    /** changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right' */
    mouseButtons?: string
}

const DragOptionsDefaults: DragOptions =
{
    direction: 'all',
    wheel: true,
    wheelScroll: 1,
    reverse: false,
    clampWheel: false,
    underflow: 'center',
    factor: 1,
    mouseButtons: 'all'
}

export class Drag extends Plugin
{
    private options: DragOptions
    private moved: boolean = false
    private reverse: number
    private xDirection: boolean
    private yDirection: boolean
    private mouse: Array<boolean>
    private underflowX: number
    private underflowY: number
    private last?: LastDrag
    private current: number

    constructor(parent: Viewport, options: DragOptions)
    {
        super(parent)
        this.options = { ...DragOptionsDefaults, ...options }

        this.reverse = this.options.reverse ? 1 : -1
        this.xDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'x'
        this.yDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'y'

        this.parseUnderflow()
        this.mouseButtons(this.options.mouseButtons)
    }

    /** initialize mousebuttons array */
    private mouseButtons(buttons: string)
    {
        if (!buttons || buttons === 'all')
        {
            this.mouse = [true, true, true]
        }
        else
        {
            this.mouse = [
                buttons.indexOf('left') === -1 ? false : true,
                buttons.indexOf('middle') === -1 ? false : true,
                buttons.indexOf('right') === -1 ? false : true
            ]
        }
    }

    private parseUnderflow()
    {
        const clamp: string = this.options.underflow.toLowerCase()
        if (clamp === 'center')
        {
            this.underflowX = 0
            this.underflowY = 0
        }
        else
        {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0
        }
    }

    private checkButtons(e: PIXI.interaction.InteractionEvent): boolean
    {
        const isMouse: boolean = e.data.pointerType === 'mouse'
        const count: number = this.parent.countDownPointers()
        if (this.parent.parent)
        {
            if ((count === 1) || (count > 1 && !this.parent.plugins['pinch']))
            {
                if (!isMouse || this.mouse[e.data.button])
                {
                    return true
                }
            }
        }
        return false
    }

    down(e: PIXI.interaction.InteractionEvent)
    {
        if (this.paused)
        {
            return
        }
        if (this.checkButtons(e))
        {
            const parent = this.parent.parent.toLocal(e.data.global)
            this.last = { x: e.data.global.x, y: e.data.global.y, parent }
            this.current = e.data.pointerId
            return true
        }
        else
        {
            this.last = null
        }
    }

    get active(): boolean
    {
        return this.moved
    }

    move(e: PIXI.interaction.InteractionEvent): boolean
    {
        if (this.paused)
        {
            return
        }
        if (this.last && this.current === e.data.pointerId)
        {
            const x: number = e.data.global.x
            const y: number = e.data.global.y
            const count: number = this.parent.countDownPointers()
            if (count === 1 || (count > 1 && !this.parent.plugins['pinch']))
            {
                const distX: number = x - this.last.x
                const distY: number = y - this.last.y
                if (this.moved || ((this.xDirection && this.parent.checkThreshold(distX)) || (this.yDirection && this.parent.checkThreshold(distY))))
                {
                    const newParent: PIXI.Point = this.parent.parent.toLocal(e.data.global)
                    if (this.xDirection)
                    {
                        this.parent.x += (newParent.x - this.last.parent.x) * this.options.factor
                    }
                    if (this.yDirection)
                    {
                        this.parent.y += (newParent.y - this.last.parent.y) * this.options.factor
                    }
                    this.last = { x, y, parent: newParent }
                    if (!this.moved)
                    {
                        this.parent.emit('drag-start', { screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent})
                    }
                    this.moved = true
                    this.parent.emit('moved', { viewport: this.parent, type: 'drag' })
                    return true
                }
            }
            else
            {
                this.moved = false
            }
        }
    }

    up(): boolean
    {
        const touches = this.parent.getTouchPointers()
        if (touches.length === 1)
        {
            const pointer = touches[0]
            if (pointer.last)
            {
                const parent = this.parent.parent.toLocal(pointer.last)
                this.last = { x: pointer.last.x, y: pointer.last.y, parent }
                this.current = pointer.last.data.pointerId
            }
            this.moved = false
            return true
        }
        else if (this.last)
        {
            if (this.moved)
            {
                this.parent.emit('drag-end', {screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent})
                this.last = null
                this.moved = false
                return true
            }
        }
    }

    wheel(e: WheelEvent): boolean
    {
        if (this.paused)
        {
            return
        }

        if (this.options.wheel)
        {
            const wheel: Wheel = this.parent.plugins['wheel']
            if (!wheel)
            {
                if (this.xDirection)
                {
                    this.parent.x += e.deltaX * this.options.wheelScroll * this.reverse
                }
                if (this.yDirection)
                {
                    this.parent.y += e.deltaY * this.options.wheelScroll * this.reverse
                }
                if (this.options.clampWheel)
                {
                    this.clamp()
                }
                this.parent.emit('wheel-scroll', this.parent)
                this.parent.emit('moved', this.parent)
                if (!this.parent.options.passiveWheel)
                {
                    e.preventDefault()
                }
                return true
            }
        }
    }

    resume()
    {
        this.last = null
        this.paused = false
    }

    clamp()
    {
        const decelerate: Decelerate = this.parent.plugins['decelerate'] || {}
        if (this.options.clampWheel !== 'y')
        {
            if (this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                switch (this.underflowX)
                {
                    case -1:
                        this.parent.x = 0
                        break
                    case 1:
                        this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth)
                        break
                    default:
                        this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                }
            }
            else
            {
                if (this.parent.left < 0)
                {
                    this.parent.x = 0
                    decelerate.x = 0
                }
                else if (this.parent.right > this.parent.worldWidth)
                {
                    this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth
                    decelerate.x = 0
                }
            }
        }
        if (this.options.clampWheel !== 'x')
        {
            if (this.parent.screenWorldHeight < this.parent.screenHeight)
            {
                switch (this.underflowY)
                {
                    case -1:
                        this.parent.y = 0
                        break
                    case 1:
                        this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                        break
                    default:
                        this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
                }
            }
            else
            {
                if (this.parent.top < 0)
                {
                    this.parent.y = 0
                    decelerate.y = 0
                }
                if (this.parent.bottom > this.parent.worldHeight)
                {
                    this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight
                    decelerate.y = 0
                }
            }
        }
    }
}