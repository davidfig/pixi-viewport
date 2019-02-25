import * as PIXI from 'pixi.js';

export = Viewport;
export as namespace Viewport;

declare namespace Viewport
{
  type DirectionType = "all" | "x" | "y";

  type UnderflowType = "center" | "top" | "left" | "right" | "bottom" | string;

  type SidesType = "all" | "horizontal" | "vertical" | string;

  type PluginType =
    | "bounce"
    | "clamp-zoom"
    | "clamp"
    | "decelerate"
    | "drag"
    | "follow"
    | "mouse-edges"
    | "pinch"
    | "snap"
    | "snap-zoom"
    | "wheel";

  type EventType =
    | "pinch-start"
    | "pinch-end"
    | "snap-start"
    | "snap-end"
    | "snap-zoom-start"
    | "snap-zoom-end"
    | "bounce-x-start"
    | "bounce-x-end"
    | "bounce-y-start"
    | "bounce-y-end"
    | "wheel-scroll"
    | "mouse-edge-start"
    | "mouse-edge-end"
    | "moved"
    | "zoomed"
    | "moved-end"
    | "zoomed-end";

  type ClickEventType = "clicked" | "drag-start" | "drag-end";

  type WheelEventType = "wheel";

  interface Bounds {
    x: number,
    y: number,
    width: number,
    height: number
  }

  interface Options {
    divWheel?: HTMLElement;
    forceHitArea?:
      | PIXI.Rectangle
      | PIXI.Circle
      | PIXI.Ellipse
      | PIXI.Polygon
      | PIXI.RoundedRectangle;
    interaction?: PIXI.interaction.InteractionManager;
    screenHeight?: number;
    screenWidth?: number;
    threshold?: number;
    passiveWheel?: boolean;
    noTicker?: boolean;
    ticker?: PIXI.ticker.Ticker;
    worldHeight?: number;
    worldWidth?: number;
  }

  interface DragOptions {
    direction?: DirectionType;
    wheel?: boolean;
    wheelScroll?: number;
    reverse?: boolean;
    underflow?: UnderflowType;
    clampWheel?: boolean | number;
    factor?: number;
  }

  interface ClampOptions {
    left?: boolean | number;
    right?: boolean | number;
    top?: boolean | number;
    bottom?: boolean | number;
    direction?: DirectionType;
    underflow?: UnderflowType;
  }

  interface DecelerateOptions {
    friction?: number;
    bounce?: number;
    minSpeed?: number;
  }

  interface BounceOptions {
    sides?: SidesType;
    friction?: number;
    time?: number;
    ease?: string | Function;
    underflow: UnderflowType;
  }

  interface PinchOptions {
    percent?: number;
    noDrag?: boolean;
    center?: PIXI.Point;
  }

  interface SnapOptions {
    topLeft?: boolean;
    friction?: number;
    time?: number;
    ease?: string | Function;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    forceStart?: boolean;
  }

  interface FollowOptions {
    speed?: number;
    radius?: number;
  }

  interface WheelOptions {
    percent?: number;
    reverse?: boolean;
    center?: PIXI.Point;
    smooth?: number;
  }

  interface ClampZoomOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }

  interface MouseEdgesOptions {
    radius?: number;
    distance?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    speed?: number;
    reverse?: boolean;
    noDecelerate?: boolean;
    linear?: boolean;
  }

  interface SnapZoomOptions {
    center?: PIXI.Point;
    ease?: string | Function;
    forceStart?: boolean;
    height?: number;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    time?: number;
    width?: number;
  }

  interface OutOfBounds {
    bottom: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
  }

  interface ClickEventData {
    screen: PIXI.Point;
    viewport: Viewport;
    world: PIXI.Point;
  }

  interface WheelData {
    dx: number;
    dy: number;
    dz: number;
  }

  interface WheelEventData {
    viewport: Viewport;
    wheel: WheelData;
  }
}

declare class Plugin
{
  constructor(viewport: Viewport);
  down(event: PIXI.interaction.InteractionEvent): void;
  up(event: PIXI.interaction.InteractionEvent): void;
  move(event: PIXI.interaction.InteractionEvent): void;
  wheel(event: WheelEvent): void;
  update(): void;
  resize(): void;
  reset(): void;
  pause(): void;
  resume(): void;
}

