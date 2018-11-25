module.exports = class Plugin
{
    constructor(parent)
    {
        this.parent = parent
        this.paused = false
    }

    /**
     * handler for pointerdown PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     */
    down(event) { }

    /**
     * handler for pointermove PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     */
    move(event) { }

    /**
     * handler for pointerup PIXI event
     * @param {PIXI.interaction.InteractionEvent} event
     */
    up(event) { }

    /**
     * handler for wheel event on div
     * @param {WheelEvent} event
     */
    wheel(event) { }

    /**
     * called on each tick
     */
    update() { }

    /**
     * called when the viewport is resized
     */
    resize() { }

    /**
     * called when the viewport is manually moved
     */
    reset() { }

    /**
     * called when viewport is paused
     */
    pause()
    {
        this.paused = true
    }

    /**
     * called when viewport is resumed
     */
    resume()
    {
        this.paused = false
    }
}