import * as PIXI from 'pixi.js'

type DirectionType = 'all' | 'x' | 'y'
type UnderflowType = 'center' | 'top' | 'left' | 'right' | 'bottom' | string
type SidesType = 'all' | 'horizontal' | 'vertical' | string
type PluginType = 'bounce' | 'clamp-zoom' | 'clamp' | 'decelerate' | 'drag' | 'follow' | 'mouse-edges' | 'pinch' | 'snap' | 'snap-zoom' | 'wheel'
type EventType = 'pinch-start' | 'pinch-end' | 'snap-start' | 'snap-end' | 'snap-zoom-start' | 'snap-zoom-end' | 'bounce-x-start' | 'bounce-x-end' | 'bounce-y-start' | 'bounce-y-end' | 'wheel-scroll' | 'mouse-edge-start' | 'mouse-edge-end' | 'moved' | 'moved-end' | 'zoomed-end'
type ClickEventType = 'clicked' | 'drag-start' | 'drag-end'
type WheelEventType = 'wheel'
type ZoomedEventType = 'zoomed'
type ZoomedEventSourceType = 'clamp-zoom' | 'pinch' | 'wheel'
type MovedEventSourceType = 'bounce-x' | 'bounce-y' | 'clamp-x' | 'clamp-y' | 'decelerate' | 'drag' | 'wheel' | 'follow' | 'mouse-edges' | 'pinch' | 'snap'
type MouseButtonsType = 'all' | 'left' | 'middle' | 'right' | string

interface ViewportOptions
{
    divWheel?: HTMLElement
    forceHitArea?: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle
    interaction?: PIXI.interaction.InteractionManager
    screenHeight?: number
    screenWidth?: number
    threshold?: number
    passiveWheel?: boolean
    noTicker?: boolean
    ticker?: PIXI.Ticker
    worldHeight?: number
    worldWidth?: number
    noOnContextMenu?: boolean
}

interface DragOptions
{
    direction?: DirectionType
    wheel?: boolean
    wheelScroll?: number
    reverse?: boolean
    clampWheel?: boolean | string
    underflow?: string
    factor?: number
    mouseButtons?: MouseButtonsType
}

interface PinchOptions
{
    percent?: number
    noDrag?: boolean
    center?: PIXI.Point
}

interface Bounds
{
    x: number
    y: number
    width: number
    height: number
}


interface DragOptions
{
    direction?: DirectionType
    wheel?: boolean
    wheelScroll?: number
    reverse?: boolean
    underflow?: UnderflowType
    clampWheel?: boolean | string
    factor?: number
    mouseButtons?: MouseButtonsType
}

interface ClampOptions
{
    left?: boolean | number
    right?: boolean | number
    top?: boolean | number
    bottom?: boolean | number
    direction?: DirectionType
    underflow?: UnderflowType
}

interface DecelerateOptions
{
    friction?: number
    bounce?: number
    minSpeed?: number
}

interface BounceOptions
{
    sides?: SidesType
    friction?: number
    time?: number
    ease?: string | Function
    underflow: UnderflowType
}

interface SnapOptions
{
    topLeft?: boolean
    friction?: number
    time?: number
    ease?: string | Function
    interrupt?: boolean
    removeOnComplete?: boolean
    removeOnInterrupt?: boolean
    forceStart?: boolean
}

interface FollowOptions
{
    speed?: number
    radius?: number
    acceleration?: number
}

interface WheelOptions
{
    percent?: number
    reverse?: boolean
    center?: PIXI.Point
    smooth?: number
}

interface ClampZoomOptions
{
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
}

interface MouseEdgesOptions
{
    radius?: number
    distance?: number
    top?: number
    bottom?: number
    left?: number
    right?: number
    speed?: number
    reverse?: boolean
    noDecelerate?: boolean
    linear?: boolean
}

interface SnapZoomOptions
{
    center?: PIXI.Point
    ease?: string | Function
    forceStart?: boolean
    height?: number
    interrupt?: boolean
    removeOnComplete?: boolean
    removeOnInterrupt?: boolean
    time?: number
    width?: number
}

interface OutOfBounds
{
    bottom: boolean
    left: boolean
    right: boolean
    top: boolean
}

interface ClickEventData
{
    screen: PIXI.Point
    viewport: Viewport
    world: PIXI.Point
}

interface WheelData
{
    dx: number
    dy: number
    dz: number
}

interface MovedEventData
{
    type: MovedEventSourceType
    viewport: Viewport
}

interface WheelEventData
{
    viewport: Viewport
    wheel: WheelData
}

