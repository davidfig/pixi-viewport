import * as PIXI from 'pixi.js'

import { Plugin } from './plugin'

/**
 * @typedef {object} LastDrag
 * @property {number} x
 * @property {number} y
 * @property {PIXI.Point} parent
 */

/**
 * @typedef DragOptions
 * @property {string} [direction=all] direction to drag
 * @property {boolean} [pressDrag=true] whether click to drag is active
 * @property {boolean} [wheel=true] use wheel to scroll in direction (unless wheel plugin is active)
 * @property {number} [wheelScroll=1] number of pixels to scroll with each wheel spin
 * @property {boolean} [reverse] reverse the direction of the wheel scroll
 * @property {(boolean|string)} [clampWheel=false] clamp wheel(to avoid weird bounce with mouse wheel)
 * @property {string} [underflow=center] where to place world if too small for screen
 * @property {number} [factor=1] factor to multiply drag to increase the speed of movement
 * @property {string} [mouseButtons=all] changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'; you may want to set viewport.options.disableOnContextMenu if you want to use right-click dragging
 * @property {string[]} [keyToPress=null] array containing {@link key|https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code} codes of keys that can be pressed for the drag to be triggered, e.g.: ['ShiftLeft', 'ShiftRight'}.
 * @property {boolean} [ignoreKeyToPressOnTouch=false] ignore keyToPress for touch events
 * @property {number} [lineHeight=20] scaling factor for non-DOM_DELTA_PIXEL scrolling events
 */

const dragOptions = {
    direction: 'all',
    pressDrag: true,
    wheel: true,
    wheelScroll: 1,
    reverse: false,
    clampWheel: false,
    underflow: 'center',
    factor: 1,
    mouseButtons: 'all',
    keyToPress: null,
    ignoreKeyToPressOnTouch: false,
    lineHeight: 20,
}

/**
 * @private
 */
export class Drag extends Plugin {
    /**
     * @param {Viewport} parent
     * @param {DragOptions} options
     */
    constructor(parent, options = {}) {
        super(parent)
        this.options = Object.assign({}, dragOptions, options)
        this.moved = false
        this.reverse = this.options.reverse ? 1 : -1
        this.xDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'x'
        this.yDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'y'
        this.keyIsPressed = false

        this.parseUnderflow()
        this.mouseButtons(this.options.mouseButtons)
        if (this.options.keyToPress) {
            this.handleKeyPresses(this.options.keyToPress)
        }
    }

    /**
     * Handles keypress events and set the keyIsPressed boolean accordingly
     * @param {array} codes - key codes that can be used to trigger drag event
     */
    handleKeyPresses(codes) {
        window.addEventListener('keydown', e => {
            if (codes.includes(e.code))
                this.keyIsPressed = true
        })

        window.addEventListener('keyup', e => {
            if (codes.includes(e.code))
                this.keyIsPressed = false
        })
    }

    /**
     * initialize mousebuttons array
     * @param {string} buttons
     */
    mouseButtons(buttons) {
        if (!buttons || buttons === 'all') {
            this.mouse = [true, true, true]
        } else {
            this.mouse = [
                buttons.indexOf('left') === -1 ? false : true,
                buttons.indexOf('middle') === -1 ? false : true,
                buttons.indexOf('right') === -1 ? false : true
            ]
        }
    }

