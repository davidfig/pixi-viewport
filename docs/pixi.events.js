/*!
 * @pixi/events - v6.1.2
 * Compiled Thu, 12 Aug 2021 17:11:19 UTC
 *
 * @pixi/events is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI = this.PIXI || {};
var _pixi_events = (function (exports, utils, math, display) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            var arguments$1 = arguments;

            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments$1[i];
                for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            { t[p] = s[p]; } }
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            { for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) { if (e.indexOf(p[i]) < 0)
                { t[p[i]] = s[p[i]]; } } }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") { r = Reflect.decorate(decorators, target, key, desc); }
        else { for (var i = decorators.length - 1; i >= 0; i--) { if (d = decorators[i]) { r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r; } } }
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") { return Reflect.metadata(metadataKey, metadataValue); }
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) { throw new TypeError("Generator is already executing."); }
            while (_) { try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) { return t; }
                if (y = 0, t) { op = [op[0] & 2, t.value]; }
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) { _.ops.pop(); }
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
            if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __exportStar(m, exports) {
        for (var p in m) { if (!exports.hasOwnProperty(p)) { exports[p] = m[p]; } }
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) { return m.call(o); }
        return {
            next: function () {
                if (o && i >= o.length) { o = void 0; }
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) { return o; }
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) { ar.push(r.value); }
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) { m.call(i); }
            }
            finally { if (e) { throw e.error; } }
        }
        return ar;
    }

    function __spread() {
        var arguments$1 = arguments;

        for (var ar = [], i = 0; i < arguments.length; i++)
            { ar = ar.concat(__read(arguments$1[i])); }
        return ar;
    }

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) { resume(q[0][0], q[0][1]); } }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) { return mod; }
        var result = {};
        if (mod != null) { for (var k in mod) { if (Object.hasOwnProperty.call(mod, k)) { result[k] = mod[k]; } } }
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    /**
     * An DOM-compatible synthetic event implementation that is "forwarded" on behalf of an original
     * FederatedEvent or native {@link https://dom.spec.whatwg.org/#event Event}.
     *
     * @memberof PIXI
     * @typeParam N - The type of native event held.
     */
    var FederatedEvent = /** @class */ (function () {
        /**
         * @param manager - The event boundary which manages this event. Propagation can only occur
         *  within the boundary's jurisdiction.
         */
        function FederatedEvent(manager) {
            /** Flags whether this event bubbles. This will take effect only if it is set before propagation. */
            this.bubbles = true;
            /** @deprecated */
            this.cancelBubble = true;
            /**
             * Flags whether this event can be canceled using {@link FederatedEvent.preventDefault}. This is always
             * false (for now).
             */
            this.cancelable = false;
            /**
             * Flag added for compatibility with DOM {@code Event}. It is not used in the Federated Events
             * API.
             *
             * @see https://dom.spec.whatwg.org/#dom-event-composed
             */
            this.composed = false;
            /** Flags whether the default response of the user agent was prevent through this event. */
            this.defaultPrevented = false;
            /**
             * The propagation phase.
             *
             * @default {@link FederatedEvent.NONE}
             */
            this.eventPhase = FederatedEvent.prototype.NONE;
            /** Flags whether propagation was stopped. */
            this.propagationStopped = false;
            /** Flags whether propagation was immediately stopped. */
            this.propagationImmediatelyStopped = false;
            /**
             * The coordinates of the evnet relative to the nearest DOM layer. This is a non-standard
             * property.
             */
            this.layer = new math.Point();
            /**
             * The coordinates of the event relative to the DOM document. This is a non-standard property.
             */
            this.page = new math.Point();
            this.AT_TARGET = 1;
            this.BUBBLING_PHASE = 2;
            this.CAPTURING_PHASE = 3;
            this.NONE = 0;
            this.manager = manager;
        }
        Object.defineProperty(FederatedEvent.prototype, "layerX", {
            /** @readonly */
            get: function () { return this.layer.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedEvent.prototype, "layerY", {
            /** @readonly */
            get: function () { return this.layer.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedEvent.prototype, "pageX", {
            /** @readonly */
            get: function () { return this.page.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedEvent.prototype, "pageY", {
            /** @readonly */
            get: function () { return this.page.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedEvent.prototype, "data", {
            /**
             * Fallback for the deprecated {@link PIXI.InteractionEvent.data}.
             *
             * @deprecated
             */
            get: function () {
                return this;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * The propagation path for this event. Alias for {@link EventBoundary.propagationPath}.
         */
        FederatedEvent.prototype.composedPath = function () {
            // Find the propagation path if it isn't cached or if the target has changed since since
            // the last evaluation.
            if (this.manager && (!this.path || this.path[this.path.length - 1] !== this.target)) {
                this.path = this.target ? this.manager.propagationPath(this.target) : [];
            }
            return this.path;
        };
        /**
         * Unimplemented method included for implementing the DOM interface {@code Event}. It will throw
         * an {@code Error}.
         */
        FederatedEvent.prototype.initEvent = function (_type, _bubbles, _cancelable) {
            throw new Error('initEvent() is a legacy DOM API. It is not implemented in the Federated Events API.');
        };
        /**
         * Prevent default behavior of PixiJS and the user agent.
         */
        FederatedEvent.prototype.preventDefault = function () {
            if (this.nativeEvent instanceof Event && this.nativeEvent.cancelable) {
                this.nativeEvent.preventDefault();
            }
            this.defaultPrevented = true;
        };
        /**
         * Stop this event from propagating to any addition listeners, including on the
         * {@link FederatedEventTarget.currentTarget currentTarget} and also the following
         * event targets on the propagation path.
         */
        FederatedEvent.prototype.stopImmediatePropagation = function () {
            this.propagationImmediatelyStopped = true;
        };
        /**
         * Stop this event from propagating to the next {@link FederatedEventTarget}. The rest of the listeners
         * on the {@link FederatedEventTarget.currentTarget currentTarget} will still be notified.
         */
        FederatedEvent.prototype.stopPropagation = function () {
            this.propagationStopped = true;
        };
        return FederatedEvent;
    }());

    /**
     * A {@link PIXI.FederatedEvent} for mouse events.
     *
     * @memberof PIXI
     */
    var FederatedMouseEvent = /** @class */ (function (_super) {
        __extends(FederatedMouseEvent, _super);
        function FederatedMouseEvent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * The coordinates of the mouse event relative to the canvas.
             */
            _this.client = new math.Point();
            /**
             * The movement in this pointer relative to the last `mousemove` event.
             */
            _this.movement = new math.Point();
            /**
             * The offset of the pointer coordinates w.r.t. target DisplayObject in world space. This is
             * not supported at the moment.
             */
            _this.offset = new math.Point();
            /**
             * The pointer coordinates in world space.
             */
            _this.global = new math.Point();
            /**
             * The pointer coordinates in the renderer's {@link PIXI.Renderer.screen screen}. This has slightly
             * different semantics than native PointerEvent screenX/screenY.
             */
            _this.screen = new math.Point();
            return _this;
        }
        Object.defineProperty(FederatedMouseEvent.prototype, "clientX", {
            /** @readonly */
            get: function () { return this.client.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "clientY", {
            /** @readonly */
            get: function () { return this.client.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "x", {
            /**
             * Alias for {@link FederatedMouseEvent.clientX this.clientX}.
             *
             * @readonly
             */
            get: function () { return this.clientX; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "y", {
            /**
             * Alias for {@link FederatedMouseEvent.clientY this.clientY}.
             *
             * @readonly
             */
            get: function () { return this.clientY; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "movementX", {
            /** @readonly */
            get: function () { return this.movement.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "movementY", {
            /** @readonly */
            get: function () { return this.movement.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "offsetX", {
            /** @readonly */
            get: function () { return this.offset.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "offsetY", {
            /** @readonly */
            get: function () { return this.offset.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "globalX", {
            /** @readonly */
            get: function () { return this.global.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "globalY", {
            /** @readonly */
            get: function () { return this.global.y; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "screenX", {
            /**
             * The pointer coordinates in the renderer's screen. Alias for {@code screen.x}.
             *
             * @readonly
             */
            get: function () { return this.screen.x; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FederatedMouseEvent.prototype, "screenY", {
            /**
             * The pointer coordinates in the renderer's screen. Alias for {@code screen.y}.
             *
             * @readonly
             */
            get: function () { return this.screen.y; },
            enumerable: false,
            configurable: true
        });
        /**
         * Whether the modifier key was pressed when this event natively occurred.
         *
         * @param key - The modifier key.
         */
        FederatedMouseEvent.prototype.getModifierState = function (key) {
            return 'getModifierState' in this.nativeEvent && this.nativeEvent.getModifierState(key);
        };
        /**
         * Not supported.
         *
         * @deprecated
         */
        // eslint-disable-next-line max-params
        FederatedMouseEvent.prototype.initMouseEvent = function (_typeArg, _canBubbleArg, _cancelableArg, _viewArg, _detailArg, _screenXArg, _screenYArg, _clientXArg, _clientYArg, _ctrlKeyArg, _altKeyArg, _shiftKeyArg, _metaKeyArg, _buttonArg, _relatedTargetArg) {
            throw new Error('Method not implemented.');
        };
        return FederatedMouseEvent;
    }(FederatedEvent));

    /**
     * A {@link PIXI.FederatedEvent} for pointer events.
     *
     * @memberof PIXI
     */
    var FederatedPointerEvent = /** @class */ (function (_super) {
        __extends(FederatedPointerEvent, _super);
        function FederatedPointerEvent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * The width of the pointer's contact along the x-axis, measured in CSS pixels.
             * radiusX of TouchEvents will be represented by this value.
             *
             * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
             */
            _this.width = 0;
            /**
             * The height of the pointer's contact along the y-axis, measured in CSS pixels.
             * radiusY of TouchEvents will be represented by this value.
             *
             * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
             */
            _this.height = 0;
            /**
             * Indicates whether or not the pointer device that created the event is the primary pointer.
             *
             * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
             */
            _this.isPrimary = false;
            return _this;
        }
        // Only included for completeness for now
        FederatedPointerEvent.prototype.getCoalescedEvents = function () {
            if (this.type === 'pointermove' || this.type === 'mousemove' || this.type === 'touchmove') {
                return [this];
            }
            return [];
        };
        // Only included for completeness for now
        FederatedPointerEvent.prototype.getPredictedEvents = function () {
            throw new Error('getPredictedEvents is not supported!');
        };
        return FederatedPointerEvent;
    }(FederatedMouseEvent));

    /**
     * A {@link PIXI.FederatedEvent} for wheel events.
     *
     * @memberof PIXI
     */
    var FederatedWheelEvent = /** @class */ (function (_super) {
        __extends(FederatedWheelEvent, _super);
        function FederatedWheelEvent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** Units specified in lines. */
            _this.DOM_DELTA_LINE = 0;
            /** Units specified in pages. */
            _this.DOM_DELTA_PAGE = 1;
            /** Units specified in pixels. */
            _this.DOM_DELTA_PIXEL = 2;
            return _this;
        }
        return FederatedWheelEvent;
    }(FederatedMouseEvent));

    // The maximum iterations used in propagation. This prevent infinite loops.
    var PROPAGATION_LIMIT = 2048;
    var tempHitLocation = new math.Point();
    var tempLocalMapping = new math.Point();
    /**
     * Event boundaries are "barriers" where events coming from an upstream scene are modified before downstream propagation.
     *
     * ## Root event boundary
     *
     * The {@link PIXI.EventSystem#rootBoundary rootBoundary} handles events coming from the &lt;canvas /&gt;.
     * {@link PIXI.EventSystem} handles the normalization from native {@link https://dom.spec.whatwg.org/#event Events}
     * into {@link PIXI.FederatedEvent FederatedEvents}. The rootBoundary then does the hit-testing and event dispatch
     * for the upstream normalized event.
     *
     * ## Additional event boundaries
     *
     * An additional event boundary may be desired within an application's scene graph. For example, if a portion of the scene is
     * is flat with many children at one level - a spatial hash maybe needed to accelerate hit testing. In this scenario, the
     * container can be detached from the scene and glued using a custom event boundary.
     *
     * ```ts
     * import { Container } from '@pixi/display';
     * import { EventBoundary } from '@pixi/events';
     * import { SpatialHash } from 'pixi-spatial-hash';
     *
     * class HashedHitTestingEventBoundary
     * {
     *     private spatialHash: SpatialHash;
     *
     *     constructor(scene: Container, spatialHash: SpatialHash)
     *     {
     *         super(scene);
     *         this.spatialHash = spatialHash;
     *     }
     *
     *     hitTestRecursive(...)
     *     {
     *         // TODO: If target === this.rootTarget, then use spatial hash to get a
     *         // list of possible children that match the given (x,y) coordinates.
     *     }
     * }
     *
     * class VastScene extends DisplayObject
     * {
     *     protected eventBoundary: EventBoundary;
     *     protected scene: Container;
     *     protected spatialHash: SpatialHash;
     *
     *     constructor()
     *     {
     *         this.scene = new Container();
     *         this.spatialHash = new SpatialHash();
     *         this.eventBoundary = new HashedHitTestingEventBoundary(this.scene, this.spatialHash);
     *
     *         // Populate this.scene with a ton of children, while updating this.spatialHash
     *     }
     * }
     * ```
     *
     * @memberof PIXI
     */
    var EventBoundary = /** @class */ (function () {
        /**
         * @param rootTarget - The holder of the event boundary.
         */
        function EventBoundary(rootTarget) {
            /**
             * Emits events after they were dispatched into the scene graph.
             *
             * This can be used for global events listening, regardless of the scene graph being used. It should
             * not be used by interactive libraries for normal use.
             *
             * Special events that do not bubble all the way to the root target are not emitted from here,
             * e.g. pointerenter, pointerleave, click.
             */
            this.dispatch = new utils.EventEmitter();
            /**
             * This flag would emit `pointermove`, `touchmove`, and `mousemove` events on all DisplayObjects.
             *
             * The `moveOnAll` semantics mirror those of earlier versions of PixiJS. This was disabled in favor of
             * the Pointer Event API's approach.
             */
            this.moveOnAll = false;
            /**
             * State object for mapping methods.
             *
             * @see PIXI.EventBoundary#trackingData
             */
            this.mappingState = {
                trackingData: {}
            };
            /**
             * The event pool maps event constructors to an free pool of instances of those specific events.
             *
             * @see PIXI.EventBoundary#allocateEvent
             * @see PIXI.EventBoundary#freeEvent
             */
            this.eventPool = new Map();
            this.rootTarget = rootTarget;
            this.hitPruneFn = this.hitPruneFn.bind(this);
            this.hitTestFn = this.hitTestFn.bind(this);
            this.mapPointerDown = this.mapPointerDown.bind(this);
            this.mapPointerMove = this.mapPointerMove.bind(this);
            this.mapPointerOut = this.mapPointerOut.bind(this);
            this.mapPointerOver = this.mapPointerOver.bind(this);
            this.mapPointerUp = this.mapPointerUp.bind(this);
            this.mapPointerUpOutside = this.mapPointerUpOutside.bind(this);
            this.mapWheel = this.mapWheel.bind(this);
            this.mappingTable = {};
            this.addEventMapping('pointerdown', this.mapPointerDown);
            this.addEventMapping('pointermove', this.mapPointerMove);
            this.addEventMapping('pointerout', this.mapPointerOut);
            this.addEventMapping('pointerleave', this.mapPointerOut);
            this.addEventMapping('pointerover', this.mapPointerOver);
            this.addEventMapping('pointerup', this.mapPointerUp);
            this.addEventMapping('pointerupoutside', this.mapPointerUpOutside);
            this.addEventMapping('wheel', this.mapWheel);
        }
        /**
         * Adds an event mapping for the event `type` handled by `fn`.
         *
         * Event mappings can be used to implement additional or custom events. They take an event
         * coming from the upstream scene (or directly from the {@link PIXI.EventSystem}) and dispatch new downstream events
         * generally trickling down and bubbling up to {@link PIXI.EventBoundary.rootTarget this.rootTarget}.
         *
         * To modify the semantics of existing events, the built-in mapping methods of EventBoundary should be overridden
         * instead.
         *
         * @param type - The type of upstream event to map.
         * @param fn - The mapping method. The context of this function must be bound manually, if desired.
         */
        EventBoundary.prototype.addEventMapping = function (type, fn) {
            if (!this.mappingTable[type]) {
                this.mappingTable[type] = [];
            }
            this.mappingTable[type].push({
                fn: fn,
                priority: 0,
            });
            this.mappingTable[type].sort(function (a, b) { return a.priority - b.priority; });
        };
        /** Dispatches the given event */
        EventBoundary.prototype.dispatchEvent = function (e, type) {
            e.propagationStopped = false;
            e.propagationImmediatelyStopped = false;
            this.propagate(e, type);
            this.dispatch.emit(type || e.type, e);
        };
        /** Maps the given upstream event through the event boundary and propagates it downstream. */
        EventBoundary.prototype.mapEvent = function (e) {
            if (!this.rootTarget) {
                return;
            }
            var mappers = this.mappingTable[e.type];
            if (mappers) {
                for (var i = 0, j = mappers.length; i < j; i++) {
                    mappers[i].fn(e);
                }
            }
            else {
                console.warn("[EventBoundary]: Event mapping not defined for " + e.type);
            }
        };
        /**
         * Finds the DisplayObject that is the target of a event at the given coordinates.
         *
         * The passed (x,y) coordinates are in the world space above this event boundary.
         */
        EventBoundary.prototype.hitTest = function (x, y) {
            var invertedPath = this.hitTestRecursive(this.rootTarget, this.rootTarget.interactive, tempHitLocation.set(x, y), this.hitTestFn, this.hitPruneFn);
            return invertedPath && invertedPath[0];
        };
        /**
         * Propagate the passed event from from {@link EventBoundary.rootTarget this.rootTarget} to its
         * target {@code e.target}.
         *
         * @param e - The event to propagate.
         */
        EventBoundary.prototype.propagate = function (e, type) {
            if (!e.target) {
                // This usually occurs when the scene graph is not interactive.
                return;
            }
            var composedPath = e.composedPath();
            // Capturing phase
            e.eventPhase = e.CAPTURING_PHASE;
            for (var i = 0, j = composedPath.length - 1; i < j; i++) {
                e.currentTarget = composedPath[i];
                this.notifyTarget(e, type);
                if (e.propagationStopped || e.propagationImmediatelyStopped)
                    { return; }
            }
            // At target phase
            e.eventPhase = e.AT_TARGET;
            e.currentTarget = e.target;
            this.notifyTarget(e, type);
            if (e.propagationStopped || e.propagationImmediatelyStopped)
                { return; }
            // Bubbling phase
            e.eventPhase = e.BUBBLING_PHASE;
            for (var i = composedPath.length - 2; i >= 0; i--) {
                e.currentTarget = composedPath[i];
                this.notifyTarget(e, type);
                if (e.propagationStopped || e.propagationImmediatelyStopped)
                    { return; }
            }
        };
        /**
         * Emits the event {@link e} to all display objects. The event is propagated in the bubbling phase always.
         *
         * This is used in the `pointermove` legacy mode.
         *
         * @param e - The emitted event.
         * @param type - The listeners to notify.
         */
        EventBoundary.prototype.all = function (e, type, target) {
            if (target === void 0) { target = this.rootTarget; }
            e.eventPhase = e.BUBBLING_PHASE;
            var children = target.children;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    this.all(e, type, children[i]);
                }
            }
            e.currentTarget = target;
            this.notifyTarget(e, type);
        };
        /**
         * Finds the propagation path from {@link PIXI.EventBoundary.rootTarget rootTarget} to the passed
         * {@code target}. The last element in the path is {@code target}.
         *
         * @param target
         */
        EventBoundary.prototype.propagationPath = function (target) {
            var propagationPath = [target];
            for (var i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget; i++) {
                if (!target.parent) {
                    throw new Error('Cannot find propagation path to disconnected target');
                }
                propagationPath.push(target.parent);
                target = target.parent;
            }
            propagationPath.reverse();
            return propagationPath;
        };
        /**
         * Recursive implementation for {@link EventBoundary.hitTest hitTest}.
         *
         * @param currentTarget - The DisplayObject that is to be hit tested.
         * @param interactive - Flags whether `currentTarget` or one of its parents are interactive.
         * @param location - The location that is being tested for overlap.
         * @param testFn - Callback that determines whether the target passes hit testing. This callback
         *  can assume that `pruneFn` failed to prune the display object.
         * @param pruneFn - Callback that determiness whether the target and all of its children
         *  cannot pass the hit test. It is used as a preliminary optimization to prune entire subtrees
         *  of the scene graph.
         * @return An array holding the hit testing target and all its ancestors in order. The first element
         *  is the target itself and the last is {@link EventBoundary.rootTarget rootTarget}. This is the opposite
         *  order w.r.t. the propagation path. If no hit testing target is found, null is returned.
         */
        EventBoundary.prototype.hitTestRecursive = function (currentTarget, interactive, location, testFn, pruneFn) {
            if (!currentTarget || !currentTarget.visible) {
                return null;
            }
            // Attempt to prune this DisplayObject and its subtree as an optimization.
            if (pruneFn(currentTarget, location)) {
                return null;
            }
            // Find a child that passes the hit testing and return one, if any.
            if (currentTarget.interactiveChildren && currentTarget.children) {
                var children = currentTarget.children;
                for (var i = children.length - 1; i >= 0; i--) {
                    var child = children[i];
                    var nestedHit = this.hitTestRecursive(child, interactive || child.interactive, location, testFn, pruneFn);
                    if (nestedHit) {
                        // Its a good idea to check if a child has lost its parent.
                        // this means it has been removed whilst looping so its best
                        if (nestedHit.length > 0 && !nestedHit[nestedHit.length - 1].parent) {
                            continue;
                        }
                        // Only add the current hit-test target to the hit-test chain if the chain
                        // has already started (i.e. the event target has been found) or if the current
                        // target is interactive (i.e. it becomes the event target).
                        if (nestedHit.length > 0 || currentTarget.interactive) {
                            nestedHit.push(currentTarget);
                        }
                        return nestedHit;
                    }
                }
            }
            // Finally, hit test this DisplayObject itself.
            if (interactive && testFn(currentTarget, location)) {
                // The current hit-test target is the event's target only if it is interactive. Otherwise,
                // the first interactive ancestor will be the event's target.
                return currentTarget.interactive ? [currentTarget] : [];
            }
            return null;
        };
        /**
         * Checks whether the display object or any of its children cannot pass the hit test at all.
         *
         * {@link EventBoundary}'s implementation uses the {@link PIXI.DisplayObject.hitArea hitArea}
         * and {@link PIXI.DisplayObject._mask} for pruning.
         *
         * @param displayObject
         * @param location
         */
        EventBoundary.prototype.hitPruneFn = function (displayObject, location) {
            if (displayObject.hitArea) {
                displayObject.worldTransform.applyInverse(location, tempLocalMapping);
                if (!displayObject.hitArea.contains(tempLocalMapping.x, tempLocalMapping.y)) {
                    return true;
                }
            }
            if (displayObject._mask) {
                var mask = displayObject._mask;
                if (!(mask.containsPoint && mask.containsPoint(location))) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Checks whether the display object passes hit testing for the given location.
         *
         * @param displayObject
         * @param location
         * @return - Whether `displayObject` passes hit testing for `location`.
         */
        EventBoundary.prototype.hitTestFn = function (displayObject, location) {
            // If the display object failed pruning with a hitArea, then it must pass it.
            if (displayObject.hitArea) {
                return true;
            }
            if (displayObject.containsPoint) {
                return displayObject.containsPoint(location);
            }
            // TODO: Should we hit test based on bounds?
            return false;
        };
        /**
         * Notify all the listeners to the event's `currentTarget`.
         *
         * @param e - The event passed to the target.
         */
        EventBoundary.prototype.notifyTarget = function (e, type) {
            type = type !== null && type !== void 0 ? type : e.type;
            var key = e.eventPhase === e.CAPTURING_PHASE || e.eventPhase === e.AT_TARGET ? type + "capture" : type;
            this.notifyListeners(e, key);
            if (e.eventPhase === e.AT_TARGET) {
                this.notifyListeners(e, type);
            }
        };
        /**
         * Maps the upstream `pointerdown` events to a downstream `pointerdown` event.
         *
         * `touchstart`, `rightdown`, `mousedown` events are also dispatched for specific pointer types.
         *
         * @param from
         */
        EventBoundary.prototype.mapPointerDown = function (from) {
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var e = this.createPointerEvent(from);
            this.dispatchEvent(e, 'pointerdown');
            if (e.pointerType === 'touch') {
                this.dispatchEvent(e, 'touchstart');
            }
            else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                var isRightButton = e.button === 2;
                this.dispatchEvent(e, isRightButton ? 'rightdown' : 'mousedown');
            }
            var trackingData = this.trackingData(from.pointerId);
            trackingData.pressTargetsByButton[from.button] = e.composedPath();
            this.freeEvent(e);
        };
        /**
         * Maps the upstream `pointermove` to downstream `pointerout`, `pointerover`, and `pointermove` events, in that order.
         *
         * The tracking data for the specific pointer has an updated `overTarget`. `mouseout`, `mouseover`,
         * `mousemove`, and `touchmove` events are fired as well for specific pointer types.
         *
         * @param from - The upstream `pointermove` event.
         */
        EventBoundary.prototype.mapPointerMove = function (from) {
            var _a;
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var e = this.createPointerEvent(from);
            var isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
            var trackingData = this.trackingData(from.pointerId);
            var outTarget = this.findMountedTarget(trackingData.overTargets);
            // First pointerout/pointerleave
            if (trackingData.overTargets && outTarget !== e.target) {
                // pointerout always occurs on the overTarget when the pointer hovers over another element.
                var outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
                var outEvent = this.createPointerEvent(from, outType, outTarget);
                this.dispatchEvent(outEvent, 'pointerout');
                if (isMouse)
                    { this.dispatchEvent(outEvent, 'mouseout'); }
                // If the pointer exits overTarget and its descendants, then a pointerleave event is also fired. This event
                // is dispatched to all ancestors that no longer capture the pointer.
                if (!e.composedPath().includes(outTarget)) {
                    var leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget);
                    leaveEvent.eventPhase = leaveEvent.AT_TARGET;
                    while (leaveEvent.target && !e.composedPath().includes(leaveEvent.target)) {
                        leaveEvent.currentTarget = leaveEvent.target;
                        this.notifyTarget(leaveEvent);
                        if (isMouse)
                            { this.notifyTarget(leaveEvent, 'mouseleave'); }
                        leaveEvent.target = leaveEvent.target.parent;
                    }
                    this.freeEvent(leaveEvent);
                }
                this.freeEvent(outEvent);
            }
            // Then pointerover
            if (outTarget !== e.target) {
                // pointerover always occurs on the new overTarget
                var overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
                var overEvent = this.clonePointerEvent(e, overType); // clone faster
                this.dispatchEvent(overEvent, 'pointerover');
                if (isMouse)
                    { this.dispatchEvent(overEvent, 'mouseover'); }
                // Probe whether the newly hovered DisplayObject is an ancestor of the original overTarget.
                var overTargetAncestor = outTarget === null || outTarget === void 0 ? void 0 : outTarget.parent;
                while (overTargetAncestor && overTargetAncestor !== this.rootTarget.parent) {
                    if (overTargetAncestor === e.target)
                        { break; }
                    overTargetAncestor = overTargetAncestor.parent;
                }
                // The pointer has entered a non-ancestor of the original overTarget. This means we need a pointerentered
                // event.
                var didPointerEnter = !overTargetAncestor || overTargetAncestor === this.rootTarget.parent;
                if (didPointerEnter) {
                    var enterEvent = this.clonePointerEvent(e, 'pointerenter');
                    enterEvent.eventPhase = enterEvent.AT_TARGET;
                    while (enterEvent.target
                        && enterEvent.target !== outTarget
                        && enterEvent.target !== this.rootTarget.parent) {
                        enterEvent.currentTarget = enterEvent.target;
                        this.notifyTarget(enterEvent);
                        if (isMouse)
                            { this.notifyTarget(enterEvent, 'mouseenter'); }
                        enterEvent.target = enterEvent.target.parent;
                    }
                    this.freeEvent(enterEvent);
                }
                this.freeEvent(overEvent);
            }
            var propagationMethod = this.moveOnAll ? 'all' : 'dispatchEvent';
            // Then pointermove
            this[propagationMethod](e, 'pointermove');
            if (e.pointerType === 'touch')
                { this[propagationMethod](e, 'touchmove'); }
            if (isMouse) {
                this[propagationMethod](e, 'mousemove');
                this.cursor = (_a = e.target) === null || _a === void 0 ? void 0 : _a.cursor;
            }
            trackingData.overTargets = e.composedPath();
            this.freeEvent(e);
        };
        /**
         * Maps the upstream `pointerover` to downstream `pointerover` and `pointerenter` events, in that order.
         *
         * The tracking data for the specific pointer gets a new `overTarget`.
         *
         * @param from - The upstream `pointerover` event.
         */
        EventBoundary.prototype.mapPointerOver = function (from) {
            var _a;
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var trackingData = this.trackingData(from.pointerId);
            var e = this.createPointerEvent(from);
            var isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
            this.dispatchEvent(e, 'pointerover');
            if (isMouse)
                { this.dispatchEvent(e, 'mouseover'); }
            if (e.pointerType === 'mouse')
                { this.cursor = (_a = e.target) === null || _a === void 0 ? void 0 : _a.cursor; }
            // pointerenter events must be fired since the pointer entered from upstream.
            var enterEvent = this.clonePointerEvent(e, 'pointerenter');
            enterEvent.eventPhase = enterEvent.AT_TARGET;
            while (enterEvent.target && enterEvent.target !== this.rootTarget.parent) {
                enterEvent.currentTarget = enterEvent.target;
                this.notifyTarget(enterEvent);
                if (isMouse)
                    { this.notifyTarget(enterEvent, 'mouseenter'); }
                enterEvent.target = enterEvent.target.parent;
            }
            trackingData.overTargets = e.composedPath();
            this.freeEvent(e);
            this.freeEvent(enterEvent);
        };
        /**
         * Maps the upstream `pointerout` to downstream `pointerout`, `pointerleave` events, in that order.
         *
         * The tracking data for the specific pointer is cleared of a `overTarget`.
         *
         * @param from - The upstream `pointerout` event.
         */
        EventBoundary.prototype.mapPointerOut = function (from) {
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var trackingData = this.trackingData(from.pointerId);
            if (trackingData.overTargets) {
                var isMouse = from.pointerType === 'mouse' || from.pointerType === 'pen';
                var outTarget = this.findMountedTarget(trackingData.overTargets);
                // pointerout first
                var outEvent = this.createPointerEvent(from, 'pointerout', outTarget);
                this.dispatchEvent(outEvent);
                if (isMouse)
                    { this.dispatchEvent(outEvent, 'mouseout'); }
                // pointerleave(s) are also dispatched b/c the pointer must've left rootTarget and its descendants to
                // get an upstream pointerout event (upstream events do not know rootTarget has descendants).
                var leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget);
                leaveEvent.eventPhase = leaveEvent.AT_TARGET;
                while (leaveEvent.target && leaveEvent.target !== this.rootTarget.parent) {
                    leaveEvent.currentTarget = leaveEvent.target;
                    this.notifyTarget(leaveEvent);
                    if (isMouse)
                        { this.notifyTarget(leaveEvent, 'mouseleave'); }
                    leaveEvent.target = leaveEvent.target.parent;
                }
                trackingData.overTargets = null;
                this.freeEvent(outEvent);
                this.freeEvent(leaveEvent);
            }
            this.cursor = null;
        };
        /**
         * Maps the upstream `pointerup` event to downstream `pointerup`, `pointerupoutside`, and `click`/`pointertap` events,
         * in that order.
         *
         * The `pointerupoutside` event bubbles from the original `pointerdown` target to the most specific
         * ancestor of the `pointerdown` and `pointerup` targets, which is also the `click` event's target. `touchend`,
         * `rightup`, `mouseup`, `touchendoutside`, `rightupoutside`, `mouseupoutside`, and `tap` are fired as well for
         * specific pointer types.
         *
         * @param from - The upstream `pointerup` event.
         */
        EventBoundary.prototype.mapPointerUp = function (from) {
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var now = performance.now();
            var e = this.createPointerEvent(from);
            this.dispatchEvent(e, 'pointerup');
            if (e.pointerType === 'touch') {
                this.dispatchEvent(e, 'touchend');
            }
            else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                var isRightButton = e.button === 2;
                this.dispatchEvent(e, isRightButton ? 'rightup' : 'mouseup');
            }
            var trackingData = this.trackingData(from.pointerId);
            var pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);
            var clickTarget = pressTarget;
            // pointerupoutside only bubbles. It only bubbles upto the parent that doesn't contain
            // the pointerup location.
            if (pressTarget && !e.composedPath().includes(pressTarget)) {
                var currentTarget = pressTarget;
                while (currentTarget && !e.composedPath().includes(currentTarget)) {
                    e.currentTarget = currentTarget;
                    this.notifyTarget(e, 'pointerupoutside');
                    if (e.pointerType === 'touch') {
                        this.notifyTarget(e, 'touchendoutside');
                    }
                    else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                        var isRightButton = e.button === 2;
                        this.notifyTarget(e, isRightButton ? 'rightupoutside' : 'mouseupoutside');
                    }
                    currentTarget = currentTarget.parent;
                }
                delete trackingData.pressTargetsByButton[from.button];
                // currentTarget is the most specific ancestor holding both the pointerdown and pointerup
                // targets. That is - it's our click target!
                clickTarget = currentTarget;
            }
            // click!
            if (clickTarget) {
                var clickEvent = this.clonePointerEvent(e, 'click');
                clickEvent.target = clickTarget;
                clickEvent.path = null;
                if (!trackingData.clicksByButton[from.button]) {
                    trackingData.clicksByButton[from.button] = {
                        clickCount: 0,
                        target: clickEvent.target,
                        timeStamp: now,
                    };
                }
                var clickHistory = trackingData.clicksByButton[from.button];
                if (clickHistory.target === clickEvent.target
                    && now - clickHistory.timeStamp < 200) {
                    ++clickHistory.clickCount;
                }
                else {
                    clickHistory.clickCount = 1;
                }
                clickHistory.target = clickEvent.target;
                clickHistory.timeStamp = now;
                clickEvent.detail = clickHistory.clickCount;
                if (clickEvent.pointerType === 'mouse') {
                    this.dispatchEvent(clickEvent, 'click');
                }
                else if (clickEvent.pointerType === 'touch') {
                    this.dispatchEvent(clickEvent, 'tap');
                }
                else {
                    this.dispatchEvent(clickEvent, 'pointertap');
                }
                this.freeEvent(clickEvent);
            }
            this.freeEvent(e);
        };
        /**
         * Maps the upstream `pointerupoutside` event to a downstream `pointerupoutside` event, bubbling from the original
         * `pointerdown` target to `rootTarget`.
         *
         * (The most specific ancestor of the `pointerdown` event and the `pointerup` event must the {@code EventBoundary}'s
         * root because the `pointerup` event occurred outside of the boundary.)
         *
         * `touchendoutside`, `mouseupoutside`, and `rightupoutside` events are fired as well for specific pointer
         * types. The tracking data for the specific pointer is cleared of a `pressTarget`.
         *
         * @param from - The upstream `pointerupoutside` event.
         */
        EventBoundary.prototype.mapPointerUpOutside = function (from) {
            if (!(from instanceof FederatedPointerEvent)) {
                console.warn('EventBoundary cannot map a non-pointer event as a pointer event');
                return;
            }
            var trackingData = this.trackingData(from.pointerId);
            var pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);
            var e = this.createPointerEvent(from);
            if (pressTarget) {
                var currentTarget = pressTarget;
                while (currentTarget) {
                    e.currentTarget = currentTarget;
                    this.notifyTarget(e, 'pointerupoutside');
                    if (e.pointerType === 'touch') {
                        this.notifyTarget(e, 'touchendoutside');
                    }
                    else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
                        this.notifyTarget(e, e.button === 2 ? 'rightupoutside' : 'mouseupoutside');
                    }
                    currentTarget = currentTarget.parent;
                }
                delete trackingData.pressTargetsByButton[from.button];
            }
            this.freeEvent(e);
        };
        /**
         * Maps the upstream `wheel` event to a downstream `wheel` event.
         *
         * @param from - The upstream `wheel` event.
         */
        EventBoundary.prototype.mapWheel = function (from) {
            if (!(from instanceof FederatedWheelEvent)) {
                console.warn('EventBoundary cannot map a non-wheel event as a wheel event');
                return;
            }
            var wheelEvent = this.createWheelEvent(from);
            this.dispatchEvent(wheelEvent);
            this.freeEvent(wheelEvent);
        };
        /**
         * Finds the most specific event-target in the given propagation path that is still mounted in the scene graph.
         *
         * This is used to find the correct `pointerup` and `pointerout` target in the case that the original `pointerdown`
         * or `pointerover` target was unmounted from the scene graph.
         *
         * @param propagationPath - The propagation path was valid in the past.
         * @return - The most specific event-target still mounted at the same location in the scene graph.
         */
        EventBoundary.prototype.findMountedTarget = function (propagationPath) {
            if (!propagationPath) {
                return null;
            }
            var currentTarget = propagationPath[0];
            for (var i = 1; i < propagationPath.length; i++) {
                // Set currentTarget to the next target in the path only if it is still attached to the
                // scene graph (i.e. parent still points to the expected ancestor).
                if (propagationPath[i].parent === currentTarget) {
                    currentTarget = propagationPath[i];
                }
                else {
                    break;
                }
            }
            return currentTarget;
        };
        /**
         * Creates an event whose {@code originalEvent} is {@code from}, with an optional `type` and `target` override.
         *
         * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
         *
         * @param from - The {@code originalEvent} for the returned event.
         * @param [type=from.type] - The type of the returned event.
         * @param target - The target of the returned event.
         */
        EventBoundary.prototype.createPointerEvent = function (from, type, target) {
            var event = this.allocateEvent(FederatedPointerEvent);
            this.copyPointerData(from, event);
            this.copyMouseData(from, event);
            this.copyData(from, event);
            event.nativeEvent = from.nativeEvent;
            event.originalEvent = from;
            event.target = target !== null && target !== void 0 ? target : this.hitTest(event.global.x, event.global.y);
            if (typeof type === 'string') {
                event.type = type;
            }
            return event;
        };
        /**
         * Creates a wheel event whose {@code originalEvent} is {@code from}.
         *
         * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
         *
         * @param from - The upstream wheel event.
         */
        EventBoundary.prototype.createWheelEvent = function (from) {
            var event = this.allocateEvent(FederatedWheelEvent);
            this.copyWheelData(from, event);
            this.copyMouseData(from, event);
            this.copyData(from, event);
            event.nativeEvent = from.nativeEvent;
            event.originalEvent = from;
            event.target = this.hitTest(event.global.x, event.global.y);
            return event;
        };
        /**
         * Clones the event {@code from}, with an optional {@code type} override.
         *
         * The event is allocated using {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}.
         *
         * @param from - The event to clone.
         * @param [type=from.type] - The type of the returned event.
         */
        EventBoundary.prototype.clonePointerEvent = function (from, type) {
            var event = this.allocateEvent(FederatedPointerEvent);
            event.nativeEvent = from.nativeEvent;
            event.originalEvent = from.originalEvent;
            this.copyPointerData(from, event);
            this.copyMouseData(from, event);
            this.copyData(from, event);
            // copy propagation path for perf
            event.target = from.target;
            event.path = from.composedPath().slice();
            event.type = type !== null && type !== void 0 ? type : event.type;
            return event;
        };
        /**
         * Copies wheel {@link PIXI.FederatedWheelEvent} data from {@code from} into {@code to}.
         *
         * The following properties are copied:
         * + deltaMode
         * + deltaX
         * + deltaY
         * + deltaZ
         *
         * @param from
         * @param to
         */
        EventBoundary.prototype.copyWheelData = function (from, to) {
            to.deltaMode = from.deltaMode;
            to.deltaX = from.deltaX;
            to.deltaY = from.deltaY;
            to.deltaZ = from.deltaZ;
        };
        /**
         * Copies pointer {@link PIXI.FederatedPointerEvent} data from {@code from} into {@code to}.
         *
         * The following properties are copied:
         * + pointerId
         * + width
         * + height
         * + isPrimary
         * + pointerType
         * + pressure
         * + tangentialPressure
         * + tiltX
         * + tiltY
         *
         * @param from
         * @param to
         */
        EventBoundary.prototype.copyPointerData = function (from, to) {
            if (!(from instanceof FederatedPointerEvent && to instanceof FederatedPointerEvent))
                { return; }
            to.pointerId = from.pointerId;
            to.width = from.width;
            to.height = from.height;
            to.isPrimary = from.isPrimary;
            to.pointerType = from.pointerType;
            to.pressure = from.pressure;
            to.tangentialPressure = from.tangentialPressure;
            to.tiltX = from.tiltX;
            to.tiltY = from.tiltY;
            to.twist = from.twist;
        };
        /**
         * Copies mouse {@link PIXI.FederatedMouseEvent} data from {@code from} to {@code to}.
         *
         * The following properties are copied:
         * + altKey
         * + button
         * + buttons
         * + clientX
         * + clientY
         * + metaKey
         * + movementX
         * + movementY
         * + pageX
         * + pageY
         * + x
         * + y
         * + screen
         * + global
         *
         * @param from
         * @param to
         */
        EventBoundary.prototype.copyMouseData = function (from, to) {
            if (!(from instanceof FederatedMouseEvent && to instanceof FederatedMouseEvent))
                { return; }
            to.altKey = from.altKey;
            to.button = from.button;
            to.buttons = from.buttons;
            to.client.copyFrom(from.client);
            to.ctrlKey = from.ctrlKey;
            to.metaKey = from.metaKey;
            to.movement.copyFrom(from.movement);
            to.screen.copyFrom(from.screen);
            to.global.copyFrom(from.global);
        };
        /**
         * Copies base {@link PIXI.FederatedEvent} data from {@code from} into {@code to}.
         *
         * The following properties are copied:
         * + isTrusted
         * + srcElement
         * + timeStamp
         * + type
         *
         * @param from - The event to copy data from.
         * @param to - The event to copy data into.
         */
        EventBoundary.prototype.copyData = function (from, to) {
            to.isTrusted = from.isTrusted;
            to.srcElement = from.srcElement;
            to.timeStamp = performance.now();
            to.type = from.type;
            to.detail = from.detail;
            to.view = from.view;
            to.which = from.which;
            to.layer.copyFrom(from.layer);
            to.page.copyFrom(from.page);
        };
        /**
         * @param id - The pointer ID.
         * @return The tracking data stored for the given pointer. If no data exists, a blank
         *  state will be created.
         */
        EventBoundary.prototype.trackingData = function (id) {
            if (!this.mappingState.trackingData[id]) {
                this.mappingState.trackingData[id] = {
                    pressTargetsByButton: {},
                    clicksByButton: {},
                    overTarget: null
                };
            }
            return this.mappingState.trackingData[id];
        };
        /**
         * Allocate a specific type of event from {@link PIXI.EventBoundary#eventPool this.eventPool}.
         *
         * This allocation is constructor-agnostic, as long as it only takes one argument - this event
         * boundary.
         *
         * @param constructor - The event's constructor.
         */
        EventBoundary.prototype.allocateEvent = function (constructor) {
            if (!this.eventPool.has(constructor)) {
                this.eventPool.set(constructor, []);
            }
            var event = this.eventPool.get(constructor).pop()
                || new constructor(this);
            event.eventPhase = event.NONE;
            event.currentTarget = null;
            event.path = null;
            event.target = null;
            return event;
        };
        /**
         * Frees the event and puts it back into the event pool.
         *
         * It is illegal to reuse the event until it is allocated again, using `this.allocateEvent`.
         *
         * It is also advised that events not allocated from {@link PIXI.EventBoundary#allocateEvent this.allocateEvent}
         * not be freed. This is because of the possibility that the same event is freed twice, which can cause
         * it to be allocated twice & result in overwriting.
         *
         * @param event - The event to be freed.
         * @throws Error if the event is managed by another event boundary.
         */
        EventBoundary.prototype.freeEvent = function (event) {
            if (event.manager !== this)
                { throw new Error('It is illegal to free an event not managed by this EventBoundary!'); }
            var constructor = event.constructor;
            if (!this.eventPool.has(constructor)) {
                this.eventPool.set(constructor, []);
            }
            this.eventPool.get(constructor).push(event);
        };
        /**
         * Similar to {@link EventEmitter.emit}, except it stops if the `propagationImmediatelyStopped` flag
         * is set on the event.
         *
         * @param e - The event to call each listener with.
         * @param type - The event key.
         */
        EventBoundary.prototype.notifyListeners = function (e, type) {
            var listeners = e.currentTarget._events[type];
            if (!listeners)
                { return; }
            if ('fn' in listeners) {
                listeners.fn.call(listeners.context, e);
            }
            else {
                for (var i = 0, j = listeners.length; i < j && !e.propagationImmediatelyStopped; i++) {
                    listeners[i].fn.call(listeners[i].context, e);
                }
            }
        };
        return EventBoundary;
    }());
    /**
     * Fired when a mouse button (usually a mouse left-button) is pressed on the display.
     * object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mousedown
     * @param {PIXI.FederatedPointerEvent} event - The mousedown event.
     */
    /**
     * Capture phase equivalent of {@code mousedown}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mousedowncapture
     * @param {PIXI.FederatedPointerEvent} event - The capture phase mousedown.
     */
    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightdown
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code rightdown}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightdowncapture
     * @param {PIXI.FederatedPointerEvent} event - The rightdowncapture event.
     */
    /**
     * Fired when a pointer device button (usually a mouse left-button) is released over the display
     * object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseup
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mouseup}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseupcature
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightup
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code rightup}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightupcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
     * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * A {@code click} event fires after the {@code pointerdown} and {@code pointerup} events, in that
     * order. If the mouse is moved over another DisplayObject after the {@code pointerdown} event, the
     * {@code click} event is fired on the most specific common ancestor of the two target DisplayObjects.
     *
     * The {@code detail} property of the event is the number of clicks that occurred within a 200ms
     * window of each other upto the current click. For example, it will be {@code 2} for a double click.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#click
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code click}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#clickcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
     * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * This event follows the semantics of {@code click}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightclick
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code rightclick}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightclickcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button (usually a mouse left-button) is released outside the
     * display object that initially registered a
     * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
     * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
     * and {@code pointerup} events, i.e. the target of the {@code click} event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseupoutside
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mouseupoutside}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseupoutsidecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device secondary button (usually a mouse right-button) is released
     * outside the display object that initially registered a
     * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightupoutside
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code rightupoutside}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#rightupoutsidecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device (usually a mouse) is moved while over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mousemove
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mousemove}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mousemovecature
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device (usually a mouse) is moved onto the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseover
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mouseover}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseovercapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the mouse pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseenter
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mouseenter}
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseentercapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device (usually a mouse) is moved off the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * This may be fired on a DisplayObject that was removed from the scene graph immediately after
     * a {@code mouseover} event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseout
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code mouseout}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseoutcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the mouse pointer exits a DisplayObject and its descendants.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseleave
     * @param {PIXI.FederatedPointerEvent} event
     */
    /**
     * Capture phase equivalent of {@code mouseleave}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#mouseleavecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button is pressed on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerdown
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerdown}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerdowncapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button is released over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerup
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerup}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerupcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the operating system cancels a pointer event.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointercancel
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointercancel}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointercancelcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button is pressed and released on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointertap
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointertap}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointertapcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device button is released outside the display object that initially
     * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * This event is specific to the Federated Events API. It does not have a capture phase, unlike most of the
     * other events. It only bubbles to the most specific ancestor of the targets of the corresponding {@code pointerdown}
     * and {@code pointerup} events, i.e. the target of the {@code click} event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerupoutside
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerupoutside}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerupoutsidecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device is moved while over the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointermove
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointermove}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointermovecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device is moved onto the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerover
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerover}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerovercapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the pointer is moved over a DisplayObject and its descendant's hit testing boundaries.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerenter
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerenter}
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerentercapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a pointer device is moved off the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerout
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code pointerout}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointeroutcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the pointer leaves the hit testing boundaries of a DisplayObject and its descendants.
     *
     * This event notifies only the target and does not bubble.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerleave
     * @param {PIXI.FederatedPointerEvent} event - The `pointerleave` event.
     */
    /**
     * Capture phase equivalent of {@code pointerleave}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#pointerleavecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a touch point is placed on the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchstart
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code touchstart}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchstartcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a touch point is removed from the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchend
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code touchend}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchendcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when the operating system cancels a touch.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchcancel
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code touchcancel}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchcancelcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a touch point is placed and removed from the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#tap
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code tap}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#tapcapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a touch point is removed outside of the display object that initially
     * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchendoutside
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code touchendoutside}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchendoutsidecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a touch point is moved along the display object.
     * DisplayObject's `interactive` property must be set to `true` to fire event.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchmove
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Capture phase equivalent of {@code touchmove}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#touchmovecapture
     * @param {PIXI.FederatedPointerEvent} event - Event
     */
    /**
     * Fired when a the user scrolls with the mouse cursor over a DisplayObject.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#wheel
     * @type {PIXI.FederatedWheelEvent}
     */
    /**
     * Capture phase equivalent of {@code wheel}.
     *
     * These events are propagating from the {@link PIXI.EventSystem EventSystem} in @pixi/events.
     *
     * @event PIXI.DisplayObject#wheelcapture
     * @type {PIXI.FederatedWheelEvent}
     */

    var MOUSE_POINTER_ID = 1;
    var TOUCH_TO_POINTER = {
        touchstart: 'pointerdown',
        touchend: 'pointerup',
        touchendoutside: 'pointerupoutside',
        touchmove: 'pointermove',
        touchcancel: 'pointercancel',
    };
    /**
     * The system for handling UI events.
     *
     * @memberof PIXI
     */
    var EventSystem = /** @class */ (function () {
        /**
         * @param {PIXI.Renderer} renderer
         */
        function EventSystem(renderer) {
            /**
             * Does the device support touch events
             * https://www.w3.org/TR/touch-events/
             */
            this.supportsTouchEvents = 'ontouchstart' in self;
            /**
             * Does the device support pointer events
             * https://www.w3.org/Submission/pointer-events/
             */
            this.supportsPointerEvents = !!self.PointerEvent;
            /**
             * The resolution used to convert between the DOM client space into world space.
             */
            this.resolution = 1;
            if (renderer.plugins.interaction) {
                throw new Error('EventSystem cannot initialize with the InteractionManager installed!');
            }
            this.renderer = renderer;
            this.rootBoundary = new EventBoundary(null);
            this.autoPreventDefault = true;
            this.eventsAdded = false;
            this.rootPointerEvent = new FederatedPointerEvent(null);
            this.rootWheelEvent = new FederatedWheelEvent(null);
            this.cursorStyles = {
                default: 'inherit',
                pointer: 'pointer',
            };
            this.domElement = renderer.view;
            this.onPointerDown = this.onPointerDown.bind(this);
            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerUp = this.onPointerUp.bind(this);
            this.onPointerOverOut = this.onPointerOverOut.bind(this);
            this.onWheel = this.onWheel.bind(this);
            this.setTargetElement(this.domElement);
            this.resolution = this.renderer.resolution;
        }
        /**
         * Destroys all event listeners and detaches the renderer.
         */
        EventSystem.prototype.destroy = function () {
            this.setTargetElement(null);
            this.renderer = null;
        };
        /**
         * Sets the current cursor mode, handling any callbacks or CSS style changes.
         *
         * @param mode - cursor mode, a key from the cursorStyles dictionary
         */
        EventSystem.prototype.setCursor = function (mode) {
            mode = mode || 'default';
            var applyStyles = true;
            // offscreen canvas does not support setting styles, but cursor modes can be functions,
            // in order to handle pixi rendered cursors, so we can't bail
            if (self.OffscreenCanvas && this.domElement instanceof OffscreenCanvas) {
                applyStyles = false;
            }
            // if the mode didn't actually change, bail early
            if (this.currentCursor === mode) {
                return;
            }
            this.currentCursor = mode;
            var style = this.cursorStyles[mode];
            // only do things if there is a cursor style for it
            if (style) {
                switch (typeof style) {
                    case 'string':
                        // string styles are handled as cursor CSS
                        if (applyStyles) {
                            this.domElement.style.cursor = style;
                        }
                        break;
                    case 'function':
                        // functions are just called, and passed the cursor mode
                        style(mode);
                        break;
                    case 'object':
                        // if it is an object, assume that it is a dictionary of CSS styles,
                        // apply it to the interactionDOMElement
                        if (applyStyles) {
                            Object.assign(this.domElement.style, style);
                        }
                        break;
                }
            }
            else if (applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
                // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
                // for the mode, then assume that the dev wants it to be CSS for the cursor.
                this.domElement.style.cursor = mode;
            }
        };
        /**
         * Event handler for pointer down events on {@link PIXI.EventSystem#domElement this.domElement}.
         *
         * @param nativeEvent - The native mouse/pointer/touch event.
         */
        EventSystem.prototype.onPointerDown = function (nativeEvent) {
            this.rootBoundary.rootTarget = this.renderer._lastObjectRendered;
            // if we support touch events, then only use those for touch events, not pointer events
            if (this.supportsTouchEvents && nativeEvent.pointerType === 'touch')
                { return; }
            var events = this.normalizeToPointerData(nativeEvent);
            /*
             * No need to prevent default on natural pointer events, as there are no side effects
             * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
             * so still need to be prevented.
             */
            // Guaranteed that there will be at least one event in events, and all events must have the same pointer type
            if (this.autoPreventDefault && events[0].isNormalized) {
                var cancelable = nativeEvent.cancelable || !('cancelable' in nativeEvent);
                if (cancelable) {
                    nativeEvent.preventDefault();
                }
            }
            for (var i = 0, j = events.length; i < j; i++) {
                var nativeEvent_1 = events[i];
                var federatedEvent = this.bootstrapEvent(this.rootPointerEvent, nativeEvent_1);
                this.rootBoundary.mapEvent(federatedEvent);
            }
            this.setCursor(this.rootBoundary.cursor);
        };
        /**
         * Event handler for pointer move events on on {@link PIXI.EventSystem#domElement this.domElement}.
         *
         * @param nativeEvent - The native mouse/pointer/touch events.
         */
        EventSystem.prototype.onPointerMove = function (nativeEvent) {
            this.rootBoundary.rootTarget = this.renderer._lastObjectRendered;
            // if we support touch events, then only use those for touch events, not pointer events
            if (this.supportsTouchEvents && nativeEvent.pointerType === 'touch')
                { return; }
            var normalizedEvents = this.normalizeToPointerData(nativeEvent);
            for (var i = 0, j = normalizedEvents.length; i < j; i++) {
                var event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
                this.rootBoundary.mapEvent(event);
            }
            this.setCursor(this.rootBoundary.cursor);
        };
        /**
         * Event handler for pointer up events on {@link PIXI.EventSystem#domElement this.domElement}.
         *
         * @param nativeEvent - The native mouse/pointer/touch event.
         */
        EventSystem.prototype.onPointerUp = function (nativeEvent) {
            this.rootBoundary.rootTarget = this.renderer._lastObjectRendered;
            // if we support touch events, then only use those for touch events, not pointer events
            if (this.supportsTouchEvents && nativeEvent.pointerType === 'touch')
                { return; }
            var outside = nativeEvent.target !== this.domElement ? 'outside' : '';
            var normalizedEvents = this.normalizeToPointerData(nativeEvent);
            for (var i = 0, j = normalizedEvents.length; i < j; i++) {
                var event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
                event.type += outside;
                this.rootBoundary.mapEvent(event);
            }
            this.setCursor(this.rootBoundary.cursor);
        };
        /**
         * Event handler for pointer over & out events on {@link PIXI.EventSystem#domElement this.domElement}.
         *
         * @param nativeEvent - The native mouse/pointer/touch event.
         */
        EventSystem.prototype.onPointerOverOut = function (nativeEvent) {
            this.rootBoundary.rootTarget = this.renderer._lastObjectRendered;
            // if we support touch events, then only use those for touch events, not pointer events
            if (this.supportsTouchEvents && nativeEvent.pointerType === 'touch')
                { return; }
            var normalizedEvents = this.normalizeToPointerData(nativeEvent);
            for (var i = 0, j = normalizedEvents.length; i < j; i++) {
                var event = this.bootstrapEvent(this.rootPointerEvent, normalizedEvents[i]);
                this.rootBoundary.mapEvent(event);
            }
            this.setCursor(this.rootBoundary.cursor);
        };
        /**
         * Passive handler for `wheel` events on {@link EventSystem.domElement this.domElement}.
         *
         * @param nativeEvent - The native wheel event.
         */
        EventSystem.prototype.onWheel = function (nativeEvent) {
            var wheelEvent = this.normalizeWheelEvent(nativeEvent);
            this.rootBoundary.rootTarget = this.renderer._lastObjectRendered;
            this.rootBoundary.mapEvent(wheelEvent);
        };
        /**
         * Sets the {@link PIXI.EventSystem#domElement domElement} and binds event listeners.
         *
         * To deregister the current DOM element without setting a new one, pass {@code null}.
         *
         * @param element - The new DOM element.
         */
        EventSystem.prototype.setTargetElement = function (element) {
            this.removeEvents();
            this.domElement = element;
            this.addEvents();
        };
        /**
         * Register event listeners on {@link PIXI.Renderer#domElement this.domElement}.
         */
        EventSystem.prototype.addEvents = function () {
            if (this.eventsAdded || !this.domElement) {
                return;
            }
            var style = this.domElement.style;
            if (self.navigator.msPointerEnabled) {
                style.msContentZooming = 'none';
                style.msTouchAction = 'none';
            }
            else if (this.supportsPointerEvents) {
                style.touchAction = 'none';
            }
            /*
             * These events are added first, so that if pointer events are normalized, they are fired
             * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
             */
            if (this.supportsPointerEvents) {
                self.document.addEventListener('pointermove', this.onPointerMove, true);
                this.domElement.addEventListener('pointerdown', this.onPointerDown, true);
                // pointerout is fired in addition to pointerup (for touch events) and pointercancel
                // we already handle those, so for the purposes of what we do in onPointerOut, we only
                // care about the pointerleave event
                this.domElement.addEventListener('pointerleave', this.onPointerOverOut, true);
                this.domElement.addEventListener('pointerover', this.onPointerOverOut, true);
                // self.addEventListener('pointercancel', this.onPointerCancel, true);
                self.addEventListener('pointerup', this.onPointerUp, true);
            }
            else {
                self.document.addEventListener('mousemove', this.onPointerMove, true);
                this.domElement.addEventListener('mousedown', this.onPointerDown, true);
                this.domElement.addEventListener('mouseout', this.onPointerOverOut, true);
                this.domElement.addEventListener('mouseover', this.onPointerOverOut, true);
                self.addEventListener('mouseup', this.onPointerUp, true);
            }
            // Always look directly for touch events so that we can provide original data
            // In a future version we should change this to being just a fallback and rely solely on
            // PointerEvents whenever available
            if (this.supportsTouchEvents) {
                this.domElement.addEventListener('touchstart', this.onPointerDown, true);
                // this.domElement.addEventListener('touchcancel', this.onPointerCancel, true);
                this.domElement.addEventListener('touchend', this.onPointerUp, true);
                this.domElement.addEventListener('touchmove', this.onPointerMove, true);
            }
            this.domElement.addEventListener('wheel', this.onWheel, {
                passive: true,
                capture: true,
            });
            this.eventsAdded = true;
        };
        /**
         * Unregister event listeners on {@link PIXI.EventSystem#domElement this.domElement}.
         */
        EventSystem.prototype.removeEvents = function () {
            if (!this.eventsAdded || !this.domElement) {
                return;
            }
            var style = this.domElement.style;
            if (self.navigator.msPointerEnabled) {
                style.msContentZooming = '';
                style.msTouchAction = '';
            }
            else if (this.supportsPointerEvents) {
                style.touchAction = '';
            }
            if (this.supportsPointerEvents) {
                self.document.removeEventListener('pointermove', this.onPointerMove, true);
                this.domElement.removeEventListener('pointerdown', this.onPointerDown, true);
                this.domElement.removeEventListener('pointerleave', this.onPointerOverOut, true);
                this.domElement.removeEventListener('pointerover', this.onPointerOverOut, true);
                // self.removeEventListener('pointercancel', this.onPointerCancel, true);
                self.removeEventListener('pointerup', this.onPointerUp, true);
            }
            else {
                self.document.removeEventListener('mousemove', this.onPointerMove, true);
                this.domElement.removeEventListener('mousedown', this.onPointerDown, true);
                this.domElement.removeEventListener('mouseout', this.onPointerOverOut, true);
                this.domElement.removeEventListener('mouseover', this.onPointerOverOut, true);
                self.removeEventListener('mouseup', this.onPointerUp, true);
            }
            if (this.supportsTouchEvents) {
                this.domElement.removeEventListener('touchstart', this.onPointerDown, true);
                // this.domElement.removeEventListener('touchcancel', this.onPointerCancel, true);
                this.domElement.removeEventListener('touchend', this.onPointerUp, true);
                this.domElement.removeEventListener('touchmove', this.onPointerMove, true);
            }
            this.domElement.removeEventListener('wheel', this.onWheel, true);
            this.domElement = null;
            this.eventsAdded = false;
        };
        /**
         * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
         * resulting value is stored in the point. This takes into account the fact that the DOM
         * element could be scaled and positioned anywhere on the screen.
         *
         * @param  {PIXI.IPointData} point - the point that the result will be stored in
         * @param  {number} x - the x coord of the position to map
         * @param  {number} y - the y coord of the position to map
         */
        EventSystem.prototype.mapPositionToPoint = function (point, x, y) {
            var rect;
            // IE 11 fix
            if (!this.domElement.parentElement) {
                rect = {
                    x: 0,
                    y: 0,
                    width: this.domElement.width,
                    height: this.domElement.height,
                    left: 0,
                    top: 0
                };
            }
            else {
                rect = this.domElement.getBoundingClientRect();
            }
            var resolutionMultiplier = 1.0 / this.resolution;
            point.x = ((x - rect.left) * (this.domElement.width / rect.width)) * resolutionMultiplier;
            point.y = ((y - rect.top) * (this.domElement.height / rect.height)) * resolutionMultiplier;
        };
        /**
         * Ensures that the original event object contains all data that a regular pointer event would have
         *
         * @param event - The original event data from a touch or mouse event
         * @return An array containing a single normalized pointer event, in the case of a pointer
         *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
         */
        EventSystem.prototype.normalizeToPointerData = function (event) {
            var normalizedEvents = [];
            if (this.supportsTouchEvents && event instanceof TouchEvent) {
                for (var i = 0, li = event.changedTouches.length; i < li; i++) {
                    var touch = event.changedTouches[i];
                    if (typeof touch.button === 'undefined')
                        { touch.button = event.touches.length ? 1 : 0; }
                    if (typeof touch.buttons === 'undefined')
                        { touch.buttons = event.touches.length ? 1 : 0; }
                    if (typeof touch.isPrimary === 'undefined') {
                        touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
                    }
                    if (typeof touch.width === 'undefined')
                        { touch.width = touch.radiusX || 1; }
                    if (typeof touch.height === 'undefined')
                        { touch.height = touch.radiusY || 1; }
                    if (typeof touch.tiltX === 'undefined')
                        { touch.tiltX = 0; }
                    if (typeof touch.tiltY === 'undefined')
                        { touch.tiltY = 0; }
                    if (typeof touch.pointerType === 'undefined')
                        { touch.pointerType = 'touch'; }
                    if (typeof touch.pointerId === 'undefined')
                        { touch.pointerId = touch.identifier || 0; }
                    if (typeof touch.pressure === 'undefined')
                        { touch.pressure = touch.force || 0.5; }
                    if (typeof touch.twist === 'undefined')
                        { touch.twist = 0; }
                    if (typeof touch.tangentialPressure === 'undefined')
                        { touch.tangentialPressure = 0; }
                    // TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
                    // support, and the fill ins are not quite the same
                    // offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
                    // left is not 0,0 on the page
                    if (typeof touch.layerX === 'undefined')
                        { touch.layerX = touch.offsetX = touch.clientX; }
                    if (typeof touch.layerY === 'undefined')
                        { touch.layerY = touch.offsetY = touch.clientY; }
                    // mark the touch as normalized, just so that we know we did it
                    touch.isNormalized = true;
                    touch.type = event.type;
                    normalizedEvents.push(touch);
                }
            }
            // apparently PointerEvent subclasses MouseEvent, so yay
            else if (!self.MouseEvent
                || (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof self.PointerEvent)))) {
                var tempEvent = event;
                if (typeof tempEvent.isPrimary === 'undefined')
                    { tempEvent.isPrimary = true; }
                if (typeof tempEvent.width === 'undefined')
                    { tempEvent.width = 1; }
                if (typeof tempEvent.height === 'undefined')
                    { tempEvent.height = 1; }
                if (typeof tempEvent.tiltX === 'undefined')
                    { tempEvent.tiltX = 0; }
                if (typeof tempEvent.tiltY === 'undefined')
                    { tempEvent.tiltY = 0; }
                if (typeof tempEvent.pointerType === 'undefined')
                    { tempEvent.pointerType = 'mouse'; }
                if (typeof tempEvent.pointerId === 'undefined')
                    { tempEvent.pointerId = MOUSE_POINTER_ID; }
                if (typeof tempEvent.pressure === 'undefined')
                    { tempEvent.pressure = 0.5; }
                if (typeof tempEvent.twist === 'undefined')
                    { tempEvent.twist = 0; }
                if (typeof tempEvent.tangentialPressure === 'undefined')
                    { tempEvent.tangentialPressure = 0; }
                // mark the mouse event as normalized, just so that we know we did it
                tempEvent.isNormalized = true;
                normalizedEvents.push(tempEvent);
            }
            else {
                normalizedEvents.push(event);
            }
            return normalizedEvents;
        };
        /**
         * Normalizes the native {@link https://w3c.github.io/uievents/#interface-wheelevent WheelEvent}.
         *
         * The returned {@link PIXI.FederatedWheelEvent} is a shared instance. It will not persist across
         * multiple native wheel events.
         *
         * @param nativeEvent - The native wheel event that occurred on the canvas.
         * @return A federated wheel event.
         */
        EventSystem.prototype.normalizeWheelEvent = function (nativeEvent) {
            var event = this.rootWheelEvent;
            this.transferMouseData(event, nativeEvent);
            event.deltaMode = nativeEvent.deltaMode;
            event.deltaX = nativeEvent.deltaX;
            event.deltaY = nativeEvent.deltaY;
            event.deltaZ = nativeEvent.deltaZ;
            this.mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY);
            event.global.copyFrom(event.screen);
            event.offset.copyFrom(event.screen);
            event.nativeEvent = nativeEvent;
            event.type = nativeEvent.type;
            return event;
        };
        /**
         * Normalizes the {@code nativeEvent} into a federateed {@code FederatedPointerEvent}.
         *
         * @param event
         * @param nativeEvent
         */
        EventSystem.prototype.bootstrapEvent = function (event, nativeEvent) {
            event.originalEvent = null;
            event.nativeEvent = nativeEvent;
            event.pointerId = nativeEvent.pointerId;
            event.width = nativeEvent.width;
            event.height = nativeEvent.height;
            event.isPrimary = nativeEvent.isPrimary;
            event.pointerType = nativeEvent.pointerType;
            event.pressure = nativeEvent.pressure;
            event.tangentialPressure = nativeEvent.tangentialPressure;
            event.tiltX = nativeEvent.tiltX;
            event.tiltY = nativeEvent.tiltY;
            event.twist = nativeEvent.twist;
            this.transferMouseData(event, nativeEvent);
            this.mapPositionToPoint(event.screen, nativeEvent.clientX, nativeEvent.clientY);
            event.global.copyFrom(event.screen); // global = screen for top-level
            event.offset.copyFrom(event.screen); // EventBoundary recalculates using its rootTarget
            event.isTrusted = nativeEvent.isTrusted;
            if (event.type === 'pointerleave') {
                event.type = 'pointerout';
            }
            if (event.type.startsWith('mouse')) {
                event.type = event.type.replace('mouse', 'pointer');
            }
            if (event.type.startsWith('touch')) {
                event.type = TOUCH_TO_POINTER[event.type] || event.type;
            }
            return event;
        };
        /**
         * Transfers base & mouse event data from the {@code nativeEvent} to the federated event.
         *
         * @param event
         * @param nativeEvent
         */
        EventSystem.prototype.transferMouseData = function (event, nativeEvent) {
            event.isTrusted = nativeEvent.isTrusted;
            event.srcElement = nativeEvent.srcElement;
            event.timeStamp = performance.now();
            event.type = nativeEvent.type;
            event.altKey = nativeEvent.altKey;
            event.button = nativeEvent.button;
            event.buttons = nativeEvent.buttons;
            event.client.x = nativeEvent.clientX;
            event.client.y = nativeEvent.clientY;
            event.ctrlKey = nativeEvent.ctrlKey;
            event.metaKey = nativeEvent.metaKey;
            event.movement.x = nativeEvent.movementX;
            event.movement.y = nativeEvent.movementY;
            event.page.x = nativeEvent.pageX;
            event.page.y = nativeEvent.pageY;
            event.relatedTarget = null;
        };
        return EventSystem;
    }());

    var FederatedDisplayObject = {
        /**
         * Enable interaction events for the DisplayObject. Touch, pointer and mouse
         * events will not be emitted unless `interactive` is set to `true`.
         *
         * @example
         * const sprite = new PIXI.Sprite(texture);
         * sprite.interactive = true;
         * sprite.on('tap', (event) => {
         *    //handle event
         * });
         * @memberof PIXI.DisplayObject#
         */
        interactive: false,
        /**
         * Determines if the children to the displayObject can be clicked/touched
         * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
         *
         * @memberof PIXI.Container#
         */
        interactiveChildren: true,
        /**
         * Interaction shape. Children will be hit first, then this shape will be checked.
         * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
         *
         * @example
         * const sprite = new PIXI.Sprite(texture);
         * sprite.interactive = true;
         * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
         * @member {PIXI.IHitArea}
         * @memberof PIXI.DisplayObject#
         */
        hitArea: null,
        /**
         * Unlike `on` or `addListener` which are methods from EventEmitter, `addEventListener`
         * seeks to be compatible with the DOM's `addEventListener` with support for options.
         * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
         * @memberof PIXI.DisplayObject
         * @param type - The type of event to listen to.
         * @param listener - The listener callback or object.
         * @param options - Listener options, used for capture phase.
         * @example
         * // Tell the user whether they did a single, double, triple, or nth click.
         * button.addEventListener('click', {
         *   handleEvent(e): {
         *     let prefix;
         *
         *     switch (e.detail) {
         *       case 1: prefix = 'single'; break;
         *       case 2: prefix = 'double'; break;
         *       case 3: prefix = 'triple'; break;
         *       default: prefix = e.detail + 'th'; break;
         *     }
         *
         *     console.log('That was a ' + prefix + 'click');
         *   }
         * });
         *
         * // But skip the first click!
         * button.parent.addEventListener('click', function blockClickOnce(e) {
         *   e.stopImmediatePropagation();
         *   button.parent.removeEventListener('click', blockClickOnce, true);
         * }, {
         *   capture: true,
         * })
         */
        addEventListener: function (type, listener, options) {
            var capture = (typeof options === 'boolean' && options)
                || (typeof options === 'object' && options.capture);
            var context = typeof listener === 'function' ? undefined : listener;
            type = capture ? type + "capture" : type;
            listener = typeof listener === 'function' ? listener : listener.handleEvent;
            this.on(type, listener, context);
        },
        /**
         * Unlike `off` or `removeListener` which are methods from EventEmitter, `removeEventListener`
         * seeks to be compatible with the DOM's `removeEventListener` with support for options.
         * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
         * @memberof PIXI.DisplayObject
         * @param type - The type of event the listener is bound to.
         * @param listener - The listener callback or object.
         * @param options - The original listener options. This is required to deregister a capture phase listener.
         */
        removeEventListener: function (type, listener, options) {
            var capture = (typeof options === 'boolean' && options)
                || (typeof options === 'object' && options.capture);
            var context = typeof listener === 'function' ? undefined : listener;
            type = capture ? type + "capture" : type;
            listener = typeof listener === 'function' ? listener : listener.handleEvent;
            this.off(type, listener, context);
        },
        /**
         * Dispatch the event on this {@link PIXI.DisplayObject} using the event's {@link PIXI.EventBoundary}.
         *
         * The target of the event is set to `this` and the `defaultPrevented` flag is cleared before dispatch.
         *
         * **IMPORTANT:** _Only_ available if using the `@pixi/events` package.
         * @memberof PIXI.DisplayObject
         * @param e - The event to dispatch.
         * @return Whether the {@link PIXI.FederatedEvent.preventDefault preventDefault}() method was not invoked.
         * @example
         * // Reuse a click event!
         * button.dispatchEvent(clickEvent);
         */
        dispatchEvent: function (e) {
            if (!(e instanceof FederatedEvent)) {
                throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
            }
            e.defaultPrevented = false;
            e.path = null;
            e.target = this;
            e.manager.dispatchEvent(e);
            return !e.defaultPrevented;
        }
    };
    display.DisplayObject.mixin(FederatedDisplayObject);

    exports.EventBoundary = EventBoundary;
    exports.EventSystem = EventSystem;
    exports.FederatedDisplayObject = FederatedDisplayObject;
    exports.FederatedEvent = FederatedEvent;
    exports.FederatedMouseEvent = FederatedMouseEvent;
    exports.FederatedPointerEvent = FederatedPointerEvent;
    exports.FederatedWheelEvent = FederatedWheelEvent;

    return exports;

}({}, PIXI.utils, PIXI, PIXI));
Object.assign(this.PIXI, _pixi_events);
//# sourceMappingURL=events.js.map
