import { Container } from '@pixi/display';
import { Point, Rectangle } from '@pixi/math';
import { Ticker } from '@pixi/ticker';

import { InputManager } from './InputManager';
import { PluginManager } from './PluginManager';
import {
    Animate,
    Bounce,
    Clamp,
    ClampZoom,
    Decelerate,
    Drag,
    Follow,
    MouseEdges,
    Pinch,
    Snap,
    SnapZoom,
    Wheel
} from './plugins';

import type { DisplayObject, IDestroyOptions } from '@pixi/display';
import type { IHitArea, InteractionManager } from '@pixi/interaction';

/** Options for {@link Viewport}. */
export interface IViewportOptions {
    /** @default window.innerWidth */
    screenWidth?: number;

    /** @default window.innerHeight */
    screenHeight?: number;

    /** @default this.width */
    worldWidth?: number | null;

    /** @default this.height */
    worldHeight?: number | null;

    /**
     * Number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
     *
     * @default 5
     */
    threshold?: number;

    /**
     * Whether the 'wheel' event is set to passive (note: if false, e.preventDefault() will be called when wheel is used over the viewport)
     *
     * @default true
     */
    passiveWheel?: boolean;

    /**
     * Whether to stopPropagation of events that impact the viewport (except wheel events, see options.passiveWheel)
     */
    stopPropagation?: boolean;

    /**
     * Change the default hitArea from world size to a new value
     */
    forceHitArea?: Rectangle | null;

    /**
     * Set this if you want to manually call update() function on each frame
     *
     * @default false
     */
    noTicker?: boolean;

    /**
     * InteractionManager, available from instantiated `WebGLRenderer/CanvasRenderer.plugins.interaction`
     *
     * It's used to calculate pointer postion relative to canvas location on screen
     */
    interaction?: InteractionManager | null;

    /**
     * Remove oncontextmenu=() => {} from the divWheel element
     */
    disableOnContextMenu?: boolean;

    /**
     * div to attach the wheel event
     *
     * @default document.body
     */
    divWheel?: HTMLElement;

    /**
     * Use this PIXI.ticker for updates
     *
     * @default PIXI.Ticker.shared
     */
    ticker?: Ticker;
}

export interface ICompleteViewportOptions extends IViewportOptions {
    screenWidth: number;
    screenHeight: number;
    threshold: number;
    passiveWheel: boolean;
    stopPropagation: boolean;
    noTicker: boolean;
    ticker: Ticker;
}

export interface IViewportTransformState {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
}

const DEFAULT_VIEWPORT_OPTIONS: ICompleteViewportOptions = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: null,
    worldHeight: null,
    threshold: 5,
    passiveWheel: true,
    stopPropagation: false,
    forceHitArea: null,
    noTicker: false,
    interaction: null,
    disableOnContextMenu: false,
    ticker: Ticker.shared,
};

/**
 * Main class to use when creating a Viewport
 *
 * @public
 * @fires clicked
 * @fires drag-start
 * @fires drag-end
 * @fires drag-remove
 * @fires pinch-start
 * @fires pinch-end
 * @fires pinch-remove
 * @fires snap-start
 * @fires snap-end
 * @fires snap-remove
 * @fires snap-zoom-start
 * @fires snap-zoom-end
 * @fires snap-zoom-remove
 * @fires bounce-x-start
 * @fires bounce-x-end
 * @fires bounce-y-start
 * @fires bounce-y-end
 * @fires bounce-remove
 * @fires wheel
 * @fires wheel-remove
 * @fires wheel-scroll
 * @fires wheel-scroll-remove
 * @fires mouse-edge-start
 * @fires mouse-edge-end
 * @fires mouse-edge-remove
 * @fires moved
 * @fires moved-end
 * @fires zoomed
 * @fires zoomed-end
 * @fires frame-end
 */
export class Viewport extends Container
{
    /** Flags whether the viewport is being panned */
    public moving?: boolean;

    public screenWidth: number;
    public screenHeight: number;

    /** Number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event */
    public threshold: number;

    public readonly input: InputManager;

    /** Use this to add user plugins or access existing plugins (e.g., to pause, resume, or remove them) */
    public readonly plugins: PluginManager;

    /** Flags whether the viewport zoom is being changed. */
    public zooming?: boolean;

    public lastViewport?: IViewportTransformState | null;

    /** The options passed when creating this viewport, merged with the default values */
    public readonly options: ICompleteViewportOptions & { divWheel: HTMLElement };

