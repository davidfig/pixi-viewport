/**
 * derive this class to create user-defined plugins
 */
export class Plugin
{
    /**
     * @param {Viewport} parent
     */
    constructor(parent)
    {
        this.parent = parent
        this.paused = false
    }

    /** called when plugin is removed */
    destroy() {}

    /**
     * handler for pointerdown PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    down()
    {
        return false
    }

    /**
     * handler for pointermove PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    move()
    {
        return false
    }

    /**
     * handler for pointerup PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    up()
    {
        return false
    }

    /**
     * handler for wheel event on div
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel()
    {
        return false
    }

    /**
     * called on each tick
     * @param {number} elapsed time in millisecond since last update
     */
    update() { }

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