interface ZoomedEventData
{
    type: ZoomedEventSourceType
    viewport: Viewport
}

export declare class Viewport extends PIXI.Container
{
    screenWidth: number
    screenHeight: number

    worldHeight: number
    worldWidth: number
    worldScreenWidth: number
    worldScreenHeight: number

    forceHitArea?: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle

    center: PIXI.Point
    corner: PIXI.Point

    right: number
    left: number
    top: number
    bottom: number

    dirty: boolean
    pause: boolean

    constructor(options?: ViewportOptions)

    // Public API
    removeListeners(): void
    update(elapsed: number): void
    resize(screenWidth: number, screenHeight: number, worldWidth?: number, worldHeight?: number): void

    toWorld(p: PIXI.Point): PIXI.Point
    toWorld(x: number, y: number): PIXI.Point
    toScreen(p: PIXI.Point): PIXI.Point
    toScreen(x: number, y: number): PIXI.Point

    getPointerPosition(event: PIXI.interaction.InteractionEvent): PIXI.Point
    getPointerPosition(event: WheelEvent): PIXI.Point

    moveCenter(p: PIXI.Point): this
    moveCenter(x: number, y: number): this
    moveCorner(p: PIXI.Point): this
    moveCorner(x: number, y: number): this

    fitWidth(width?: number, center?: boolean, scaleY?: boolean, noClamp?: boolean): this
    fitHeight(height?: number, center?: boolean, scaleX?: boolean, noClamp?: boolean): this
    fitWorld(center?: boolean): this
    fit(center?: boolean, width?: number, height?: number): this

    setZoom(scale: number, center?: boolean): this
    zoomPercent(percent: number, center?: boolean): this
    zoom(change: number, center?: boolean): this

    getVisibleBounds(): Bounds

    // Plugins
    plugins: PluginManager
    // removePlugin(type: Viewport.PluginType): void
    // pausePlugin(type: Viewport.PluginType): void
    // resumePlugin(type: Viewport.PluginType): void
    drag(options?: DragOptions): this
    clamp(options?: ClampOptions): this
    decelerate(options?: DecelerateOptions): this
    bounce(options?: BounceOptions): this
    pinch(options?: PinchOptions): this
    snap(x: number, y: number, options?: SnapOptions): this
    snapZoom(options?: SnapZoomOptions): this
    follow(target: PIXI.DisplayObject, options?: FollowOptions): this
    wheel(options?: WheelOptions): this
    clampZoom(options?: ClampZoomOptions): this
    mouseEdges(options?: MouseEdgesOptions): this

    // Events
    on(
        event: 'added' | 'removed',
        fn: (container: PIXI.Container) => void,
        context?: any
    ): this
    // Events
    on(
        event: PIXI.interaction.InteractionEventTypes,
        fn: (event: PIXI.interaction.InteractionEvent) => void,
        context?: any
    ): this
    on(
        event: EventType,
        fn: (viewport: Viewport) => void,
        context?: any
    ): this
    on(
        event: ClickEventType,
        fn: (data: ClickEventData) => void,
        context?: any
    ): this
    on(
        event: WheelEventType,
        fn: (data: WheelEventData) => void,
        context?: any
    ): this
    on(
        event: ZoomedEventType,
        fn: (data: ZoomedEventData) => void,
        context?: any
    ): this

    listeners(event: string | symbol): Function[]
    listeners(event: string | symbol, exists: boolean): boolean

    /**
    * Do not use. This is in fact a protected method.
    */
    listeners(div: HTMLElement): void

    // Protected/Private methods
    protected resizePlugins(): void
    protected down(e: UIEvent): void
    protected checkThreshold(change: number): void
    protected move(e: UIEvent): void
    protected up(e: UIEvent): void
    protected handleWheel(e: UIEvent): void
    // protected OOB(): Viewport.OutOfBounds
    protected countDownPointers(): number
    protected getTouchPointers(): number
    protected _reset(): void
}

export declare class Plugin
{
    constructor(viewport: Viewport)
    down(event: PIXI.interaction.InteractionEvent): void
    up(event: PIXI.interaction.InteractionEvent): void
    move(event: PIXI.interaction.InteractionEvent): void
    wheel(event: WheelEvent): void
    update(): void
    resize(): void
    reset(): void
    pause(): void
    resume(): void
}

declare class PluginManager
{
    constructor(viewport: Viewport)
    add(type: string, plugin: Plugin, index?: number): void
    get(name: string): Plugin
    remove(name: string): void
    pause(name: string): void
    resume(name: string): void
}
