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
     * @param {boolean} [options.noTicker] set this if you want to manually call update() function on each frame
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

        if (!options.noTicker) {
            _this.ticker = options.ticker || PIXI.ticker.shared;
            _this.tickerFunction = function () {
                return _this.update(_this.ticker.elapsedMS);
            };
            _this.ticker.add(_this.tickerFunction);
        }
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
         * update viewport on each frame
         * by default, you do not need to call this unless you set options.noTicker=true
         */

    }, {
        key: 'update',
        value: function update(elapsed) {
            if (!this.pause) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.pluginsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var plugin = _step.value;

                        plugin.update(elapsed);
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
         * @param {number} [screenWidth=window.innerWidth]
         * @param {number} [screenHeight=window.innerHeight]
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
        key: 'getVisibleBounds',


        /**
         * get visible bounds of viewport
         * @return {object} bounds { x, y, width, height }
         */
        value: function getVisibleBounds() {
            return { x: this.left, y: this.top, width: this.worldScreenWidth, height: this.worldScreenHeight };
        }

        /**
         * add input listeners
         * @private
         */

    }, {
        key: 'listeners',
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
         * NOTE: uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJwYXNzaXZlV2hlZWwiLCJzdG9wRXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsIm5vVGlja2VyIiwidGlja2VyIiwiUElYSSIsInNoYXJlZCIsInRpY2tlckZ1bmN0aW9uIiwidXBkYXRlIiwiZWxhcHNlZE1TIiwiYWRkIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIndoZWVsRnVuY3Rpb24iLCJyZW1vdmVMaXN0ZW5lcnMiLCJlbGFwc2VkIiwicGF1c2UiLCJwbHVnaW4iLCJsYXN0Vmlld3BvcnQiLCJ4IiwieSIsIm1vdmluZyIsImVtaXQiLCJzY2FsZVgiLCJzY2FsZSIsInNjYWxlWSIsInpvb21pbmciLCJoaXRBcmVhIiwibGVmdCIsInRvcCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiX2RpcnR5Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicmVzaXplUGx1Z2lucyIsInJlc2l6ZSIsImludGVyYWN0aXZlIiwiUmVjdGFuZ2xlIiwib24iLCJkb3duIiwibW92ZSIsInVwIiwiZSIsImhhbmRsZVdoZWVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsInBhc3NpdmUiLCJsZWZ0RG93biIsImRhdGEiLCJwb2ludGVyVHlwZSIsIm9yaWdpbmFsRXZlbnQiLCJidXR0b24iLCJwdXNoIiwicG9pbnRlcklkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwiZ2xvYmFsIiwiZGVjZWxlcmF0ZSIsImJvdW5jZSIsIk1hdGgiLCJhYnMiLCJ0b1giLCJ0b1kiLCJjbGlja2VkQXZhaWxhYmxlIiwic3RvcCIsImNoYW5nZSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIk1vdXNlRXZlbnQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJldnQiLCJwb2ludCIsIlBvaW50IiwibWFwUG9zaXRpb25Ub1BvaW50IiwiY2xpZW50WCIsImNsaWVudFkiLCJ0b0xvY2FsIiwiZ2V0UG9pbnRlclBvc2l0aW9uIiwicmlnaHQiLCJib3R0b20iLCJyZXN1bHQiLCJ3aGVlbCIsImFyZ3VtZW50cyIsInRvR2xvYmFsIiwiaXNOYU4iLCJwb3NpdGlvbiIsInNldCIsIl9yZXNldCIsImNlbnRlciIsIm5vQ2xhbXAiLCJzYXZlIiwiY2xhbXBab29tIiwiY2xhbXAiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJ0eXBlIiwicmVzdW1lIiwidGFyZ2V0IiwidmFsdWUiLCJtb3ZlQ29ybmVyIiwiX2ZvcmNlSGl0QXJlYSIsIl9wYXVzZSIsIkNvbnRhaW5lciIsImV4dHJhcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwi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RURtSixPQUFPQyxPQUFQLEdBQWlCcEosUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgRHJhZyA9IHJlcXVpcmUoJy4vZHJhZycpXHJcbmNvbnN0IFBpbmNoID0gcmVxdWlyZSgnLi9waW5jaCcpXHJcbmNvbnN0IENsYW1wID0gcmVxdWlyZSgnLi9jbGFtcCcpXHJcbmNvbnN0IENsYW1wWm9vbSA9IHJlcXVpcmUoJy4vY2xhbXAtem9vbScpXHJcbmNvbnN0IERlY2VsZXJhdGUgPSByZXF1aXJlKCcuL2RlY2VsZXJhdGUnKVxyXG5jb25zdCBCb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpXHJcbmNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAnKVxyXG5jb25zdCBTbmFwWm9vbSA9IHJlcXVpcmUoJy4vc25hcC16b29tJylcclxuY29uc3QgRm9sbG93ID0gcmVxdWlyZSgnLi9mb2xsb3cnKVxyXG5jb25zdCBXaGVlbCA9IHJlcXVpcmUoJy4vd2hlZWwnKVxyXG5jb25zdCBNb3VzZUVkZ2VzID0gcmVxdWlyZSgnLi9tb3VzZS1lZGdlcycpXHJcblxyXG5jb25zdCBQTFVHSU5fT1JERVIgPSBbJ2RyYWcnLCAncGluY2gnLCAnd2hlZWwnLCAnZm9sbG93JywgJ21vdXNlLWVkZ2VzJywgJ2RlY2VsZXJhdGUnLCAnYm91bmNlJywgJ3NuYXAtem9vbScsICdjbGFtcC16b29tJywgJ3NuYXAnLCAnY2xhbXAnXVxyXG5cclxuY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEVtaXR0ZXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkV2lkdGg9dGhpcy53aWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZEhlaWdodD10aGlzLmhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQ9NV0gbnVtYmVyIG9mIHBpeGVscyB0byBtb3ZlIHRvIHRyaWdnZXIgYW4gaW5wdXQgZXZlbnQgKGUuZy4sIGRyYWcsIHBpbmNoKSBvciBkaXNhYmxlIGEgY2xpY2tlZCBldmVudFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5wYXNzaXZlV2hlZWw9dHJ1ZV0gd2hldGhlciB0aGUgJ3doZWVsJyBldmVudCBpcyBzZXQgdG8gcGFzc2l2ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zdG9wUHJvcGFnYXRpb249ZmFsc2VdIHdoZXRoZXIgdG8gc3RvcFByb3BhZ2F0aW9uIG9mIGV2ZW50cyB0aGF0IGltcGFjdCB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9UaWNrZXJdIHNldCB0aGlzIGlmIHlvdSB3YW50IHRvIG1hbnVhbGx5IGNhbGwgdXBkYXRlKCkgZnVuY3Rpb24gb24gZWFjaCBmcmFtZVxyXG4gICAgICogQHBhcmFtIHtQSVhJLnRpY2tlci5UaWNrZXJ9IFtvcHRpb25zLnRpY2tlcj1QSVhJLnRpY2tlci5zaGFyZWRdIHVzZSB0aGlzIFBJWEkudGlja2VyIGZvciB1cGRhdGVzXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuSW50ZXJhY3Rpb25NYW5hZ2VyfSBbb3B0aW9ucy5pbnRlcmFjdGlvbj1udWxsXSBJbnRlcmFjdGlvbk1hbmFnZXIsIGF2YWlsYWJsZSBmcm9tIGluc3RhbnRpYXRlZCBXZWJHTFJlbmRlcmVyL0NhbnZhc1JlbmRlcmVyLnBsdWdpbnMuaW50ZXJhY3Rpb24gLSB1c2VkIHRvIGNhbGN1bGF0ZSBwb2ludGVyIHBvc3Rpb24gcmVsYXRpdmUgdG8gY2FudmFzIGxvY2F0aW9uIG9uIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbnMuZGl2V2hlZWw9ZG9jdW1lbnQuYm9keV0gZGl2IHRvIGF0dGFjaCB0aGUgd2hlZWwgZXZlbnRcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKiBAZmlyZXMgZHJhZy1zdGFydFxyXG4gICAgICogQGZpcmVzIGRyYWctZW5kXHJcbiAgICAgKiBAZmlyZXMgZHJhZy1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBwaW5jaC1zdGFydFxyXG4gICAgICogQGZpcmVzIHBpbmNoLWVuZFxyXG4gICAgICogQGZpcmVzIHBpbmNoLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtc2Nyb2xsXHJcbiAgICAgKiBAZmlyZXMgd2hlZWwtc2Nyb2xsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2Utc3RhcnRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLWVuZFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgbW92ZWRcclxuICAgICAqIEBmaXJlcyBtb3ZlZC1lbmRcclxuICAgICAqIEBmaXJlcyB6b29tZWRcclxuICAgICAqIEBmaXJlcyB6b29tZWQtZW5kXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy5wYXNzaXZlV2hlZWwgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnBhc3NpdmVXaGVlbCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLnN0b3BFdmVudCA9IG9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRocmVzaG9sZCwgNSlcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gb3B0aW9ucy5pbnRlcmFjdGlvbiB8fCBudWxsXHJcbiAgICAgICAgdGhpcy5kaXYgPSBvcHRpb25zLmRpdldoZWVsIHx8IGRvY3VtZW50LmJvZHlcclxuICAgICAgICB0aGlzLmxpc3RlbmVycyh0aGlzLmRpdilcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWN0aXZlIHRvdWNoIHBvaW50IGlkcyBvbiB0aGUgdmlld3BvcnRcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyW119XHJcbiAgICAgICAgICogQHJlYWRvbmx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLm5vVGlja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50aWNrZXIgPSBvcHRpb25zLnRpY2tlciB8fCBQSVhJLnRpY2tlci5zaGFyZWRcclxuICAgICAgICAgICAgdGhpcy50aWNrZXJGdW5jdGlvbiA9ICgpID0+IHRoaXMudXBkYXRlKHRoaXMudGlja2VyLmVsYXBzZWRNUylcclxuICAgICAgICAgICAgdGhpcy50aWNrZXIuYWRkKHRoaXMudGlja2VyRnVuY3Rpb24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzIGZyb20gdmlld3BvcnRcclxuICAgICAqICh1c2VmdWwgZm9yIGNsZWFudXAgb2Ygd2hlZWwgYW5kIHRpY2tlciBldmVudHMgd2hlbiByZW1vdmluZyB2aWV3cG9ydClcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlTGlzdGVuZXJzKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnRpY2tlci5yZW1vdmUodGhpcy50aWNrZXJGdW5jdGlvbilcclxuICAgICAgICB0aGlzLmRpdi5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMud2hlZWxGdW5jdGlvbilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG92ZXJyaWRlcyBQSVhJLkNvbnRhaW5lcidzIGRlc3Ryb3kgdG8gYWxzbyByZW1vdmUgdGhlICd3aGVlbCcgYW5kIFBJWEkuVGlja2VyIGxpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICBkZXN0cm95KG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveShvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSB2aWV3cG9ydCBvbiBlYWNoIGZyYW1lXHJcbiAgICAgKiBieSBkZWZhdWx0LCB5b3UgZG8gbm90IG5lZWQgdG8gY2FsbCB0aGlzIHVubGVzcyB5b3Ugc2V0IG9wdGlvbnMubm9UaWNrZXI9dHJ1ZVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcGx1Z2luLnVwZGF0ZShlbGFwc2VkKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0Vmlld3BvcnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciBtb3ZlZC1lbmQgZXZlbnRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RWaWV3cG9ydC54ICE9PSB0aGlzLnggfHwgdGhpcy5sYXN0Vmlld3BvcnQueSAhPT0gdGhpcy55KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdmluZylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnbW92ZWQtZW5kJywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciB6b29tZWQtZW5kIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0Vmlld3BvcnQuc2NhbGVYICE9PSB0aGlzLnNjYWxlLnggfHwgdGhpcy5sYXN0Vmlld3BvcnQuc2NhbGVZICE9PSB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b29taW5nID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnpvb21pbmcpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3pvb21lZC1lbmQnLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnpvb21pbmcgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS54ID0gdGhpcy5sZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEud2lkdGggPSB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS5oZWlnaHQgPSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZGlydHkgPSB0aGlzLl9kaXJ0eSB8fCAhdGhpcy5sYXN0Vmlld3BvcnQgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0LnggIT09IHRoaXMueCB8fCB0aGlzLmxhc3RWaWV3cG9ydC55ICE9PSB0aGlzLnkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWCAhPT0gdGhpcy5zY2FsZS54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWSAhPT0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0ID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVYOiB0aGlzLnNjYWxlLngsXHJcbiAgICAgICAgICAgICAgICBzY2FsZVk6IHRoaXMuc2NhbGUueVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gc2V0IHNjcmVlbiBhbmQgd29ybGQgc2l6ZXMtLW5lZWRlZCBmb3IgcGluY2gvd2hlZWwvY2xhbXAvYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3NjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZFdpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZEhlaWdodF1cclxuICAgICAqL1xyXG4gICAgcmVzaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gc2NyZWVuV2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBzY3JlZW5IZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHdvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHdvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCBhZnRlciBhIHdvcmxkV2lkdGgvSGVpZ2h0IGNoYW5nZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVzaXplUGx1Z2lucygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4ucmVzaXplKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5XaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5IZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRXaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IHZpc2libGUgYm91bmRzIG9mIHZpZXdwb3J0XHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IGJvdW5kcyB7IHgsIHksIHdpZHRoLCBoZWlnaHQgfVxyXG4gICAgICovXHJcbiAgICBnZXRWaXNpYmxlQm91bmRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLmxlZnQsIHk6IHRoaXMudG9wLCB3aWR0aDogdGhpcy53b3JsZFNjcmVlbldpZHRoLCBoZWlnaHQ6IHRoaXMud29ybGRTY3JlZW5IZWlnaHQgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGlucHV0IGxpc3RlbmVyc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbGlzdGVuZXJzKGRpdilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyZG93bicsIHRoaXMuZG93bilcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVybW92ZScsIHRoaXMubW92ZSlcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXAnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cG91dHNpZGUnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJvdXQnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMud2hlZWxGdW5jdGlvbiA9IChlKSA9PiB0aGlzLmhhbmRsZVdoZWVsKGUpXHJcbiAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy53aGVlbEZ1bmN0aW9uLCB7IHBhc3NpdmU6IHRoaXMucGFzc2l2ZVdoZWVsIH0pXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZG93biBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcy5wdXNoKGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSB9XHJcblxyXG4gICAgICAgICAgICAvLyBjbGlja2VkIGV2ZW50IGRvZXMgbm90IGZpcmUgaWYgdmlld3BvcnQgaXMgZGVjZWxlcmF0aW5nIG9yIGJvdW5jaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBjb25zdCBib3VuY2UgPSB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddXHJcbiAgICAgICAgICAgIGlmICgoIWRlY2VsZXJhdGUgfHwgKE1hdGguYWJzKGRlY2VsZXJhdGUueCkgPCB0aGlzLnRocmVzaG9sZCAmJiBNYXRoLmFicyhkZWNlbGVyYXRlLnkpIDwgdGhpcy50aHJlc2hvbGQpKSAmJiAoIWJvdW5jZSB8fCAoIWJvdW5jZS50b1ggJiYgIWJvdW5jZS50b1kpKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0b3BcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW4uZG93bihlKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RvcCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RvcCAmJiB0aGlzLnN0b3BFdmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0b3BcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW4ubW92ZShlKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RvcCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RYID0gZS5kYXRhLmdsb2JhbC54IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgY29uc3QgZGlzdFkgPSBlLmRhdGEuZ2xvYmFsLnkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja1RocmVzaG9sZChkaXN0WCkgfHwgdGhpcy5jaGVja1RocmVzaG9sZChkaXN0WSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdG9wICYmIHRoaXMuc3RvcEV2ZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXAgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXNbaV0gPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3VjaGVzLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdG9wXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAocGx1Z2luLnVwKGUpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdG9wICYmIHRoaXMuc3RvcEV2ZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldHMgcG9pbnRlciBwb3NpdGlvbiBpZiB0aGlzLmludGVyYWN0aW9uIGlzIHNldFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBldnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGdldFBvaW50ZXJQb3NpdGlvbihldnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHBvaW50ID0gbmV3IFBJWEkuUG9pbnQoKVxyXG4gICAgICAgIGlmICh0aGlzLmludGVyYWN0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbi5tYXBQb3NpdGlvblRvUG9pbnQocG9pbnQsIGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcG9pbnQueCA9IGV2dC5jbGllbnRYXHJcbiAgICAgICAgICAgIHBvaW50LnkgPSBldnQuY2xpZW50WVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9pbnRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB3aGVlbCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgaGFuZGxlIHdoZWVsIGV2ZW50cyB3aGVyZSB0aGUgbW91c2UgaXMgb3ZlciB0aGUgdmlld3BvcnRcclxuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMudG9Mb2NhbCh0aGlzLmdldFBvaW50ZXJQb3NpdGlvbihlKSlcclxuICAgICAgICBpZiAodGhpcy5sZWZ0IDw9IHBvaW50LnggJiYgcG9pbnQueCA8PSB0aGlzLnJpZ2h0ICYmIHRoaXMudG9wIDw9IHBvaW50LnkgJiYgcG9pbnQueSA8PSB0aGlzLmJvdHRvbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbHVnaW4ud2hlZWwoZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSBzY3JlZW4gdG8gd29ybGRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1dvcmxkKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKGFyZ3VtZW50c1swXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSB3b3JsZCB0byBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1NjcmVlbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHBvaW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodCAqIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGNlbnRlciBvZiBzY3JlZW4gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogdGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogdGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB0aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNlbnRlcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDZW50ZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIGNlbnRlciBvZiB2aWV3cG9ydCB0byBwb2ludFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfFBJWEkuUG9pbnRMaWtlKX0geCBvciBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNlbnRlcigvKngsIHkgfCBQSVhJLlBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHgsIHlcclxuICAgICAgICBpZiAoIWlzTmFOKGFyZ3VtZW50c1swXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXS54XHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMF0ueVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgodGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHgpICogdGhpcy5zY2FsZS54LCAodGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB5KSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRvcC1sZWZ0IGNvcm5lclxyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY29ybmVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiAtdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiAtdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjb3JuZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29ybmVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB2aWV3cG9ydCdzIHRvcC1sZWZ0IGNvcm5lcjsgYWxzbyBjbGFtcHMgYW5kIHJlc2V0cyBkZWNlbGVyYXRlIGFuZCBib3VuY2UgKGFzIG5lZWRlZClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHh8cG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ29ybmVyKC8qeCwgeSB8IHBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdLnggKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMF0ueSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXSAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1sxXSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgd2lkdGggZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGg9dGhpcy5fd29ybGRXaWR0aF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzY2FsZVk9dHJ1ZV0gd2hldGhlciB0byBzZXQgc2NhbGVZPXNjYWxlWFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9DbGFtcD1mYWxzZV0gd2hldGhlciB0byBkaXNhYmxlIGNsYW1wLXpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdpZHRoKHdpZHRoLCBjZW50ZXIsIHNjYWxlWT10cnVlLCBub0NsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG5cclxuICAgICAgICBpZiAoc2NhbGVZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjbGFtcFpvb20gPSB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmICghbm9DbGFtcCAmJiBjbGFtcFpvb20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGFtcFpvb20uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIGhlaWdodCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9dGhpcy5fd29ybGRIZWlnaHRdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NjYWxlWD10cnVlXSB3aGV0aGVyIHRvIHNldCBzY2FsZVggPSBzY2FsZVlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW25vQ2xhbXA9ZmFsc2VdIHdoZXRoZXIgdG8gZGlzYWJsZSBjbGFtcC16b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRIZWlnaHQoaGVpZ2h0LCBjZW50ZXIsIHNjYWxlWD10cnVlLCBub0NsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcblxyXG4gICAgICAgIGlmIChzY2FsZVgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKCFub0NsYW1wICYmIGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdvcmxkKGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhbXBab29tID0gdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoY2xhbXBab29tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXBab29tLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIHNpemUgb3IgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aF0gZGVzaXJlZCB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHRdIGRlc2lyZWQgaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXQoY2VudGVyLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjbGFtcFpvb20gPSB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcFpvb20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGFtcFpvb20uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGEgY2VydGFpbiBwZXJjZW50IChpbiBib3RoIHggYW5kIHkgZGlyZWN0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgY2hhbmdlIChlLmcuLCAwLjI1IHdvdWxkIGluY3JlYXNlIGEgc3RhcnRpbmcgc2NhbGUgb2YgMS4wIHRvIDEuMjUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbVBlcmNlbnQocGVyY2VudCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NhbGUueCArIHRoaXMuc2NhbGUueCAqIHBlcmNlbnRcclxuICAgICAgICB0aGlzLnNjYWxlLnNldChzY2FsZSlcclxuICAgICAgICBjb25zdCBjbGFtcFpvb20gPSB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcFpvb20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGFtcFpvb20uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGluY3JlYXNpbmcvZGVjcmVhc2luZyB3aWR0aCBieSBhIGNlcnRhaW4gbnVtYmVyIG9mIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSBpbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tKGNoYW5nZSwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZml0V2lkdGgoY2hhbmdlICsgdGhpcy53b3JsZFNjcmVlbldpZHRoLCBjZW50ZXIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCB6b29tXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vTW92ZV0gem9vbSBidXQgZG8gbm90IG1vdmVcclxuICAgICAqL1xyXG4gICAgc25hcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAtem9vbSddID0gbmV3IFNuYXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAdHlwZWRlZiBPdXRPZkJvdW5kc1xyXG4gICAgICogQHR5cGUge29iamVjdH1cclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gbGVmdFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSByaWdodFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSB0b3BcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gYm90dG9tXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIGlzIGNvbnRhaW5lciBvdXQgb2Ygd29ybGQgYm91bmRzXHJcbiAgICAgKiBAcmV0dXJuIHtPdXRPZkJvdW5kc31cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIE9PQigpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge31cclxuICAgICAgICByZXN1bHQubGVmdCA9IHRoaXMubGVmdCA8IDBcclxuICAgICAgICByZXN1bHQucmlnaHQgPSB0aGlzLnJpZ2h0ID4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHJlc3VsdC50b3AgPSB0aGlzLnRvcCA8IDBcclxuICAgICAgICByZXN1bHQuYm90dG9tID0gdGhpcy5ib3R0b20gPiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIHJlc3VsdC5jb3JuZXJQb2ludCA9IHtcclxuICAgICAgICAgICAgeDogdGhpcy5fd29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueCAtIHRoaXMuX3NjcmVlbldpZHRoLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl93b3JsZEhlaWdodCAqIHRoaXMuc2NhbGUueSAtIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgcmlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy54IC8gdGhpcy5zY2FsZS54ICsgdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICB9XHJcbiAgICBzZXQgcmlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54ICsgdGhpcy5zY3JlZW5XaWR0aFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGxlZnQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy54IC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcbiAgICBzZXQgbGVmdCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgdG9wIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHRvcCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuICAgIHNldCB0b3AodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBib3R0b20oKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55ICsgdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IGJvdHRvbSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnkgKyB0aGlzLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBkaXJ0eSAoaS5lLiwgbmVlZHMgdG8gYmUgcmVuZGVyZXJlZCB0byB0aGUgc2NyZWVuIGJlY2F1c2Ugb2YgYSBjaGFuZ2UpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGRpcnR5KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlydHlcclxuICAgIH1cclxuICAgIHNldCBkaXJ0eSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9kaXJ0eSA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwZXJtYW5lbnRseSBjaGFuZ2VzIHRoZSBWaWV3cG9ydCdzIGhpdEFyZWFcclxuICAgICAqIE5PVEU6IG5vcm1hbGx5IHRoZSBoaXRBcmVhID0gUElYSS5SZWN0YW5nbGUoVmlld3BvcnQubGVmdCwgVmlld3BvcnQudG9wLCBWaWV3cG9ydC53b3JsZFNjcmVlbldpZHRoLCBWaWV3cG9ydC53b3JsZFNjcmVlbkhlaWdodClcclxuICAgICAqIEB0eXBlIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfVxyXG4gICAgICovXHJcbiAgICBnZXQgZm9yY2VIaXRBcmVhKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VIaXRBcmVhXHJcbiAgICB9XHJcbiAgICBzZXQgZm9yY2VIaXRBcmVhKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgb2YgbW91c2UvdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50RG93blBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGVmdERvd24gPyAxIDogMCkgKyB0aGlzLnRvdWNoZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiB0b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXMuaW5kZXhPZihwb2ludGVyLnBvaW50ZXJJZCkgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgb2YgcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkludGVyYWN0aW9uVHJhY2tpbmdEYXRhW119XHJcbiAgICAgKi9cclxuICAgIGdldFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBvaW50ZXJzW2tleV0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcHMgYW5kIHJlc2V0cyBib3VuY2UgYW5kIGRlY2VsZXJhdGUgKGFzIG5lZWRlZCkgYWZ0ZXIgbWFudWFsbHkgbW92aW5nIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2JvdW5jZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5yZXNldCgpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10uYm91bmNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydzbmFwJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQTFVHSU5TXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGluc3RhbGxlZCBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZW1vdmVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmVtaXQodHlwZSArICctcmVtb3ZlJylcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2UgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcGF1c2VQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnBhdXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXN1bWUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVzdW1lUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXN1bWUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNvcnQgcGx1Z2lucyBmb3IgdXBkYXRlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcGx1Z2luc1NvcnQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc0xpc3QgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc0xpc3QucHVzaCh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSBkaXJlY3Rpb24gdG8gZHJhZyAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xMF0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGRyYWcob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RyYWcnXSA9IG5ldyBEcmFnKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wIHRvIHdvcmxkIGJvdW5kYXJpZXMgb3Igb3RoZXIgcHJvdmlkZWQgYm91bmRhcmllc1xyXG4gICAgICogTk9URVM6XHJcbiAgICAgKiAgIGNsYW1wIGlzIGRpc2FibGVkIGlmIGNhbGxlZCB3aXRoIG5vIG9wdGlvbnM7IHVzZSB7IGRpcmVjdGlvbjogJ2FsbCcgfSBmb3IgYWxsIGVkZ2UgY2xhbXBpbmdcclxuICAgICAqICAgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmxlZnRdIGNsYW1wIGxlZnQ7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5yaWdodF0gY2xhbXAgcmlnaHQ7IHRydWU9dmlld3BvcnQud29ybGRXaWR0aFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy50b3BdIGNsYW1wIHRvcDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmJvdHRvbV0gY2xhbXAgYm90dG9tOyB0cnVlPXZpZXdwb3J0LndvcmxkSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uXSAoYWxsLCB4LCBvciB5KSB1c2luZyBjbGFtcHMgb2YgWzAsIHZpZXdwb3J0LndvcmxkV2lkdGgvdmlld3BvcnQud29ybGRIZWlnaHRdOyByZXBsYWNlcyBsZWZ0L3JpZ2h0L3RvcC9ib3R0b20gaWYgc2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXAob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10gPSBuZXcgQ2xhbXAodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVjZWxlcmF0ZSBhZnRlciBhIG1vdmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBkZWNlbGVyYXRlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10gPSBuZXcgRGVjZWxlcmF0ZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBib3VuY2Ugb24gYm9yZGVyc1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGJvdW5jZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10gPSBuZXcgQm91bmNlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBwaW5jaCB0byB6b29tIGFuZCB0d28tZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MS4wXSBwZXJjZW50IHRvIG1vZGlmeSBwaW5jaCBzcGVlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RyYWddIGRpc2FibGUgdHdvLWZpbmdlciBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHR3byBmaW5nZXJzXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBwaW5jaChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1sncGluY2gnXSA9IG5ldyBQaW5jaCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzbmFwIHRvIGEgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50b3BMZWZ0XSBzbmFwIHRvIHRoZSB0b3AtbGVmdCBvZiB2aWV3cG9ydCBpbnN0ZWFkIG9mIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIE5PVEU6IHVzZXMgdGhlICh4LCB5KSBhcyB0aGUgY2VudGVyIHRvIGZvbGxvdzsgZm9yIFBJWEkuU3ByaXRlIHRvIHdvcmsgcHJvcGVybHksIHVzZSBzcHJpdGUuYW5jaG9yLnNldCgwLjUpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuRGlzcGxheU9iamVjdH0gdGFyZ2V0IHRvIGZvbGxvdyAob2JqZWN0IG11c3QgaW5jbHVkZSB7eDogeC1jb29yZGluYXRlLCB5OiB5LWNvb3JkaW5hdGV9KVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPTBdIHRvIGZvbGxvdyBpbiBwaXhlbHMvZnJhbWUgKDA9dGVsZXBvcnQgdG8gbG9jYXRpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSByYWRpdXMgKGluIHdvcmxkIGNvb3JkaW5hdGVzKSBvZiBjZW50ZXIgY2lyY2xlIHdoZXJlIG1vdmVtZW50IGlzIGFsbG93ZWQgd2l0aG91dCBtb3ZpbmcgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmb2xsb3codGFyZ2V0LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZm9sbG93J10gPSBuZXcgRm9sbG93KHRoaXMsIHRhcmdldCwgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB1c2luZyBtb3VzZSB3aGVlbFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgd2hlZWwob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3doZWVsJ10gPSBuZXcgV2hlZWwodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIGNsYW1waW5nIG9mIHpvb20gdG8gY29uc3RyYWludHNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbldpZHRoXSBtaW5pbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluSGVpZ2h0XSBtaW5pbXVtIGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdpZHRoXSBtYXhpbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4SGVpZ2h0XSBtYXhpbXVtIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10gPSBuZXcgQ2xhbXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMgb3IgcmFkaXVzLWRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbi5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIGRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbiBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZGlzdGFuY2VdIGRpc3RhbmNlIGZyb20gYWxsIHNpZGVzIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3BdIGFsdGVybmF0aXZlbHksIHNldCB0b3AgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdHRvbV0gYWx0ZXJuYXRpdmVseSwgc2V0IGJvdHRvbSBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubGVmdF0gYWx0ZXJuYXRpdmVseSwgc2V0IGxlZnQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJpZ2h0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgcmlnaHQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPThdIHNwZWVkIGluIHBpeGVscy9mcmFtZSB0byBzY3JvbGwgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSBkaXJlY3Rpb24gb2Ygc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRGVjZWxlcmF0ZV0gZG9uJ3QgdXNlIGRlY2VsZXJhdGUgcGx1Z2luIGV2ZW4gaWYgaXQncyBpbnN0YWxsZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGluZWFyXSBpZiB1c2luZyByYWRpdXMsIHVzZSBsaW5lYXIgbW92ZW1lbnQgKCsvLSAxLCArLy0gMSkgaW5zdGVhZCBvZiBhbmdsZWQgbW92ZW1lbnQgKE1hdGguY29zKGFuZ2xlIGZyb20gY2VudGVyKSwgTWF0aC5zaW4oYW5nbGUgZnJvbSBjZW50ZXIpKVxyXG4gICAgICovXHJcbiAgICBtb3VzZUVkZ2VzKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydtb3VzZS1lZGdlcyddID0gbmV3IE1vdXNlRWRnZXModGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2Ugdmlld3BvcnQgKGluY2x1ZGluZyBhbmltYXRpb24gdXBkYXRlcyBzdWNoIGFzIGRlY2VsZXJhdGUpXHJcbiAgICAgKiBOT1RFOiB3aGVuIHNldHRpbmcgcGF1c2U9dHJ1ZSwgYWxsIHRvdWNoZXMgYW5kIG1vdXNlIGFjdGlvbnMgYXJlIGNsZWFyZWQgKGkuZS4sIGlmIG1vdXNlZG93biB3YXMgYWN0aXZlLCBpdCBiZWNvbWVzIGluYWN0aXZlIGZvciBwdXJwb3NlcyBvZiB0aGUgdmlld3BvcnQpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHBhdXNlKCkgeyByZXR1cm4gdGhpcy5fcGF1c2UgfVxyXG4gICAgc2V0IHBhdXNlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3BhdXNlID0gdmFsdWVcclxuICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydCA9IG51bGxcclxuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy56b29taW5nID0gZmFsc2VcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyBhZnRlciBhIG1vdXNlIG9yIHRvdWNoIGNsaWNrXHJcbiAqIEBldmVudCBWaWV3cG9ydCNjbGlja2VkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctc3RhcnRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctZW5kXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBlbmRcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBmb3IgYSBtb3VzZSB3aGVlbCBldmVudFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWxcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtvYmplY3R9IHdoZWVsXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHlcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR6XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSB3aGVlbC1zY3JvbGwgb2NjdXJzXHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbC1zY3JvbGxcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgbW91c2UtZWRnZSBzdGFydHMgdG8gc2Nyb2xsXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgbW91c2UtZWRnZSBzY3JvbGxpbmcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IG1vdmVzIHRocm91Z2ggVUkgaW50ZXJhY3Rpb24sIGRlY2VsZXJhdGlvbiwgb3IgZm9sbG93XHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3ZlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZSAoZHJhZywgc25hcCwgcGluY2gsIGZvbGxvdywgYm91bmNlLXgsIGJvdW5jZS15LCBjbGFtcC14LCBjbGFtcC15LCBkZWNlbGVyYXRlLCBtb3VzZS1lZGdlcywgd2hlZWwpXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgbW92ZXMgdGhyb3VnaCBVSSBpbnRlcmFjdGlvbiwgZGVjZWxlcmF0aW9uLCBvciBmb2xsb3dcclxuICogQGV2ZW50IFZpZXdwb3J0I3pvb21lZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZSAoZHJhZy16b29tLCBwaW5jaCwgd2hlZWwsIGNsYW1wLXpvb20pXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgc3RvcHMgbW92aW5nIGZvciBhbnkgcmVhc29uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3ZlZC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IHN0b3BzIHpvb21pbmcgZm9yIGFueSByYXNvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjem9vbWVkLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBQSVhJICE9PSAndW5kZWZpbmVkJylcclxue1xyXG4gICAgUElYSS5leHRyYXMuVmlld3BvcnQgPSBWaWV3cG9ydFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0XHJcbiJdfQ==