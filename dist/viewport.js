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
     * @fires zoomed
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.pluginsList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var plugin = _step3.value;

                    plugin.down(e);
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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.pluginsList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var plugin = _step4.value;

                    plugin.move(e);
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

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.pluginsList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var plugin = _step5.value;

                    plugin.up(e);
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
         * @return {Viewport} this
         */

    }, {
        key: 'fitWidth',
        value: function fitWidth(width, center) {
            var scaleY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            this.scale.x = this.screenWidth / width;

            if (scaleY) {
                this.scale.y = this.scale.x;
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
         * @return {Viewport} this
         */

    }, {
        key: 'fitHeight',
        value: function fitHeight(height, center) {
            var scaleX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var save = void 0;
            if (center) {
                save = this.center;
            }
            height = height || this.worldHeight;
            this.scale.y = this.screenHeight / height;

            if (scaleX) {
                this.scale.x = this.scale.y;
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
         * <p>NOTE: normally the hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)</p>
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

if (typeof PIXI !== 'undefined') {
    PIXI.extras.Viewport = Viewport;
}

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJwYXNzaXZlV2hlZWwiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJ0aWNrZXJGdW5jdGlvbiIsInVwZGF0ZSIsImFkZCIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aGVlbEZ1bmN0aW9uIiwicmVtb3ZlTGlzdGVuZXJzIiwicGF1c2UiLCJwbHVnaW4iLCJlbGFwc2VkTVMiLCJoaXRBcmVhIiwieCIsImxlZnQiLCJ5IiwidG9wIiwid2lkdGgiLCJ3b3JsZFNjcmVlbldpZHRoIiwiaGVpZ2h0Iiwid29ybGRTY3JlZW5IZWlnaHQiLCJfZGlydHkiLCJsYXN0Vmlld3BvcnQiLCJzY2FsZVgiLCJzY2FsZSIsInNjYWxlWSIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJyZXNpemUiLCJpbnRlcmFjdGl2ZSIsIlJlY3RhbmdsZSIsIm9uIiwiZG93biIsIm1vdmUiLCJ1cCIsImUiLCJoYW5kbGVXaGVlbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJwYXNzaXZlIiwibGVmdERvd24iLCJkYXRhIiwicG9pbnRlclR5cGUiLCJvcmlnaW5hbEV2ZW50IiwiYnV0dG9uIiwicHVzaCIsInBvaW50ZXJJZCIsImNvdW50RG93blBvaW50ZXJzIiwibGFzdCIsImdsb2JhbCIsImRlY2VsZXJhdGUiLCJib3VuY2UiLCJNYXRoIiwiYWJzIiwidG9YIiwidG9ZIiwiY2xpY2tlZEF2YWlsYWJsZSIsImNoYW5nZSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIk1vdXNlRXZlbnQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZXZ0IiwicG9pbnQiLCJQb2ludCIsIm1hcFBvc2l0aW9uVG9Qb2ludCIsImNsaWVudFgiLCJjbGllbnRZIiwidG9Mb2NhbCIsImdldFBvaW50ZXJQb3NpdGlvbiIsInJpZ2h0IiwiYm90dG9tIiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0dsb2JhbCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJfcmVzZXQiLCJjZW50ZXIiLCJzYXZlIiwibW92ZUNlbnRlciIsInBlcmNlbnQiLCJmaXRXaWR0aCIsInBsdWdpbnNTb3J0IiwiY29ybmVyUG9pbnQiLCJyZXN1bHRzIiwicG9pbnRlcnMiLCJ0cmFja2VkUG9pbnRlcnMiLCJrZXkiLCJwb2ludGVyIiwiaW5kZXhPZiIsInJlc2V0IiwiY2xhbXAiLCJ0eXBlIiwicmVzdW1lIiwidGFyZ2V0IiwidmFsdWUiLCJtb3ZlQ29ybmVyIiwiX2ZvcmNlSGl0QXJlYSIsIl9wYXVzZSIsIkNvbnRhaW5lciIsImV4dHJhcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVNDLFFBQVEsU0FBUixDQUFmO0FBQ0EsSUFBTUMsT0FBT0QsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNRSxR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QUVEOzs7Ozs7Ozs0QkFNQTtBQUNJLG1CQUFPLEtBQUtFLGFBQVo7QUFDSCxTOzBCQUNnQkYsSyxFQUNqQjtBQUNJLGdCQUFJQSxLQUFKLEVBQ0E7QUFDSSxxQkFBS0UsYUFBTCxHQUFxQkYsS0FBckI7QUFDQSxxQkFBSy9GLE9BQUwsR0FBZStGLEtBQWY7QUFDSCxhQUpELE1BTUE7QUFDSSxxQkFBS0UsYUFBTCxHQUFxQixLQUFyQjtBQUNBLHFCQUFLakcsT0FBTCxHQUFlLElBQUlaLEtBQUtnQyxTQUFULENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLEtBQUtoRCxVQUE5QixFQUEwQyxLQUFLRSxXQUEvQyxDQUFmO0FBQ0g7QUFDSjs7OzRCQXlUVztBQUFFLG1CQUFPLEtBQUs0SCxNQUFaO0FBQW9CLFM7MEJBQ3hCSCxLLEVBQ1Y7QUFDSSxpQkFBS0csTUFBTCxHQUFjSCxLQUFkO0FBQ0EsZ0JBQUlBLEtBQUosRUFDQTtBQUNJLHFCQUFLN0csT0FBTCxHQUFlLEVBQWY7QUFDQSxxQkFBSzJDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDSDtBQUNKOzs7O0VBL3BDa0J6QyxLQUFLK0csUzs7QUFrcUM1Qjs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7Ozs7QUFTQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7O0FBUUE7Ozs7Ozs7O0FBUUEsSUFBSSxPQUFPL0csSUFBUCxLQUFnQixXQUFwQixFQUNBO0FBQ0lBLFNBQUtnSCxNQUFMLENBQVl6SSxRQUFaLEdBQXVCQSxRQUF2QjtBQUNIOztBQUVEMEksT0FBT0MsT0FBUCxHQUFpQjNJLFFBQWpCIiwiZmlsZSI6InZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IERyYWcgPSByZXF1aXJlKCcuL2RyYWcnKVxyXG5jb25zdCBQaW5jaCA9IHJlcXVpcmUoJy4vcGluY2gnKVxyXG5jb25zdCBDbGFtcCA9IHJlcXVpcmUoJy4vY2xhbXAnKVxyXG5jb25zdCBDbGFtcFpvb20gPSByZXF1aXJlKCcuL2NsYW1wLXpvb20nKVxyXG5jb25zdCBEZWNlbGVyYXRlID0gcmVxdWlyZSgnLi9kZWNlbGVyYXRlJylcclxuY29uc3QgQm91bmNlID0gcmVxdWlyZSgnLi9ib3VuY2UnKVxyXG5jb25zdCBTbmFwID0gcmVxdWlyZSgnLi9zbmFwJylcclxuY29uc3QgU25hcFpvb20gPSByZXF1aXJlKCcuL3NuYXAtem9vbScpXHJcbmNvbnN0IEZvbGxvdyA9IHJlcXVpcmUoJy4vZm9sbG93JylcclxuY29uc3QgV2hlZWwgPSByZXF1aXJlKCcuL3doZWVsJylcclxuY29uc3QgTW91c2VFZGdlcyA9IHJlcXVpcmUoJy4vbW91c2UtZWRnZXMnKVxyXG5cclxuY29uc3QgUExVR0lOX09SREVSID0gWydkcmFnJywgJ3BpbmNoJywgJ3doZWVsJywgJ2ZvbGxvdycsICdtb3VzZS1lZGdlcycsICdkZWNlbGVyYXRlJywgJ2JvdW5jZScsICdzbmFwLXpvb20nLCAnY2xhbXAtem9vbScsICdzbmFwJywgJ2NsYW1wJ11cclxuXHJcbmNsYXNzIFZpZXdwb3J0IGV4dGVuZHMgUElYSS5Db250YWluZXJcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG4gICAgICogQGV4dGVuZHMgRXZlbnRFbWl0dGVyXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2NyZWVuV2lkdGg9d2luZG93LmlubmVyV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc2NyZWVuSGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZFdpZHRoPXRoaXMud2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRIZWlnaHQ9dGhpcy5oZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGhyZXNob2xkPTVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaCkgb3IgZGlzYWJsZSBhIGNsaWNrZWQgZXZlbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucGFzc2l2ZVdoZWVsPXRydWVdIHdoZXRoZXIgdGhlICd3aGVlbCcgZXZlbnQgaXMgc2V0IHRvIHBhc3NpdmVcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQHBhcmFtIHtQSVhJLkludGVyYWN0aW9uTWFuYWdlcn0gW29wdGlvbnMuaW50ZXJhY3Rpb249bnVsbF0gSW50ZXJhY3Rpb25NYW5hZ2VyLCBhdmFpbGFibGUgZnJvbSBpbnN0YW50aWF0ZWQgV2ViR0xSZW5kZXJlci9DYW52YXNSZW5kZXJlci5wbHVnaW5zLmludGVyYWN0aW9uIC0gdXNlZCB0byBjYWxjdWxhdGUgcG9pbnRlciBwb3N0aW9uIHJlbGF0aXZlIHRvIGNhbnZhcyBsb2NhdGlvbiBvbiBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIGRyYWctcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdmVkXHJcbiAgICAgKiBAZmlyZXMgem9vbWVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy5wYXNzaXZlV2hlZWwgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnBhc3NpdmVXaGVlbCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMudGhyZXNob2xkLCA1KVxyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb24gPSBvcHRpb25zLmludGVyYWN0aW9uIHx8IG51bGxcclxuICAgICAgICB0aGlzLmRpdiA9IG9wdGlvbnMuZGl2V2hlZWwgfHwgZG9jdW1lbnQuYm9keVxyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzKHRoaXMuZGl2KVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhY3RpdmUgdG91Y2ggcG9pbnQgaWRzIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJbXX1cclxuICAgICAgICAgKiBAcmVhZG9ubHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG5cclxuICAgICAgICB0aGlzLnRpY2tlciA9IG9wdGlvbnMudGlja2VyIHx8IFBJWEkudGlja2VyLnNoYXJlZFxyXG4gICAgICAgIHRoaXMudGlja2VyRnVuY3Rpb24gPSAoKSA9PiB0aGlzLnVwZGF0ZSgpXHJcbiAgICAgICAgdGhpcy50aWNrZXIuYWRkKHRoaXMudGlja2VyRnVuY3Rpb24pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMgZnJvbSB2aWV3cG9ydFxyXG4gICAgICogKHVzZWZ1bCBmb3IgY2xlYW51cCBvZiB3aGVlbCBhbmQgdGlja2VyIGV2ZW50cyB3aGVuIHJlbW92aW5nIHZpZXdwb3J0KVxyXG4gICAgICovXHJcbiAgICByZW1vdmVMaXN0ZW5lcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudGlja2VyLnJlbW92ZSh0aGlzLnRpY2tlckZ1bmN0aW9uKVxyXG4gICAgICAgIHRoaXMuZGl2LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy53aGVlbEZ1bmN0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogb3ZlcnJpZGVzIFBJWEkuQ29udGFpbmVyJ3MgZGVzdHJveSB0byBhbHNvIHJlbW92ZSB0aGUgJ3doZWVsJyBhbmQgUElYSS5UaWNrZXIgbGlzdGVuZXJzXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3kob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlci5kZXN0cm95KG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbi51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS54ID0gdGhpcy5sZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEud2lkdGggPSB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS5oZWlnaHQgPSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZGlydHkgPSB0aGlzLl9kaXJ0eSB8fCAhdGhpcy5sYXN0Vmlld3BvcnQgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0LnggIT09IHRoaXMueCB8fCB0aGlzLmxhc3RWaWV3cG9ydC55ICE9PSB0aGlzLnkgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWCAhPT0gdGhpcy5zY2FsZS54IHx8IHRoaXMubGFzdFZpZXdwb3J0LnNjYWxlWSAhPT0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFZpZXdwb3J0ID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy54LFxyXG4gICAgICAgICAgICAgICAgeTogdGhpcy55LFxyXG4gICAgICAgICAgICAgICAgc2NhbGVYOiB0aGlzLnNjYWxlLngsXHJcbiAgICAgICAgICAgICAgICBzY2FsZVk6IHRoaXMuc2NhbGUueVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gc2V0IHNjcmVlbiBhbmQgd29ybGQgc2l6ZXMtLW5lZWRlZCBmb3IgcGluY2gvd2hlZWwvY2xhbXAvYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuV2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5IZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRIZWlnaHRdXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHNjcmVlbldpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB3b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB3b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgYWZ0ZXIgYSB3b3JsZFdpZHRoL0hlaWdodCBjaGFuZ2VcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZVBsdWdpbnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLnJlc2l6ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoXHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRXaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZEhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBpbnB1dCBsaXN0ZW5lcnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGxpc3RlbmVycyhkaXYpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmRvd24nLCB0aGlzLmRvd24pXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm1vdmUnLCB0aGlzLm1vdmUpXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXBvdXRzaWRlJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyY2FuY2VsJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyb3V0JywgdGhpcy51cClcclxuICAgICAgICB0aGlzLndoZWVsRnVuY3Rpb24gPSAoZSkgPT4gdGhpcy5oYW5kbGVXaGVlbChlKVxyXG4gICAgICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMud2hlZWxGdW5jdGlvbiwgeyBwYXNzaXZlOiB0aGlzLnBhc3NpdmVXaGVlbCB9KVxyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRvd24gZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuZGF0YS5wb2ludGVyVHlwZSA9PT0gJ21vdXNlJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMucHVzaChlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2xpY2tlZCBldmVudCBkb2VzIG5vdCBmaXJlIGlmIHZpZXdwb3J0IGlzIGRlY2VsZXJhdGluZyBvciBib3VuY2luZ1xyXG4gICAgICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICAgICAgY29uc3QgYm91bmNlID0gdGhpcy5wbHVnaW5zWydib3VuY2UnXVxyXG4gICAgICAgICAgICBpZiAoKCFkZWNlbGVyYXRlIHx8IChNYXRoLmFicyhkZWNlbGVyYXRlLngpIDwgdGhpcy50aHJlc2hvbGQgJiYgTWF0aC5hYnMoZGVjZWxlcmF0ZS55KSA8IHRoaXMudGhyZXNob2xkKSkgJiYgKCFib3VuY2UgfHwgKCFib3VuY2UudG9YICYmICFib3VuY2UudG9ZKSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLmRvd24oZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4ubW92ZShlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RYID0gZS5kYXRhLmdsb2JhbC54IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgY29uc3QgZGlzdFkgPSBlLmRhdGEuZ2xvYmFsLnkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja1RocmVzaG9sZChkaXN0WCkgfHwgdGhpcy5jaGVja1RocmVzaG9sZChkaXN0WSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXAgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXNbaV0gPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3VjaGVzLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLnVwKGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXRzIHBvaW50ZXIgcG9zaXRpb24gaWYgdGhpcy5pbnRlcmFjdGlvbiBpcyBzZXRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZXZ0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBnZXRQb2ludGVyUG9zaXRpb24oZXZ0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBwb2ludCA9IG5ldyBQSVhJLlBvaW50KClcclxuICAgICAgICBpZiAodGhpcy5pbnRlcmFjdGlvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb24ubWFwUG9zaXRpb25Ub1BvaW50KHBvaW50LCBldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBvaW50LnggPSBldnQuY2xpZW50WFxyXG4gICAgICAgICAgICBwb2ludC55ID0gZXZ0LmNsaWVudFlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvaW50XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgd2hlZWwgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVXaGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGhhbmRsZSB3aGVlbCBldmVudHMgd2hlcmUgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnRvTG9jYWwodGhpcy5nZXRQb2ludGVyUG9zaXRpb24oZSkpXHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCA8PSBwb2ludC54ICYmIHBvaW50LnggPD0gdGhpcy5yaWdodCAmJiB0aGlzLnRvcCA8PSBwb2ludC55ICYmIHBvaW50LnkgPD0gdGhpcy5ib3R0b20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGx1Z2luLndoZWVsKGUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gc2NyZWVuIHRvIHdvcmxkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9Xb3JsZCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbChhcmd1bWVudHNbMF0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gd29ybGQgdG8gc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9TY3JlZW4oKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBjZW50ZXIgb2Ygc2NyZWVuIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjZW50ZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB0aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0gdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjZW50ZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBjZW50ZXIgb2Ygdmlld3BvcnQgdG8gcG9pbnRcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxQSVhJLlBvaW50TGlrZSl9IHggb3IgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDZW50ZXIoLyp4LCB5IHwgUElYSS5Qb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB4LCB5XHJcbiAgICAgICAgaWYgKCFpc05hTihhcmd1bWVudHNbMF0pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF0ueFxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzBdLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoKHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB4KSAqIHRoaXMuc2NhbGUueCwgKHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0geSkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0b3AtbGVmdCBjb3JuZXJcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNvcm5lcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogLXRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogLXRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY29ybmVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNvcm5lcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgdmlld3BvcnQncyB0b3AtbGVmdCBjb3JuZXI7IGFsc28gY2xhbXBzIGFuZCByZXNldHMgZGVjZWxlcmF0ZSBhbmQgYm91bmNlIChhcyBuZWVkZWQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4fHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNvcm5lcigvKngsIHkgfCBwb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXS54ICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzBdLnkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0gKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMV0gKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIHdpZHRoIGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoPXRoaXMuX3dvcmxkV2lkdGhdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2NhbGVZPXRydWVdIHdoZXRoZXIgdG8gc2V0IHNjYWxlWT1zY2FsZVhcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdpZHRoKHdpZHRoLCBjZW50ZXIsIHNjYWxlWT10cnVlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG5cclxuICAgICAgICBpZiAoc2NhbGVZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgaGVpZ2h0IGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD10aGlzLl93b3JsZEhlaWdodF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc2NhbGVYPXRydWVdIHdoZXRoZXIgdG8gc2V0IHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0SGVpZ2h0KGhlaWdodCwgY2VudGVyLCBzY2FsZVg9dHJ1ZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG5cclxuICAgICAgICBpZiAoc2NhbGVYKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdvcmxkKGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBzaXplIG9yIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIGRlc2lyZWQgd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBkZXNpcmVkIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlciwgd2lkdGgsIGhlaWdodClcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBhIGNlcnRhaW4gcGVyY2VudCAoaW4gYm90aCB4IGFuZCB5IGRpcmVjdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IGNoYW5nZSAoZS5nLiwgMC4yNSB3b3VsZCBpbmNyZWFzZSBhIHN0YXJ0aW5nIHNjYWxlIG9mIDEuMCB0byAxLjI1KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb21QZXJjZW50KHBlcmNlbnQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlLnggKyB0aGlzLnNjYWxlLnggKiBwZXJjZW50XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgd2lkdGggYnkgYSBjZXJ0YWluIG51bWJlciBvZiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgaW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbShjaGFuZ2UsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZpdFdpZHRoKGNoYW5nZSArIHRoaXMud29ybGRTY3JlZW5XaWR0aCwgY2VudGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgem9vbVxyXG4gICAgICovXHJcbiAgICBzbmFwWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcC16b29tJ10gPSBuZXcgU25hcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlZGVmIE91dE9mQm91bmRzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBsZWZ0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJpZ2h0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHRvcFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBib3R0b21cclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaXMgY29udGFpbmVyIG91dCBvZiB3b3JsZCBib3VuZHNcclxuICAgICAqIEByZXR1cm4ge091dE9mQm91bmRzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgT09CKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fVxyXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gdGhpcy5sZWZ0IDwgMFxyXG4gICAgICAgIHJlc3VsdC5yaWdodCA9IHRoaXMucmlnaHQgPiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgcmVzdWx0LnRvcCA9IHRoaXMudG9wIDwgMFxyXG4gICAgICAgIHJlc3VsdC5ib3R0b20gPSB0aGlzLmJvdHRvbSA+IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgcmVzdWx0LmNvcm5lclBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54IC0gdGhpcy5fc2NyZWVuV2lkdGgsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55IC0gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCByaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnggKyB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCByaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnggKyB0aGlzLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuICAgIHNldCBsZWZ0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG4gICAgc2V0IHRvcCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGJvdHRvbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgKyB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgYm90dG9tKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueSArIHRoaXMuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGRpcnR5IChpLmUuLCBuZWVkcyB0byBiZSByZW5kZXJlcmVkIHRvIHRoZSBzY3JlZW4gYmVjYXVzZSBvZiBhIGNoYW5nZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgZGlydHkoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJ0eVxyXG4gICAgfVxyXG4gICAgc2V0IGRpcnR5KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBlcm1hbmVudGx5IGNoYW5nZXMgdGhlIFZpZXdwb3J0J3MgaGl0QXJlYVxyXG4gICAgICogPHA+Tk9URTogbm9ybWFsbHkgdGhlIGhpdEFyZWEgPSBQSVhJLlJlY3RhbmdsZShWaWV3cG9ydC5sZWZ0LCBWaWV3cG9ydC50b3AsIFZpZXdwb3J0LndvcmxkU2NyZWVuV2lkdGgsIFZpZXdwb3J0LndvcmxkU2NyZWVuSGVpZ2h0KTwvcD5cclxuICAgICAqIEB0eXBlIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfVxyXG4gICAgICovXHJcbiAgICBnZXQgZm9yY2VIaXRBcmVhKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VIaXRBcmVhXHJcbiAgICB9XHJcbiAgICBzZXQgZm9yY2VIaXRBcmVhKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgb2YgbW91c2UvdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50RG93blBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGVmdERvd24gPyAxIDogMCkgKyB0aGlzLnRvdWNoZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiB0b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXMuaW5kZXhPZihwb2ludGVyLnBvaW50ZXJJZCkgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgb2YgcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkludGVyYWN0aW9uVHJhY2tpbmdEYXRhW119XHJcbiAgICAgKi9cclxuICAgIGdldFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBvaW50ZXJzW2tleV0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcHMgYW5kIHJlc2V0cyBib3VuY2UgYW5kIGRlY2VsZXJhdGUgKGFzIG5lZWRlZCkgYWZ0ZXIgbWFudWFsbHkgbW92aW5nIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2JvdW5jZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5yZXNldCgpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10uYm91bmNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydzbmFwJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQTFVHSU5TXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGluc3RhbGxlZCBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZW1vdmVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmVtaXQodHlwZSArICctcmVtb3ZlJylcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2UgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcGF1c2VQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnBhdXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXN1bWUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVzdW1lUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXN1bWUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNvcnQgcGx1Z2lucyBmb3IgdXBkYXRlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcGx1Z2luc1NvcnQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc0xpc3QgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc0xpc3QucHVzaCh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSBkaXJlY3Rpb24gdG8gZHJhZyAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xMF0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGRyYWcob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RyYWcnXSA9IG5ldyBEcmFnKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wIHRvIHdvcmxkIGJvdW5kYXJpZXMgb3Igb3RoZXIgcHJvdmlkZWQgYm91bmRhcmllc1xyXG4gICAgICogTk9URVM6XHJcbiAgICAgKiAgIGNsYW1wIGlzIGRpc2FibGVkIGlmIGNhbGxlZCB3aXRoIG5vIG9wdGlvbnM7IHVzZSB7IGRpcmVjdGlvbjogJ2FsbCcgfSBmb3IgYWxsIGVkZ2UgY2xhbXBpbmdcclxuICAgICAqICAgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmxlZnRdIGNsYW1wIGxlZnQ7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5yaWdodF0gY2xhbXAgcmlnaHQ7IHRydWU9dmlld3BvcnQud29ybGRXaWR0aFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy50b3BdIGNsYW1wIHRvcDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmJvdHRvbV0gY2xhbXAgYm90dG9tOyB0cnVlPXZpZXdwb3J0LndvcmxkSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uXSAoYWxsLCB4LCBvciB5KSB1c2luZyBjbGFtcHMgb2YgWzAsIHZpZXdwb3J0LndvcmxkV2lkdGgvdmlld3BvcnQud29ybGRIZWlnaHRdOyByZXBsYWNlcyBsZWZ0L3JpZ2h0L3RvcC9ib3R0b20gaWYgc2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXAob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10gPSBuZXcgQ2xhbXAodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVjZWxlcmF0ZSBhZnRlciBhIG1vdmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBkZWNlbGVyYXRlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10gPSBuZXcgRGVjZWxlcmF0ZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBib3VuY2Ugb24gYm9yZGVyc1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGJvdW5jZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10gPSBuZXcgQm91bmNlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBwaW5jaCB0byB6b29tIGFuZCB0d28tZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MS4wXSBwZXJjZW50IHRvIG1vZGlmeSBwaW5jaCBzcGVlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RyYWddIGRpc2FibGUgdHdvLWZpbmdlciBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHR3byBmaW5nZXJzXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBwaW5jaChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1sncGluY2gnXSA9IG5ldyBQaW5jaCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzbmFwIHRvIGEgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50b3BMZWZ0XSBzbmFwIHRvIHRoZSB0b3AtbGVmdCBvZiB2aWV3cG9ydCBpbnN0ZWFkIG9mIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZvbGxvdyh0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydmb2xsb3cnXSA9IG5ldyBGb2xsb3codGhpcywgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHVzaW5nIG1vdXNlIHdoZWVsXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICB3aGVlbChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snd2hlZWwnXSA9IG5ldyBXaGVlbCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXBpbmcgb2Ygem9vbSB0byBjb25zdHJhaW50c1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSA9IG5ldyBDbGFtcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2Nyb2xsIHZpZXdwb3J0IHdoZW4gbW91c2UgaG92ZXJzIG5lYXIgb25lIG9mIHRoZSBlZGdlcyBvciByYWRpdXMtZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKi9cclxuICAgIG1vdXNlRWRnZXMob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ21vdXNlLWVkZ2VzJ10gPSBuZXcgTW91c2VFZGdlcyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSB2aWV3cG9ydCAoaW5jbHVkaW5nIGFuaW1hdGlvbiB1cGRhdGVzIHN1Y2ggYXMgZGVjZWxlcmF0ZSlcclxuICAgICAqIE5PVEU6IHdoZW4gc2V0dGluZyBwYXVzZT10cnVlLCBhbGwgdG91Y2hlcyBhbmQgbW91c2UgYWN0aW9ucyBhcmUgY2xlYXJlZCAoaS5lLiwgaWYgbW91c2Vkb3duIHdhcyBhY3RpdmUsIGl0IGJlY29tZXMgaW5hY3RpdmUgZm9yIHB1cnBvc2VzIG9mIHRoZSB2aWV3cG9ydClcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLl9wYXVzZSB9XHJcbiAgICBzZXQgcGF1c2UodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fcGF1c2UgPSB2YWx1ZVxyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIGFmdGVyIGEgbW91c2Ugb3IgdG91Y2ggY2xpY2tcclxuICogQGV2ZW50IFZpZXdwb3J0I2NsaWNrZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1zdGFydFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1lbmRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIGVuZFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGZvciBhIG1vdXNlIHdoZWVsIGV2ZW50XHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge29iamVjdH0gd2hlZWxcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR4XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keVxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHpcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHdoZWVsLXNjcm9sbCBvY2N1cnNcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsLXNjcm9sbFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBtb3VzZS1lZGdlIHN0YXJ0cyB0byBzY3JvbGxcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2Utc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBtb3VzZS1lZGdlIHNjcm9sbGluZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgbW92ZXMgdGhyb3VnaCBVSSBpbnRlcmFjdGlvbiwgZGVjZWxlcmF0aW9uLCBvciBmb2xsb3dcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdmVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLCBzbmFwLCBwaW5jaCwgZm9sbG93LCBib3VuY2UteCwgYm91bmNlLXksIGNsYW1wLXgsIGNsYW1wLXksIGRlY2VsZXJhdGUsIG1vdXNlLWVkZ2VzLCB3aGVlbClcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjem9vbWVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLXpvb20sIHBpbmNoLCB3aGVlbCwgY2xhbXAtem9vbSlcclxuICovXHJcblxyXG5pZiAodHlwZW9mIFBJWEkgIT09ICd1bmRlZmluZWQnKVxyXG57XHJcbiAgICBQSVhJLmV4dHJhcy5WaWV3cG9ydCA9IFZpZXdwb3J0XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnRcclxuIl19