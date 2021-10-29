import { Container } from '@pixi/display';
import type { DisplayObject } from '@pixi/display';
import type { IDestroyOptions } from '@pixi/display';
import type { IHitArea } from '@pixi/interaction';
import type { InteractionEvent } from '@pixi/interaction';
import type { InteractionManager } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { Point } from '@pixi/math';
import { Rectangle } from '@pixi/math';
import { Ticker } from '@pixi/ticker';

export declare class Animate extends Plugin_2 {
    readonly options: IAnimateOptions & {
        ease: any;
        time: number;
    };
    protected startX?: number;
    protected startY?: number;
    protected deltaX?: number;
    protected deltaY?: number;
    protected keepCenter: boolean;
    protected startWidth: number | null;
    protected startHeight: number | null;
    protected deltaWidth: number | null;
    protected deltaHeight: number | null;
    protected width: number | null;
    protected height: number | null;
    protected time: number;
    constructor(parent: Viewport, options?: IAnimateOptions);
    protected setupPosition(): void;
    protected setupZoom(): void;
    down(): boolean;
    complete(): void;
    update(elapsed: number): void;
}

export declare class Bounce extends Plugin_2 {
    readonly options: Readonly<Required<IBounceOptions>>;
    readonly left: boolean;
    readonly top: boolean;
    readonly right: boolean;
    readonly bottom: boolean;
    readonly underflowX: -1 | 0 | 1;
    readonly underflowY: -1 | 0 | 1;
    protected ease: any;
    protected toX: IBounceState | null;
    protected toY: IBounceState | null;
    constructor(parent: Viewport, options?: IBounceOptions);
    isActive(): boolean;
    down(): boolean;
    up(): boolean;
    update(elapsed: number): void;
    protected calcUnderflowX(): number;
    protected calcUnderflowY(): number;
    private oob;
    bounce(): void;
    reset(): void;
}

export declare class Clamp extends Plugin_2 {
    readonly options: Required<IClampOptions>;
    protected last: {
        x: number | null;
        y: number | null;
        scaleX: number | null;
        scaleY: number | null;
    };
    protected noUnderflow: boolean;
    protected underflowX: -1 | 0 | 1;
    protected underflowY: -1 | 0 | 1;
    constructor(parent: Viewport, options?: IClampOptions);
    private parseUnderflow;
    move(): boolean;
    update(): void;
    reset(): void;
}

export declare class ClampZoom extends Plugin_2 {
    readonly options: Required<IClampZoomOptions>;
    constructor(parent: Viewport, options?: {});
    resize(): void;
    clamp(): void;
    reset(): void;
}

export declare class Decelerate extends Plugin_2 {
    readonly options: Required<IDecelerateOptions>;
    x: number | null;
    y: number | null;
    percentChangeX: number;
    percentChangeY: number;
    protected saved: Array<IDecelerateSnapshot>;
    protected timeSinceRelease: number;
    constructor(parent: Viewport, options?: IDecelerateOptions);
    down(): boolean;
    isActive(): boolean;
    move(): boolean;
    protected moved(data: {
        type: 'clamp-x' | 'clamp-y';
        original: Point;
    }): void;
    up(): boolean;
    activate(options: {
        x?: number;
        y?: number;
    }): void;
    update(elapsed: number): void;
    reset(): void;
}

export declare class Drag extends Plugin_2 {
    readonly options: Readonly<Required<IDragOptions>>;
    protected moved: boolean;
    protected reverse: 1 | -1;
    protected xDirection: boolean;
    protected yDirection: boolean;
    protected keyIsPressed: boolean;
    protected mouse: [boolean, boolean, boolean];
    protected underflowX: -1 | 0 | 1;
    protected underflowY: -1 | 0 | 1;
    protected last?: IPointData | null;
    protected current?: number;
    constructor(parent: Viewport, options?: {});
    protected handleKeyPresses(codes: string[]): void;
    protected mouseButtons(buttons: string): void;
    protected parseUnderflow(): void;
    protected checkButtons(event: InteractionEvent): boolean;
    protected checkKeyPress(event: InteractionEvent): boolean;
    down(event: InteractionEvent): boolean;
    get active(): boolean;
    move(event: InteractionEvent): boolean;
    up(event: InteractionEvent): boolean;
    wheel(event: WheelEvent): boolean;
    resume(): void;
    clamp(): void;
}

export declare class Follow extends Plugin_2 {
    readonly options: Required<IFollowOptions>;
    target: DisplayObject;
    protected velocity: IPointData;
    constructor(parent: Viewport, target: DisplayObject, options?: IFollowOptions);
    update(elapsed: number): void;
}

