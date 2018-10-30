'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Drag = require('./drag');
var Pinch = require('./pinch');
var Clamp = require('./clamp');
var ClampZoom = require('./clamp-zoom');
var Decelerate = require('./decelerate');
var Bounce = require('./bounce');
var Snap = require('./snap');
var SnapZoom = require('./snap-zoom');
var Follow = require('./follow');
var Wheel = require('./wheel');
var MouseEdges = require('./mouse-edges');

var PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'];

var Viewport = function (_PIXI$Container) {
    _inherits(Viewport, _PIXI$Container);

    /**
     * @extends PIXI.Container
     * @extends EventEmitter
     * @param {object} [options]
     * @param {number} [options.screenWidth=window.innerWidth]
     * @param {number} [options.screenHeight=window.innerHeight]
     * @param {number} [options.worldWidth=this.width]
     * @param {number} [options.worldHeight=this.height]
     * @param {number} [options.threshold=5] number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
     * @param {boolean} [options.passiveWheel=true] whether the 'wheel' event is set to passive
     * @param {boolean} [options.stopPropagation=false] whether to stopPropagation of events that impact the viewport
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for updates
     * @param {PIXI.InteractionManager} [options.interaction=null] InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer postion relative to canvas location on screen
     * @param {HTMLElement} [options.divWheel=document.body] div to attach the wheel event
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
     */
    function Viewport(options) {
        _classCallCheck(this, Viewport);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (Viewport.__proto__ || Object.getPrototypeOf(Viewport)).call(this));

        _this.plugins = {};
        _this.pluginsList = [];
        _this._screenWidth = options.screenWidth;
        _this._screenHeight = options.screenHeight;
        _this._worldWidth = options.worldWidth;
        _this._worldHeight = options.worldHeight;
        _this.hitAreaFullScreen = utils.defaults(options.hitAreaFullScreen, true);
        _this.forceHitArea = options.forceHitArea;
        _this.passiveWheel = utils.defaults(options.passiveWheel, true);
        _this.stopEvent = options.stopPropagation;
        _this.threshold = utils.defaults(options.threshold, 5);
        _this.interaction = options.interaction || null;
        _this.div = options.divWheel || document.body;
        _this.listeners(_this.div);

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        _this.touches = [];

        _this.ticker = options.ticker || PIXI.ticker.shared;
        _this.tickerFunction = function () {
            return _this.update();
        };
        _this.ticker.add(_this.tickerFunction);
        return _this;
    }

    /**
     * removes all event listeners from viewport
     * (useful for cleanup of wheel and ticker events when removing viewport)
     */


    _createClass(Viewport, [{
        key: 'removeListeners',
        value: function removeListeners() {
            this.ticker.remove(this.tickerFunction);
            this.div.removeEventListener('wheel', this.wheelFunction);
        }

        /**
         * overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners
         */

    }, {
        key: 'destroy',
        value: function destroy(options) {
            _get(Viewport.prototype.__proto__ || Object.getPrototypeOf(Viewport.prototype), 'destroy', this).call(this, options);
            this.removeListeners();
        }

        /**
         * update animations
         * @private
         */

    }, {
        key: 'update',
        value: function update() {
            if (!this.pause) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.pluginsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var plugin = _step.value;

                        plugin.update(this.ticker.elapsedMS);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (this.lastViewport) {
                    // check for moved-end event
                    if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y) {
                        this.moving = true;
                    } else {
                        if (this.moving) {
                            this.emit('moved-end', this);
                            this.moving = false;
                        }
                    }
                    // check for zoomed-end event
                    if (this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y) {
                        this.zooming = true;
                    } else {
                        if (this.zooming) {
                            this.emit('zoomed-end', this);
                            this.zooming = false;
                        }
                    }
                }

                if (!this.forceHitArea) {
                    this.hitArea.x = this.left;
                    this.hitArea.y = this.top;
                    this.hitArea.width = this.worldScreenWidth;
                    this.hitArea.height = this.worldScreenHeight;
                }
                this._dirty = this._dirty || !this.lastViewport || this.lastViewport.x !== this.x || this.lastViewport.y !== this.y || this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y;
                this.lastViewport = {
                    x: this.x,
                    y: this.y,
                    scaleX: this.scale.x,
                    scaleY: this.scale.y
                };
            }
        }

        /**
         * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
         * @param {number} screenWidth
         * @param {number} screenHeight
         * @param {number} [worldWidth]
         * @param {number} [worldHeight]
         */

    }, {
        key: 'resize',
        value: function resize(screenWidth, screenHeight, worldWidth, worldHeight) {
            this._screenWidth = screenWidth || window.innerWidth;
            this._screenHeight = screenHeight || window.innerHeight;
            this._worldWidth = worldWidth;
            this._worldHeight = worldHeight;
            this.resizePlugins();
        }

        /**
         * called after a worldWidth/Height change
         * @private
         */

    }, {
        key: 'resizePlugins',
        value: function resizePlugins() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.pluginsList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var plugin = _step2.value;

                    plugin.resize();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        /**
         * screen width in screen pixels
         * @type {number}
         */

    }, {
        key: 'listeners',


        /**
         * add input listeners
         * @private
         */
        value: function listeners(div) {
            var _this2 = this;

            this.interactive = true;
            if (!this.forceHitArea) {
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
            this.on('pointerdown', this.down);
            this.on('pointermove', this.move);
            this.on('pointerup', this.up);
            this.on('pointerupoutside', this.up);
            this.on('pointercancel', this.up);
            this.on('pointerout', this.up);
            this.wheelFunction = function (e) {
                return _this2.handleWheel(e);
            };
            div.addEventListener('wheel', this.wheelFunction, { passive: this.passiveWheel });
            this.leftDown = false;
        }

        /**
         * handle down events
         * @private
         */

    }, {
        key: 'down',
        value: function down(e) {
            if (this.pause) {
                return;
            }
            if (e.data.pointerType === 'mouse') {
                if (e.data.originalEvent.button == 0) {
                    this.leftDown = true;
                }
            } else {
                this.touches.push(e.data.pointerId);
            }

            if (this.countDownPointers() === 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y

                    // clicked event does not fire if viewport is decelerating or bouncing
                };var decelerate = this.plugins['decelerate'];
                var bounce = this.plugins['bounce'];
                if ((!decelerate || Math.abs(decelerate.x) < this.threshold && Math.abs(decelerate.y) < this.threshold) && (!bounce || !bounce.toX && !bounce.toY)) {
                    this.clickedAvailable = true;
                } else {
                    this.clickedAvailable = false;
                }
            } else {
                this.clickedAvailable = false;
            }

            var stop = void 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.pluginsList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var plugin = _step3.value;

                    if (plugin.down(e)) {
                        stop = true;
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            if (stop && this.stopEvent) {
                e.stopPropagation();
            }
        }

        /**
         * whether change exceeds threshold
         * @private
         * @param {number} change
         */

    }, {
        key: 'checkThreshold',
        value: function checkThreshold(change) {
            if (Math.abs(change) >= this.threshold) {
                return true;
            }
            return false;
        }

        /**
         * handle move events
         * @private
         */

    }, {
        key: 'move',
        value: function move(e) {
            if (this.pause) {
                return;
            }

            var stop = void 0;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.pluginsList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var plugin = _step4.value;

                    if (plugin.move(e)) {
                        stop = true;
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (this.clickedAvailable) {
                var distX = e.data.global.x - this.last.x;
                var distY = e.data.global.y - this.last.y;
                if (this.checkThreshold(distX) || this.checkThreshold(distY)) {
                    this.clickedAvailable = false;
                }
            }

            if (stop && this.stopEvent) {
                e.stopPropagation();
            }
        }

        /**
         * handle up events
         * @private
         */

    }, {
        key: 'up',
        value: function up(e) {
            if (this.pause) {
                return;
            }

            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0) {
                this.leftDown = false;
            }

            if (e.data.pointerType !== 'mouse') {
                for (var i = 0; i < this.touches.length; i++) {
                    if (this.touches[i] === e.data.pointerId) {
                        this.touches.splice(i, 1);
                        break;
                    }
                }
            }

            var stop = void 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.pluginsList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var plugin = _step5.value;

                    if (plugin.up(e)) {
                        stop = true;
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (this.clickedAvailable && this.countDownPointers() === 0) {
                this.emit('clicked', { screen: this.last, world: this.toWorld(this.last), viewport: this });
                this.clickedAvailable = false;
            }

            if (stop && this.stopEvent) {
                e.stopPropagation();
            }
        }

        /**
         * gets pointer position if this.interaction is set
         * @param {UIEvent} evt
         * @private
         */

    }, {
        key: 'getPointerPosition',
        value: function getPointerPosition(evt) {
            var point = new PIXI.Point();
            if (this.interaction) {
                this.interaction.mapPositionToPoint(point, evt.clientX, evt.clientY);
            } else {
                point.x = evt.clientX;
                point.y = evt.clientY;
            }
            return point;
        }

        /**
         * handle wheel events
         * @private
         */

    }, {
        key: 'handleWheel',
        value: function handleWheel(e) {
            if (this.pause) {
                return;
            }

            // only handle wheel events where the mouse is over the viewport
            var point = this.toLocal(this.getPointerPosition(e));
            if (this.left <= point.x && point.x <= this.right && this.top <= point.y && point.y <= this.bottom) {
                var result = void 0;
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this.pluginsList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var plugin = _step6.value;

                        if (plugin.wheel(e)) {
                            result = true;
                        }
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                return result;
            }
        }

        /**
         * change coordinates from screen to world
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toWorld',
        value: function toWorld() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toLocal({ x: x, y: y });
            } else {
                return this.toLocal(arguments[0]);
            }
        }

        /**
         * change coordinates from world to screen
         * @param {number|PIXI.Point} x
         * @param {number} [y]
         * @returns {PIXI.Point}
         */

    }, {
        key: 'toScreen',
        value: function toScreen() {
            if (arguments.length === 2) {
                var x = arguments[0];
                var y = arguments[1];
                return this.toGlobal({ x: x, y: y });
            } else {
                var point = arguments[0];
                return this.toGlobal(point);
            }
        }

        /**
         * screen width in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'moveCenter',


        /**
         * move center of viewport to point
         * @param {(number|PIXI.PointLike)} x or point
         * @param {number} [y]
         * @return {Viewport} this
         */
        value: function moveCenter() /*x, y | PIXI.Point*/{
            var x = void 0,
                y = void 0;
            if (!isNaN(arguments[0])) {
                x = arguments[0];
                y = arguments[1];
            } else {
                x = arguments[0].x;
                y = arguments[0].y;
            }
            this.position.set((this.worldScreenWidth / 2 - x) * this.scale.x, (this.worldScreenHeight / 2 - y) * this.scale.y);
            this._reset();
            return this;
        }

        /**
         * top-left corner
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'moveCorner',


        /**
         * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
         * @param {number|PIXI.Point} x|point
         * @param {number} y
         * @return {Viewport} this
         */
        value: function moveCorner() /*x, y | point*/{
            if (arguments.length === 1) {
                this.position.set(-arguments[0].x * this.scale.x, -arguments[0].y * this.scale.y);
            } else {
                this.position.set(-arguments[0] * this.scale.x, -arguments[1] * this.scale.y);
            }
            this._reset();
            return this;
        }

        /**
         * change zoom so the width fits in the viewport
         * @param {number} [width=this._worldWidth] in world coordinates
         * @param {boolean} [center] maintain the same center
         * @param {boolean} [scaleY=true] whether to set scaleY=scaleX
         * @param {boolean} [noClamp=false] whether to disable clamp-zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitWidth',
        value: function fitWidth(width, center) {
            var scaleY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var noClamp = arguments[3];

            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            this.scale.x = this.screenWidth / width;

            if (scaleY) {
                this.scale.y = this.scale.x;
            }

            var clampZoom = this.plugins['clamp-zoom'];
            if (!noClamp && clampZoom) {
                clampZoom.clamp();
            }

            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so the height fits in the viewport
         * @param {number} [height=this._worldHeight] in world coordinates
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
         * @param {boolean} [noClamp=false] whether to disable clamp-zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitHeight',
        value: function fitHeight(height, center) {
            var scaleX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var noClamp = arguments[3];

            var save = void 0;
            if (center) {
                save = this.center;
            }
            height = height || this.worldHeight;
            this.scale.y = this.screenHeight / height;

            if (scaleX) {
                this.scale.x = this.scale.y;
            }

            var clampZoom = this.plugins['clamp-zoom'];
            if (!noClamp && clampZoom) {
                clampZoom.clamp();
            }

            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitWorld',
        value: function fitWorld(center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            this.scale.x = this._screenWidth / this._worldWidth;
            this.scale.y = this._screenHeight / this._worldHeight;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }

            var clampZoom = this.plugins['clamp-zoom'];
            if (clampZoom) {
                clampZoom.clamp();
            }

            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so it fits the size or the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param {number} [width] desired width
         * @param {number} [height] desired height
         * @return {Viewport} this
         */

    }, {
        key: 'fit',
        value: function fit(center, width, height) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            height = height || this.worldHeight;
            this.scale.x = this.screenWidth / width;
            this.scale.y = this.screenHeight / height;
            if (this.scale.x < this.scale.y) {
                this.scale.y = this.scale.x;
            } else {
                this.scale.x = this.scale.y;
            }
            var clampZoom = this.plugins['clamp-zoom'];
            if (clampZoom) {
                clampZoom.clamp();
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by a certain percent (in both x and y direction)
         * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoomPercent',
        value: function zoomPercent(percent, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            var scale = this.scale.x + this.scale.x * percent;
            this.scale.set(scale);
            var clampZoom = this.plugins['clamp-zoom'];
            if (clampZoom) {
                clampZoom.clamp();
            }
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * zoom viewport by increasing/decreasing width by a certain number of pixels
         * @param {number} change in pixels
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} the viewport
         */

    }, {
        key: 'zoom',
        value: function zoom(change, center) {
            this.fitWidth(change + this.worldScreenWidth, center);
            return this;
        }

        /**
         * @param {object} [options]
         * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
         * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
         * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
         * @param {boolean} [options.noMove] zoom but do not move
         */

    }, {
        key: 'snapZoom',
        value: function snapZoom(options) {
            this.plugins['snap-zoom'] = new SnapZoom(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * @private
         * @typedef OutOfBounds
         * @type {object}
         * @property {boolean} left
         * @property {boolean} right
         * @property {boolean} top
         * @property {boolean} bottom
         */

        /**
         * is container out of world bounds
         * @return {OutOfBounds}
         * @private
         */

    }, {
        key: 'OOB',
        value: function OOB() {
            var result = {};
            result.left = this.left < 0;
            result.right = this.right > this._worldWidth;
            result.top = this.top < 0;
            result.bottom = this.bottom > this._worldHeight;
            result.cornerPoint = {
                x: this._worldWidth * this.scale.x - this._screenWidth,
                y: this._worldHeight * this.scale.y - this._screenHeight
            };
            return result;
        }

        /**
         * world coordinates of the right edge of the screen
         * @type {number}
         */

    }, {
        key: 'countDownPointers',


        /**
         * count of mouse/touch pointers that are down on the viewport
         * @private
         * @return {number}
         */
        value: function countDownPointers() {
            return (this.leftDown ? 1 : 0) + this.touches.length;
        }

        /**
         * array of touch pointers that are down on the viewport
         * @private
         * @return {PIXI.InteractionTrackingData[]}
         */

    }, {
        key: 'getTouchPointers',
        value: function getTouchPointers() {
            var results = [];
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                var pointer = pointers[key];
                if (this.touches.indexOf(pointer.pointerId) !== -1) {
                    results.push(pointer);
                }
            }
            return results;
        }

        /**
         * array of pointers that are down on the viewport
         * @private
         * @return {PIXI.InteractionTrackingData[]}
         */

    }, {
        key: 'getPointers',
        value: function getPointers() {
            var results = [];
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                results.push(pointers[key]);
            }
            return results;
        }

        /**
         * clamps and resets bounce and decelerate (as needed) after manually moving viewport
         * @private
         */

    }, {
        key: '_reset',
        value: function _reset() {
            if (this.plugins['bounce']) {
                this.plugins['bounce'].reset();
                this.plugins['bounce'].bounce();
            }
            if (this.plugins['decelerate']) {
                this.plugins['decelerate'].reset();
            }
            if (this.plugins['snap']) {
                this.plugins['snap'].reset();
            }
            if (this.plugins['clamp']) {
                this.plugins['clamp'].update();
            }
            if (this.plugins['clamp-zoom']) {
                this.plugins['clamp-zoom'].clamp();
            }
        }

        // PLUGINS

        /**
         * removes installed plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'removePlugin',
        value: function removePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type] = null;
                this.emit(type + '-remove');
                this.pluginsSort();
            }
        }

        /**
         * pause plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'pausePlugin',
        value: function pausePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].pause();
            }
        }

        /**
         * resume plugin
         * @param {string} type of plugin (e.g., 'drag', 'pinch')
         */

    }, {
        key: 'resumePlugin',
        value: function resumePlugin(type) {
            if (this.plugins[type]) {
                this.plugins[type].resume();
            }
        }

        /**
         * sort plugins for updates
         * @private
         */

    }, {
        key: 'pluginsSort',
        value: function pluginsSort() {
            this.pluginsList = [];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = PLUGIN_ORDER[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var plugin = _step7.value;

                    if (this.plugins[plugin]) {
                        this.pluginsList.push(this.plugins[plugin]);
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }

        /**
         * enable one-finger touch to drag
         * @param {object} [options]
         * @param {string} [options.direction=all] direction to drag (all, x, or y)
         * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
         * @param {number} [options.wheelScroll=10] number of pixels to scroll with each wheel spin
         * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         */

    }, {
        key: 'drag',
        value: function drag(options) {
            this.plugins['drag'] = new Drag(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * clamp to world boundaries or other provided boundaries
         * NOTES:
         *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
         *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {(number|boolean)} [options.left] clamp left; true=0
         * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
         * @param {(number|boolean)} [options.top] clamp top; true=0
         * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
         * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'clamp',
        value: function clamp(options) {
            this.plugins['clamp'] = new Clamp(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * decelerate after a move
         * @param {object} [options]
         * @param {number} [options.friction=0.95] percent to decelerate after movement
         * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
         * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
         * @return {Viewport} this
         */

    }, {
        key: 'decelerate',
        value: function decelerate(options) {
            this.plugins['decelerate'] = new Decelerate(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * bounce on borders
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
         * @param {number} [options.friction=0.5] friction to apply to decelerate if active
         * @param {number} [options.time=150] time in ms to finish bounce
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'bounce',
        value: function bounce(options) {
            this.plugins['bounce'] = new Bounce(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * enable pinch to zoom and two-finger touch to drag
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {number} [options.percent=1.0] percent to modify pinch speed
         * @param {boolean} [options.noDrag] disable two-finger dragging
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
         * @return {Viewport} this
         */

    }, {
        key: 'pinch',
        value: function pinch(options) {
            this.plugins['pinch'] = new Pinch(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * snap to a point
         * @param {number} x
         * @param {number} y
         * @param {object} [options]
         * @param {boolean} [options.topLeft] snap to the top-left of viewport instead of center
         * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
         * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
         * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
         * @return {Viewport} this
         */

    }, {
        key: 'snap',
        value: function snap(x, y, options) {
            this.plugins['snap'] = new Snap(this, x, y, options);
            this.pluginsSort();
            return this;
        }

        /**
         * follow a target
         * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
         * @param {object} [options]
         * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
         * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
         * @return {Viewport} this
         */

    }, {
        key: 'follow',
        value: function follow(target, options) {
            this.plugins['follow'] = new Follow(this, target, options);
            this.pluginsSort();
            return this;
        }

        /**
         * zoom using mouse wheel
         * @param {object} [options]
         * @param {number} [options.percent=0.1] percent to scroll with each spin
         * @param {boolean} [options.reverse] reverse the direction of the scroll
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
         * @return {Viewport} this
         */

    }, {
        key: 'wheel',
        value: function wheel(options) {
            this.plugins['wheel'] = new Wheel(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * enable clamping of zoom to constraints
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {number} [options.minWidth] minimum width
         * @param {number} [options.minHeight] minimum height
         * @param {number} [options.maxWidth] maximum width
         * @param {number} [options.maxHeight] maximum height
         * @return {Viewport} this
         */

    }, {
        key: 'clampZoom',
        value: function clampZoom(options) {
            this.plugins['clamp-zoom'] = new ClampZoom(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
         * @param {object} [options]
         * @param {number} [options.radius] distance from center of screen in screen pixels
         * @param {number} [options.distance] distance from all sides in screen pixels
         * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
         * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
         * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
         * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
         * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
         * @param {boolean} [options.reverse] reverse direction of scroll
         * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
         * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
         */

    }, {
        key: 'mouseEdges',
        value: function mouseEdges(options) {
            this.plugins['mouse-edges'] = new MouseEdges(this, options);
            this.pluginsSort();
            return this;
        }

        /**
         * pause viewport (including animation updates such as decelerate)
         * NOTE: when setting pause=true, all touches and mouse actions are cleared (i.e., if mousedown was active, it becomes inactive for purposes of the viewport)
         * @type {boolean}
         */

    }, {
        key: 'screenWidth',
        get: function get() {
            return this._screenWidth;
        },
        set: function set(value) {
            this._screenWidth = value;
        }

        /**
         * screen height in screen pixels
         * @type {number}
         */

    }, {
        key: 'screenHeight',
        get: function get() {
            return this._screenHeight;
        },
        set: function set(value) {
            this._screenHeight = value;
        }

        /**
         * world width in pixels
         * @type {number}
         */

    }, {
        key: 'worldWidth',
        get: function get() {
            if (this._worldWidth) {
                return this._worldWidth;
            } else {
                return this.width;
            }
        },
        set: function set(value) {
            this._worldWidth = value;
            this.resizePlugins();
        }

        /**
         * world height in pixels
         * @type {number}
         */

    }, {
        key: 'worldHeight',
        get: function get() {
            if (this._worldHeight) {
                return this._worldHeight;
            } else {
                return this.height;
            }
        },
        set: function set(value) {
            this._worldHeight = value;
            this.resizePlugins();
        }
    }, {
        key: 'worldScreenWidth',
        get: function get() {
            return this._screenWidth / this.scale.x;
        }

        /**
         * screen height in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'worldScreenHeight',
        get: function get() {
            return this._screenHeight / this.scale.y;
        }

        /**
         * world width in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldWidth',
        get: function get() {
            return this._worldWidth * this.scale.x;
        }

        /**
         * world height in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldHeight',
        get: function get() {
            return this._worldHeight * this.scale.y;
        }

        /**
         * get center of screen in world coordinates
         * @type {PIXI.PointLike}
         */

    }, {
        key: 'center',
        get: function get() {
            return { x: this.worldScreenWidth / 2 - this.x / this.scale.x, y: this.worldScreenHeight / 2 - this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCenter(value);
        }
    }, {
        key: 'corner',
        get: function get() {
            return { x: -this.x / this.scale.x, y: -this.y / this.scale.y };
        },
        set: function set(value) {
            this.moveCorner(value);
        }
    }, {
        key: 'right',
        get: function get() {
            return -this.x / this.scale.x + this.worldScreenWidth;
        },
        set: function set(value) {
            this.x = -value * this.scale.x + this.screenWidth;
            this._reset();
        }

        /**
         * world coordinates of the left edge of the screen
         * @type {number}
         */

    }, {
        key: 'left',
        get: function get() {
            return -this.x / this.scale.x;
        },
        set: function set(value) {
            this.x = -value * this.scale.x;
            this._reset();
        }

        /**
         * world coordinates of the top edge of the screen
         * @type {number}
         */

    }, {
        key: 'top',
        get: function get() {
            return -this.y / this.scale.y;
        },
        set: function set(value) {
            this.y = -value * this.scale.y;
            this._reset();
        }

        /**
         * world coordinates of the bottom edge of the screen
         * @type {number}
         */

    }, {
        key: 'bottom',
        get: function get() {
            return -this.y / this.scale.y + this.worldScreenHeight;
        },
        set: function set(value) {
            this.y = -value * this.scale.y + this.screenHeight;
            this._reset();
        }
        /**
         * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
         * @type {boolean}
         */

    }, {
        key: 'dirty',
        get: function get() {
            return this._dirty;
        },
        set: function set(value) {
            this._dirty = value;
        }

        /**
         * permanently changes the Viewport's hitArea
         * NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
         * @type {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)}
         */

    }, {
        key: 'forceHitArea',
        get: function get() {
            return this._forceHitArea;
        },
        set: function set(value) {
            if (value) {
                this._forceHitArea = value;
                this.hitArea = value;
            } else {
                this._forceHitArea = false;
                this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
        }
    }, {
        key: 'pause',
        get: function get() {
            return this._pause;
        },
        set: function set(value) {
            this._pause = value;
            this.lastViewport = null;
            this.moving = false;
            this.zooming = false;
            if (value) {
                this.touches = [];
                this.leftDown = false;
            }
        }
    }]);

    return Viewport;
}(PIXI.Container);

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.PointLike} screen
 * @property {PIXI.PointLike} world
 * @property {Viewport} viewport
 */

/**
 * fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#moved
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag, snap, pinch, follow, bounce-x, bounce-y, clamp-x, clamp-y, decelerate, mouse-edges, wheel)
 */

/**
 * fires when viewport moves through UI interaction, deceleration, or follow
 * @event Viewport#zoomed
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom)
 */

/**
 * fires when viewport stops moving for any reason
 * @event Viewport#moved-end
 * @type {Viewport}
 */

/**
 * fires when viewport stops zooming for any rason
 * @event Viewport#zoomed-end
 * @type {Viewport}
 */

if (typeof PIXI !== 'undefined') {
    PIXI.extras.Viewport = Viewport;
}

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJwYXNzaXZlV2hlZWwiLCJzdG9wRXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJ0aWNrZXJGdW5jdGlvbiIsInVwZGF0ZSIsImFkZCIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aGVlbEZ1bmN0aW9uIiwicmVtb3ZlTGlzdGVuZXJzIiwicGF1c2UiLCJwbHVnaW4iLCJlbGFwc2VkTVMiLCJsYXN0Vmlld3BvcnQiLCJ4IiwieSIsIm1vdmluZyIsImVtaXQiLCJzY2FsZVgiLCJzY2FsZSIsInNjYWxlWSIsInpvb21pbmciLCJoaXRBcmVhIiwibGVmdCIsInRvcCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiX2RpcnR5Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicmVzaXplUGx1Z2lucyIsInJlc2l6ZSIsImludGVyYWN0aXZlIiwiUmVjdGFuZ2xlIiwib24iLCJkb3duIiwibW92ZSIsInVwIiwiZSIsImhhbmRsZVdoZWVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsInBhc3NpdmUiLCJsZWZ0RG93biIsImRhdGEiLCJwb2ludGVyVHlwZSIsIm9yaWdpbmFsRXZlbnQiLCJidXR0b24iLCJwdXNoIiwicG9pbnRlcklkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwiZ2xvYmFsIiwiZGVjZWxlcmF0ZSIsImJvdW5jZSIsIk1hdGgiLCJhYnMiLCJ0b1giLCJ0b1kiLCJjbGlja2VkQXZhaWxhYmxlIiwic3RvcCIsImNoYW5nZSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIk1vdXNlRXZlbnQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJldnQiLCJwb2ludCIsIlBvaW50IiwibWFwUG9zaXRpb25Ub1BvaW50IiwiY2xpZW50WCIsImNsaWVudFkiLCJ0b0xvY2FsIiwiZ2V0UG9pbnRlclBvc2l0aW9uIiwicmlnaHQiLCJib3R0b20iLCJyZXN1bHQiLCJ3aGVlbCIsImFyZ3VtZW50cyIsInRvR2xvYmFsIiwiaXNOYU4iLCJwb3NpdGlvbiIsInNldCIsIl9yZXNldCIsImNlbnRlciIsIm5vQ2xhbXAiLCJzYXZlIiwiY2xhbXBab29tIiwiY2xhbXAiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJ0eXBlIiwicmVzdW1lIiwidGFyZ2V0IiwidmFsdWUiLCJtb3ZlQ29ybmVyIiwiX2ZvcmNlSGl0QXJlYSIsIl9wYXVzZSIsIkNvbnRhaW5lciIsImV4dHJhcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7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VCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLckQsVUFBOUIsRUFBMEMsS0FBS0UsV0FBL0MsQ0FBZjtBQUNIO0FBQ0o7Ozs0QkF5VFc7QUFBRSxtQkFBTyxLQUFLbUksTUFBWjtBQUFvQixTOzBCQUN4QkgsSyxFQUNWO0FBQ0ksaUJBQUtHLE1BQUwsR0FBY0gsS0FBZDtBQUNBLGlCQUFLcEcsWUFBTCxHQUFvQixJQUFwQjtBQUNBLGlCQUFLRyxNQUFMLEdBQWMsS0FBZDtBQUNBLGlCQUFLSyxPQUFMLEdBQWUsS0FBZjtBQUNBLGdCQUFJNEYsS0FBSixFQUNBO0FBQ0kscUJBQUtsSCxPQUFMLEdBQWUsRUFBZjtBQUNBLHFCQUFLOEMsUUFBTCxHQUFnQixLQUFoQjtBQUNIO0FBQ0o7Ozs7RUFqd0NrQjVDLEtBQUtvSCxTOztBQW93QzVCOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7Ozs7QUFRQTs7Ozs7Ozs7QUFRQTs7Ozs7O0FBTUE7Ozs7OztBQU1BLElBQUksT0FBT3BILElBQVAsS0FBZ0IsV0FBcEIsRUFDQTtBQUNJQSxTQUFLcUgsTUFBTCxDQUFZaEosUUFBWixHQUF1QkEsUUFBdkI7QUFDSDs7QUFFRGlKLE9BQU9DLE9BQVAsR0FBaUJsSixRQUFqQiIsImZpbGUiOiJ2aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZD01XSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUgdG8gdHJpZ2dlciBhbiBpbnB1dCBldmVudCAoZS5nLiwgZHJhZywgcGluY2gpIG9yIGRpc2FibGUgYSBjbGlja2VkIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnBhc3NpdmVXaGVlbD10cnVlXSB3aGV0aGVyIHRoZSAnd2hlZWwnIGV2ZW50IGlzIHNldCB0byBwYXNzaXZlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnN0b3BQcm9wYWdhdGlvbj1mYWxzZV0gd2hldGhlciB0byBzdG9wUHJvcGFnYXRpb24gb2YgZXZlbnRzIHRoYXQgaW1wYWN0IHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfSBbb3B0aW9ucy5mb3JjZUhpdEFyZWFdIGNoYW5nZSB0aGUgZGVmYXVsdCBoaXRBcmVhIGZyb20gd29ybGQgc2l6ZSB0byBhIG5ldyB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHtQSVhJLnRpY2tlci5UaWNrZXJ9IFtvcHRpb25zLnRpY2tlcj1QSVhJLnRpY2tlci5zaGFyZWRdIHVzZSB0aGlzIFBJWEkudGlja2VyIGZvciB1cGRhdGVzXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuSW50ZXJhY3Rpb25NYW5hZ2VyfSBbb3B0aW9ucy5pbnRlcmFjdGlvbj1udWxsXSBJbnRlcmFjdGlvbk1hbmFnZXIsIGF2YWlsYWJsZSBmcm9tIGluc3RhbnRpYXRlZCBXZWJHTFJlbmRlcmVyL0NhbnZhc1JlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24gLSB1c2VkIHRvIGNhbGN1bGF0ZSBwb2ludGVyIHBvc3Rpb24gcmVsYXRpdmUgdG8gY2FudmFzIGxvY2F0aW9uIG9uIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbnMuZGl2V2hlZWw9ZG9jdW1lbnQuYm9keV0gZGl2IHRvIGF0dGFjaCB0aGUgd2hlZWwgZXZlbnRcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKiBAZmlyZXMgZHJhZy1zdGFydFxyXG4gICAgICogQGZpcmVzIGRyYWctZW5kXHJcbiAgICAgKiBAZmlyZXMgZHJhZy1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBwaW5jaC1zdGFydFxyXG4gICAgICogQGZpcmVzIHBpbmNoLWVuZFxyXG4gICAgICogQGZpcmVzIHBpbmNoLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtc2Nyb2xsXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtc2Nyb2xsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2Utc3RhcnRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLWVuZFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgbW92ZWRcclxuICAgICAqIEBmaXJlcyBtb3ZlZC1lbmRcclxuICAgICAqIEBmaXJlcyB6b29tZWRcclxuICAgICAqIEBmaXJlcyB6b29tZWQtZW5kXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy5wYXNzaXZlV2hlZWwgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnBhc3NpdmVXaGVlbCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLnN0b3BFdmVudCA9IG9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRocmVzaG9sZCwgNSlcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gb3B0aW9ucy5pbnRlcmFjdGlvbiB8fCBudWxsXHJcbiAgICAgICAgdGhpcy5kaXYgPSBvcHRpb25zLmRpdldoZWVsIHx8IGRvY3VtZW50LmJvZHlcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyh0aGlzLmRpdilcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWN0aXZlIHRvdWNoIHBvaW50IGlkcyBvbiB0aGUgdmlld3BvcnRcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyW119XHJcbiAgICAgICAgICogQHJlYWRvbmx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuXHJcbiAgICAgICAgdGhpcy50aWNrZXIgPSBvcHRpb25zLnRpY2tlciB8fCBQSVhJLnRpY2tlci5zaGFyZWRcclxuICAgICAgICB0aGlzLnRpY2tlckZ1bmN0aW9uID0gKCkgPT4gdGhpcy51cGRhdGUoKVxyXG4gICAgICAgIHRoaXMudGlja2VyLmFkZCh0aGlzLnRpY2tlckZ1bmN0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdmlld3BvcnRcclxuICAgICAqICh1c2VmdWwgZm9yIGNsZWFudXAgb2Ygd2hlZWwgYW5kIHRpY2tlciBldmVudHMgd2hlbiByZW1vdmluZyB2aWV3cG9ydClcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlTGlzdGVuZXJzKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnRpY2tlci5yZW1vdmUodGhpcy50aWNrZXJGdW5jdGlvbilcclxuICAgICAgICB0aGlzLmRpdi5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMud2hlZWxGdW5jdGlvbilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG92ZXJyaWRlcyBQSVhJLkNvbnRhaW5lcidzIGRlc3Ryb3kgdG8gYWxzbyByZW1vdmUgdGhlICd3aGVlbCcgYW5kIFBJWEkuVGlja2VyIGxpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICBkZXN0cm95KG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveShvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSBhbmltYXRpb25zXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwbHVnaW4udXBkYXRlKHRoaXMudGlja2VyLmVsYXBzZWRNUylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubGFzdFZpZXdwb3J0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgbW92ZWQtZW5kIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0Vmlld3BvcnQueCAhPT0gdGhpcy54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnkgIT09IHRoaXMueSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ21vdmVkLWVuZCcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92aW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3Igem9vbWVkLWVuZCBldmVudFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWCAhPT0gdGhpcy5zY2FsZS54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWSAhPT0gdGhpcy5zY2FsZS55KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuem9vbWluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy56b29taW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd6b29tZWQtZW5kJywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b29taW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnkgPSB0aGlzLnRvcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLndpZHRoID0gdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2RpcnR5ID0gdGhpcy5fZGlydHkgfHwgIXRoaXMubGFzdFZpZXdwb3J0IHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydC54ICE9PSB0aGlzLnggfHwgdGhpcy5sYXN0Vmlld3BvcnQueSAhPT0gdGhpcy55IHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydC5zY2FsZVggIT09IHRoaXMuc2NhbGUueCB8fCB0aGlzLmxhc3RWaWV3cG9ydC5zY2FsZVkgIT09IHRoaXMuc2NhbGUueVxyXG4gICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydCA9IHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICAgICAgICAgIHNjYWxlWDogdGhpcy5zY2FsZS54LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVZOiB0aGlzLnNjYWxlLnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbldpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkSGVpZ2h0XVxyXG4gICAgICovXHJcbiAgICByZXNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoZGl2KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy53aGVlbEZ1bmN0aW9uID0gKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSlcclxuICAgICAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24sIHsgcGFzc2l2ZTogdGhpcy5wYXNzaXZlV2hlZWwgfSlcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkb3duIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgPT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQuYnV0dG9uID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzLnB1c2goZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNsaWNrZWQgZXZlbnQgZG9lcyBub3QgZmlyZSBpZiB2aWV3cG9ydCBpcyBkZWNlbGVyYXRpbmcgb3IgYm91bmNpbmdcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGNvbnN0IGJvdW5jZSA9IHRoaXMucGx1Z2luc1snYm91bmNlJ11cclxuICAgICAgICAgICAgaWYgKCghZGVjZWxlcmF0ZSB8fCAoTWF0aC5hYnMoZGVjZWxlcmF0ZS54KSA8IHRoaXMudGhyZXNob2xkICYmIE1hdGguYWJzKGRlY2VsZXJhdGUueSkgPCB0aGlzLnRocmVzaG9sZCkpICYmICghYm91bmNlIHx8ICghYm91bmNlLnRvWCAmJiAhYm91bmNlLnRvWSkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3RvcFxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHBsdWdpbi5kb3duKGUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdG9wICYmIHRoaXMuc3RvcEV2ZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZXRoZXIgY2hhbmdlIGV4Y2VlZHMgdGhyZXNob2xkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZVxyXG4gICAgICovXHJcbiAgICBjaGVja1RocmVzaG9sZChjaGFuZ2UpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKE1hdGguYWJzKGNoYW5nZSkgPj0gdGhpcy50aHJlc2hvbGQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtb3ZlIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3RvcFxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHBsdWdpbi5tb3ZlKGUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGlzdFggPSBlLmRhdGEuZ2xvYmFsLnggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICBjb25zdCBkaXN0WSA9IGUuZGF0YS5nbG9iYWwueSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RZKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0b3AgJiYgdGhpcy5zdG9wRXZlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEub3JpZ2luYWxFdmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgJiYgZS5kYXRhLm9yaWdpbmFsRXZlbnQuYnV0dG9uID09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgIT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudG91Y2hlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlc1tpXSA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdWNoZXMuc3BsaWNlKGksIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0b3BcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW4udXAoZSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUgJiYgdGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcyB9KVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0b3AgJiYgdGhpcy5zdG9wRXZlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0cyBwb2ludGVyIHBvc2l0aW9uIGlmIHRoaXMuaW50ZXJhY3Rpb24gaXMgc2V0XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGV2dFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlclBvc2l0aW9uKGV2dClcclxuICAgIHtcclxuICAgICAgICBsZXQgcG9pbnQgPSBuZXcgUElYSS5Qb2ludCgpXHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uLm1hcFBvc2l0aW9uVG9Qb2ludChwb2ludCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwb2ludC54ID0gZXZ0LmNsaWVudFhcclxuICAgICAgICAgICAgcG9pbnQueSA9IGV2dC5jbGllbnRZXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHdoZWVsIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgaGFuZGxlV2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBoYW5kbGUgd2hlZWwgZXZlbnRzIHdoZXJlIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy50b0xvY2FsKHRoaXMuZ2V0UG9pbnRlclBvc2l0aW9uKGUpKVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgPD0gcG9pbnQueCAmJiBwb2ludC54IDw9IHRoaXMucmlnaHQgJiYgdGhpcy50b3AgPD0gcG9pbnQueSAmJiBwb2ludC55IDw9IHRoaXMuYm90dG9tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsdWdpbi53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHNjcmVlbiB0byB3b3JsZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvV29ybGQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoYXJndW1lbnRzWzBdKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHdvcmxkIHRvIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvU2NyZWVuKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NjYWxlWT10cnVlXSB3aGV0aGVyIHRvIHNldCBzY2FsZVk9c2NhbGVYXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub0NsYW1wPWZhbHNlXSB3aGV0aGVyIHRvIGRpc2FibGUgY2xhbXAtem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V2lkdGgod2lkdGgsIGNlbnRlciwgc2NhbGVZPXRydWUsIG5vQ2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcblxyXG4gICAgICAgIGlmIChzY2FsZVkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKCFub0NsYW1wICYmIGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgaGVpZ2h0IGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD10aGlzLl93b3JsZEhlaWdodF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2NhbGVYPXRydWVdIHdoZXRoZXIgdG8gc2V0IHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9DbGFtcD1mYWxzZV0gd2hldGhlciB0byBkaXNhYmxlIGNsYW1wLXpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdEhlaWdodChoZWlnaHQsIGNlbnRlciwgc2NhbGVYPXRydWUsIG5vQ2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuXHJcbiAgICAgICAgaWYgKHNjYWxlWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhbXBab29tID0gdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoIW5vQ2xhbXAgJiYgY2xhbXBab29tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXBab29tLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjbGFtcFpvb20gPSB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcFpvb20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGFtcFpvb20uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gaXQgZml0cyB0aGUgc2l6ZSBvciB0aGUgZW50aXJlIHdvcmxkIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSBkZXNpcmVkIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gZGVzaXJlZCBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdChjZW50ZXIsIHdpZHRoLCBoZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjcmVlbldpZHRoIC8gd2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgYSBjZXJ0YWluIHBlcmNlbnQgKGluIGJvdGggeCBhbmQgeSBkaXJlY3Rpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudCBjaGFuZ2UgKGUuZy4sIDAuMjUgd291bGQgaW5jcmVhc2UgYSBzdGFydGluZyBzY2FsZSBvZiAxLjAgdG8gMS4yNSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tUGVyY2VudChwZXJjZW50LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY2FsZS54ICsgdGhpcy5zY2FsZS54ICogcGVyY2VudFxyXG4gICAgICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlKVxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgaW5jcmVhc2luZy9kZWNyZWFzaW5nIHdpZHRoIGJ5IGEgY2VydGFpbiBudW1iZXIgb2YgcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlIGluIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb20oY2hhbmdlLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5maXRXaWR0aChjaGFuZ2UgKyB0aGlzLndvcmxkU2NyZWVuV2lkdGgsIGNlbnRlcilcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIHpvb21cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9Nb3ZlXSB6b29tIGJ1dCBkbyBub3QgbW92ZVxyXG4gICAgICovXHJcbiAgICBzbmFwWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcC16b29tJ10gPSBuZXcgU25hcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlZGVmIE91dE9mQm91bmRzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBsZWZ0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJpZ2h0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHRvcFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBib3R0b21cclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaXMgY29udGFpbmVyIG91dCBvZiB3b3JsZCBib3VuZHNcclxuICAgICAqIEByZXR1cm4ge091dE9mQm91bmRzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgT09CKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fVxyXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gdGhpcy5sZWZ0IDwgMFxyXG4gICAgICAgIHJlc3VsdC5yaWdodCA9IHRoaXMucmlnaHQgPiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgcmVzdWx0LnRvcCA9IHRoaXMudG9wIDwgMFxyXG4gICAgICAgIHJlc3VsdC5ib3R0b20gPSB0aGlzLmJvdHRvbSA+IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgcmVzdWx0LmNvcm5lclBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54IC0gdGhpcy5fc2NyZWVuV2lkdGgsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55IC0gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCByaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnggKyB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCByaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnggKyB0aGlzLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuICAgIHNldCBsZWZ0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG4gICAgc2V0IHRvcCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGJvdHRvbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgKyB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgYm90dG9tKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueSArIHRoaXMuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGRpcnR5IChpLmUuLCBuZWVkcyB0byBiZSByZW5kZXJlcmVkIHRvIHRoZSBzY3JlZW4gYmVjYXVzZSBvZiBhIGNoYW5nZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgZGlydHkoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJ0eVxyXG4gICAgfVxyXG4gICAgc2V0IGRpcnR5KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBlcm1hbmVudGx5IGNoYW5nZXMgdGhlIFZpZXdwb3J0J3MgaGl0QXJlYVxyXG4gICAgICogTk9URTogbm9ybWFsbHkgdGhlIGhpdEFyZWEgPSBQSVhJLlJlY3RhbmdsZShWaWV3cG9ydC5sZWZ0LCBWaWV3cG9ydC50b3AsIFZpZXdwb3J0LndvcmxkU2NyZWVuV2lkdGgsIFZpZXdwb3J0LndvcmxkU2NyZWVuSGVpZ2h0KVxyXG4gICAgICogQHR5cGUgeyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9XHJcbiAgICAgKi9cclxuICAgIGdldCBmb3JjZUhpdEFyZWEoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUhpdEFyZWFcclxuICAgIH1cclxuICAgIHNldCBmb3JjZUhpdEFyZWEodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gdmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCBvZiBtb3VzZS90b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sZWZ0RG93biA/IDEgOiAwKSArIHRoaXMudG91Y2hlcy5sZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHRvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHBvaW50ZXJzW2tleV1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlcy5pbmRleE9mKHBvaW50ZXIucG9pbnRlcklkKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcnNba2V5XSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wcyBhbmQgcmVzZXRzIGJvdW5jZSBhbmQgZGVjZWxlcmF0ZSAoYXMgbmVlZGVkKSBhZnRlciBtYW51YWxseSBtb3Zpbmcgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snYm91bmNlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLnJlc2V0KClcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5ib3VuY2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ3NuYXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXS51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMVUdJTlNcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgaW5zdGFsbGVkIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0gPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCh0eXBlICsgJy1yZW1vdmUnKVxyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICBwYXVzZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucGF1c2UoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlc3VtZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZXN1bWVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnJlc3VtZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc29ydCBwbHVnaW5zIGZvciB1cGRhdGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwbHVnaW5zU29ydCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zTGlzdC5wdXNoKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTEwXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgZHJhZyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZHJhZyddID0gbmV3IERyYWcodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXAgdG8gd29ybGQgYm91bmRhcmllcyBvciBvdGhlciBwcm92aWRlZCBib3VuZGFyaWVzXHJcbiAgICAgKiBOT1RFUzpcclxuICAgICAqICAgY2xhbXAgaXMgZGlzYWJsZWQgaWYgY2FsbGVkIHdpdGggbm8gb3B0aW9uczsgdXNlIHsgZGlyZWN0aW9uOiAnYWxsJyB9IGZvciBhbGwgZWRnZSBjbGFtcGluZ1xyXG4gICAgICogICBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMubGVmdF0gY2xhbXAgbGVmdDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnJpZ2h0XSBjbGFtcCByaWdodDsgdHJ1ZT12aWV3cG9ydC53b3JsZFdpZHRoXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnRvcF0gY2xhbXAgdG9wOyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMuYm90dG9tXSBjbGFtcCBib3R0b207IHRydWU9dmlld3BvcnQud29ybGRIZWlnaHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb25dIChhbGwsIHgsIG9yIHkpIHVzaW5nIGNsYW1wcyBvZiBbMCwgdmlld3BvcnQud29ybGRXaWR0aC92aWV3cG9ydC53b3JsZEhlaWdodF07IHJlcGxhY2VzIGxlZnQvcmlnaHQvdG9wL2JvdHRvbSBpZiBzZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXSA9IG5ldyBDbGFtcCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWNlbGVyYXRlIGFmdGVyIGEgbW92ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGRlY2VsZXJhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSA9IG5ldyBEZWNlbGVyYXRlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGJvdW5jZSBvbiBib3JkZXJzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWRlcz1hbGxdIGFsbCwgaG9yaXpvbnRhbCwgdmVydGljYWwsIG9yIGNvbWJpbmF0aW9uIG9mIHRvcCwgYm90dG9tLCByaWdodCwgbGVmdCAoZS5nLiwgJ3RvcC1ib3R0b20tcmlnaHQnKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuNV0gZnJpY3Rpb24gdG8gYXBwbHkgdG8gZGVjZWxlcmF0ZSBpZiBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTE1MF0gdGltZSBpbiBtcyB0byBmaW5pc2ggYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgYm91bmNlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXSA9IG5ldyBCb3VuY2UodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIHBpbmNoIHRvIHpvb20gYW5kIHR3by1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHBpbmNoKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydwaW5jaCddID0gbmV3IFBpbmNoKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNuYXAgdG8gYSBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRvcExlZnRdIHNuYXAgdG8gdGhlIHRvcC1sZWZ0IG9mIHZpZXdwb3J0IGluc3RlYWQgb2YgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgbG9jYXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHNuYXAoeCwgeSwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXSA9IG5ldyBTbmFwKHRoaXMsIHgsIHksIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZvbGxvdyBhIHRhcmdldFxyXG4gICAgICogQHBhcmFtIHtQSVhJLkRpc3BsYXlPYmplY3R9IHRhcmdldCB0byBmb2xsb3cgKG9iamVjdCBtdXN0IGluY2x1ZGUge3g6IHgtY29vcmRpbmF0ZSwgeTogeS1jb29yZGluYXRlfSlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD0wXSB0byBmb2xsb3cgaW4gcGl4ZWxzL2ZyYW1lICgwPXRlbGVwb3J0IHRvIGxvY2F0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gcmFkaXVzIChpbiB3b3JsZCBjb29yZGluYXRlcykgb2YgY2VudGVyIGNpcmNsZSB3aGVyZSBtb3ZlbWVudCBpcyBhbGxvd2VkIHdpdGhvdXQgbW92aW5nIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZm9sbG93KHRhcmdldCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2ZvbGxvdyddID0gbmV3IEZvbGxvdyh0aGlzLCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdXNpbmcgbW91c2Ugd2hlZWxcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHdoZWVsKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWyd3aGVlbCddID0gbmV3IFdoZWVsKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBjbGFtcGluZyBvZiB6b29tIHRvIGNvbnN0cmFpbnRzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5XaWR0aF0gbWluaW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbkhlaWdodF0gbWluaW11bSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXaWR0aF0gbWF4aW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heEhlaWdodF0gbWF4aW11bSBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddID0gbmV3IENsYW1wWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzIG9yIHJhZGl1cy1kaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yaWdodF0gYWx0ZXJuYXRpdmVseSwgc2V0IHJpZ2h0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqL1xyXG4gICAgbW91c2VFZGdlcyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snbW91c2UtZWRnZXMnXSA9IG5ldyBNb3VzZUVkZ2VzKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHZpZXdwb3J0IChpbmNsdWRpbmcgYW5pbWF0aW9uIHVwZGF0ZXMgc3VjaCBhcyBkZWNlbGVyYXRlKVxyXG4gICAgICogTk9URTogd2hlbiBzZXR0aW5nIHBhdXNlPXRydWUsIGFsbCB0b3VjaGVzIGFuZCBtb3VzZSBhY3Rpb25zIGFyZSBjbGVhcmVkIChpLmUuLCBpZiBtb3VzZWRvd24gd2FzIGFjdGl2ZSwgaXQgYmVjb21lcyBpbmFjdGl2ZSBmb3IgcHVycG9zZXMgb2YgdGhlIHZpZXdwb3J0KVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBwYXVzZSgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlIH1cclxuICAgIHNldCBwYXVzZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9wYXVzZSA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5sYXN0Vmlld3BvcnQgPSBudWxsXHJcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuem9vbWluZyA9IGZhbHNlXHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgYWZ0ZXIgYSBtb3VzZSBvciB0b3VjaCBjbGlja1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjY2xpY2tlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLXN0YXJ0XHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLWVuZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggZW5kXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZm9yIGEgbW91c2Ugd2hlZWwgZXZlbnRcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB3aGVlbFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5kelxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgd2hlZWwtc2Nyb2xsIG9jY3Vyc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWwtc2Nyb2xsXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIG1vdXNlLWVkZ2Ugc3RhcnRzIHRvIHNjcm9sbFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIG1vdXNlLWVkZ2Ugc2Nyb2xsaW5nIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2UtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGUgKGRyYWcsIHNuYXAsIHBpbmNoLCBmb2xsb3csIGJvdW5jZS14LCBib3VuY2UteSwgY2xhbXAteCwgY2xhbXAteSwgZGVjZWxlcmF0ZSwgbW91c2UtZWRnZXMsIHdoZWVsKVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IG1vdmVzIHRocm91Z2ggVUkgaW50ZXJhY3Rpb24sIGRlY2VsZXJhdGlvbiwgb3IgZm9sbG93XHJcbiAqIEBldmVudCBWaWV3cG9ydCN6b29tZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGUgKGRyYWctem9vbSwgcGluY2gsIHdoZWVsLCBjbGFtcC16b29tKVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IHN0b3BzIG1vdmluZyBmb3IgYW55IHJlYXNvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWQtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBzdG9wcyB6b29taW5nIGZvciBhbnkgcmFzb25cclxuICogQGV2ZW50IFZpZXdwb3J0I3pvb21lZC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgUElYSSAhPT0gJ3VuZGVmaW5lZCcpXHJcbntcclxuICAgIFBJWEkuZXh0cmFzLlZpZXdwb3J0ID0gVmlld3BvcnRcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydFxyXG4iXX0=