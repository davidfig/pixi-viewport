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
            if (worldWidth) {
                this._worldWidth = worldWidth;
            }
            if (worldHeight) {
                this._worldHeight = worldHeight;
            }
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
            if (this.pause || !this.worldVisible) {
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
                if ((!decelerate || !decelerate.isActive()) && (!bounce || !bounce.isActive())) {
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
            if (this.pause || !this.worldVisible) {
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
            if (this.pause || !this.worldVisible) {
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
            if (this.pause || !this.worldVisible) {
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
            this.scale.x = this.screenWidth / this.worldWidth;
            this.scale.y = this.screenHeight / this.worldHeight;
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
         * Inserts a user plugin into the viewport
         * @param {string} name of plugin
         * @param {Plugin} plugin - instantiated Plugin class
         * @param {number} [index=last element] plugin is called current order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
         */

    }, {
        key: 'userPlugin',
        value: function userPlugin(name, plugin) {
            var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : PLUGIN_ORDER.length;

            this.plugins[name] = plugin;
            var current = PLUGIN_ORDER.indexOf(name);
            if (current !== -1) {
                PLUGIN_ORDER.splice(current, 1);
            }
            PLUGIN_ORDER.splice(index, 0, name);
            this.pluginsSort();
        }

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
         * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
         * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
         * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @param {number} [options.factor=1] factor to multiply drag to increase the speed of movement
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
         * @param {string} [options.underflow=center] (none OR (top/bottom/center and left/right/center) OR center) where to place world if too small for screen (e.g., top-right, center, none, bottomleft)
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
         * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no bottom scroll)
         * @param {number} [options.left] alternatively, set left distance (leave unset for no left scroll)
         * @param {number} [options.right] alternatively, set right distance (leave unset for no right scroll)
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
        key: 'ensureVisible',


        /**
         * move the viewport so the bounding box is visible
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         */
        value: function ensureVisible(x, y, width, height) {
            if (x < this.left) {
                this.left = x;
            } else if (x + width > this.right) {
                this.right = x + width;
            }
            if (y < this.top) {
                this.top = y;
            } else if (y + height > this.bottom) {
                this.bottom = y + height;
            }
        }
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
            return this.screenWidth / this.scale.x;
        }

        /**
         * screen height in world coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'worldScreenHeight',
        get: function get() {
            return this.screenHeight / this.scale.y;
        }

        /**
         * world width in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldWidth',
        get: function get() {
            return this.worldWidth * this.scale.x;
        }

        /**
         * world height in screen coordinates
         * @type {number}
         * @readonly
         */

    }, {
        key: 'screenWorldHeight',
        get: function get() {
            return this.worldHeight * this.scale.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJwYXNzaXZlV2hlZWwiLCJzdG9wRXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsIm5vVGlja2VyIiwidGlja2VyIiwiUElYSSIsInNoYXJlZCIsInRpY2tlckZ1bmN0aW9uIiwidXBkYXRlIiwiZWxhcHNlZE1TIiwiYWRkIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIndoZWVsRnVuY3Rpb24iLCJyZW1vdmVMaXN0ZW5lcnMiLCJlbGFwc2VkIiwicGF1c2UiLCJwbHVnaW4iLCJsYXN0Vmlld3BvcnQiLCJ4IiwieSIsIm1vdmluZyIsImVtaXQiLCJzY2FsZVgiLCJzY2FsZSIsInNjYWxlWSIsInpvb21pbmciLCJoaXRBcmVhIiwibGVmdCIsInRvcCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiX2RpcnR5Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicmVzaXplUGx1Z2lucyIsInJlc2l6ZSIsImludGVyYWN0aXZlIiwiUmVjdGFuZ2xlIiwib24iLCJkb3duIiwibW92ZSIsInVwIiwiZSIsImhhbmRsZVdoZWVsIiwiYWRkRXZlbnRMaXN0ZW5lciIsInBhc3NpdmUiLCJsZWZ0RG93biIsIndvcmxkVmlzaWJsZSIsImRhdGEiLCJwb2ludGVyVHlwZSIsIm9yaWdpbmFsRXZlbnQiLCJidXR0b24iLCJwdXNoIiwicG9pbnRlcklkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwiZ2xvYmFsIiwiZGVjZWxlcmF0ZSIsImJvdW5jZSIsImlzQWN0aXZlIiwiY2xpY2tlZEF2YWlsYWJsZSIsInN0b3AiLCJjaGFuZ2UiLCJNYXRoIiwiYWJzIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwiTW91c2VFdmVudCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJzY3JlZW4iLCJ3b3JsZCIsInRvV29ybGQiLCJ2aWV3cG9ydCIsImV2dCIsInBvaW50IiwiUG9pbnQiLCJtYXBQb3NpdGlvblRvUG9pbnQiLCJjbGllbnRYIiwiY2xpZW50WSIsInRvTG9jYWwiLCJnZXRQb2ludGVyUG9zaXRpb24iLCJyaWdodCIsImJvdHRvbSIsInJlc3VsdCIsIndoZWVsIiwiYXJndW1lbnRzIiwidG9HbG9iYWwiLCJpc05hTiIsInBvc2l0aW9uIiwic2V0IiwiX3Jlc2V0IiwiY2VudGVyIiwibm9DbGFtcCIsInNhdmUiLCJjbGFtcFpvb20iLCJjbGFtcCIsIm1vdmVDZW50ZXIiLCJwZXJjZW50IiwiZml0V2lkdGgiLCJwbHVnaW5zU29ydCIsImNvcm5lclBvaW50IiwicmVzdWx0cyIsInBvaW50ZXJzIiwidHJhY2tlZFBvaW50ZXJzIiwia2V5IiwicG9pbnRlciIsImluZGV4T2YiLCJyZXNldCIsIm5hbWUiLCJpbmRleCIsImN1cnJlbnQiLCJ0eXBlIiwicmVzdW1lIiwidGFyZ2V0IiwidmFsdWUiLCJtb3ZlQ29ybmVyIiwiX2ZvcmNlSGl0QXJlYSIsIl9wYXVzZSIsIkNv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QUFyQjtBQUNBLHFCQUFLOUYsT0FBTCxHQUFlOEYsS0FBZjtBQUNILGFBSkQsTUFNQTtBQUNJLHFCQUFLRSxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EscUJBQUtoRyxPQUFMLEdBQWUsSUFBSXRCLEtBQUtvQyxTQUFULENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLEtBQUt2RCxVQUE5QixFQUEwQyxLQUFLRSxXQUEvQyxDQUFmO0FBQ0g7QUFDSjs7OzRCQThVVztBQUFFLG1CQUFPLEtBQUt3SSxNQUFaO0FBQW9CLFM7MEJBQ3hCSCxLLEVBQ1Y7QUFDSSxpQkFBS0csTUFBTCxHQUFjSCxLQUFkO0FBQ0EsaUJBQUt2RyxZQUFMLEdBQW9CLElBQXBCO0FBQ0EsaUJBQUtHLE1BQUwsR0FBYyxLQUFkO0FBQ0EsaUJBQUtLLE9BQUwsR0FBZSxLQUFmO0FBQ0EsZ0JBQUkrRixLQUFKLEVBQ0E7QUFDSSxxQkFBS3ZILE9BQUwsR0FBZSxFQUFmO0FBQ0EscUJBQUtnRCxRQUFMLEdBQWdCLEtBQWhCO0FBQ0g7QUFDSjs7OztFQXp5Q2tCN0MsS0FBS3dILFM7O0FBdTBDNUI7Ozs7Ozs7OztBQVNBOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7O0FBU0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7OztBQVdBOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7OztBQVFBOzs7Ozs7OztBQVFBOzs7Ozs7QUFNQTs7Ozs7O0FBTUEsSUFBSSxPQUFPeEgsSUFBUCxLQUFnQixXQUFwQixFQUNBO0FBQ0lBLFNBQUt5SCxNQUFMLENBQVlySixRQUFaLEdBQXVCQSxRQUF2QjtBQUNIOztBQUVEc0osT0FBT0MsT0FBUCxHQUFpQnZKLFFBQWpCIiwiZmlsZSI6InZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IERyYWcgPSByZXF1aXJlKCcuL2RyYWcnKVxyXG5jb25zdCBQaW5jaCA9IHJlcXVpcmUoJy4vcGluY2gnKVxyXG5jb25zdCBDbGFtcCA9IHJlcXVpcmUoJy4vY2xhbXAnKVxyXG5jb25zdCBDbGFtcFpvb20gPSByZXF1aXJlKCcuL2NsYW1wLXpvb20nKVxyXG5jb25zdCBEZWNlbGVyYXRlID0gcmVxdWlyZSgnLi9kZWNlbGVyYXRlJylcclxuY29uc3QgQm91bmNlID0gcmVxdWlyZSgnLi9ib3VuY2UnKVxyXG5jb25zdCBTbmFwID0gcmVxdWlyZSgnLi9zbmFwJylcclxuY29uc3QgU25hcFpvb20gPSByZXF1aXJlKCcuL3NuYXAtem9vbScpXHJcbmNvbnN0IEZvbGxvdyA9IHJlcXVpcmUoJy4vZm9sbG93JylcclxuY29uc3QgV2hlZWwgPSByZXF1aXJlKCcuL3doZWVsJylcclxuY29uc3QgTW91c2VFZGdlcyA9IHJlcXVpcmUoJy4vbW91c2UtZWRnZXMnKVxyXG5cclxuY29uc3QgUExVR0lOX09SREVSID0gWydkcmFnJywgJ3BpbmNoJywgJ3doZWVsJywgJ2ZvbGxvdycsICdtb3VzZS1lZGdlcycsICdkZWNlbGVyYXRlJywgJ2JvdW5jZScsICdzbmFwLXpvb20nLCAnY2xhbXAtem9vbScsICdzbmFwJywgJ2NsYW1wJ11cclxuXHJcbmNsYXNzIFZpZXdwb3J0IGV4dGVuZHMgUElYSS5Db250YWluZXJcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG4gICAgICogQGV4dGVuZHMgRXZlbnRFbWl0dGVyXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2NyZWVuV2lkdGg9d2luZG93LmlubmVyV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2NyZWVuSGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZFdpZHRoPXRoaXMud2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRIZWlnaHQ9dGhpcy5oZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGhyZXNob2xkPTVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaCkgb3IgZGlzYWJsZSBhIGNsaWNrZWQgZXZlbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucGFzc2l2ZVdoZWVsPXRydWVdIHdoZXRoZXIgdGhlICd3aGVlbCcgZXZlbnQgaXMgc2V0IHRvIHBhc3NpdmVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc3RvcFByb3BhZ2F0aW9uPWZhbHNlXSB3aGV0aGVyIHRvIHN0b3BQcm9wYWdhdGlvbiBvZiBldmVudHMgdGhhdCBpbXBhY3QgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0geyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9IFtvcHRpb25zLmZvcmNlSGl0QXJlYV0gY2hhbmdlIHRoZSBkZWZhdWx0IGhpdEFyZWEgZnJvbSB3b3JsZCBzaXplIHRvIGEgbmV3IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vVGlja2VyXSBzZXQgdGhpcyBpZiB5b3Ugd2FudCB0byBtYW51YWxseSBjYWxsIHVwZGF0ZSgpIGZ1bmN0aW9uIG9uIGVhY2ggZnJhbWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQHBhcmFtIHtQSVhJLkludGVyYWN0aW9uTWFuYWdlcn0gW29wdGlvbnMuaW50ZXJhY3Rpb249bnVsbF0gSW50ZXJhY3Rpb25NYW5hZ2VyLCBhdmFpbGFibGUgZnJvbSBpbnN0YW50aWF0ZWQgV2ViR0xSZW5kZXJlci9DYW52YXNSZW5kZXJlci5wbHVnaW5zLmludGVyYWN0aW9uIC0gdXNlZCB0byBjYWxjdWxhdGUgcG9pbnRlciBwb3N0aW9uIHJlbGF0aXZlIHRvIGNhbnZhcyBsb2NhdGlvbiBvbiBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIGRyYWctcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdmVkXHJcbiAgICAgKiBAZmlyZXMgbW92ZWQtZW5kXHJcbiAgICAgKiBAZmlyZXMgem9vbWVkXHJcbiAgICAgKiBAZmlyZXMgem9vbWVkLWVuZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBvcHRpb25zLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gb3B0aW9ucy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gb3B0aW9ucy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSBvcHRpb25zLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5oaXRBcmVhRnVsbFNjcmVlbiA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4sIHRydWUpXHJcbiAgICAgICAgdGhpcy5mb3JjZUhpdEFyZWEgPSBvcHRpb25zLmZvcmNlSGl0QXJlYVxyXG4gICAgICAgIHRoaXMucGFzc2l2ZVdoZWVsID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5wYXNzaXZlV2hlZWwsIHRydWUpXHJcbiAgICAgICAgdGhpcy5zdG9wRXZlbnQgPSBvcHRpb25zLnN0b3BQcm9wYWdhdGlvblxyXG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50aHJlc2hvbGQsIDUpXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwgbnVsbFxyXG4gICAgICAgIHRoaXMuZGl2ID0gb3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnModGhpcy5kaXYpXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGFjdGl2ZSB0b3VjaCBwb2ludCBpZHMgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgICogQHR5cGUge251bWJlcltdfVxyXG4gICAgICAgICAqIEByZWFkb25seVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcblxyXG4gICAgICAgIGlmICghb3B0aW9ucy5ub1RpY2tlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudGlja2VyID0gb3B0aW9ucy50aWNrZXIgfHwgUElYSS50aWNrZXIuc2hhcmVkXHJcbiAgICAgICAgICAgIHRoaXMudGlja2VyRnVuY3Rpb24gPSAoKSA9PiB0aGlzLnVwZGF0ZSh0aGlzLnRpY2tlci5lbGFwc2VkTVMpXHJcbiAgICAgICAgICAgIHRoaXMudGlja2VyLmFkZCh0aGlzLnRpY2tlckZ1bmN0aW9uKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycyBmcm9tIHZpZXdwb3J0XHJcbiAgICAgKiAodXNlZnVsIGZvciBjbGVhbnVwIG9mIHdoZWVsIGFuZCB0aWNrZXIgZXZlbnRzIHdoZW4gcmVtb3Zpbmcgdmlld3BvcnQpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUxpc3RlbmVycygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50aWNrZXIucmVtb3ZlKHRoaXMudGlja2VyRnVuY3Rpb24pXHJcbiAgICAgICAgdGhpcy5kaXYucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvdmVycmlkZXMgUElYSS5Db250YWluZXIncyBkZXN0cm95IHRvIGFsc28gcmVtb3ZlIHRoZSAnd2hlZWwnIGFuZCBQSVhJLlRpY2tlciBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgZGVzdHJveShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3kob3B0aW9ucylcclxuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVycygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgdmlld3BvcnQgb24gZWFjaCBmcmFtZVxyXG4gICAgICogYnkgZGVmYXVsdCwgeW91IGRvIG5vdCBuZWVkIHRvIGNhbGwgdGhpcyB1bmxlc3MgeW91IHNldCBvcHRpb25zLm5vVGlja2VyPXRydWVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbi51cGRhdGUoZWxhcHNlZClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubGFzdFZpZXdwb3J0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgbW92ZWQtZW5kIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0Vmlld3BvcnQueCAhPT0gdGhpcy54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnkgIT09IHRoaXMueSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ21vdmVkLWVuZCcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92aW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3Igem9vbWVkLWVuZCBldmVudFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWCAhPT0gdGhpcy5zY2FsZS54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWSAhPT0gdGhpcy5zY2FsZS55KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuem9vbWluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy56b29taW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd6b29tZWQtZW5kJywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b29taW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnkgPSB0aGlzLnRvcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLndpZHRoID0gdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2RpcnR5ID0gdGhpcy5fZGlydHkgfHwgIXRoaXMubGFzdFZpZXdwb3J0IHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydC54ICE9PSB0aGlzLnggfHwgdGhpcy5sYXN0Vmlld3BvcnQueSAhPT0gdGhpcy55IHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydC5zY2FsZVggIT09IHRoaXMuc2NhbGUueCB8fCB0aGlzLmxhc3RWaWV3cG9ydC5zY2FsZVkgIT09IHRoaXMuc2NhbGUueVxyXG4gICAgICAgICAgICB0aGlzLmxhc3RWaWV3cG9ydCA9IHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMueCxcclxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSxcclxuICAgICAgICAgICAgICAgIHNjYWxlWDogdGhpcy5zY2FsZS54LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVZOiB0aGlzLnNjYWxlLnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtzY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc2NyZWVuSGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRIZWlnaHRdXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHNjcmVlbldpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIGlmICh3b3JsZFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHdvcmxkV2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHdvcmxkSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB3b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgdmlzaWJsZSBib3VuZHMgb2Ygdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gYm91bmRzIHsgeCwgeSwgd2lkdGgsIGhlaWdodCB9XHJcbiAgICAgKi9cclxuICAgIGdldFZpc2libGVCb3VuZHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHRoaXMubGVmdCwgeTogdGhpcy50b3AsIHdpZHRoOiB0aGlzLndvcmxkU2NyZWVuV2lkdGgsIGhlaWdodDogdGhpcy53b3JsZFNjcmVlbkhlaWdodCB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoZGl2KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy53aGVlbEZ1bmN0aW9uID0gKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSlcclxuICAgICAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24sIHsgcGFzc2l2ZTogdGhpcy5wYXNzaXZlV2hlZWwgfSlcclxuICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkb3duIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlIHx8ICF0aGlzLndvcmxkVmlzaWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcy5wdXNoKGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSB9XHJcblxyXG4gICAgICAgICAgICAvLyBjbGlja2VkIGV2ZW50IGRvZXMgbm90IGZpcmUgaWYgdmlld3BvcnQgaXMgZGVjZWxlcmF0aW5nIG9yIGJvdW5jaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBjb25zdCBib3VuY2UgPSB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddXHJcbiAgICAgICAgICAgIGlmICgoIWRlY2VsZXJhdGUgfHwgIWRlY2VsZXJhdGUuaXNBY3RpdmUoKSkgJiYgKCFib3VuY2UgfHwgIWJvdW5jZS5pc0FjdGl2ZSgpKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0b3BcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW4uZG93bihlKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RvcCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RvcCAmJiB0aGlzLnN0b3BFdmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSB8fCAhdGhpcy53b3JsZFZpc2libGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdG9wXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAocGx1Z2luLm1vdmUoZSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0WCA9IGUuZGF0YS5nbG9iYWwueCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RZID0gZS5kYXRhLmdsb2JhbC55IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RvcCAmJiB0aGlzLnN0b3BFdmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSB8fCAhdGhpcy53b3JsZFZpc2libGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEub3JpZ2luYWxFdmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgJiYgZS5kYXRhLm9yaWdpbmFsRXZlbnQuYnV0dG9uID09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgIT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudG91Y2hlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlc1tpXSA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdWNoZXMuc3BsaWNlKGksIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0b3BcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwbHVnaW4udXAoZSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUgJiYgdGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcyB9KVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0b3AgJiYgdGhpcy5zdG9wRXZlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0cyBwb2ludGVyIHBvc2l0aW9uIGlmIHRoaXMuaW50ZXJhY3Rpb24gaXMgc2V0XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGV2dFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlclBvc2l0aW9uKGV2dClcclxuICAgIHtcclxuICAgICAgICBsZXQgcG9pbnQgPSBuZXcgUElYSS5Qb2ludCgpXHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uLm1hcFBvc2l0aW9uVG9Qb2ludChwb2ludCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwb2ludC54ID0gZXZ0LmNsaWVudFhcclxuICAgICAgICAgICAgcG9pbnQueSA9IGV2dC5jbGllbnRZXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHdoZWVsIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgaGFuZGxlV2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSB8fCAhdGhpcy53b3JsZFZpc2libGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgaGFuZGxlIHdoZWVsIGV2ZW50cyB3aGVyZSB0aGUgbW91c2UgaXMgb3ZlciB0aGUgdmlld3BvcnRcclxuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMudG9Mb2NhbCh0aGlzLmdldFBvaW50ZXJQb3NpdGlvbihlKSlcclxuICAgICAgICBpZiAodGhpcy5sZWZ0IDw9IHBvaW50LnggJiYgcG9pbnQueCA8PSB0aGlzLnJpZ2h0ICYmIHRoaXMudG9wIDw9IHBvaW50LnkgJiYgcG9pbnQueSA8PSB0aGlzLmJvdHRvbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbHVnaW4ud2hlZWwoZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSBzY3JlZW4gdG8gd29ybGRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1dvcmxkKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKGFyZ3VtZW50c1swXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSB3b3JsZCB0byBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1NjcmVlbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHBvaW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zY3JlZW5IZWlnaHQgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLndvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3NjYWxlWT10cnVlXSB3aGV0aGVyIHRvIHNldCBzY2FsZVk9c2NhbGVYXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub0NsYW1wPWZhbHNlXSB3aGV0aGVyIHRvIGRpc2FibGUgY2xhbXAtem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V2lkdGgod2lkdGgsIGNlbnRlciwgc2NhbGVZPXRydWUsIG5vQ2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcblxyXG4gICAgICAgIGlmIChzY2FsZVkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKCFub0NsYW1wICYmIGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgaGVpZ2h0IGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD10aGlzLl93b3JsZEhlaWdodF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2NhbGVYPXRydWVdIHdoZXRoZXIgdG8gc2V0IHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9DbGFtcD1mYWxzZV0gd2hldGhlciB0byBkaXNhYmxlIGNsYW1wLXpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdEhlaWdodChoZWlnaHQsIGNlbnRlciwgc2NhbGVYPXRydWUsIG5vQ2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuXHJcbiAgICAgICAgaWYgKHNjYWxlWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhbXBab29tID0gdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoIW5vQ2xhbXAgJiYgY2xhbXBab29tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXBab29tLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjcmVlbldpZHRoIC8gdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYW1wWm9vbSA9IHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKGNsYW1wWm9vbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wWm9vbS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBzaXplIG9yIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIGRlc2lyZWQgd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBkZXNpcmVkIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlciwgd2lkdGgsIGhlaWdodClcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2xhbXBab29tID0gdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoY2xhbXBab29tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXBab29tLmNsYW1wKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBhIGNlcnRhaW4gcGVyY2VudCAoaW4gYm90aCB4IGFuZCB5IGRpcmVjdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IGNoYW5nZSAoZS5nLiwgMC4yNSB3b3VsZCBpbmNyZWFzZSBhIHN0YXJ0aW5nIHNjYWxlIG9mIDEuMCB0byAxLjI1KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb21QZXJjZW50KHBlcmNlbnQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlLnggKyB0aGlzLnNjYWxlLnggKiBwZXJjZW50XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICAgICAgY29uc3QgY2xhbXBab29tID0gdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoY2xhbXBab29tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXBab29tLmNsYW1wKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgd2lkdGggYnkgYSBjZXJ0YWluIG51bWJlciBvZiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgaW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbShjaGFuZ2UsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZpdFdpZHRoKGNoYW5nZSArIHRoaXMud29ybGRTY3JlZW5XaWR0aCwgY2VudGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgem9vbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub01vdmVdIHpvb20gYnV0IGRvIG5vdCBtb3ZlXHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHJpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueCArIHRoaXMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBsZWZ0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG4gICAgc2V0IGxlZnQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHRvcCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB0b3AoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcbiAgICBzZXQgdG9wKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgYm90dG9tKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueSArIHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBib3R0b20odmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55ICsgdGhpcy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgd2hldGhlciB0aGUgdmlld3BvcnQgaXMgZGlydHkgKGkuZS4sIG5lZWRzIHRvIGJlIHJlbmRlcmVyZWQgdG8gdGhlIHNjcmVlbiBiZWNhdXNlIG9mIGEgY2hhbmdlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBkaXJ0eSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcnR5XHJcbiAgICB9XHJcbiAgICBzZXQgZGlydHkodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGVybWFuZW50bHkgY2hhbmdlcyB0aGUgVmlld3BvcnQncyBoaXRBcmVhXHJcbiAgICAgKiBOT1RFOiBub3JtYWxseSB0aGUgaGl0QXJlYSA9IFBJWEkuUmVjdGFuZ2xlKFZpZXdwb3J0LmxlZnQsIFZpZXdwb3J0LnRvcCwgVmlld3BvcnQud29ybGRTY3JlZW5XaWR0aCwgVmlld3BvcnQud29ybGRTY3JlZW5IZWlnaHQpXHJcbiAgICAgKiBAdHlwZSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGZvcmNlSGl0QXJlYSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlSGl0QXJlYVxyXG4gICAgfVxyXG4gICAgc2V0IGZvcmNlSGl0QXJlYSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvdW50IG9mIG1vdXNlL3RvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBjb3VudERvd25Qb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxlZnREb3duID8gMSA6IDApICsgdGhpcy50b3VjaGVzLmxlbmd0aFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgb2YgdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkludGVyYWN0aW9uVHJhY2tpbmdEYXRhW119XHJcbiAgICAgKi9cclxuICAgIGdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gcG9pbnRlcnNba2V5XVxyXG4gICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzLmluZGV4T2YocG9pbnRlci5wb2ludGVySWQpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBvaW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyc1trZXldKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXBzIGFuZCByZXNldHMgYm91bmNlIGFuZCBkZWNlbGVyYXRlIChhcyBuZWVkZWQpIGFmdGVyIG1hbnVhbGx5IG1vdmluZyB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3Jlc2V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydib3VuY2UnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10ucmVzZXQoKVxyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLmJvdW5jZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snc25hcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddLnVwZGF0ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddLmNsYW1wKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExVR0lOU1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyBhIHVzZXIgcGx1Z2luIGludG8gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7UGx1Z2lufSBwbHVnaW4gLSBpbnN0YW50aWF0ZWQgUGx1Z2luIGNsYXNzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2luZGV4PWxhc3QgZWxlbWVudF0gcGx1Z2luIGlzIGNhbGxlZCBjdXJyZW50IG9yZGVyOiAnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCdcclxuICAgICAqL1xyXG4gICAgdXNlclBsdWdpbihuYW1lLCBwbHVnaW4sIGluZGV4PVBMVUdJTl9PUkRFUi5sZW5ndGgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zW25hbWVdID0gcGx1Z2luXHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IFBMVUdJTl9PUkRFUi5pbmRleE9mKG5hbWUpXHJcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgUExVR0lOX09SREVSLnNwbGljZShjdXJyZW50LCAxKVxyXG4gICAgICAgIH1cclxuICAgICAgICBQTFVHSU5fT1JERVIuc3BsaWNlKGluZGV4LCAwLCBuYW1lKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBpbnN0YWxsZWQgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXSA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5lbWl0KHR5cGUgKyAnLXJlbW92ZScpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzb3J0IHBsdWdpbnMgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHBsdWdpbnNTb3J0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNMaXN0LnB1c2godGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZhY3Rvcj0xXSBmYWN0b3IgdG8gbXVsdGlwbHkgZHJhZyB0byBpbmNyZWFzZSB0aGUgc3BlZWQgb2YgbW92ZW1lbnRcclxuICAgICAqL1xyXG4gICAgZHJhZyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZHJhZyddID0gbmV3IERyYWcodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXAgdG8gd29ybGQgYm91bmRhcmllcyBvciBvdGhlciBwcm92aWRlZCBib3VuZGFyaWVzXHJcbiAgICAgKiBOT1RFUzpcclxuICAgICAqICAgY2xhbXAgaXMgZGlzYWJsZWQgaWYgY2FsbGVkIHdpdGggbm8gb3B0aW9uczsgdXNlIHsgZGlyZWN0aW9uOiAnYWxsJyB9IGZvciBhbGwgZWRnZSBjbGFtcGluZ1xyXG4gICAgICogICBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMubGVmdF0gY2xhbXAgbGVmdDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnJpZ2h0XSBjbGFtcCByaWdodDsgdHJ1ZT12aWV3cG9ydC53b3JsZFdpZHRoXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnRvcF0gY2xhbXAgdG9wOyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMuYm90dG9tXSBjbGFtcCBib3R0b207IHRydWU9dmlld3BvcnQud29ybGRIZWlnaHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb25dIChhbGwsIHgsIG9yIHkpIHVzaW5nIGNsYW1wcyBvZiBbMCwgdmlld3BvcnQud29ybGRXaWR0aC92aWV3cG9ydC53b3JsZEhlaWdodF07IHJlcGxhY2VzIGxlZnQvcmlnaHQvdG9wL2JvdHRvbSBpZiBzZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAobm9uZSBPUiAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyKSBPUiBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuIChlLmcuLCB0b3AtcmlnaHQsIGNlbnRlciwgbm9uZSwgYm90dG9tbGVmdClcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBib3VuY2Uob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddID0gbmV3IEJvdW5jZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgcGluY2ggdG8gem9vbSBhbmQgdHdvLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgcGluY2gob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3BpbmNoJ10gPSBuZXcgUGluY2godGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc25hcCB0byBhIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgc25hcCh4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddID0gbmV3IFNuYXAodGhpcywgeCwgeSwgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9sbG93IGEgdGFyZ2V0XHJcbiAgICAgKiBOT1RFOiB1c2VzIHRoZSAoeCwgeSkgYXMgdGhlIGNlbnRlciB0byBmb2xsb3c7IGZvciBQSVhJLlNwcml0ZSB0byB3b3JrIHByb3Blcmx5LCB1c2Ugc3ByaXRlLmFuY2hvci5zZXQoMC41KVxyXG4gICAgICogQHBhcmFtIHtQSVhJLkRpc3BsYXlPYmplY3R9IHRhcmdldCB0byBmb2xsb3cgKG9iamVjdCBtdXN0IGluY2x1ZGUge3g6IHgtY29vcmRpbmF0ZSwgeTogeS1jb29yZGluYXRlfSlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD0wXSB0byBmb2xsb3cgaW4gcGl4ZWxzL2ZyYW1lICgwPXRlbGVwb3J0IHRvIGxvY2F0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gcmFkaXVzIChpbiB3b3JsZCBjb29yZGluYXRlcykgb2YgY2VudGVyIGNpcmNsZSB3aGVyZSBtb3ZlbWVudCBpcyBhbGxvd2VkIHdpdGhvdXQgbW92aW5nIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZm9sbG93KHRhcmdldCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2ZvbGxvdyddID0gbmV3IEZvbGxvdyh0aGlzLCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdXNpbmcgbW91c2Ugd2hlZWxcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHdoZWVsKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWyd3aGVlbCddID0gbmV3IFdoZWVsKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBjbGFtcGluZyBvZiB6b29tIHRvIGNvbnN0cmFpbnRzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5XaWR0aF0gbWluaW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbkhlaWdodF0gbWluaW11bSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXaWR0aF0gbWF4aW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heEhlaWdodF0gbWF4aW11bSBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddID0gbmV3IENsYW1wWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzIG9yIHJhZGl1cy1kaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyBib3R0b20gc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gbGVmdCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHJpZ2h0IHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqL1xyXG4gICAgbW91c2VFZGdlcyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snbW91c2UtZWRnZXMnXSA9IG5ldyBNb3VzZUVkZ2VzKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHZpZXdwb3J0IChpbmNsdWRpbmcgYW5pbWF0aW9uIHVwZGF0ZXMgc3VjaCBhcyBkZWNlbGVyYXRlKVxyXG4gICAgICogTk9URTogd2hlbiBzZXR0aW5nIHBhdXNlPXRydWUsIGFsbCB0b3VjaGVzIGFuZCBtb3VzZSBhY3Rpb25zIGFyZSBjbGVhcmVkIChpLmUuLCBpZiBtb3VzZWRvd24gd2FzIGFjdGl2ZSwgaXQgYmVjb21lcyBpbmFjdGl2ZSBmb3IgcHVycG9zZXMgb2YgdGhlIHZpZXdwb3J0KVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBwYXVzZSgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlIH1cclxuICAgIHNldCBwYXVzZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9wYXVzZSA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5sYXN0Vmlld3BvcnQgPSBudWxsXHJcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuem9vbWluZyA9IGZhbHNlXHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB0aGUgdmlld3BvcnQgc28gdGhlIGJvdW5kaW5nIGJveCBpcyB2aXNpYmxlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAgICovXHJcbiAgICBlbnN1cmVWaXNpYmxlKHgsIHksIHdpZHRoLCBoZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHggPCB0aGlzLmxlZnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSB4XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHggKyB3aWR0aCA+IHRoaXMucmlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0geCArIHdpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh5IDwgdGhpcy50b3ApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoeSArIGhlaWdodCA+IHRoaXMuYm90dG9tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSB5ICsgaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgYWZ0ZXIgYSBtb3VzZSBvciB0b3VjaCBjbGlja1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjY2xpY2tlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLXN0YXJ0XHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLWVuZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggZW5kXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZm9yIGEgbW91c2Ugd2hlZWwgZXZlbnRcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB3aGVlbFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5kelxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgd2hlZWwtc2Nyb2xsIG9jY3Vyc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWwtc2Nyb2xsXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIG1vdXNlLWVkZ2Ugc3RhcnRzIHRvIHNjcm9sbFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIG1vdXNlLWVkZ2Ugc2Nyb2xsaW5nIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2UtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGUgKGRyYWcsIHNuYXAsIHBpbmNoLCBmb2xsb3csIGJvdW5jZS14LCBib3VuY2UteSwgY2xhbXAteCwgY2xhbXAteSwgZGVjZWxlcmF0ZSwgbW91c2UtZWRnZXMsIHdoZWVsKVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IG1vdmVzIHRocm91Z2ggVUkgaW50ZXJhY3Rpb24sIGRlY2VsZXJhdGlvbiwgb3IgZm9sbG93XHJcbiAqIEBldmVudCBWaWV3cG9ydCN6b29tZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGUgKGRyYWctem9vbSwgcGluY2gsIHdoZWVsLCBjbGFtcC16b29tKVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IHN0b3BzIG1vdmluZyBmb3IgYW55IHJlYXNvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWQtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBzdG9wcyB6b29taW5nIGZvciBhbnkgcmFzb25cclxuICogQGV2ZW50IFZpZXdwb3J0I3pvb21lZC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgUElYSSAhPT0gJ3VuZGVmaW5lZCcpXHJcbntcclxuICAgIFBJWEkuZXh0cmFzLlZpZXdwb3J0ID0gVmlld3BvcnRcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydFxyXG4iXX0=