export declare interface IAnimateOptions {
    time?: number;
    position?: Point;
    width?: number;
    height?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    ease?: any;
    callbackOnComplete?: (viewport: Viewport) => void;
    removeOnInterrupt?: boolean;
}

export declare interface IBounceOptions {
    sides?: 'all' | 'horizontal' | 'vertical' | string;
    friction?: number;
    time?: number;
    bounceBox?: Rectangle | null;
    ease?: any;
    underflow?: 'center' | string;
}

export declare interface IBounceState {
    time: number;
    start: number;
    delta: number;
    end: number;
}

export declare interface IClampOptions {
    left?: number | boolean | null;
    top?: number | boolean | null;
    right?: number | boolean | null;
    bottom?: number | boolean | null;
    direction?: 'all' | 'x' | 'y' | null;
    underflow?: 'center' | string;
}

export declare interface IClampZoomOptions {
    minWidth?: number | null;
    minHeight?: number | null;
    maxWidth?: number | null;
    maxHeight?: number | null;
    minScale?: number | null | IScale;
    maxScale?: number | null | IScale;
}

export declare interface ICompleteViewportOptions extends IViewportOptions {
    screenWidth: number;
    screenHeight: number;
    threshold: number;
    passiveWheel: boolean;
    stopPropagation: boolean;
    noTicker: boolean;
    ticker: Ticker;
}

export declare interface IDecelerateOptions {
    friction?: number;
    bounce?: number;
    minSpeed?: number;
}

export declare interface IDecelerateSnapshot {
    x: number;
    y: number;
    time: number;
}

export declare interface IDragOptions {
    direction?: string;
    pressDrag?: boolean;
    wheel?: boolean;
    wheelScroll?: number;
    reverse?: boolean;
    clampWheel?: boolean | string;
    underflow?: string;
    factor?: number;
    mouseButtons?: 'all' | string;
    keyToPress?: string[] | null;
    ignoreKeyToPressOnTouch?: boolean;
    lineHeight?: number;
}

export declare interface IFollowOptions {
    speed?: number;
    acceleration?: number | null;
    radius?: number | null;
}

export declare interface IMouseEdgesInsets {
    radius?: number | null;
    distance?: number | null;
    top?: number | null;
    bottom?: number | null;
    left?: number | null;
    right?: number | null;
}

export declare interface IMouseEdgesOptions extends IMouseEdgesInsets {
    speed?: number;
    reverse?: boolean;
    noDecelerate?: boolean;
    linear?: boolean;
    allowButtons?: boolean;
}

export declare class InputManager {
    readonly viewport: Viewport;
    clickedAvailable?: boolean;
    isMouseDown?: boolean;
    last?: Point | null;
    wheelFunction?: (e: WheelEvent) => void;
    touches: IViewportTouch[];
    constructor(viewport: Viewport);
    private addListeners;
    destroy(): void;
    down(event: InteractionEvent): void;
    clear(): void;
    checkThreshold(change: number): boolean;
    move(event: InteractionEvent): void;
    up(event: InteractionEvent): void;
    getPointerPosition(event: WheelEvent): Point;
    handleWheel(event: WheelEvent): void;
    pause(): void;
    get(id: number): IViewportTouch | null;
    remove(id: number): void;
    count(): number;
}

export declare interface IPinchOptions {
    noDrag?: boolean;
    percent?: number;
    factor?: number;
    center?: Point | null;
    axis?: 'all' | 'x' | 'y';
}

export declare interface IScale {
    x: null | number;
    y: null | number;
}

export declare interface ISnapOptions {
    topLeft?: boolean;
    friction?: number;
    time?: number;
    ease?: any;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    forceStart?: boolean;
}

export declare interface ISnapZoomOptions {
    width?: number;
    height?: number;
    time?: number;
    ease?: any;
    center?: Point | null;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    forceStart?: boolean;
    noMove?: boolean;
}

export declare interface IViewportOptions {
    screenWidth?: number;
    screenHeight?: number;
    worldWidth?: number | null;
    worldHeight?: number | null;
    threshold?: number;
    passiveWheel?: boolean;
    stopPropagation?: boolean;
    forceHitArea?: Rectangle | null;
    noTicker?: boolean;
    interaction?: InteractionManager | null;
    disableOnContextMenu?: boolean;
    divWheel?: HTMLElement;
    ticker?: Ticker;
}

export declare interface IViewportTouch {
    id: number;
    last: IPointData | null;
}

export declare interface IViewportTransformState {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
}

export declare interface IWheelOptions {
    percent?: number;
    smooth?: false | number;
    interrupt?: boolean;
    reverse?: boolean;
    center?: Point | null;
    lineHeight?: number;
    axis?: 'all' | 'x' | 'y';
    keyToPress?: string[] | null;
    trackpadPinch?: boolean;
    wheelZoom?: boolean;
}

