import { Point, Rectangle } from '@pixi/math';

import type { IPointData } from '@pixi/math';
import type { InteractionEvent } from '@pixi/interaction';
import type { Viewport } from './Viewport';

export interface IViewportTouch {
    id: number;
    last: IPointData | null;
}

/**
 * Handles all input for Viewport
 *
 * @internal
 * @ignore
 * @private
 */
export class InputManager
{
    public readonly viewport: Viewport;

    public clickedAvailable?: boolean;
    public isMouseDown?: boolean;
    public last?: Point | null;
    public wheelFunction?: (e: WheelEvent) => void;
    /** List of active touches on viewport */
    public touches: IViewportTouch[];

    constructor(viewport: Viewport)
    {
        this.viewport = viewport;
        this.touches = [];

        this.addListeners();
    }

    /** Add input listeners */
    private addListeners()
    {
        this.viewport.interactive = true;
        if (!this.viewport.forceHitArea)
        {
            this.viewport.hitArea = new Rectangle(0, 0, this.viewport.worldWidth, this.viewport.worldHeight);
        }
        this.viewport.on('pointerdown', this.down, this);
        this.viewport.on('pointermove', this.move, this);
        this.viewport.on('pointerup', this.up, this);
        this.viewport.on('pointerupoutside', this.up, this);
        this.viewport.on('pointercancel', this.up, this);
        this.viewport.on('pointerout', this.up, this);
        this.wheelFunction = (e) => this.handleWheel(e);
        this.viewport.options.divWheel.addEventListener(
            'wheel',
            this.wheelFunction as any,
            { passive: this.viewport.options.passiveWheel });
        this.isMouseDown = false;
    }

    /**
     * Removes all event listeners from viewport
     * (useful for cleanup of wheel when removing viewport)
     */
    public destroy(): void
    {
        this.viewport.options.divWheel.removeEventListener('wheel', this.wheelFunction as any);
    }

    /**
     * handle down events for viewport
     *
     * @param {PIXI.InteractionEvent} event
     */
    public down(event: InteractionEvent): void
    {
        if (this.viewport.pause || !this.viewport.worldVisible)
        {
            return;
        }
        if (event.data.pointerType === 'mouse')
        {
            this.isMouseDown = true;
        }
        else if (!this.get(event.data.pointerId))
        {
            this.touches.push({ id: event.data.pointerId, last: null });
        }
        if (this.count() === 1)
        {
            this.last = event.data.global.clone();

            // clicked event does not fire if viewport is decelerating or bouncing
            const decelerate = this.viewport.plugins.get('decelerate', true);
            const bounce = this.viewport.plugins.get('bounce', true);

            if ((!decelerate || !decelerate.isActive()) && (!bounce || !bounce.isActive()))
            {
                this.clickedAvailable = true;
            }
            else
            {
                this.clickedAvailable = false;
            }
        }
        else
        {
            this.clickedAvailable = false;
        }

        const stop = this.viewport.plugins.down(event);

        if (stop && this.viewport.options.stopPropagation)
        {
            event.stopPropagation();
        }
    }

    /** Clears all pointer events */
    public clear(): void
    {
        this.isMouseDown = false;
        this.touches = [];
        this.last = null;
    }

    /**
     * @param {number} change
     * @returns whether change exceeds threshold
     */
    public checkThreshold(change: number): boolean
    {
        if (Math.abs(change) >= this.viewport.threshold)
        {
            return true;
        }

        return false;
    }

    /** Handle move events for viewport */
    public move(event: InteractionEvent): void
    {
        if (this.viewport.pause || !this.viewport.worldVisible)
        {
            return;
        }

        const stop = this.viewport.plugins.move(event);

        if (this.clickedAvailable && this.last)
        {
            const distX = event.data.global.x - this.last.x;
            const distY = event.data.global.y - this.last.y;

            if (this.checkThreshold(distX) || this.checkThreshold(distY))
            {
                this.clickedAvailable = false;
            }
        }

        if (stop && this.viewport.options.stopPropagation)
        {
            event.stopPropagation();
        }
    }

    /** Handle up events for viewport */
    public up(event: InteractionEvent): void
    {
        if (this.viewport.pause || !this.viewport.worldVisible)
        {
            return;
        }

        if (event.data.pointerType === 'mouse')
        {
            this.isMouseDown = false;
        }

        if (event.data.pointerType !== 'mouse')
        {
            this.remove(event.data.pointerId);
        }

        const stop = this.viewport.plugins.up(event);

        if (this.clickedAvailable && this.count() === 0 && this.last)
        {
            this.viewport.emit('clicked', {
                event,
                screen: this.last,
                world: this.viewport.toWorld(this.last),
                viewport: this
            });
            this.clickedAvailable = false;
        }

        if (stop && this.viewport.options.stopPropagation)
        {
            event.stopPropagation();
        }
    }

    /** Gets pointer position if this.interaction is set */
    public getPointerPosition(event: WheelEvent): Point
    {
        const point = new Point();

        if (this.viewport.options.interaction)
        {
            this.viewport.options.interaction.mapPositionToPoint(point, event.clientX, event.clientY);
        }
        else
        {
            point.x = event.clientX;
            point.y = event.clientY;
        }

        return point;
    }

    /** Handle wheel events */
    public handleWheel(event: WheelEvent): void
    {
        if (this.viewport.pause || !this.viewport.worldVisible)
        {
            return;
        }

        // do not handle events coming from other elements
        if (this.viewport.options.interaction
            && (this.viewport.options.interaction as any).interactionDOMElement !== event.target)
        {
            return;
        }

        // only handle wheel events where the mouse is over the viewport
        const point = this.viewport.toLocal(this.getPointerPosition(event));

        if (this.viewport.left <= point.x
            && point.x <= this.viewport.right
            && this.viewport.top <= point.y
            && point.y <= this.viewport.bottom)
        {
            const stop = this.viewport.plugins.wheel(event);

            if (stop && !this.viewport.options.passiveWheel)
            {
                event.preventDefault();
            }
        }
    }

    public pause(): void
    {
        this.touches = [];
        this.isMouseDown = false;
    }

    /** Get touch by id */
    public get(id: number): IViewportTouch | null
    {
        for (const touch of this.touches)
        {
            if (touch.id === id)
            {
                return touch;
            }
        }

        return null;
    }

    /** Remove touch by number */
    remove(id: number): void
    {
        for (let i = 0; i < this.touches.length; i++)
        {
            if (this.touches[i].id === id)
            {
                this.touches.splice(i, 1);

                return;
            }
        }
    }

    /**
     * @returns {number} count of mouse/touch pointers that are down on the viewport
     */
    count(): number
    {
        return (this.isMouseDown ? 1 : 0) + this.touches.length;
    }
}