declare class Viewport extends PIXI.Container {
  screenHeight: number;
  screenWidth: number;

  worldHeight: number;
  worldWidth: number;
  worldScreenWidth: number;
  worldScreenHeight: number;

  forceHitArea?:
      | PIXI.Rectangle
      | PIXI.Circle
      | PIXI.Ellipse
      | PIXI.Polygon
      | PIXI.RoundedRectangle;

  center: PIXI.Point;
  corner: PIXI.Point;

  right: number;
  left: number;
  top: number;
  bottom: number;

  dirty: boolean;

  pause: boolean;

  constructor(options?: Viewport.Options);

  // Public API
  removeListeners(): void;
  update(elapsed: number): void;
  resize(screenWidth: number, screenHeight: number, worldWidth?: number, worldHeight?: number): void;

  toWorld(p: PIXI.Point): PIXI.Point;
  toWorld(x: number, y: number): PIXI.Point;
  toScreen(p: PIXI.Point): PIXI.Point;
  toScreen(x: number, y: number): PIXI.Point;

  getPointerPosition(event: PIXI.interaction.InteractionEvent): PIXI.Point;
  getPointerPosition(event: WheelEvent): PIXI.Point;

  moveCenter(p: PIXI.Point): this;
  moveCenter(x: number, y: number): this;
  moveCorner(p: PIXI.Point): this;
  moveCorner(x: number, y: number): this;

  fitWidth(width?: number, center?: boolean, scaleY?: boolean, noClamp?: boolean): this;
  fitHeight(height?: number, center?: boolean, scaleX?: boolean, noClamp?: boolean): this;
  fitWorld(center?: boolean): this;
  fit(center?: boolean, width?: number, height?: number): this;

  zoomPercent(percent: number, center?: boolean): this;
  zoom(change: number, center?: boolean): this;

  getVisibleBounds(): Viewport.Bounds;

  // Plugins
  plugins: Record<string, Plugin>;
  userPlugin(type: string, plugin: Plugin, index?: number): void;
  removePlugin(type: Viewport.PluginType): void;
  pausePlugin(type: Viewport.PluginType): void;
  resumePlugin(type: Viewport.PluginType): void;
  drag(options?: Viewport.DragOptions): this;
  clamp(options?: Viewport.ClampOptions): this;
  decelerate(options?: Viewport.DecelerateOptions): this;
  bounce(options?: Viewport.BounceOptions): this;
  pinch(options?: Viewport.PinchOptions): this;
  snap(x: number, y: number, options?: Viewport.SnapOptions): this;
  snapZoom(options?: Viewport.SnapZoomOptions): this;
  follow(target: PIXI.DisplayObject, options?: Viewport.FollowOptions): this;
  wheel(options?: Viewport.WheelOptions): this;
  clampZoom(options?: Viewport.ClampZoomOptions): this;
  mouseEdges(options?: Viewport.MouseEdgesOptions): this;

  // Events
  on(
    event: "added" | "removed",
    fn: (container: PIXI.Container) => void,
    context?: any
  ): this;
  // Events
  on(
    event: PIXI.interaction.InteractionEventTypes,
    fn: (event: PIXI.interaction.InteractionEvent) => void,
    context?: any
  ): this;
  on(
    event: Viewport.EventType,
    fn: (viewport: Viewport) => void,
    context?: any
  ): this;
  on(
    event: Viewport.ClickEventType,
    fn: (data: Viewport.ClickEventData) => void,
    context?: any
  ): this;
  on(
    event: Viewport.WheelEventType,
    fn: (data: Viewport.WheelEventData) => void,
    context?: any
  ): this;

  listeners(event: string | symbol): Function[];
  listeners(event: string | symbol, exists: boolean): boolean;

  /**
   * Do not use. This is in fact a protected method.
   */
  listeners(div: HTMLElement): void;

  // Protected/Private methods
  protected resizePlugins(): void;
  protected down(e: UIEvent): void;
  protected checkThreshold(change: number): void;
  protected move(e: UIEvent): void;
  protected up(e: UIEvent): void;
  protected handleWheel(e: UIEvent): void;
  protected OOB(): Viewport.OutOfBounds;
  protected countDownPointers(): number;
  protected getTouchPointers(): number;
  protected _reset(): void;
}