export declare class MouseEdges extends Plugin_2 {
    readonly options: Readonly<Required<IMouseEdgesOptions>>;
    protected readonly reverse: -1 | 1;
    protected readonly radiusSquared: number | null;
    protected left: number | null;
    protected top: number | null;
    protected right: number | null;
    protected bottom: number | null;
    protected horizontal?: number | null;
    protected vertical?: number | null;
    constructor(parent: Viewport, options?: IMouseEdgesOptions);
    resize(): void;
    down(): boolean;
    move(event: InteractionEvent): boolean;
    private decelerateHorizontal;
    private decelerateVertical;
    up(): boolean;
    update(): void;
}

export declare class Pinch extends Plugin_2 {
    readonly options: Required<IPinchOptions>;
    active: boolean;
    pinching: boolean;
    protected moved: boolean;
    protected lastCenter?: IPointData | null;
    constructor(parent: Viewport, options?: IPinchOptions);
    down(): boolean;
    isAxisX(): boolean;
    isAxisY(): boolean;
    move(e: InteractionEvent): boolean;
    up(): boolean;
}

declare class Plugin_2 {
    readonly parent: Viewport;
    paused: boolean;
    constructor(parent: Viewport);
    destroy(): void;
    down(_e: InteractionEvent): boolean;
    move(_e: InteractionEvent): boolean;
    up(_e: InteractionEvent): boolean;
    wheel(_e: WheelEvent): boolean | undefined;
    update(_delta: number): void;
    resize(): void;
    reset(): void;
    pause(): void;
    resume(): void;
}
export { Plugin_2 as Plugin }

export declare class PluginManager {
    plugins: Partial<Record<string, Plugin_2>>;
    list: Array<Plugin_2>;
    readonly viewport: Viewport;
    constructor(viewport: Viewport);
    add(name: string, plugin: Plugin_2, index?: number): void;
    get(name: 'animate', ignorePaused?: boolean): Animate | undefined | null;
    get(name: 'bounce', ignorePaused?: boolean): Bounce | undefined | null;
    get(name: 'clamp', ignorePaused?: boolean): Clamp | undefined | null;
    get(name: 'clamp-zoom', ignorePaused?: boolean): ClampZoom | undefined | null;
    get(name: 'decelerate', ignorePaused?: boolean): Decelerate | undefined | null;
    get(name: 'drag', ignorePaused?: boolean): Drag | undefined | null;
    get(name: 'follow', ignorePaused?: boolean): Follow | undefined | null;
    get(name: 'mouse-edges', ignorePaused?: boolean): MouseEdges | undefined | null;
    get(name: 'pinch', ignorePaused?: boolean): Pinch | undefined | null;
    get(name: 'snap', ignorePaused?: boolean): Snap | undefined | null;
    get(name: 'snap-zoom', ignorePaused?: boolean): SnapZoom | undefined | null;
    get(name: 'wheel', ignorePaused?: boolean): Wheel | undefined | null;
    get<T extends Plugin_2 = Plugin_2>(name: string, ignorePaused?: boolean): T | undefined | null;
    update(elapsed: number): void;
    resize(): void;
    reset(): void;
    removeAll(): void;
    remove(name: string): void;
    pause(name: string): void;
    resume(name: string): void;
    sort(): void;
    down(event: InteractionEvent): boolean;
    move(event: InteractionEvent): boolean;
    up(event: InteractionEvent): boolean;
    wheel(e: WheelEvent): boolean;
}

export declare class Snap extends Plugin_2 {
    readonly options: Required<ISnapOptions>;
    ease?: any;
    x: number;
    y: number;
    protected percent?: number;
    protected snapping?: {
        time: number;
    } | null;
    protected deltaX?: number;
    protected deltaY?: number;
    protected startX?: number;
    protected startY?: number;
    constructor(parent: Viewport, x: number, y: number, options?: ISnapOptions);
    snapStart(): void;
    wheel(): boolean;
    down(): boolean;
    up(): boolean;
    update(elapsed: number): void;
}

export declare class SnapZoom extends Plugin_2 {
    readonly options: Required<ISnapZoomOptions>;
    protected ease: any;
    protected xScale: number;
    protected yScale: number;
    protected xIndependent: boolean;
    protected yIndependent: boolean;
    protected snapping?: {
        time: number;
        startX: number;
        startY: number;
        deltaX: number;
        deltaY: number;
    } | null;
    constructor(parent: Viewport, options?: ISnapZoomOptions);
    private createSnapping;
    resize(): void;
    wheel(): boolean;
    down(): boolean;
    update(elapsed: number): void;
    resume(): void;
}

