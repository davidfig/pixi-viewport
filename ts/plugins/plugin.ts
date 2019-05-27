import { Viewport } from '../viewport'

export abstract class Plugin {
    parent: Viewport
    paused: boolean

    constructor(parent) {
        this.parent = parent
        this.paused = false
    }

    /**
     * handler for pointerdown PIXI event
     */
    down(event: PIXI.interaction.InteractionEvent): boolean
    {
        return false
    }

    /**
     * handler for pointermove PIXI event
     */
    move(event: PIXI.interaction.InteractionEvent): boolean
    {
        return false
    }

    /**
     * handler for pointerup PIXI event
     */
    up(event: PIXI.interaction.InteractionEvent): boolean
    {
        return false
    }

    /**
     * handler for wheel event on div
     */
    wheel(event: WheelEvent): boolean
    {
        return false
    }

    /** called on each tick */
    update(elapsed: number) { }

    /** called when the viewport is resized */
    resize() { }

    /** called when the viewport is manually moved */
    reset() { }

    /** pause the plugin */
    pause()
    {
        this.paused = true
    }

    /** un-pause the plugin */
    resume()
    {
        this.paused = false
    }
}