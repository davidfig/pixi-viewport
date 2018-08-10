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
     * @param {number} [options.threshold = 5] number of pixels to move to trigger an input event (e.g., drag, pinch)
     * @param {(PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle)} [options.forceHitArea] change the default hitArea from world size to a new value
     * @param {PIXI.ticker.Ticker} [options.ticker=PIXI.ticker.shared] use this PIXI.ticker for updates
     * @param {PIXI.InteractionManager} [options.interaction=null] InteractionManager, used to calculate pointer postion relative to
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
        value: function destroy() {
            _get(Viewport.prototype.__proto__ || Object.getPrototypeOf(Viewport.prototype), 'destroy', this).call(this);
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
            }
            if (!this.forceHitArea) {
                this.hitArea.x = this.left;
                this.hitArea.y = this.top;
                this.hitArea.width = this.worldScreenWidth;
                this.hitArea.height = this.worldScreenHeight;
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
            div.addEventListener('wheel', this.wheelFunction);
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
                if ((!decelerate || !decelerate.x && !decelerate.y) && (!bounce || !bounce.toX && !bounce.toY)) {
                    this.clickedAvailable = true;
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
            var point = this.toLocal({ x: e.clientX, y: e.clientY });
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
         * @return {Viewport} this
         */

    }, {
        key: 'fitWidth',
        value: function fitWidth(width, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            width = width || this.worldWidth;
            this.scale.x = this.screenWidth / width;
            this.scale.y = this.scale.x;
            if (center) {
                this.moveCenter(save);
            }
            return this;
        }

        /**
         * change zoom so the height fits in the viewport
         * @param {number} [height=this._worldHeight] in world coordinates
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fitHeight',
        value: function fitHeight(height, center) {
            var save = void 0;
            if (center) {
                save = this.center;
            }
            height = height || this.worldHeight;
            this.scale.y = this.screenHeight / height;
            this.scale.x = this.scale.y;
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
            this.dirty = true;
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

PIXI.extras.Viewport = Viewport;

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImRpdiIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJ0aWNrZXJGdW5jdGlvbiIsInVwZGF0ZSIsImFkZCIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ3aGVlbEZ1bmN0aW9uIiwicmVtb3ZlTGlzdGVuZXJzIiwicGF1c2UiLCJwbHVnaW4iLCJlbGFwc2VkTVMiLCJoaXRBcmVhIiwieCIsImxlZnQiLCJ5IiwidG9wIiwid2lkdGgiLCJ3b3JsZFNjcmVlbldpZHRoIiwiaGVpZ2h0Iiwid29ybGRTY3JlZW5IZWlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJyZXNpemVQbHVnaW5zIiwicmVzaXplIiwiaW50ZXJhY3RpdmUiLCJSZWN0YW5nbGUiLCJvbiIsImRvd24iLCJtb3ZlIiwidXAiLCJlIiwiaGFuZGxlV2hlZWwiLCJhZGRFdmVudExpc3RlbmVyIiwibGVmdERvd24iLCJkYXRhIiwicG9pbnRlclR5cGUiLCJvcmlnaW5hbEV2ZW50IiwiYnV0dG9uIiwicHVzaCIsInBvaW50ZXJJZCIsImNvdW50RG93blBvaW50ZXJzIiwibGFzdCIsImdsb2JhbCIsImRlY2VsZXJhdGUiLCJib3VuY2UiLCJ0b1giLCJ0b1kiLCJjbGlja2VkQXZhaWxhYmxlIiwiY2hhbmdlIiwiTWF0aCIsImFicyIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIk1vdXNlRXZlbnQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwicG9pbnQiLCJ0b0xvY2FsIiwiY2xpZW50WCIsImNsaWVudFkiLCJyaWdodCIsImJvdHRvbSIsInJlc3VsdCIsIndoZWVsIiwiYXJndW1lbnRzIiwidG9HbG9iYWwiLCJpc05hTiIsInBvc2l0aW9uIiwic2V0Iiwic2NhbGUiLCJfcmVzZXQiLCJjZW50ZXIiLCJzYXZlIiwibW92ZUNlbnRlciIsInBlcmNlbnQiLCJmaXRXaWR0aCIsInBsdWdpbnNTb3J0IiwiY29ybmVyUG9pbnQiLCJyZXN1bHRzIiwicG9pbnRlcnMiLCJ0cmFja2VkUG9pbnRlcnMiLCJrZXkiLCJwb2ludGVyIiwiaW5kZXhPZiIsInJlc2V0IiwiY2xhbXAiLCJkaXJ0eSIsInR5cGUiLCJyZXN1bWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm1vdmVDb3JuZXIiLCJfZGlydHkiLCJfZm9yY2VIaXRBcmVhIiwiX3BhdXNlIiwiQ29udGFpbmVyIiwiZXh0cmFzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUcsUUFBUUgsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNSSxZQUFZSixRQUFRLGNBQVIsQ0FBbEI7QUFDQSxJQUFNSyxhQUFhTCxRQUFRLGNBQVIsQ0FBbkI7QUFDQSxJQUFNTSxTQUFTTixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1PLE9BQU9QLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFBTVEsV0FBV1IsUUFBUSxhQUFSLENBQWpCO0FBQ0EsSUFBTVMsU0FBU1QsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNVSxRQUFRVixRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU1XLGFBQWFYLFFBQVEsZUFBUixDQUFuQjs7QUFFQSxJQUFNWSxlQUFlLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsT0FBbEIsRUFBMkIsUUFBM0IsRUFBcUMsYUFBckMsRUFBb0QsWUFBcEQsRUFBa0UsUUFBbEUsRUFBNEUsV0FBNUUsRUFBeUYsWUFBekYsRUFBdUcsTUFBdkcsRUFBK0csT0FBL0csQ0FBckI7O0lBRU1DLFE7OztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NBLHNCQUFZQyxPQUFaLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREo7O0FBR0ksY0FBS0MsT0FBTCxHQUFlLEVBQWY7QUFDQSxjQUFLQyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQkgsUUFBUUksV0FBNUI7QUFDQSxjQUFLQyxhQUFMLEdBQXFCTCxRQUFRTSxZQUE3QjtBQUNBLGNBQUtDLFdBQUwsR0FBbUJQLFFBQVFRLFVBQTNCO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQlQsUUFBUVUsV0FBNUI7QUFDQSxjQUFLQyxpQkFBTCxHQUF5QjFCLE1BQU0yQixRQUFOLENBQWVaLFFBQVFXLGlCQUF2QixFQUEwQyxJQUExQyxDQUF6QjtBQUNBLGNBQUtFLFlBQUwsR0FBb0JiLFFBQVFhLFlBQTVCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQjdCLE1BQU0yQixRQUFOLENBQWVaLFFBQVFjLFNBQXZCLEVBQWtDLENBQWxDLENBQWpCO0FBQ0EsY0FBS0MsV0FBTCxHQUFtQmYsUUFBUWUsV0FBUixJQUF1QixJQUExQztBQUNBLGNBQUtDLEdBQUwsR0FBV2hCLFFBQVFpQixRQUFSLElBQW9CQyxTQUFTQyxJQUF4QztBQUNBLGNBQUtDLFNBQUwsQ0FBZSxNQUFLSixHQUFwQjs7QUFFQTs7Ozs7QUFLQSxjQUFLSyxPQUFMLEdBQWUsRUFBZjs7QUFFQSxjQUFLQyxNQUFMLEdBQWN0QixRQUFRc0IsTUFBUixJQUFrQkMsS0FBS0QsTUFBTCxDQUFZRSxNQUE1QztBQUNBLGNBQUtDLGNBQUwsR0FBc0I7QUFBQSxtQkFBTSxNQUFLQyxNQUFMLEVBQU47QUFBQSxTQUF0QjtBQUNBLGNBQUtKLE1BQUwsQ0FBWUssR0FBWixDQUFnQixNQUFLRixjQUFyQjtBQXpCSjtBQTBCQzs7QUFFRDs7Ozs7Ozs7MENBS0E7QUFDSSxpQkFBS0gsTUFBTCxDQUFZTSxNQUFaLENBQW1CLEtBQUtILGNBQXhCO0FBQ0EsaUJBQUtULEdBQUwsQ0FBU2EsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBc0MsS0FBS0MsYUFBM0M7QUFDSDs7QUFFRDs7Ozs7O2tDQUlBO0FBQ0k7QUFDQSxpQkFBS0MsZUFBTDtBQUNIOztBQUVEOzs7Ozs7O2lDQUtBO0FBQ0ksZ0JBQUksQ0FBQyxLQUFLQyxLQUFWLEVBQ0E7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSx5Q0FBbUIsS0FBSzlCLFdBQXhCLDhIQUNBO0FBQUEsNEJBRFMrQixNQUNUOztBQUNJQSwrQkFBT1AsTUFBUCxDQUFjLEtBQUtKLE1BQUwsQ0FBWVksU0FBMUI7QUFDSDtBQUpMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLQztBQUNELGdCQUFJLENBQUMsS0FBS3JCLFlBQVYsRUFDQTtBQUNJLHFCQUFLc0IsT0FBTCxDQUFhQyxDQUFiLEdBQWlCLEtBQUtDLElBQXRCO0FBQ0EscUJBQUtGLE9BQUwsQ0FBYUcsQ0FBYixHQUFpQixLQUFLQyxHQUF0QjtBQUNBLHFCQUFLSixPQUFMLENBQWFLLEtBQWIsR0FBcUIsS0FBS0MsZ0JBQTFCO0FBQ0EscUJBQUtOLE9BQUwsQ0FBYU8sTUFBYixHQUFzQixLQUFLQyxpQkFBM0I7QUFDSDtBQUNKOztBQUVEOzs7Ozs7Ozs7OytCQU9PdkMsVyxFQUFhRSxZLEVBQWNFLFUsRUFBWUUsVyxFQUM5QztBQUNJLGlCQUFLUCxZQUFMLEdBQW9CQyxlQUFld0MsT0FBT0MsVUFBMUM7QUFDQSxpQkFBS3hDLGFBQUwsR0FBcUJDLGdCQUFnQnNDLE9BQU9FLFdBQTVDO0FBQ0EsaUJBQUt2QyxXQUFMLEdBQW1CQyxVQUFuQjtBQUNBLGlCQUFLQyxZQUFMLEdBQW9CQyxXQUFwQjtBQUNBLGlCQUFLcUMsYUFBTDtBQUNIOztBQUVEOzs7Ozs7O3dDQUtBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0ksc0NBQW1CLEtBQUs3QyxXQUF4QixtSUFDQTtBQUFBLHdCQURTK0IsTUFDVDs7QUFDSUEsMkJBQU9lLE1BQVA7QUFDSDtBQUpMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLQzs7QUFFRDs7Ozs7Ozs7O0FBb0VBOzs7O2tDQUlVaEMsRyxFQUNWO0FBQUE7O0FBQ0ksaUJBQUtpQyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLcEMsWUFBVixFQUNBO0FBQ0kscUJBQUtzQixPQUFMLEdBQWUsSUFBSVosS0FBSzJCLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsS0FBSzFDLFVBQTlCLEVBQTBDLEtBQUtFLFdBQS9DLENBQWY7QUFDSDtBQUNELGlCQUFLeUMsRUFBTCxDQUFRLGFBQVIsRUFBdUIsS0FBS0MsSUFBNUI7QUFDQSxpQkFBS0QsRUFBTCxDQUFRLGFBQVIsRUFBdUIsS0FBS0UsSUFBNUI7QUFDQSxpQkFBS0YsRUFBTCxDQUFRLFdBQVIsRUFBcUIsS0FBS0csRUFBMUI7QUFDQSxpQkFBS0gsRUFBTCxDQUFRLGtCQUFSLEVBQTRCLEtBQUtHLEVBQWpDO0FBQ0EsaUJBQUtILEVBQUwsQ0FBUSxlQUFSLEVBQXlCLEtBQUtHLEVBQTlCO0FBQ0EsaUJBQUtILEVBQUwsQ0FBUSxZQUFSLEVBQXNCLEtBQUtHLEVBQTNCO0FBQ0EsaUJBQUt4QixhQUFMLEdBQXFCLFVBQUN5QixDQUFEO0FBQUEsdUJBQU8sT0FBS0MsV0FBTCxDQUFpQkQsQ0FBakIsQ0FBUDtBQUFBLGFBQXJCO0FBQ0F2QyxnQkFBSXlDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLEtBQUszQixhQUFuQztBQUNBLGlCQUFLNEIsUUFBTCxHQUFnQixLQUFoQjtBQUNIOztBQUVEOzs7Ozs7OzZCQUlLSCxDLEVBQ0w7QUFDSSxnQkFBSSxLQUFLdkIsS0FBVCxFQUNBO0FBQ0k7QUFDSDtBQUNELGdCQUFJdUIsRUFBRUksSUFBRixDQUFPQyxXQUFQLEtBQXVCLE9BQTNCLEVBQ0E7QUFDSSxvQkFBSUwsRUFBRUksSUFBRixDQUFPRSxhQUFQLENBQXFCQyxNQUFyQixJQUErQixDQUFuQyxFQUNBO0FBQ0kseUJBQUtKLFFBQUwsR0FBZ0IsSUFBaEI7QUFDSDtBQUNKLGFBTkQsTUFRQTtBQUNJLHFCQUFLckMsT0FBTCxDQUFhMEMsSUFBYixDQUFrQlIsRUFBRUksSUFBRixDQUFPSyxTQUF6QjtBQUNIOztBQUVELGdCQUFJLEtBQUtDLGlCQUFMLE9BQTZCLENBQWpDLEVBQ0E7QUFDSSxxQkFBS0MsSUFBTCxHQUFZLEVBQUU5QixHQUFHbUIsRUFBRUksSUFBRixDQUFPUSxNQUFQLENBQWMvQixDQUFuQixFQUFzQkUsR0FBR2lCLEVBQUVJLElBQUYsQ0FBT1EsTUFBUCxDQUFjN0I7O0FBRW5EO0FBRlksaUJBQVosQ0FHQSxJQUFNOEIsYUFBYSxLQUFLbkUsT0FBTCxDQUFhLFlBQWIsQ0FBbkI7QUFDQSxvQkFBTW9FLFNBQVMsS0FBS3BFLE9BQUwsQ0FBYSxRQUFiLENBQWY7QUFDQSxvQkFBSSxDQUFDLENBQUNtRSxVQUFELElBQWdCLENBQUNBLFdBQVdoQyxDQUFaLElBQWlCLENBQUNnQyxXQUFXOUIsQ0FBOUMsTUFBc0QsQ0FBQytCLE1BQUQsSUFBWSxDQUFDQSxPQUFPQyxHQUFSLElBQWUsQ0FBQ0QsT0FBT0UsR0FBekYsQ0FBSixFQUNBO0FBQ0kseUJBQUtDLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0g7QUFDSixhQVhELE1BYUE7QUFDSSxxQkFBS0EsZ0JBQUwsR0FBd0IsS0FBeEI7QUFDSDs7QUFoQ0w7QUFBQTtBQUFBOztBQUFBO0FBa0NJLHNDQUFtQixLQUFLdEUsV0FBeEIsbUlBQ0E7QUFBQSx3QkFEUytCLE1BQ1Q7O0FBQ0lBLDJCQUFPbUIsSUFBUCxDQUFZRyxDQUFaO0FBQ0g7QUFyQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXNDQzs7QUFFRDs7Ozs7Ozs7dUNBS2VrQixNLEVBQ2Y7QUFDSSxnQkFBSUMsS0FBS0MsR0FBTCxDQUFTRixNQUFULEtBQW9CLEtBQUszRCxTQUE3QixFQUNBO0FBQ0ksdUJBQU8sSUFBUDtBQUNIO0FBQ0QsbUJBQU8sS0FBUDtBQUNIOztBQUVEOzs7Ozs7OzZCQUlLeUMsQyxFQUNMO0FBQ0ksZ0JBQUksS0FBS3ZCLEtBQVQsRUFDQTtBQUNJO0FBQ0g7O0FBSkw7QUFBQTtBQUFBOztBQUFBO0FBTUksc0NBQW1CLEtBQUs5QixXQUF4QixtSUFDQTtBQUFBLHdCQURTK0IsTUFDVDs7QUFDSUEsMkJBQU9vQixJQUFQLENBQVlFLENBQVo7QUFDSDtBQVRMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBV0ksZ0JBQUksS0FBS2lCLGdCQUFULEVBQ0E7QUFDSSxvQkFBTUksUUFBUXJCLEVBQUVJLElBQUYsQ0FBT1EsTUFBUCxDQUFjL0IsQ0FBZCxHQUFrQixLQUFLOEIsSUFBTCxDQUFVOUIsQ0FBMUM7QUFDQSxvQkFBTXlDLFFBQVF0QixFQUFFSSxJQUFGLENBQU9RLE1BQVAsQ0FBYzdCLENBQWQsR0FBa0IsS0FBSzRCLElBQUwsQ0FBVTVCLENBQTFDO0FBQ0Esb0JBQUksS0FBS3dDLGNBQUwsQ0FBb0JGLEtBQXBCLEtBQThCLEtBQUtFLGNBQUwsQ0FBb0JELEtBQXBCLENBQWxDLEVBQ0E7QUFDSSx5QkFBS0wsZ0JBQUwsR0FBd0IsS0FBeEI7QUFDSDtBQUNKO0FBQ0o7O0FBRUQ7Ozs7Ozs7MkJBSUdqQixDLEVBQ0g7QUFDSSxnQkFBSSxLQUFLdkIsS0FBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSXVCLEVBQUVJLElBQUYsQ0FBT0UsYUFBUCxZQUFnQ2tCLFVBQWhDLElBQThDeEIsRUFBRUksSUFBRixDQUFPRSxhQUFQLENBQXFCQyxNQUFyQixJQUErQixDQUFqRixFQUNBO0FBQ0kscUJBQUtKLFFBQUwsR0FBZ0IsS0FBaEI7QUFDSDs7QUFFRCxnQkFBSUgsRUFBRUksSUFBRixDQUFPQyxXQUFQLEtBQXVCLE9BQTNCLEVBQ0E7QUFDSSxxQkFBSyxJQUFJb0IsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUszRCxPQUFMLENBQWE0RCxNQUFqQyxFQUF5Q0QsR0FBekMsRUFDQTtBQUNJLHdCQUFJLEtBQUszRCxPQUFMLENBQWEyRCxDQUFiLE1BQW9CekIsRUFBRUksSUFBRixDQUFPSyxTQUEvQixFQUNBO0FBQ0ksNkJBQUszQyxPQUFMLENBQWE2RCxNQUFiLENBQW9CRixDQUFwQixFQUF1QixDQUF2QjtBQUNBO0FBQ0g7QUFDSjtBQUNKOztBQXJCTDtBQUFBO0FBQUE7O0FBQUE7QUF1Qkksc0NBQW1CLEtBQUs5RSxXQUF4QixtSUFDQTtBQUFBLHdCQURTK0IsTUFDVDs7QUFDSUEsMkJBQU9xQixFQUFQLENBQVVDLENBQVY7QUFDSDtBQTFCTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTRCSSxnQkFBSSxLQUFLaUIsZ0JBQUwsSUFBeUIsS0FBS1AsaUJBQUwsT0FBNkIsQ0FBMUQsRUFDQTtBQUNJLHFCQUFLa0IsSUFBTCxDQUFVLFNBQVYsRUFBcUIsRUFBRUMsUUFBUSxLQUFLbEIsSUFBZixFQUFxQm1CLE9BQU8sS0FBS0MsT0FBTCxDQUFhLEtBQUtwQixJQUFsQixDQUE1QixFQUFxRHFCLFVBQVUsSUFBL0QsRUFBckI7QUFDQSxxQkFBS2YsZ0JBQUwsR0FBd0IsS0FBeEI7QUFDSDtBQUNKOztBQUVEOzs7Ozs7O29DQUlZakIsQyxFQUNaO0FBQ0ksZ0JBQUksS0FBS3ZCLEtBQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBTXdELFFBQVEsS0FBS0MsT0FBTCxDQUFhLEVBQUVyRCxHQUFHbUIsRUFBRW1DLE9BQVAsRUFBZ0JwRCxHQUFHaUIsRUFBRW9DLE9BQXJCLEVBQWIsQ0FBZDtBQUNBLGdCQUFJLEtBQUt0RCxJQUFMLElBQWFtRCxNQUFNcEQsQ0FBbkIsSUFBd0JvRCxNQUFNcEQsQ0FBTixJQUFXLEtBQUt3RCxLQUF4QyxJQUFpRCxLQUFLckQsR0FBTCxJQUFZaUQsTUFBTWxELENBQW5FLElBQXdFa0QsTUFBTWxELENBQU4sSUFBVyxLQUFLdUQsTUFBNUYsRUFDQTtBQUNJLG9CQUFJQyxlQUFKO0FBREo7QUFBQTtBQUFBOztBQUFBO0FBRUksMENBQW1CLEtBQUs1RixXQUF4QixtSUFDQTtBQUFBLDRCQURTK0IsTUFDVDs7QUFDSSw0QkFBSUEsT0FBTzhELEtBQVAsQ0FBYXhDLENBQWIsQ0FBSixFQUNBO0FBQ0l1QyxxQ0FBUyxJQUFUO0FBQ0g7QUFDSjtBQVJMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU0ksdUJBQU9BLE1BQVA7QUFDSDtBQUNKOztBQUVEOzs7Ozs7Ozs7a0NBT0E7QUFDSSxnQkFBSUUsVUFBVWYsTUFBVixLQUFxQixDQUF6QixFQUNBO0FBQ0ksb0JBQU03QyxJQUFJNEQsVUFBVSxDQUFWLENBQVY7QUFDQSxvQkFBTTFELElBQUkwRCxVQUFVLENBQVYsQ0FBVjtBQUNBLHVCQUFPLEtBQUtQLE9BQUwsQ0FBYSxFQUFFckQsSUFBRixFQUFLRSxJQUFMLEVBQWIsQ0FBUDtBQUNILGFBTEQsTUFPQTtBQUNJLHVCQUFPLEtBQUttRCxPQUFMLENBQWFPLFVBQVUsQ0FBVixDQUFiLENBQVA7QUFDSDtBQUNKOztBQUVEOzs7Ozs7Ozs7bUNBT0E7QUFDSSxnQkFBSUEsVUFBVWYsTUFBVixLQUFxQixDQUF6QixFQUNBO0FBQ0ksb0JBQU03QyxJQUFJNEQsVUFBVSxDQUFWLENBQVY7QUFDQSxvQkFBTTFELElBQUkwRCxVQUFVLENBQVYsQ0FBVjtBQUNBLHVCQUFPLEtBQUtDLFFBQUwsQ0FBYyxFQUFFN0QsSUFBRixFQUFLRSxJQUFMLEVBQWQsQ0FBUDtBQUNILGFBTEQsTUFPQTtBQUNJLG9CQUFNa0QsUUFBUVEsVUFBVSxDQUFWLENBQWQ7QUFDQSx1QkFBTyxLQUFLQyxRQUFMLENBQWNULEtBQWQsQ0FBUDtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7Ozs7QUFxREE7Ozs7OztxQ0FNVyxxQkFDWDtBQUNJLGdCQUFJcEQsVUFBSjtBQUFBLGdCQUFPRSxVQUFQO0FBQ0EsZ0JBQUksQ0FBQzRELE1BQU1GLFVBQVUsQ0FBVixDQUFOLENBQUwsRUFDQTtBQUNJNUQsb0JBQUk0RCxVQUFVLENBQVYsQ0FBSjtBQUNBMUQsb0JBQUkwRCxVQUFVLENBQVYsQ0FBSjtBQUNILGFBSkQsTUFNQTtBQUNJNUQsb0JBQUk0RCxVQUFVLENBQVYsRUFBYTVELENBQWpCO0FBQ0FFLG9CQUFJMEQsVUFBVSxDQUFWLEVBQWExRCxDQUFqQjtBQUNIO0FBQ0QsaUJBQUs2RCxRQUFMLENBQWNDLEdBQWQsQ0FBa0IsQ0FBQyxLQUFLM0QsZ0JBQUwsR0FBd0IsQ0FBeEIsR0FBNEJMLENBQTdCLElBQWtDLEtBQUtpRSxLQUFMLENBQVdqRSxDQUEvRCxFQUFrRSxDQUFDLEtBQUtPLGlCQUFMLEdBQXlCLENBQXpCLEdBQTZCTCxDQUE5QixJQUFtQyxLQUFLK0QsS0FBTCxDQUFXL0QsQ0FBaEg7QUFDQSxpQkFBS2dFLE1BQUw7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztBQWFBOzs7Ozs7cUNBTVcsZ0JBQ1g7QUFDSSxnQkFBSU4sVUFBVWYsTUFBVixLQUFxQixDQUF6QixFQUNBO0FBQ0kscUJBQUtrQixRQUFMLENBQWNDLEdBQWQsQ0FBa0IsQ0FBQ0osVUFBVSxDQUFWLEVBQWE1RCxDQUFkLEdBQWtCLEtBQUtpRSxLQUFMLENBQVdqRSxDQUEvQyxFQUFrRCxDQUFDNEQsVUFBVSxDQUFWLEVBQWExRCxDQUFkLEdBQWtCLEtBQUsrRCxLQUFMLENBQVcvRCxDQUEvRTtBQUNILGFBSEQsTUFLQTtBQUNJLHFCQUFLNkQsUUFBTCxDQUFjQyxHQUFkLENBQWtCLENBQUNKLFVBQVUsQ0FBVixDQUFELEdBQWdCLEtBQUtLLEtBQUwsQ0FBV2pFLENBQTdDLEVBQWdELENBQUM0RCxVQUFVLENBQVYsQ0FBRCxHQUFnQixLQUFLSyxLQUFMLENBQVcvRCxDQUEzRTtBQUNIO0FBQ0QsaUJBQUtnRSxNQUFMO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7aUNBTVM5RCxLLEVBQU8rRCxNLEVBQ2hCO0FBQ0ksZ0JBQUlDLGFBQUo7QUFDQSxnQkFBSUQsTUFBSixFQUNBO0FBQ0lDLHVCQUFPLEtBQUtELE1BQVo7QUFDSDtBQUNEL0Qsb0JBQVFBLFNBQVMsS0FBS2hDLFVBQXRCO0FBQ0EsaUJBQUs2RixLQUFMLENBQVdqRSxDQUFYLEdBQWUsS0FBS2hDLFdBQUwsR0FBbUJvQyxLQUFsQztBQUNBLGlCQUFLNkQsS0FBTCxDQUFXL0QsQ0FBWCxHQUFlLEtBQUsrRCxLQUFMLENBQVdqRSxDQUExQjtBQUNBLGdCQUFJbUUsTUFBSixFQUNBO0FBQ0kscUJBQUtFLFVBQUwsQ0FBZ0JELElBQWhCO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztrQ0FNVTlELE0sRUFBUTZELE0sRUFDbEI7QUFDSSxnQkFBSUMsYUFBSjtBQUNBLGdCQUFJRCxNQUFKLEVBQ0E7QUFDSUMsdUJBQU8sS0FBS0QsTUFBWjtBQUNIO0FBQ0Q3RCxxQkFBU0EsVUFBVSxLQUFLaEMsV0FBeEI7QUFDQSxpQkFBSzJGLEtBQUwsQ0FBVy9ELENBQVgsR0FBZSxLQUFLaEMsWUFBTCxHQUFvQm9DLE1BQW5DO0FBQ0EsaUJBQUsyRCxLQUFMLENBQVdqRSxDQUFYLEdBQWUsS0FBS2lFLEtBQUwsQ0FBVy9ELENBQTFCO0FBQ0EsZ0JBQUlpRSxNQUFKLEVBQ0E7QUFDSSxxQkFBS0UsVUFBTCxDQUFnQkQsSUFBaEI7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7aUNBS1NELE0sRUFDVDtBQUNJLGdCQUFJQyxhQUFKO0FBQ0EsZ0JBQUlELE1BQUosRUFDQTtBQUNJQyx1QkFBTyxLQUFLRCxNQUFaO0FBQ0g7QUFDRCxpQkFBS0YsS0FBTCxDQUFXakUsQ0FBWCxHQUFlLEtBQUtqQyxZQUFMLEdBQW9CLEtBQUtJLFdBQXhDO0FBQ0EsaUJBQUs4RixLQUFMLENBQVcvRCxDQUFYLEdBQWUsS0FBS2pDLGFBQUwsR0FBcUIsS0FBS0ksWUFBekM7QUFDQSxnQkFBSSxLQUFLNEYsS0FBTCxDQUFXakUsQ0FBWCxHQUFlLEtBQUtpRSxLQUFMLENBQVcvRCxDQUE5QixFQUNBO0FBQ0kscUJBQUsrRCxLQUFMLENBQVcvRCxDQUFYLEdBQWUsS0FBSytELEtBQUwsQ0FBV2pFLENBQTFCO0FBQ0gsYUFIRCxNQUtBO0FBQ0kscUJBQUtpRSxLQUFMLENBQVdqRSxDQUFYLEdBQWUsS0FBS2lFLEtBQUwsQ0FBVy9ELENBQTFCO0FBQ0g7QUFDRCxnQkFBSWlFLE1BQUosRUFDQTtBQUNJLHFCQUFLRSxVQUFMLENBQWdCRCxJQUFoQjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7OzRCQU9JRCxNLEVBQVEvRCxLLEVBQU9FLE0sRUFDbkI7QUFDSSxnQkFBSThELGFBQUo7QUFDQSxnQkFBSUQsTUFBSixFQUNBO0FBQ0lDLHVCQUFPLEtBQUtELE1BQVo7QUFDSDtBQUNEL0Qsb0JBQVFBLFNBQVMsS0FBS2hDLFVBQXRCO0FBQ0FrQyxxQkFBU0EsVUFBVSxLQUFLaEMsV0FBeEI7QUFDQSxpQkFBSzJGLEtBQUwsQ0FBV2pFLENBQVgsR0FBZSxLQUFLaEMsV0FBTCxHQUFtQm9DLEtBQWxDO0FBQ0EsaUJBQUs2RCxLQUFMLENBQVcvRCxDQUFYLEdBQWUsS0FBS2hDLFlBQUwsR0FBb0JvQyxNQUFuQztBQUNBLGdCQUFJLEtBQUsyRCxLQUFMLENBQVdqRSxDQUFYLEdBQWUsS0FBS2lFLEtBQUwsQ0FBVy9ELENBQTlCLEVBQ0E7QUFDSSxxQkFBSytELEtBQUwsQ0FBVy9ELENBQVgsR0FBZSxLQUFLK0QsS0FBTCxDQUFXakUsQ0FBMUI7QUFDSCxhQUhELE1BS0E7QUFDSSxxQkFBS2lFLEtBQUwsQ0FBV2pFLENBQVgsR0FBZSxLQUFLaUUsS0FBTCxDQUFXL0QsQ0FBMUI7QUFDSDtBQUNELGdCQUFJaUUsTUFBSixFQUNBO0FBQ0kscUJBQUtFLFVBQUwsQ0FBZ0JELElBQWhCO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7OztvQ0FNWUUsTyxFQUFTSCxNLEVBQ3JCO0FBQ0ksZ0JBQUlDLGFBQUo7QUFDQSxnQkFBSUQsTUFBSixFQUNBO0FBQ0lDLHVCQUFPLEtBQUtELE1BQVo7QUFDSDtBQUNELGdCQUFNRixRQUFRLEtBQUtBLEtBQUwsQ0FBV2pFLENBQVgsR0FBZSxLQUFLaUUsS0FBTCxDQUFXakUsQ0FBWCxHQUFlc0UsT0FBNUM7QUFDQSxpQkFBS0wsS0FBTCxDQUFXRCxHQUFYLENBQWVDLEtBQWY7QUFDQSxnQkFBSUUsTUFBSixFQUNBO0FBQ0kscUJBQUtFLFVBQUwsQ0FBZ0JELElBQWhCO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs2QkFNSy9CLE0sRUFBUThCLE0sRUFDYjtBQUNJLGlCQUFLSSxRQUFMLENBQWNsQyxTQUFTLEtBQUtoQyxnQkFBNUIsRUFBOEM4RCxNQUE5QztBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O2lDQVlTdkcsTyxFQUNUO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxXQUFiLElBQTRCLElBQUlQLFFBQUosQ0FBYSxJQUFiLEVBQW1CTSxPQUFuQixDQUE1QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7OztBQVVBOzs7Ozs7Ozs4QkFNQTtBQUNJLGdCQUFNZCxTQUFTLEVBQWY7QUFDQUEsbUJBQU96RCxJQUFQLEdBQWMsS0FBS0EsSUFBTCxHQUFZLENBQTFCO0FBQ0F5RCxtQkFBT0YsS0FBUCxHQUFlLEtBQUtBLEtBQUwsR0FBYSxLQUFLckYsV0FBakM7QUFDQXVGLG1CQUFPdkQsR0FBUCxHQUFhLEtBQUtBLEdBQUwsR0FBVyxDQUF4QjtBQUNBdUQsbUJBQU9ELE1BQVAsR0FBZ0IsS0FBS0EsTUFBTCxHQUFjLEtBQUtwRixZQUFuQztBQUNBcUYsbUJBQU9lLFdBQVAsR0FBcUI7QUFDakJ6RSxtQkFBRyxLQUFLN0IsV0FBTCxHQUFtQixLQUFLOEYsS0FBTCxDQUFXakUsQ0FBOUIsR0FBa0MsS0FBS2pDLFlBRHpCO0FBRWpCbUMsbUJBQUcsS0FBSzdCLFlBQUwsR0FBb0IsS0FBSzRGLEtBQUwsQ0FBVy9ELENBQS9CLEdBQW1DLEtBQUtqQztBQUYxQixhQUFyQjtBQUlBLG1CQUFPeUYsTUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7QUEyRkE7Ozs7OzRDQU1BO0FBQ0ksbUJBQU8sQ0FBQyxLQUFLcEMsUUFBTCxHQUFnQixDQUFoQixHQUFvQixDQUFyQixJQUEwQixLQUFLckMsT0FBTCxDQUFhNEQsTUFBOUM7QUFDSDs7QUFFRDs7Ozs7Ozs7MkNBTUE7QUFDSSxnQkFBTTZCLFVBQVUsRUFBaEI7QUFDQSxnQkFBTUMsV0FBVyxLQUFLQyxlQUF0QjtBQUNBLGlCQUFLLElBQUlDLEdBQVQsSUFBZ0JGLFFBQWhCLEVBQ0E7QUFDSSxvQkFBTUcsVUFBVUgsU0FBU0UsR0FBVCxDQUFoQjtBQUNBLG9CQUFJLEtBQUs1RixPQUFMLENBQWE4RixPQUFiLENBQXFCRCxRQUFRbEQsU0FBN0IsTUFBNEMsQ0FBQyxDQUFqRCxFQUNBO0FBQ0k4Qyw0QkFBUS9DLElBQVIsQ0FBYW1ELE9BQWI7QUFDSDtBQUNKO0FBQ0QsbUJBQU9KLE9BQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7c0NBTUE7QUFDSSxnQkFBTUEsVUFBVSxFQUFoQjtBQUNBLGdCQUFNQyxXQUFXLEtBQUtDLGVBQXRCO0FBQ0EsaUJBQUssSUFBSUMsR0FBVCxJQUFnQkYsUUFBaEIsRUFDQTtBQUNJRCx3QkFBUS9DLElBQVIsQ0FBYWdELFNBQVNFLEdBQVQsQ0FBYjtBQUNIO0FBQ0QsbUJBQU9ILE9BQVA7QUFDSDs7QUFFRDs7Ozs7OztpQ0FLQTtBQUNJLGdCQUFJLEtBQUs3RyxPQUFMLENBQWEsUUFBYixDQUFKLEVBQ0E7QUFDSSxxQkFBS0EsT0FBTCxDQUFhLFFBQWIsRUFBdUJtSCxLQUF2QjtBQUNBLHFCQUFLbkgsT0FBTCxDQUFhLFFBQWIsRUFBdUJvRSxNQUF2QjtBQUNIO0FBQ0QsZ0JBQUksS0FBS3BFLE9BQUwsQ0FBYSxZQUFiLENBQUosRUFDQTtBQUNJLHFCQUFLQSxPQUFMLENBQWEsWUFBYixFQUEyQm1ILEtBQTNCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLbkgsT0FBTCxDQUFhLE1BQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUtBLE9BQUwsQ0FBYSxNQUFiLEVBQXFCbUgsS0FBckI7QUFDSDtBQUNELGdCQUFJLEtBQUtuSCxPQUFMLENBQWEsT0FBYixDQUFKLEVBQ0E7QUFDSSxxQkFBS0EsT0FBTCxDQUFhLE9BQWIsRUFBc0J5QixNQUF0QjtBQUNIO0FBQ0QsZ0JBQUksS0FBS3pCLE9BQUwsQ0FBYSxZQUFiLENBQUosRUFDQTtBQUNJLHFCQUFLQSxPQUFMLENBQWEsWUFBYixFQUEyQm9ILEtBQTNCO0FBQ0g7QUFDRCxpQkFBS0MsS0FBTCxHQUFhLElBQWI7QUFDSDs7QUFFRDs7QUFFQTs7Ozs7OztxQ0FJYUMsSSxFQUNiO0FBQ0ksZ0JBQUksS0FBS3RILE9BQUwsQ0FBYXNILElBQWIsQ0FBSixFQUNBO0FBQ0kscUJBQUt0SCxPQUFMLENBQWFzSCxJQUFiLElBQXFCLElBQXJCO0FBQ0EscUJBQUtwQyxJQUFMLENBQVVvQyxPQUFPLFNBQWpCO0FBQ0EscUJBQUtYLFdBQUw7QUFDSDtBQUNKOztBQUVEOzs7Ozs7O29DQUlZVyxJLEVBQ1o7QUFDSSxnQkFBSSxLQUFLdEgsT0FBTCxDQUFhc0gsSUFBYixDQUFKLEVBQ0E7QUFDSSxxQkFBS3RILE9BQUwsQ0FBYXNILElBQWIsRUFBbUJ2RixLQUFuQjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7cUNBSWF1RixJLEVBQ2I7QUFDSSxnQkFBSSxLQUFLdEgsT0FBTCxDQUFhc0gsSUFBYixDQUFKLEVBQ0E7QUFDSSxxQkFBS3RILE9BQUwsQ0FBYXNILElBQWIsRUFBbUJDLE1BQW5CO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7OztzQ0FLQTtBQUNJLGlCQUFLdEgsV0FBTCxHQUFtQixFQUFuQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHNDQUFtQkosWUFBbkIsbUlBQ0E7QUFBQSx3QkFEU21DLE1BQ1Q7O0FBQ0ksd0JBQUksS0FBS2hDLE9BQUwsQ0FBYWdDLE1BQWIsQ0FBSixFQUNBO0FBQ0ksNkJBQUsvQixXQUFMLENBQWlCNkQsSUFBakIsQ0FBc0IsS0FBSzlELE9BQUwsQ0FBYWdDLE1BQWIsQ0FBdEI7QUFDSDtBQUNKO0FBUkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVNDOztBQUVEOzs7Ozs7Ozs7Ozs7NkJBU0tqQyxPLEVBQ0w7QUFDSSxpQkFBS0MsT0FBTCxDQUFhLE1BQWIsSUFBdUIsSUFBSWQsSUFBSixDQUFTLElBQVQsRUFBZWEsT0FBZixDQUF2QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBY001RyxPLEVBQ047QUFDSSxpQkFBS0MsT0FBTCxDQUFhLE9BQWIsSUFBd0IsSUFBSVosS0FBSixDQUFVLElBQVYsRUFBZ0JXLE9BQWhCLENBQXhCO0FBQ0EsaUJBQUs0RyxXQUFMO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7OzttQ0FRVzVHLE8sRUFDWDtBQUNJLGlCQUFLQyxPQUFMLENBQWEsWUFBYixJQUE2QixJQUFJVixVQUFKLENBQWUsSUFBZixFQUFxQlMsT0FBckIsQ0FBN0I7QUFDQSxpQkFBSzRHLFdBQUw7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7OytCQVdPNUcsTyxFQUNQO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxRQUFiLElBQXlCLElBQUlULE1BQUosQ0FBVyxJQUFYLEVBQWlCUSxPQUFqQixDQUF6QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7OEJBUU01RyxPLEVBQ047QUFDSSxpQkFBS0MsT0FBTCxDQUFhLE9BQWIsSUFBd0IsSUFBSWIsS0FBSixDQUFVLElBQVYsRUFBZ0JZLE9BQWhCLENBQXhCO0FBQ0EsaUJBQUs0RyxXQUFMO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBZUt4RSxDLEVBQUdFLEMsRUFBR3RDLE8sRUFDWDtBQUNJLGlCQUFLQyxPQUFMLENBQWEsTUFBYixJQUF1QixJQUFJUixJQUFKLENBQVMsSUFBVCxFQUFlMkMsQ0FBZixFQUFrQkUsQ0FBbEIsRUFBcUJ0QyxPQUFyQixDQUF2QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7K0JBUU9hLE0sRUFBUXpILE8sRUFDZjtBQUNJLGlCQUFLQyxPQUFMLENBQWEsUUFBYixJQUF5QixJQUFJTixNQUFKLENBQVcsSUFBWCxFQUFpQjhILE1BQWpCLEVBQXlCekgsT0FBekIsQ0FBekI7QUFDQSxpQkFBSzRHLFdBQUw7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7OzhCQVFNNUcsTyxFQUNOO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxPQUFiLElBQXdCLElBQUlMLEtBQUosQ0FBVSxJQUFWLEVBQWdCSSxPQUFoQixDQUF4QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7OztrQ0FVVTVHLE8sRUFDVjtBQUNJLGlCQUFLQyxPQUFMLENBQWEsWUFBYixJQUE2QixJQUFJWCxTQUFKLENBQWMsSUFBZCxFQUFvQlUsT0FBcEIsQ0FBN0I7QUFDQSxpQkFBSzRHLFdBQUw7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQWNXNUcsTyxFQUNYO0FBQ0ksaUJBQUtDLE9BQUwsQ0FBYSxhQUFiLElBQThCLElBQUlKLFVBQUosQ0FBZSxJQUFmLEVBQXFCRyxPQUFyQixDQUE5QjtBQUNBLGlCQUFLNEcsV0FBTDtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7NEJBajlCQTtBQUNJLG1CQUFPLEtBQUt6RyxZQUFaO0FBQ0gsUzswQkFDZXVILEssRUFDaEI7QUFDSSxpQkFBS3ZILFlBQUwsR0FBb0J1SCxLQUFwQjtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksbUJBQU8sS0FBS3JILGFBQVo7QUFDSCxTOzBCQUNnQnFILEssRUFDakI7QUFDSSxpQkFBS3JILGFBQUwsR0FBcUJxSCxLQUFyQjtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksZ0JBQUksS0FBS25ILFdBQVQsRUFDQTtBQUNJLHVCQUFPLEtBQUtBLFdBQVo7QUFDSCxhQUhELE1BS0E7QUFDSSx1QkFBTyxLQUFLaUMsS0FBWjtBQUNIO0FBQ0osUzswQkFDY2tGLEssRUFDZjtBQUNJLGlCQUFLbkgsV0FBTCxHQUFtQm1ILEtBQW5CO0FBQ0EsaUJBQUszRSxhQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7NEJBS0E7QUFDSSxnQkFBSSxLQUFLdEMsWUFBVCxFQUNBO0FBQ0ksdUJBQU8sS0FBS0EsWUFBWjtBQUNILGFBSEQsTUFLQTtBQUNJLHVCQUFPLEtBQUtpQyxNQUFaO0FBQ0g7QUFDSixTOzBCQUNlZ0YsSyxFQUNoQjtBQUNJLGlCQUFLakgsWUFBTCxHQUFvQmlILEtBQXBCO0FBQ0EsaUJBQUszRSxhQUFMO0FBQ0g7Ozs0QkFnT0Q7QUFDSSxtQkFBTyxLQUFLNUMsWUFBTCxHQUFvQixLQUFLa0csS0FBTCxDQUFXakUsQ0FBdEM7QUFDSDs7QUFFRDs7Ozs7Ozs7NEJBTUE7QUFDSSxtQkFBTyxLQUFLL0IsYUFBTCxHQUFxQixLQUFLZ0csS0FBTCxDQUFXL0QsQ0FBdkM7QUFDSDs7QUFFRDs7Ozs7Ozs7NEJBTUE7QUFDSSxtQkFBTyxLQUFLL0IsV0FBTCxHQUFtQixLQUFLOEYsS0FBTCxDQUFXakUsQ0FBckM7QUFDSDs7QUFFRDs7Ozs7Ozs7NEJBTUE7QUFDSSxtQkFBTyxLQUFLM0IsWUFBTCxHQUFvQixLQUFLNEYsS0FBTCxDQUFXL0QsQ0FBdEM7QUFDSDs7QUFFRDs7Ozs7Ozs0QkFLQTtBQUNJLG1CQUFPLEVBQUVGLEdBQUcsS0FBS0ssZ0JBQUwsR0FBd0IsQ0FBeEIsR0FBNEIsS0FBS0wsQ0FBTCxHQUFTLEtBQUtpRSxLQUFMLENBQVdqRSxDQUFyRCxFQUF3REUsR0FBRyxLQUFLSyxpQkFBTCxHQUF5QixDQUF6QixHQUE2QixLQUFLTCxDQUFMLEdBQVMsS0FBSytELEtBQUwsQ0FBVy9ELENBQTVHLEVBQVA7QUFDSCxTOzBCQUNVb0YsSyxFQUNYO0FBQ0ksaUJBQUtqQixVQUFMLENBQWdCaUIsS0FBaEI7QUFDSDs7OzRCQStCRDtBQUNJLG1CQUFPLEVBQUV0RixHQUFHLENBQUMsS0FBS0EsQ0FBTixHQUFVLEtBQUtpRSxLQUFMLENBQVdqRSxDQUExQixFQUE2QkUsR0FBRyxDQUFDLEtBQUtBLENBQU4sR0FBVSxLQUFLK0QsS0FBTCxDQUFXL0QsQ0FBckQsRUFBUDtBQUNILFM7MEJBQ1VvRixLLEVBQ1g7QUFDSSxpQkFBS0MsVUFBTCxDQUFnQkQsS0FBaEI7QUFDSDs7OzRCQXlORDtBQUNJLG1CQUFPLENBQUMsS0FBS3RGLENBQU4sR0FBVSxLQUFLaUUsS0FBTCxDQUFXakUsQ0FBckIsR0FBeUIsS0FBS0ssZ0JBQXJDO0FBQ0gsUzswQkFDU2lGLEssRUFDVjtBQUNJLGlCQUFLdEYsQ0FBTCxHQUFTLENBQUNzRixLQUFELEdBQVMsS0FBS3JCLEtBQUwsQ0FBV2pFLENBQXBCLEdBQXdCLEtBQUtoQyxXQUF0QztBQUNBLGlCQUFLa0csTUFBTDtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksbUJBQU8sQ0FBQyxLQUFLbEUsQ0FBTixHQUFVLEtBQUtpRSxLQUFMLENBQVdqRSxDQUE1QjtBQUNILFM7MEJBQ1FzRixLLEVBQ1Q7QUFDSSxpQkFBS3RGLENBQUwsR0FBUyxDQUFDc0YsS0FBRCxHQUFTLEtBQUtyQixLQUFMLENBQVdqRSxDQUE3QjtBQUNBLGlCQUFLa0UsTUFBTDtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksbUJBQU8sQ0FBQyxLQUFLaEUsQ0FBTixHQUFVLEtBQUsrRCxLQUFMLENBQVcvRCxDQUE1QjtBQUNILFM7MEJBQ09vRixLLEVBQ1I7QUFDSSxpQkFBS3BGLENBQUwsR0FBUyxDQUFDb0YsS0FBRCxHQUFTLEtBQUtyQixLQUFMLENBQVcvRCxDQUE3QjtBQUNBLGlCQUFLZ0UsTUFBTDtBQUNIOztBQUVEOzs7Ozs7OzRCQUtBO0FBQ0ksbUJBQU8sQ0FBQyxLQUFLaEUsQ0FBTixHQUFVLEtBQUsrRCxLQUFMLENBQVcvRCxDQUFyQixHQUF5QixLQUFLSyxpQkFBckM7QUFDSCxTOzBCQUNVK0UsSyxFQUNYO0FBQ0ksaUJBQUtwRixDQUFMLEdBQVMsQ0FBQ29GLEtBQUQsR0FBUyxLQUFLckIsS0FBTCxDQUFXL0QsQ0FBcEIsR0FBd0IsS0FBS2hDLFlBQXRDO0FBQ0EsaUJBQUtnRyxNQUFMO0FBQ0g7QUFDRDs7Ozs7Ozs0QkFLQTtBQUNJLG1CQUFPLEtBQUtzQixNQUFaO0FBQ0gsUzswQkFDU0YsSyxFQUNWO0FBQ0ksaUJBQUtFLE1BQUwsR0FBY0YsS0FBZDtBQUNIOztBQUVEOzs7Ozs7Ozs0QkFNQTtBQUNJLG1CQUFPLEtBQUtHLGFBQVo7QUFDSCxTOzBCQUNnQkgsSyxFQUNqQjtBQUNJLGdCQUFJQSxLQUFKLEVBQ0E7QUFDSSxxQkFBS0csYUFBTCxHQUFxQkgsS0FBckI7QUFDQSxxQkFBS3ZGLE9BQUwsR0FBZXVGLEtBQWY7QUFDSCxhQUpELE1BTUE7QUFDSSxxQkFBS0csYUFBTCxHQUFxQixLQUFyQjtBQUNBLHFCQUFLMUYsT0FBTCxHQUFlLElBQUlaLEtBQUsyQixTQUFULENBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLEtBQUsxQyxVQUE5QixFQUEwQyxLQUFLRSxXQUEvQyxDQUFmO0FBQ0g7QUFDSjs7OzRCQTBUVztBQUFFLG1CQUFPLEtBQUtvSCxNQUFaO0FBQW9CLFM7MEJBQ3hCSixLLEVBQ1Y7QUFDSSxpQkFBS0ksTUFBTCxHQUFjSixLQUFkO0FBQ0EsZ0JBQUlBLEtBQUosRUFDQTtBQUNJLHFCQUFLckcsT0FBTCxHQUFlLEVBQWY7QUFDQSxxQkFBS3FDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDSDtBQUNKOzs7O0VBaG5Da0JuQyxLQUFLd0csUzs7QUFtbkM1Qjs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7Ozs7QUFTQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7O0FBUUE7Ozs7Ozs7O0FBUUF4RyxLQUFLeUcsTUFBTCxDQUFZakksUUFBWixHQUF1QkEsUUFBdkI7O0FBRUFrSSxPQUFPQyxPQUFQLEdBQWlCbkksUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgRHJhZyA9IHJlcXVpcmUoJy4vZHJhZycpXHJcbmNvbnN0IFBpbmNoID0gcmVxdWlyZSgnLi9waW5jaCcpXHJcbmNvbnN0IENsYW1wID0gcmVxdWlyZSgnLi9jbGFtcCcpXHJcbmNvbnN0IENsYW1wWm9vbSA9IHJlcXVpcmUoJy4vY2xhbXAtem9vbScpXHJcbmNvbnN0IERlY2VsZXJhdGUgPSByZXF1aXJlKCcuL2RlY2VsZXJhdGUnKVxyXG5jb25zdCBCb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpXHJcbmNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAnKVxyXG5jb25zdCBTbmFwWm9vbSA9IHJlcXVpcmUoJy4vc25hcC16b29tJylcclxuY29uc3QgRm9sbG93ID0gcmVxdWlyZSgnLi9mb2xsb3cnKVxyXG5jb25zdCBXaGVlbCA9IHJlcXVpcmUoJy4vd2hlZWwnKVxyXG5jb25zdCBNb3VzZUVkZ2VzID0gcmVxdWlyZSgnLi9tb3VzZS1lZGdlcycpXHJcblxyXG5jb25zdCBQTFVHSU5fT1JERVIgPSBbJ2RyYWcnLCAncGluY2gnLCAnd2hlZWwnLCAnZm9sbG93JywgJ21vdXNlLWVkZ2VzJywgJ2RlY2VsZXJhdGUnLCAnYm91bmNlJywgJ3NuYXAtem9vbScsICdjbGFtcC16b29tJywgJ3NuYXAnLCAnY2xhbXAnXVxyXG5cclxuY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEVtaXR0ZXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkV2lkdGg9dGhpcy53aWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZEhlaWdodD10aGlzLmhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQgPSA1XSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUgdG8gdHJpZ2dlciBhbiBpbnB1dCBldmVudCAoZS5nLiwgZHJhZywgcGluY2gpXHJcbiAgICAgKiBAcGFyYW0geyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9IFtvcHRpb25zLmZvcmNlSGl0QXJlYV0gY2hhbmdlIHRoZSBkZWZhdWx0IGhpdEFyZWEgZnJvbSB3b3JsZCBzaXplIHRvIGEgbmV3IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkudGlja2VyLlRpY2tlcn0gW29wdGlvbnMudGlja2VyPVBJWEkudGlja2VyLnNoYXJlZF0gdXNlIHRoaXMgUElYSS50aWNrZXIgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwYXJhbSB7UElYSS5JbnRlcmFjdGlvbk1hbmFnZXJ9IFtvcHRpb25zLmludGVyYWN0aW9uPW51bGxdIEludGVyYWN0aW9uTWFuYWdlciwgdXNlZCB0byBjYWxjdWxhdGUgcG9pbnRlciBwb3N0aW9uIHJlbGF0aXZlIHRvXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5kaXZXaGVlbD1kb2N1bWVudC5ib2R5XSBkaXYgdG8gYXR0YWNoIHRoZSB3aGVlbCBldmVudFxyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBkcmFnLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgZHJhZy1lbmRcclxuICAgICAqIEBmaXJlcyBkcmFnLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHBpbmNoLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgcGluY2gtZW5kXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgc25hcC1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgd2hlZWxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGwtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1zdGFydFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtZW5kXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3ZlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBvcHRpb25zLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gb3B0aW9ucy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gb3B0aW9ucy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSBvcHRpb25zLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5oaXRBcmVhRnVsbFNjcmVlbiA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4sIHRydWUpXHJcbiAgICAgICAgdGhpcy5mb3JjZUhpdEFyZWEgPSBvcHRpb25zLmZvcmNlSGl0QXJlYVxyXG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50aHJlc2hvbGQsIDUpXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwgbnVsbFxyXG4gICAgICAgIHRoaXMuZGl2ID0gb3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnModGhpcy5kaXYpXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGFjdGl2ZSB0b3VjaCBwb2ludCBpZHMgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgICogQHR5cGUge251bWJlcltdfVxyXG4gICAgICAgICAqIEByZWFkb25seVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcblxyXG4gICAgICAgIHRoaXMudGlja2VyID0gb3B0aW9ucy50aWNrZXIgfHwgUElYSS50aWNrZXIuc2hhcmVkXHJcbiAgICAgICAgdGhpcy50aWNrZXJGdW5jdGlvbiA9ICgpID0+IHRoaXMudXBkYXRlKClcclxuICAgICAgICB0aGlzLnRpY2tlci5hZGQodGhpcy50aWNrZXJGdW5jdGlvbilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycyBmcm9tIHZpZXdwb3J0XHJcbiAgICAgKiAodXNlZnVsIGZvciBjbGVhbnVwIG9mIHdoZWVsIGFuZCB0aWNrZXIgZXZlbnRzIHdoZW4gcmVtb3Zpbmcgdmlld3BvcnQpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUxpc3RlbmVycygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50aWNrZXIucmVtb3ZlKHRoaXMudGlja2VyRnVuY3Rpb24pXHJcbiAgICAgICAgdGhpcy5kaXYucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvdmVycmlkZXMgUElYSS5Db250YWluZXIncyBkZXN0cm95IHRvIGFsc28gcmVtb3ZlIHRoZSAnd2hlZWwnIGFuZCBQSVhJLlRpY2tlciBsaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpXHJcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbi51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS53aWR0aCA9IHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbldpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkSGVpZ2h0XVxyXG4gICAgICovXHJcbiAgICByZXNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoZGl2KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy53aGVlbEZ1bmN0aW9uID0gKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSlcclxuICAgICAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLndoZWVsRnVuY3Rpb24pXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZG93biBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcy5wdXNoKGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSB9XHJcblxyXG4gICAgICAgICAgICAvLyBjbGlja2VkIGV2ZW50IGRvZXMgbm90IGZpcmUgaWYgdmlld3BvcnQgaXMgZGVjZWxlcmF0aW5nIG9yIGJvdW5jaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBjb25zdCBib3VuY2UgPSB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddXHJcbiAgICAgICAgICAgIGlmICgoIWRlY2VsZXJhdGUgfHwgKCFkZWNlbGVyYXRlLnggJiYgIWRlY2VsZXJhdGUueSkpICYmICghYm91bmNlIHx8ICghYm91bmNlLnRvWCAmJiAhYm91bmNlLnRvWSkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLmRvd24oZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4ubW92ZShlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RYID0gZS5kYXRhLmdsb2JhbC54IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgY29uc3QgZGlzdFkgPSBlLmRhdGEuZ2xvYmFsLnkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja1RocmVzaG9sZChkaXN0WCkgfHwgdGhpcy5jaGVja1RocmVzaG9sZChkaXN0WSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXAgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXNbaV0gPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3VjaGVzLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLnVwKGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgd2hlZWwgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVXaGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGhhbmRsZSB3aGVlbCBldmVudHMgd2hlcmUgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnRvTG9jYWwoeyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9KVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgPD0gcG9pbnQueCAmJiBwb2ludC54IDw9IHRoaXMucmlnaHQgJiYgdGhpcy50b3AgPD0gcG9pbnQueSAmJiBwb2ludC55IDw9IHRoaXMuYm90dG9tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsdWdpbi53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHNjcmVlbiB0byB3b3JsZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvV29ybGQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoYXJndW1lbnRzWzBdKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHdvcmxkIHRvIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvU2NyZWVuKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdpZHRoKHdpZHRoLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIGhlaWdodCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9dGhpcy5fd29ybGRIZWlnaHRdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdEhlaWdodChoZWlnaHQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIHNpemUgb3IgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aF0gZGVzaXJlZCB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHRdIGRlc2lyZWQgaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXQoY2VudGVyLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGEgY2VydGFpbiBwZXJjZW50IChpbiBib3RoIHggYW5kIHkgZGlyZWN0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgY2hhbmdlIChlLmcuLCAwLjI1IHdvdWxkIGluY3JlYXNlIGEgc3RhcnRpbmcgc2NhbGUgb2YgMS4wIHRvIDEuMjUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbVBlcmNlbnQocGVyY2VudCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NhbGUueCArIHRoaXMuc2NhbGUueCAqIHBlcmNlbnRcclxuICAgICAgICB0aGlzLnNjYWxlLnNldChzY2FsZSlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGluY3JlYXNpbmcvZGVjcmVhc2luZyB3aWR0aCBieSBhIGNlcnRhaW4gbnVtYmVyIG9mIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSBpbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tKGNoYW5nZSwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZml0V2lkdGgoY2hhbmdlICsgdGhpcy53b3JsZFNjcmVlbldpZHRoLCBjZW50ZXIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCB6b29tXHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHJpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueCArIHRoaXMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBsZWZ0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG4gICAgc2V0IGxlZnQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHRvcCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB0b3AoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcbiAgICBzZXQgdG9wKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgYm90dG9tKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueSArIHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBib3R0b20odmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55ICsgdGhpcy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgd2hldGhlciB0aGUgdmlld3BvcnQgaXMgZGlydHkgKGkuZS4sIG5lZWRzIHRvIGJlIHJlbmRlcmVyZWQgdG8gdGhlIHNjcmVlbiBiZWNhdXNlIG9mIGEgY2hhbmdlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBkaXJ0eSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcnR5XHJcbiAgICB9XHJcbiAgICBzZXQgZGlydHkodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGVybWFuZW50bHkgY2hhbmdlcyB0aGUgVmlld3BvcnQncyBoaXRBcmVhXHJcbiAgICAgKiA8cD5OT1RFOiBub3JtYWxseSB0aGUgaGl0QXJlYSA9IFBJWEkuUmVjdGFuZ2xlKFZpZXdwb3J0LmxlZnQsIFZpZXdwb3J0LnRvcCwgVmlld3BvcnQud29ybGRTY3JlZW5XaWR0aCwgVmlld3BvcnQud29ybGRTY3JlZW5IZWlnaHQpPC9wPlxyXG4gICAgICogQHR5cGUgeyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9XHJcbiAgICAgKi9cclxuICAgIGdldCBmb3JjZUhpdEFyZWEoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUhpdEFyZWFcclxuICAgIH1cclxuICAgIHNldCBmb3JjZUhpdEFyZWEodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gdmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCBvZiBtb3VzZS90b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sZWZ0RG93biA/IDEgOiAwKSArIHRoaXMudG91Y2hlcy5sZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHRvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHBvaW50ZXJzW2tleV1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlcy5pbmRleE9mKHBvaW50ZXIucG9pbnRlcklkKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcnNba2V5XSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wcyBhbmQgcmVzZXRzIGJvdW5jZSBhbmQgZGVjZWxlcmF0ZSAoYXMgbmVlZGVkKSBhZnRlciBtYW51YWxseSBtb3Zpbmcgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snYm91bmNlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLnJlc2V0KClcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5ib3VuY2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ3NuYXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXS51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExVR0lOU1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBpbnN0YWxsZWQgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXSA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5lbWl0KHR5cGUgKyAnLXJlbW92ZScpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzb3J0IHBsdWdpbnMgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHBsdWdpbnNTb3J0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNMaXN0LnB1c2godGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MTBdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBkcmFnKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkcmFnJ10gPSBuZXcgRHJhZyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcCB0byB3b3JsZCBib3VuZGFyaWVzIG9yIG90aGVyIHByb3ZpZGVkIGJvdW5kYXJpZXNcclxuICAgICAqIE5PVEVTOlxyXG4gICAgICogICBjbGFtcCBpcyBkaXNhYmxlZCBpZiBjYWxsZWQgd2l0aCBubyBvcHRpb25zOyB1c2UgeyBkaXJlY3Rpb246ICdhbGwnIH0gZm9yIGFsbCBlZGdlIGNsYW1waW5nXHJcbiAgICAgKiAgIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBib3VuY2Uob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddID0gbmV3IEJvdW5jZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgcGluY2ggdG8gem9vbSBhbmQgdHdvLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgcGluY2gob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3BpbmNoJ10gPSBuZXcgUGluY2godGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc25hcCB0byBhIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvblxyXG4gKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZvbGxvdyh0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydmb2xsb3cnXSA9IG5ldyBGb2xsb3codGhpcywgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHVzaW5nIG1vdXNlIHdoZWVsXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICB3aGVlbChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snd2hlZWwnXSA9IG5ldyBXaGVlbCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXBpbmcgb2Ygem9vbSB0byBjb25zdHJhaW50c1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSA9IG5ldyBDbGFtcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2Nyb2xsIHZpZXdwb3J0IHdoZW4gbW91c2UgaG92ZXJzIG5lYXIgb25lIG9mIHRoZSBlZGdlcyBvciByYWRpdXMtZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKi9cclxuICAgIG1vdXNlRWRnZXMob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ21vdXNlLWVkZ2VzJ10gPSBuZXcgTW91c2VFZGdlcyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSB2aWV3cG9ydCAoaW5jbHVkaW5nIGFuaW1hdGlvbiB1cGRhdGVzIHN1Y2ggYXMgZGVjZWxlcmF0ZSlcclxuICAgICAqIE5PVEU6IHdoZW4gc2V0dGluZyBwYXVzZT10cnVlLCBhbGwgdG91Y2hlcyBhbmQgbW91c2UgYWN0aW9ucyBhcmUgY2xlYXJlZCAoaS5lLiwgaWYgbW91c2Vkb3duIHdhcyBhY3RpdmUsIGl0IGJlY29tZXMgaW5hY3RpdmUgZm9yIHB1cnBvc2VzIG9mIHRoZSB2aWV3cG9ydClcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLl9wYXVzZSB9XHJcbiAgICBzZXQgcGF1c2UodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fcGF1c2UgPSB2YWx1ZVxyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIGFmdGVyIGEgbW91c2Ugb3IgdG91Y2ggY2xpY2tcclxuICogQGV2ZW50IFZpZXdwb3J0I2NsaWNrZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1zdGFydFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1lbmRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIGVuZFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGZvciBhIG1vdXNlIHdoZWVsIGV2ZW50XHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge29iamVjdH0gd2hlZWxcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR4XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keVxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHpcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHdoZWVsLXNjcm9sbCBvY2N1cnNcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsLXNjcm9sbFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBtb3VzZS1lZGdlIHN0YXJ0cyB0byBzY3JvbGxcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2Utc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBtb3VzZS1lZGdlIHNjcm9sbGluZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgbW92ZXMgdGhyb3VnaCBVSSBpbnRlcmFjdGlvbiwgZGVjZWxlcmF0aW9uLCBvciBmb2xsb3dcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdmVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLCBzbmFwLCBwaW5jaCwgZm9sbG93LCBib3VuY2UteCwgYm91bmNlLXksIGNsYW1wLXgsIGNsYW1wLXksIGRlY2VsZXJhdGUsIG1vdXNlLWVkZ2VzLCB3aGVlbClcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjem9vbWVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLXpvb20sIHBpbmNoLCB3aGVlbCwgY2xhbXAtem9vbSlcclxuICovXHJcblxyXG5QSVhJLmV4dHJhcy5WaWV3cG9ydCA9IFZpZXdwb3J0XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0Il19