    parseUnderflow() {
        const clamp = this.options.underflow.toLowerCase()
        if (clamp === 'center') {
            this.underflowX = 0
            this.underflowY = 0
        } else {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0
        }
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    checkButtons(event) {
        const isMouse = event.data.pointerType === 'mouse'
        const count = this.parent.input.count()
        if ((count === 1) || (count > 1 && !this.parent.plugins.get('pinch', true))) {
            if (!isMouse || this.mouse[event.data.button]) {
                return true
            }
        }
        return false
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    checkKeyPress(event) {
        if (!this.options.keyToPress || this.keyIsPressed || (this.options.ignoreKeyToPressOnTouch && event.data.pointerType === 'touch'))
            return true

        return false
    }

    /**
     * @param {PIXI.InteractionEvent} event
     */
    down(event) {
        if (this.paused || !this.options.pressDrag) {
            return
        }
        if (this.checkButtons(event) && this.checkKeyPress(event)) {
            this.last = { x: event.data.global.x, y: event.data.global.y }
            this.current = event.data.pointerId
            return true
        } else {
            this.last = null
        }
    }

    get active() {
        return this.moved
    }

    /**
     * @param {PIXI.InteractionEvent} event
     */
    move(event) {
        if (this.paused || !this.options.pressDrag) {
            return
        }
        if (this.last && this.current === event.data.pointerId) {
            const x = event.data.global.x
            const y = event.data.global.y
            const count = this.parent.input.count()
            if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch', true))) {
                const distX = x - this.last.x
                const distY = y - this.last.y
                if (this.moved || ((this.xDirection && this.parent.input.checkThreshold(distX)) || (this.yDirection && this.parent.input.checkThreshold(distY)))) {
                    const newPoint = { x, y }
                    if (this.xDirection) {
                        this.parent.x += (newPoint.x - this.last.x) * this.options.factor
                    }
                    if (this.yDirection) {
                        this.parent.y += (newPoint.y - this.last.y) * this.options.factor
                    }
                    this.last = newPoint
                    if (!this.moved) {
                        this.parent.emit('drag-start', { event: event, screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(new PIXI.Point(this.last.x, this.last.y)), viewport: this.parent })
                    }
                    this.moved = true
                    this.parent.emit('moved', { viewport: this.parent, type: 'drag' })
                    return true
                }
            } else {
                this.moved = false
            }
        }
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    up(event) {
        if (this.paused) {
            return
        }
        const touches = this.parent.input.touches
        if (touches.length === 1) {
            const pointer = touches[0]
            if (pointer.last) {
                this.last = { x: pointer.last.x, y: pointer.last.y }
                this.current = pointer.id
            }
            this.moved = false
            return true
        } else if (this.last) {
            if (this.moved) {
                const screen = new PIXI.Point(this.last.x, this.last.y)
                this.parent.emit('drag-end', { event: event, screen, world: this.parent.toWorld(screen), viewport: this.parent })
                this.last = null
                this.moved = false
                return true
            }
        }
    }

    /**
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel(event) {
        if (this.paused) {
            return
        }

        if (this.options.wheel) {
            const wheel = this.parent.plugins.get('wheel', true)
            if (!wheel) {
                const step = event.deltaMode ? this.options.lineHeight : 1
                if (this.xDirection) {
                    this.parent.x += event.deltaX * step * this.options.wheelScroll * this.reverse
                }
                if (this.yDirection) {
                    this.parent.y += event.deltaY * step * this.options.wheelScroll * this.reverse
                }
                if (this.options.clampWheel) {
                    this.clamp()
                }
                this.parent.emit('wheel-scroll', this.parent)
                this.parent.emit('moved', { viewport: this.parent, type: 'wheel' })
                if (!this.parent.options.passiveWheel) {
                    event.preventDefault()
                }
                return true
            }
        }
    }

    resume() {
        this.last = null
        this.paused = false
    }

    clamp() {
        const decelerate = this.parent.plugins.get('decelerate', true) || {}
        if (this.options.clampWheel !== 'y') {
            if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                switch (this.underflowX) {
                case -1:
                    this.parent.x = 0
                    break
                case 1:
                    this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth)
                    break
                default:
                    this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                }
            } else {
                if (this.parent.left < 0) {
                    this.parent.x = 0
                    decelerate.x = 0
                } else if (this.parent.right > this.parent.worldWidth) {
                    this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth
                    decelerate.x = 0
                }
            }
        }
        if (this.options.clampWheel !== 'x') {
            if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                switch (this.underflowY) {
                case -1:
                    this.parent.y = 0
                    break
                case 1:
                    this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                    break
                default:
                    this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
                }
            } else {
                if (this.parent.top < 0) {
                    this.parent.y = 0
                    decelerate.y = 0
                }
                if (this.parent.bottom > this.parent.worldHeight) {
                    this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight
                    decelerate.y = 0
                }
            }
        }
    }
}