    private _dirty?: boolean;
    private _forceHitArea?: IHitArea | null;
    private _hitAreaDefault?: Rectangle;
    private _pause?: boolean;
    private readonly tickerFunction?: () => void;
    private _worldWidth?: number | null;
    private _worldHeight?: number | null;

    /**
     * @param options
     */
    constructor(options: IViewportOptions = {})
    {
        super();
        this.options = Object.assign(
            {},
            { divWheel: document.body },
            DEFAULT_VIEWPORT_OPTIONS,
            options
        );

        this.screenWidth = this.options.screenWidth;
        this.screenHeight = this.options.screenHeight;

        this._worldWidth = this.options.worldWidth;
        this._worldHeight = this.options.worldHeight;
        this.forceHitArea = this.options.forceHitArea;
        this.threshold = this.options.threshold;

        this.options.divWheel = this.options.divWheel || document.body;

        if (this.options.disableOnContextMenu)
        {
            this.options.divWheel.oncontextmenu = (e) => e.preventDefault();
        }
        if (!this.options.noTicker)
        {
            this.tickerFunction = () => this.update(this.options.ticker.elapsedMS);
            this.options.ticker.add(this.tickerFunction);
        }

        this.input = new InputManager(this);
        this.plugins = new PluginManager(this);
    }

    /** Overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners */
    destroy(options: IDestroyOptions)
    {
        if (!this.options.noTicker && this.tickerFunction)
        {
            this.options.ticker.remove(this.tickerFunction);
        }

        this.input.destroy();
        super.destroy(options);
    }