export declare class Viewport extends Container {
    moving?: boolean;
    screenWidth: number;
    screenHeight: number;
    threshold: number;
    readonly input: InputManager;
    readonly plugins: PluginManager;
    zooming?: boolean;
    lastViewport?: IViewportTransformState | null;
    readonly options: ICompleteViewportOptions & {
        divWheel: HTMLElement;
    };
    private _dirty?;
    private _forceHitArea?;
    private _hitAreaDefault?;
    private _pause?;
    private readonly tickerFunction?;
    private _worldWidth?;
    private _worldHeight?;
    private _disableOnContextMenu;
    constructor(options?: IViewportOptions);
    destroy(options?: IDestroyOptions): void;
    update(elapsed: number): void;
    resize(screenWidth?: number, screenHeight?: number, worldWidth?: number, worldHeight?: number): void;
    get worldWidth(): number;
    set worldWidth(value: number);
    get worldHeight(): number;
    set worldHeight(value: number);
    getVisibleBounds(): Rectangle;
    toWorld<P extends IPointData = Point>(x: number, y: number): P;
    toWorld<P extends IPointData = Point>(screenPoint: IPointData): P;
    toScreen<P extends IPointData = Point>(x: number, y: number): P;
    toScreen<P extends IPointData = Point>(worldPoint: IPointData): P;
    get worldScreenWidth(): number;
    get worldScreenHeight(): number;
    get screenWorldWidth(): number;
    get screenWorldHeight(): number;
    get center(): Point;
    set center(value: Point);
    moveCenter(x: number, y: number): Viewport;
    moveCenter(center: Point): Viewport;
    get corner(): Point;
    set corner(value: Point);
    moveCorner(x: number, y: number): Viewport;
    moveCorner(center: Point): Viewport;
    get screenWidthInWorldPixels(): number;
    get screenHeightInWorldPixels(): number;
    findFitWidth(width: number): number;
    findFitHeight(height: number): number;
    findFit(width: number, height: number): number;
    findCover(width: number, height: number): number;
    fitWidth(width?: number, center?: boolean, scaleY?: boolean, noClamp?: boolean): Viewport;
    fitHeight(height?: number, center?: boolean, scaleX?: boolean, noClamp?: boolean): Viewport;
    fitWorld(center?: boolean): Viewport;
    fit(center?: boolean, width?: number, height?: number): Viewport;
    setZoom(scale: number, center?: boolean): Viewport;
    zoomPercent(percent: number, center?: boolean): Viewport;
    zoom(change: number, center?: boolean): Viewport;
    get scaled(): number;
    set scaled(scale: number);
    snapZoom(options?: ISnapZoomOptions): Viewport;
    OOB(): {
        left: boolean;
        right: boolean;
        top: boolean;
        bottom: boolean;
        cornerPoint: Point;
    };
    get right(): number;
    set right(value: number);
    get left(): number;
    set left(value: number);
    get top(): number;
    set top(value: number);
    get bottom(): number;
    set bottom(value: number);
    get dirty(): boolean;
    set dirty(value: boolean);
    get forceHitArea(): IHitArea | null | undefined;
    set forceHitArea(value: IHitArea | null | undefined);
    drag(options?: IDragOptions): Viewport;
    clamp(options?: IClampOptions): Viewport;
    decelerate(options?: IDecelerateOptions): Viewport;
    bounce(options?: IBounceOptions): Viewport;
    pinch(options?: IPinchOptions): Viewport;
    snap(x: number, y: number, options?: ISnapOptions): Viewport;
    follow(target: DisplayObject, options?: IFollowOptions): Viewport;
    wheel(options?: IWheelOptions): Viewport;
    animate(options: IAnimateOptions): Viewport;
    clampZoom(options: IClampZoomOptions): Viewport;
    mouseEdges(options: IMouseEdgesOptions): Viewport;
    get pause(): boolean;
    set pause(value: boolean);
    ensureVisible(x: number, y: number, width: number, height: number, resizeToFit?: boolean): void;
}

export declare class Wheel extends Plugin_2 {
    readonly options: Required<IWheelOptions>;
    protected smoothing?: IPointData | null;
    protected smoothingCenter?: Point | null;
    protected smoothingCount?: number;
    protected keyIsPressed: boolean;
    constructor(parent: Viewport, options?: IWheelOptions);
    protected handleKeyPresses(codes: string[]): void;
    protected checkKeyPress(): boolean;
    down(): boolean;
    protected isAxisX(): boolean;
    protected isAxisY(): boolean;
    update(): void;
    private pinch;
    wheel(e: WheelEvent): boolean;
}

export { }
