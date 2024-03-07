import type { FederatedEvent } from 'pixi.js';
import type { Viewport } from '../Viewport';

/**
 * Derive this class to create user-defined plugins
 *
 * @public
 */
export class Plugin
{
    /** The viewport to which this plugin is attached. */
    public readonly parent: Viewport;

    /**
     * Flags whether this plugin has been "paused".
     *
     * @see Plugin#pause
     * @see Plugin#resume
     */
    public paused: boolean;

    /** @param {Viewport} parent */
    constructor(parent: Viewport)
    {
        this.parent = parent;
        this.paused = false;
    }

    /** Called when plugin is removed */
    public destroy()
    {
        // Override for implementation
    }

    /** Handler for pointerdown PIXI event */
    public down(_e: FederatedEvent): boolean
    {
        return false;
    }

    /** Handler for pointermove PIXI event */
    public move(_e: FederatedEvent): boolean
    {
        return false;
    }

    /** Handler for pointerup PIXI event */
    public up(_e: FederatedEvent): boolean
    {
        return false;
    }

    /** Handler for wheel event on div */
    public wheel(_e: WheelEvent): boolean | undefined
    {
        return false;
    }

    /**
     * Called on each tick
     * @param {number} elapsed time in millisecond since last update
     */
    public update(_delta: number): void
    {
        // Override for implementation
    }

    /** Called when the viewport is resized */
    public resize()
    {
        // Override for implementation
    }

    /** Called when the viewport is manually moved */
    public reset(): void
    {
        // Override for implementation
    }

    /** Pause the plugin */
    public pause(): void
    {
        this.paused = true;
    }

    /** Un-pause the plugin */
    public resume(): void
    {
        this.paused = false;
    }
}
