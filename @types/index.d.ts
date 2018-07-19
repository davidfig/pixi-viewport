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

type ViewportEventType =
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
  | "zoomed";

type ViewportClickEventType = "clicked" | "drag-start" | "drag-end";

type ViewportWheelEventType = "wheel";

interface ViewportOptions {
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

interface ViewportClickEventData {
  screen: PIXI.PointLike;
  viewport: Viewport;
  world: PIXI.PointLike;
}

interface ViewportWheelData {
  dx: number;
  dy: number;
  dz: number;
}

interface ViewportWheelEventData {
  viewport: Viewport;
  wheel: ViewportWheelData;
}

declare namespace Viewport {

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

  center: PIXI.PointLike;
  corner: PIXI.PointLike;

  right: number;
  left: number;
  top: number;
  bottom: number;

  dirty: boolean;

  constructor(options?: ViewportOptions);

  // Public API
  update(): void;
  pause(): void;
  resize(): void;

  toWorld(p: PIXI.Point): PIXI.Point;
  toWorld(x: number, y: number): PIXI.Point;
  toScreen(p: PIXI.Point): PIXI.Point;
  toScreen(x: number, y: number): PIXI.Point;

  moveCenter(p: PIXI.Point): this;
  moveCenter(x: number, y: number): this;
  moveCorner(p: PIXI.Point): this;
  moveCorner(x: number, y: number): this;

  fitWidth(width?: number, center?: boolean): this;
  fitHeight(width?: number, center?: boolean): this;
  fitWorld(center?: boolean): this;
  fit(center?: boolean, width?: number, height?: number): this;

  zoomPercent(percent: number, center?: boolean): this;
  zoom(change: number, center?: boolean): this;

  // Plugins
  removePlugin(type: PluginType): void;
  pausePlugin(type: PluginType): void;
  resumePlugin(type: PluginType): void;
  drag(options?: DragOptions): this;
  clamp(options?: ClampOptions): this;
  decelerate(options?: DecelerateOptions): this;
  bounce(options?: BounceOptions): this;
  pinch(options?: PinchOptions): this;
  snap(x: number, y: number, options?: SnapOptions): this;
  snapZoom(options?: SnapZoomOptions): this;
  follow(target: PIXI.DisplayObject, options?: FollowOptions): this;
  wheel(options?: WheelOptions): this;
  clampZoom(options?: ClampZoomOptions): this;
  mouseEdges(options?: MouseEdgesOptions): this;

  // Events
  // @ts-ignore Needed because of incompatible override of Container.on()
  on(
    event: ViewportEventType,
    fn: (viewport: Viewport) => void,
    context?: any
  ): this;
  // @ts-ignore Needed because of incompatible override of Container.on()
  on(
    event: ViewportClickEventType,
    fn: (data: ViewportClickEventData) => void,
    context?: any
  ): this;
  // @ts-ignore Needed because of incompatible override of Container.on()
  on(
    event: ViewportWheelEventType,
    fn: (data: ViewportWheelEventData) => void,
    context?: any
  ): this;

  // Protected/Private methods
  // @ts-ignore Needed because of incompatible override of Container.listeners()
  protected listeners(div: HTMLElement): void;
  protected resizePlugins(): void;
  protected down(e: UIEvent): void;
  protected checkThreshold(change: number): void;
  protected move(e: UIEvent): void;
  protected up(e: UIEvent): void;
  protected handleWheel(e: UIEvent): void;
  protected OOB(): OutOfBounds;
  protected countDownPointers(): number;
  protected getTouchPointers(): number;
  protected _reset(): void;
}

export = Viewport;
export as namespace Viewport;