    /**
     * Update viewport on each frame.
     *
     * By default, you do not need to call this unless you set `options.noTicker=true`.
     *
     * @param {number} elapsed time in milliseconds since last update
     */
    update(elapsed: number): void
    {
        if (!this.pause)
        {
            this.plugins.update(elapsed);

            if (this.lastViewport)
            {
                // Check for moved-end event
                if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y)
                {
                    this.moving = true;
                }
                else if (this.moving)
                {
                    this.emit('moved-end', this);
                    this.moving = false;
                }

                // Check for zoomed-end event
                if (this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y)
                {
                    this.zooming = true;
                }
                else  if (this.zooming)
                {
                    this.emit('zoomed-end', this);
                    this.zooming = false;
                }
            }

            if (!this.forceHitArea)
            {
                this._hitAreaDefault = new Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
                this.hitArea = this._hitAreaDefault;
            }

            this._dirty = this._dirty || !this.lastViewport
                || this.lastViewport.x !== this.x || this.lastViewport.y !== this.y
                || this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y;

            this.lastViewport = {
                x: this.x,
                y: this.y,
                scaleX: this.scale.x,
                scaleY: this.scale.y
            };
            this.emit('frame-end', this);
        }
    }

    /** Use this to set screen and world sizes, needed for pinch/wheel/clamp/bounce. */
    resize(
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight,
        worldWidth: number,
        worldHeight: number
    ): void
    {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        if (typeof worldWidth !== 'undefined')
        {
            this._worldWidth = worldWidth;
        }
        if (typeof worldHeight !== 'undefined')
        {
            this._worldHeight = worldHeight;
        }

        this.plugins.resize();
        this.dirty = true;
    }

    /** World width, in pixels */
    get worldWidth(): number
    {
        if (this._worldWidth)
        {
            return this._worldWidth;
        }

        return this.width / this.scale.x;
    }
    set worldWidth(value)
    {
        this._worldWidth = value;
        this.plugins.resize();
    }

    /** World height, in pixels */
    get worldHeight(): number
    {
        if (this._worldHeight)
        {
            return this._worldHeight;
        }

        return this.height / this.scale.y;
    }
    set worldHeight(value)
    {
        this._worldHeight = value;
        this.plugins.resize();
    }

    /** Get visible world bounds of viewport */
    public getVisibleBounds(): Rectangle
    {
        return new Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
    }

    /** Change coordinates from screen to world */
    public toWorld(x: number, y: number): Point;
    /** Change coordinates from screen to world */
    public toWorld(screenPoint: Point): Point;

    public toWorld(x: number | Point, y?: number): Point
    {
        if (arguments.length === 2)
        {
            return this.toLocal(new Point(x as number, y));
        }

        return this.toLocal(x as Point);
    }

    /** Change coordinates from world to screen */
    public toScreen(x: number, y: number): Point;
    /** Change coordinates from world to screen */
    public toScreen(worldPoint: Point): Point;

    public toScreen(x: number | Point, y?: number): Point
    {
        if (arguments.length === 2)
        {
            return this.toGlobal(new Point(x as number, y));
        }

        return this.toGlobal(x as Point);
    }

    /** Screen width in world coordinates */
    get worldScreenWidth(): number
    {
        return this.screenWidth / this.scale.x;
    }

    /** Screen height in world coordinates */
    get worldScreenHeight(): number
    {
        return this.screenHeight / this.scale.y;
    }

    /** World width in screen coordinates */
    get screenWorldWidth(): number
    {
        return this.worldWidth * this.scale.x;
    }

    /** World height in screen coordinates */
    get screenWorldHeight()
    {
        return this.worldHeight * this.scale.y;
    }

    /** Center of screen in world coordinates */
    get center(): Point
    {
        return new Point(
            this.worldScreenWidth / 2 - this.x / this.scale.x,
            this.worldScreenHeight / 2 - this.y / this.scale.y,
        );
    }
    set center(value: Point)
    {
        this.moveCenter(value);
    }

    /** Move center of viewport to (x, y) */
    public moveCenter(x: number, y: number): this;

    /** Move center of viewport to {@code center}. */
    public moveCenter(center: Point): this;

    public moveCenter(...args: [number, number] | [Point]): this
    {
        let x: number;
        let y: number;

        if (typeof args[0] === 'number')
        {
            x = args[0];
            y = args[1] as number;
        }
        else
        {
            x = args[0].x;
            y = args[0].y;
        }

        const newX = (this.worldScreenWidth / 2 - x) * this.scale.x;
        const newY = (this.worldScreenHeight / 2 - y) * this.scale.y;

        if (this.x !== newX || this.y !== newY)
        {
            this.position.set(newX, newY);
            this.plugins.reset();
            this.dirty = true;
        }

        return this;
    }

    /** Top-left corner of Viewport */
    get corner(): Point
    {
        return new Point(-this.x / this.scale.x, -this.y / this.scale.y);
    }
    set corner(value: Point)
    {
        this.moveCorner(value);
    }

    /** Move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed) */
    public moveCorner(x: number, y: number): this;

    /** move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed) */
    public moveCorner(center: Point): this;

    public moveCorner(...args: [number, number] | [Point])
    {
        let x;
        let y;

        if (args.length === 1)
        {
            x = -args[0].x * this.scale.x;
            y = -args[0].y * this.scale.y;
        }
        else
        {
            x = -args[0] * this.scale.x;
            y = -args[1] * this.scale.y;
        }

        if (x !== this.x || y !== this.y)
        {
            this.position.set(x, y);
            this.plugins.reset();
            this.dirty = true;
        }

        return this;
    }

    /** Get how many world pixels fit in screen's width */
    get screenWidthInWorldPixels()
    {
        return this.screenWidth / this.scale.x;
    }

    /** Get how many world pixels fit on screen's height */
    get screenHeightInWorldPixels()
    {
        return this.screenHeight / this.scale.y;
    }

    /**
     * Find the scale value that fits a world width on the screen
     * does not change the viewport (use fit... to change)
     *
     * @param width - Width in world pixels
     * @return - scale
     */
    findFitWidth(width: number): number
    {
        return this.screenWidth / width;
    }

    /**
     * Finds the scale value that fits a world height on the screens
     * does not change the viewport (use fit... to change)
     *
     * @param height - Height in world pixels
     * @return - scale
     */
    findFitHeight(height: number): number
    {
        return this.screenHeight / height;
    }

    /**
     * Finds the scale value that fits the smaller of a world width and world height on the screen
     * does not change the viewport (use fit... to change)
     *
     * @param {number} width in world pixels
     * @param {number} height in world pixels
     * @returns {number} scale
     */
    findFit(width: number, height: number): number
    {
        const scaleX = this.screenWidth / width;
        const scaleY = this.screenHeight / height;

        return Math.min(scaleX, scaleY);
    }

    /**
     * Finds the scale value that fits the larger of a world width and world height on the screen
     * does not change the viewport (use fit... to change)
     *
     * @param {number} width in world pixels
     * @param {number} height in world pixels
     * @returns {number} scale
     */
    findCover(width: number, height: number): number
    {
        const scaleX = this.screenWidth / width;
        const scaleY = this.screenHeight / height;

        return Math.max(scaleX, scaleY);
    }

    /**
     * Change zoom so the width fits in the viewport
     *
     * @param width - width in world coordinates
     * @param center - maintain the same center
     * @param scaleY - whether to set scaleY=scaleX
     * @param noClamp - whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitWidth(width = this.worldWidth, center?: boolean, scaleY = true, noClamp?: boolean): this
    {
        let save: Point | undefined;

        if (center)
        {
            save = this.center;
        }
        this.scale.x = this.screenWidth / width;

        if (scaleY)
        {
            this.scale.y = this.scale.x;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);

        if (!noClamp && clampZoom)
        {
            clampZoom.clamp();
        }

        if (center && save)
        {
            this.moveCenter(save);
        }

        return this;
    }

    /**
     * Change zoom so the height fits in the viewport
     *
     * @param {number} [height=this.worldHeight] in world coordinates
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
     * @param {boolean} [noClamp] whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitHeight(height = this.worldHeight, center?: boolean, scaleX = true, noClamp?: boolean)
    {
        let save: Point | undefined;

        if (center)
        {
            save = this.center;
        }
        this.scale.y = this.screenHeight / height;

        if (scaleX)
        {
            this.scale.x = this.scale.y;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);

        if (!noClamp && clampZoom)
        {
            clampZoom.clamp();
        }

        if (center && save)
        {
            this.moveCenter(save);
        }

        return this;
    }

    /**
     * Change zoom so it fits the entire world in the viewport
     *
     * @param {boolean} center maintain the same center of the screen after zoom
     * @returns {Viewport} this
     */
    fitWorld(center?: boolean): this
    {
        let save: Point | undefined;

        if (center)
        {
            save = this.center;
        }

        this.scale.x = this.screenWidth / this.worldWidth;
        this.scale.y = this.screenHeight / this.worldHeight;

        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x;
        }
        else
        {
            this.scale.x = this.scale.y;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);

        if (clampZoom)
        {
            clampZoom.clamp();
        }

        if (center && save)
        {
            this.moveCenter(save);
        }

        return this;
    }

    /**
     * Change zoom so it fits the size or the entire world in the viewport
     *
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {number} [width=this.worldWidth] desired width
     * @param {number} [height=this.worldHeight] desired height
     * @returns {Viewport} this
     */
    fit(center?: boolean, width = this.worldWidth, height = this.worldHeight): this
    {
        let save: Point | undefined;

        if (center)
        {
            save = this.center;
        }

        this.scale.x = this.screenWidth / width;
        this.scale.y = this.screenHeight / height;

        if (this.scale.x < this.scale.y)
        {
            this.scale.y = this.scale.x;
        }
        else
        {
            this.scale.x = this.scale.y;
        }
        const clampZoom = this.plugins.get('clamp-zoom', true);

        if (clampZoom)
        {
            clampZoom.clamp();
        }
        if (center && save)
        {
            this.moveCenter(save);
        }

        return this;
    }

    // eslint-disable-next-line
    // @ts-ignore
    set visible(value: boolean)
    {
        if (!value)
        {
            this.input.clear();
        }

        super.visible = value;
    }

    /**
     * Zoom viewport to specific value.
     *
     * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    setZoom(scale: number, center?: boolean): this
    {
        let save;

        if (center)
        {
            save = this.center;
        }
        this.scale.set(scale);
        const clampZoom = this.plugins.get('clamp-zoom', true);

        if (clampZoom)
        {
            clampZoom.clamp();
        }
        if (center && save)
        {
            this.moveCenter(save);
        }

        return this;
    }

    /**
     * Zoom viewport by a certain percent (in both x and y direction).
     *
     * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    zoomPercent(percent: number, center?: boolean): this
    {
        return this.setZoom(this.scale.x + this.scale.x * percent, center);
    }

    /**
     * Zoom viewport by increasing/decreasing width by a certain number of pixels.
     *
     * @param {number} change in pixels
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    zoom(change: number, center?: boolean)
    {
        this.fitWidth(change + this.worldScreenWidth, center);

        return this;
    }

    /** Changes scale of viewport and maintains center of viewport */
    get scaled(): number
    {
        return this.scale.x;
    }
    set scaled(scale: number)
    {
        this.setZoom(scale, true);
    }

    /**
     * @param {SnapZoomOptions} options
     */
    snapZoom(options: any): this
    {
        this.plugins.add('snap-zoom', new SnapZoom(this, options));

        return this;
    }

    /** Is container out of world bounds */
    OOB(): {
        left: boolean;
        right: boolean;
        top: boolean;
        bottom: boolean;
        cornerPoint: Point;
    }
    {
        return {
            left: this.left < 0,
            right: this.right > this.worldWidth,
            top: this.top < 0,
            bottom: this.bottom > this.worldHeight,
            cornerPoint: new Point(
                this.worldWidth * this.scale.x - this.screenWidth,
                this.worldHeight * this.scale.y - this.screenHeight
            )
        };
    }

    /** World coordinates of the right edge of the screen */
    get right(): number
    {
        return -this.x / this.scale.x + this.worldScreenWidth;
    }
    set right(value: number)
    {
        this.x = -value * this.scale.x + this.screenWidth;
        this.plugins.reset();
    }

    /** World coordinates of the left edge of the screen */
    get left(): number
    {
        return -this.x / this.scale.x;
    }
    set left(value: number)
    {
        this.x = -value * this.scale.x;
        this.plugins.reset();
    }

    /** World coordinates of the top edge of the screen */
    get top(): number
    {
        return -this.y / this.scale.y;
    }
    set top(value: number)
    {
        this.y = -value * this.scale.y;
        this.plugins.reset();
    }

    /** World coordinates of the bottom edge of the screen */
    get bottom(): number
    {
        return -this.y / this.scale.y + this.worldScreenHeight;
    }
    set bottom(value: number)
    {
        this.y = -value * this.scale.y + this.screenHeight;
        this.plugins.reset();
    }

    /**
     * Determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
     */
    get dirty(): boolean
    {
        return !!this._dirty;
    }
    set dirty(value: boolean)
    {
        this._dirty = value;
    }

    /**
     * Permanently changes the Viewport's hitArea
     *
     * NOTE: if not set then hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
     */
    get forceHitArea(): IHitArea | null | undefined
    {
        return this._forceHitArea;
    }
    set forceHitArea(value: IHitArea | null | undefined)
    {
        if (value)
        {
            this._forceHitArea = value;
            this.hitArea = value;
        }
        else
        {
            this._forceHitArea = null;
            this.hitArea = new Rectangle(0, 0, this.worldWidth, this.worldHeight);
        }
    }

    /**
     * Enable one-finger touch to drag
     *
     * NOTE: if you expect users to use right-click dragging, you should enable `viewport.options.disableOnContextMenu`
     * to avoid the context menu popping up on each right-click drag.
     *
     * @param {DragOptions} [options]
     * @returns {Viewport} this
     */
    public drag(options: any): this
    {
        this.plugins.add('drag', new Drag(this, options));

        return this;
    }

    /**
     * Clamp to world boundaries or other provided boundaries
     *
     * NOTES:
     *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
     *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     *
     * @param {ClampOptions} [options]
     * @returns {Viewport} this
     */
    public clamp(options: any): this
    {
        this.plugins.add('clamp', new Clamp(this, options));

        return this;
    }

    /**
     * Decelerate after a move
     *
     * NOTE: this fires 'moved' event during deceleration
     *
     * @param {DecelerateOptions} [options]
     * @return {Viewport} this
     */
    public decelerate(options: any): this
    {
        this.plugins.add('decelerate', new Decelerate(this, options));

        return this;
    }

    /**
     * Bounce on borders
     * NOTES:
     *    screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     *    fires 'moved', 'bounce-x-start', 'bounce-y-start', 'bounce-x-end', and 'bounce-y-end' events
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {object} [options.bounceBox] use this bounceBox instead of (0, 0, viewport.worldWidth, viewport.worldHeight)
     * @param {number} [options.bounceBox.x=0]
     * @param {number} [options.bounceBox.y=0]
     * @param {number} [options.bounceBox.width=viewport.worldWidth]
     * @param {number} [options.bounceBox.height=viewport.worldHeight]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @return {Viewport} this
     */
    public bounce(options: any): this
    {
        this.plugins.add('bounce', new Bounce(this, options));

        return this;
    }

    /**
     * Enable pinch to zoom and two-finger touch to drag
     *
     * @param {PinchOptions} [options]
     * @return {Viewport} this
     */
    public pinch(options: any): this
    {
        this.plugins.add('pinch', new Pinch(this, options));

        return this;
    }

    /**
     * Snap to a point
     *
     * @param {number} x
     * @param {number} y
     * @param {SnapOptions} [options]
     * @return {Viewport} this
     */
    public snap(x: number, y: number, options: any): this
    {
        this.plugins.add('snap', new Snap(this, x, y, options));

        return this;
    }

    /**
     * Follow a target
     *
     * NOTES:
     *    uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
     *    options.acceleration is not perfect as it doesn't know the velocity of the target
     *    it adds acceleration to the start of movement and deceleration to the end of movement when the target is stopped
     *    fires 'moved' event
     * @param {PIXI.DisplayObject} target to follow
     * @param {FollowOptions} [options]
     * @returns {Viewport} this
     */
    public follow(target: DisplayObject, options: any): this
    {
        this.plugins.add('follow', new Follow(this, target, options));

        return this;
    }

    /**
     * Zoom using mouse wheel
     *
     * @param {WheelOptions} [options]
     * @return {Viewport} this
     */
    public wheel(options: any): this
    {
        this.plugins.add('wheel', new Wheel(this, options));

        return this;
    }

    /**
     * Animate the position and/or scale of the viewport
     *
     * @param {AnimateOptions} options
     * @returns {Viewport} this
     */
    public animate(options: any): this
    {
        this.plugins.add('animate', new Animate(this, options));

        return this;
    }

    /**
     * Enable clamping of zoom to constraints
     *
     * The minWidth/Height settings are how small the world can get (as it would appear on the screen)
     * before clamping. The maxWidth/maxHeight is how larger the world can scale (as it would appear on
     * the screen) before clamping.
     *
     * For example, if you have a world size of 1000 x 1000 and a screen size of 100 x 100, if you set
     * minWidth/Height = 100 then the world will not be able to zoom smaller than the screen size (ie,
     * zooming out so it appears smaller than the screen). Similarly, if you set maxWidth/Height = 100
     * the world will not be able to zoom larger than the screen size (ie, zooming in so it appears
     * larger than the screen).
     *
     * @param {ClampZoomOptions} [options]
     * @return {Viewport} this
     */
    public clampZoom(options: any): this
    {
        this.plugins.add('clamp-zoom', new ClampZoom(this, options));

        return this;
    }

    /**
     * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
     *
     * NOTE: fires 'moved' event
     *
     * @param {MouseEdgesOptions} [options]
     */
    public mouseEdges(options: any): this
    {
        this.plugins.add('mouse-edges', new MouseEdges(this, options));

        return this;
    }

    /** Pause viewport (including animation updates such as decelerate) */
    get pause(): boolean
    {
        return !!this._pause;
    }
    set pause(value: boolean)
    {
        this._pause = value;

        this.lastViewport = null;
        this.moving = false;
        this.zooming = false;

        if (value)
        {
            this.input.pause();
        }
    }

    /**
     * Move the viewport so the bounding box is visible
     *
     * @param x - left
     * @param y - top
     * @param width
     * @param height
     * @param resizeToFit - Resize the viewport so the box fits within the viewport
     */
    public ensureVisible(x: number, y: number, width: number, height: number, resizeToFit?: boolean)
    {
        if (resizeToFit && (width > this.worldScreenWidth || height > this.worldScreenHeight))
        {
            this.fit(true, width, height);
            this.emit('zoomed', { viewport: this, type: 'ensureVisible' });
        }
        let moved = false;

        if (x < this.left)
        {
            this.left = x;
            moved = true;
        }
        else if (x + width > this.right)
        {
            this.right = x + width;
            moved = true;
        }
        if (y < this.top)
        {
            this.top = y;
            moved = true;
        }
        else if (y + height > this.bottom)
        {
            this.bottom = y + height;
            moved = true;
        }
        if (moved)
        {
            this.emit('moved', { viewport: this, type: 'ensureVisible' });
        }
    }
}

/**
 * Fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * Fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * Fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * Fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * Fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * Fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * Fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * Fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * Fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * Fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * Fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * Fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * Fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * Fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * Fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * Fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * Fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

/**
 * Fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
 * @event Viewport#moved
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type - (drag, snap, pinch, follow, bounce-x, bounce-y,
 *  clamp-x, clamp-y, decelerate, mouse-edges, wheel, ensureVisible)
 */

/**
 * Fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
 * @event Viewport#zoomed
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom, ensureVisible)
 */

/**
 * Fires when viewport stops moving
 * @event Viewport#moved-end
 * @type {Viewport}
 */

/**
 * Fires when viewport stops zooming
 * @event Viewport#zoomed-end
 * @type {Viewport}
 */

/**
* Fires at the end of an update frame
* @event Viewport#frame-end
* @type {Viewport}
*/
