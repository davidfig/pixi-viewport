'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');
var exists = require('exists');

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

        _this.plugins = [];
        _this._screenWidth = options.screenWidth;
        _this._screenHeight = options.screenHeight;
        _this._worldWidth = options.worldWidth;
        _this._worldHeight = options.worldHeight;
        _this.hitAreaFullScreen = exists(options.hitAreaFullScreen) ? options.hitAreaFullScreen : true;
        _this.forceHitArea = options.forceHitArea;
        _this.threshold = exists(options.threshold) ? options.threshold : 5;
        _this.interaction = options.interaction || null;
        _this.listeners(options.divWheel || document.body);

        /**
         * active touch point ids on the viewport
         * @type {number[]}
         * @readonly
         */
        _this.touches = [];

        _this.ticker = options.ticker || PIXI.ticker.shared;
        _this.ticker.add(function () {
            return _this.update();
        });
        return _this;
    }

    /**
     * update animations
     * @private
     */


    _createClass(Viewport, [{
        key: 'update',
        value: function update() {
            if (!this._pause) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = PLUGIN_ORDER[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var plugin = _step.value;

                        if (this.plugins[plugin]) {
                            this.plugins[plugin].update(this.ticker.elapsedMS);
                        }
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
                for (var _iterator2 = PLUGIN_ORDER[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var type = _step2.value;

                    if (this.plugins[type]) {
                        this.plugins[type].resize();
                    }
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
            div.addEventListener('wheel', function (e) {
                return _this2.handleWheel(e);
            });
            this.leftDown = false;
        }

        /**
         * handle down events
         * @private
         */

    }, {
        key: 'down',
        value: function down(e) {
            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.button == 0) {
                this.leftDown = true;
            }

            if (e.data.pointerType !== 'mouse') {
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
                for (var _iterator3 = PLUGIN_ORDER[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var type = _step3.value;

                    if (this.plugins[type]) {
                        this.plugins[type].down(e);
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
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = PLUGIN_ORDER[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var type = _step4.value;

                    if (this.plugins[type]) {
                        this.plugins[type].move(e);
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
        }

        /**
         * handle up events
         * @private
         */

    }, {
        key: 'up',
        value: function up(e) {
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
                for (var _iterator5 = PLUGIN_ORDER[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var type = _step5.value;

                    if (this.plugins[type]) {
                        this.plugins[type].up(e);
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
        }

        /**
         * handle wheel events
         * @private
         */

    }, {
        key: 'handleWheel',
        value: function handleWheel(e) {
            // only handle wheel events where the mouse is over the viewport
            var point = this.toLocal({ x: e.clientX, y: e.clientY });
            if (this.left <= point.x && point.x <= this.right && this.top <= point.y && point.y <= this.bottom) {
                var result = void 0;
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = PLUGIN_ORDER[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var type = _step6.value;

                        if (this.plugins[type]) {
                            if (this.plugins[type].wheel(e)) {
                                result = true;
                            }
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
            width = width || this._worldWidth;
            this.scale.x = this._screenWidth / width;
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
            height = height || this._worldHeight;
            this.scale.y = this._screenHeight / height;
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
         * change zoom so it fits the entire world in the viewport
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */

    }, {
        key: 'fit',
        value: function fit(center) {
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
            return this;
        }

        /**
         * bounce on borders
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} [options]
         * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
         * @param {number} [options.friction=0.5] friction to apply to decelerate if active
         * @param {number} [options.time=150] time in ms to finish bounce
         * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */

    }, {
        key: 'bounce',
        value: function bounce(options) {
            this.plugins['bounce'] = new Bounce(this, options);
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
            return this;
        }

        /**
         * pause viewport (including animation updates such as decelerate)
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
            this.interactive = !value;
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
 * @type {Viewport}
 */

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJQSVhJIiwicmVxdWlyZSIsImV4aXN0cyIsIkRyYWciLCJQaW5jaCIsIkNsYW1wIiwiQ2xhbXBab29tIiwiRGVjZWxlcmF0ZSIsIkJvdW5jZSIsIlNuYXAiLCJTbmFwWm9vbSIsIkZvbGxvdyIsIldoZWVsIiwiTW91c2VFZGdlcyIsIlBMVUdJTl9PUkRFUiIsIlZpZXdwb3J0Iiwib3B0aW9ucyIsInBsdWdpbnMiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZm9yY2VIaXRBcmVhIiwidGhyZXNob2xkIiwiaW50ZXJhY3Rpb24iLCJsaXN0ZW5lcnMiLCJkaXZXaGVlbCIsImRvY3VtZW50IiwiYm9keSIsInRvdWNoZXMiLCJ0aWNrZXIiLCJzaGFyZWQiLCJhZGQiLCJ1cGRhdGUiLCJfcGF1c2UiLCJwbHVnaW4iLCJlbGFwc2VkTVMiLCJoaXRBcmVhIiwieCIsImxlZnQiLCJ5IiwidG9wIiwid2lkdGgiLCJ3b3JsZFNjcmVlbldpZHRoIiwiaGVpZ2h0Iiwid29ybGRTY3JlZW5IZWlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJyZXNpemVQbHVnaW5zIiwidHlwZSIsInJlc2l6ZSIsImRpdiIsImludGVyYWN0aXZlIiwiUmVjdGFuZ2xlIiwib24iLCJkb3duIiwibW92ZSIsInVwIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJoYW5kbGVXaGVlbCIsImxlZnREb3duIiwiZGF0YSIsIm9yaWdpbmFsRXZlbnQiLCJNb3VzZUV2ZW50IiwiYnV0dG9uIiwicG9pbnRlclR5cGUiLCJwdXNoIiwicG9pbnRlcklkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwiZ2xvYmFsIiwiZGVjZWxlcmF0ZSIsImJvdW5jZSIsInRvWCIsInRvWSIsImNsaWNrZWRBdmFpbGFibGUiLCJjaGFuZ2UiLCJNYXRoIiwiYWJzIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwiaSIsImxlbmd0aCIsInNwbGljZSIsImVtaXQiLCJzY3JlZW4iLCJ3b3JsZCIsInRvV29ybGQiLCJ2aWV3cG9ydCIsInBvaW50IiwidG9Mb2NhbCIsImNsaWVudFgiLCJjbGllbnRZIiwicmlnaHQiLCJib3R0b20iLCJyZXN1bHQiLCJ3aGVlbCIsImFyZ3VtZW50cyIsInRvR2xvYmFsIiwiaXNOYU4iLCJwb3NpdGlvbiIsInNldCIsInNjYWxlIiwiX3Jlc2V0IiwiY2VudGVyIiwic2F2ZSIsIm1vdmVDZW50ZXIiLCJwZXJjZW50IiwiZml0V2lkdGgiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwicGF1c2UiLCJyZXN1bWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm1vdmVDb3JuZXIiLCJfZGlydHkiLCJfZm9yY2VIaXRBcmVhIiwiQ29udGFpbmVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLE9BQU9DLFFBQVEsU0FBUixDQUFiO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUUsT0FBT0YsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNRyxRQUFRSCxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU1JLFFBQVFKLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUssWUFBWUwsUUFBUSxjQUFSLENBQWxCO0FBQ0EsSUFBTU0sYUFBYU4sUUFBUSxjQUFSLENBQW5CO0FBQ0EsSUFBTU8sU0FBU1AsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNUSxPQUFPUixRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1TLFdBQVdULFFBQVEs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QUFLM0YsT0FBTCxHQUFlLElBQUkxQyxLQUFLMkQsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLcEMsVUFBOUIsRUFBMEMsS0FBS0UsV0FBL0MsQ0FBZjtBQUNIO0FBQ0o7Ozs0QkE4UVc7QUFBRSxtQkFBTyxLQUFLYyxNQUFaO0FBQW9CLFM7MEJBQ3hCMkYsSyxFQUNWO0FBQ0ksaUJBQUszRixNQUFMLEdBQWMyRixLQUFkO0FBQ0EsaUJBQUt4RSxXQUFMLEdBQW1CLENBQUN3RSxLQUFwQjtBQUNIOzs7O0VBaGlDa0JsSSxLQUFLc0ksUzs7QUFtaUM1Qjs7Ozs7Ozs7O0FBU0E7Ozs7Ozs7OztBQVNBOzs7Ozs7Ozs7QUFTQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BQyxPQUFPQyxPQUFQLEdBQWlCekgsUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZCA9IDVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaClcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQHBhcmFtIHtQSVhJLkludGVyYWN0aW9uTWFuYWdlcn0gW29wdGlvbnMuaW50ZXJhY3Rpb249bnVsbF0gSW50ZXJhY3Rpb25NYW5hZ2VyLCB1c2VkIHRvIGNhbGN1bGF0ZSBwb2ludGVyIHBvc3Rpb24gcmVsYXRpdmUgdG9cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIGRyYWctcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gZXhpc3RzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4pID8gb3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiA6IHRydWVcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBleGlzdHMob3B0aW9ucy50aHJlc2hvbGQpID8gb3B0aW9ucy50aHJlc2hvbGQgOiA1XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwgbnVsbFxyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzKG9wdGlvbnMuZGl2V2hlZWwgfHwgZG9jdW1lbnQuYm9keSlcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWN0aXZlIHRvdWNoIHBvaW50IGlkcyBvbiB0aGUgdmlld3BvcnRcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyW119XHJcbiAgICAgICAgICogQHJlYWRvbmx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuXHJcbiAgICAgICAgdGhpcy50aWNrZXIgPSBvcHRpb25zLnRpY2tlciB8fCBQSVhJLnRpY2tlci5zaGFyZWRcclxuICAgICAgICB0aGlzLnRpY2tlci5hZGQoKCkgPT4gdGhpcy51cGRhdGUoKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSBhbmltYXRpb25zXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5fcGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3BsdWdpbl0udXBkYXRlKHRoaXMudGlja2VyLmVsYXBzZWRNUylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnkgPSB0aGlzLnRvcFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLndpZHRoID0gdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gc2V0IHNjcmVlbiBhbmQgd29ybGQgc2l6ZXMtLW5lZWRlZCBmb3IgcGluY2gvd2hlZWwvY2xhbXAvYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuV2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5IZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd29ybGRIZWlnaHRdXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZShzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodClcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHNjcmVlbldpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB3b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB3b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgYWZ0ZXIgYSB3b3JsZFdpZHRoL0hlaWdodCBjaGFuZ2VcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZVBsdWdpbnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnJlc2l6ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5XaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5IZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRXaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGlucHV0IGxpc3RlbmVyc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbGlzdGVuZXJzKGRpdilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyZG93bicsIHRoaXMuZG93bilcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVybW92ZScsIHRoaXMubW92ZSlcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXAnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cG91dHNpZGUnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJvdXQnLCB0aGlzLnVwKVxyXG4gICAgICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlKSA9PiB0aGlzLmhhbmRsZVdoZWVsKGUpKVxyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRvd24gZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzLnB1c2goZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNsaWNrZWQgZXZlbnQgZG9lcyBub3QgZmlyZSBpZiB2aWV3cG9ydCBpcyBkZWNlbGVyYXRpbmcgb3IgYm91bmNpbmdcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGNvbnN0IGJvdW5jZSA9IHRoaXMucGx1Z2luc1snYm91bmNlJ11cclxuICAgICAgICAgICAgaWYgKCghZGVjZWxlcmF0ZSB8fCAoIWRlY2VsZXJhdGUueCAmJiAhZGVjZWxlcmF0ZS55KSkgJiYgKCFib3VuY2UgfHwgKCFib3VuY2UudG9YICYmICFib3VuY2UudG9ZKSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0uZG93bihlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hldGhlciBjaGFuZ2UgZXhjZWVkcyB0aHJlc2hvbGRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIGNoZWNrVGhyZXNob2xkKGNoYW5nZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA+PSB0aGlzLnRocmVzaG9sZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ubW92ZShlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGlzdFggPSBlLmRhdGEuZ2xvYmFsLnggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICBjb25zdCBkaXN0WSA9IGUuZGF0YS5nbG9iYWwueSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RZKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5wb2ludGVyVHlwZSAhPT0gJ21vdXNlJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzW2ldID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG91Y2hlcy5zcGxpY2UoaSwgMSlcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS51cChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgd2hlZWwgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVXaGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIC8vIG9ubHkgaGFuZGxlIHdoZWVsIGV2ZW50cyB3aGVyZSB0aGUgbW91c2UgaXMgb3ZlciB0aGUgdmlld3BvcnRcclxuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMudG9Mb2NhbCh7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH0pXHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCA8PSBwb2ludC54ICYmIHBvaW50LnggPD0gdGhpcy5yaWdodCAmJiB0aGlzLnRvcCA8PSBwb2ludC55ICYmIHBvaW50LnkgPD0gdGhpcy5ib3R0b20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0XHJcbiAgICAgICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0ud2hlZWwoZSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSBzY3JlZW4gdG8gd29ybGRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1dvcmxkKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKGFyZ3VtZW50c1swXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSB3b3JsZCB0byBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1NjcmVlbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHBvaW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodCAqIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGNlbnRlciBvZiBzY3JlZW4gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogdGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogdGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB0aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNlbnRlcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDZW50ZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIGNlbnRlciBvZiB2aWV3cG9ydCB0byBwb2ludFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfFBJWEkuUG9pbnRMaWtlKX0geCBvciBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNlbnRlcigvKngsIHkgfCBQSVhJLlBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHgsIHlcclxuICAgICAgICBpZiAoIWlzTmFOKGFyZ3VtZW50c1swXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXS54XHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMF0ueVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgodGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHgpICogdGhpcy5zY2FsZS54LCAodGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB5KSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRvcC1sZWZ0IGNvcm5lclxyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY29ybmVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiAtdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiAtdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjb3JuZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29ybmVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB2aWV3cG9ydCdzIHRvcC1sZWZ0IGNvcm5lcjsgYWxzbyBjbGFtcHMgYW5kIHJlc2V0cyBkZWNlbGVyYXRlIGFuZCBib3VuY2UgKGFzIG5lZWRlZClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHh8cG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ29ybmVyKC8qeCwgeSB8IHBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdLnggKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMF0ueSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXSAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1sxXSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgd2lkdGggZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGg9dGhpcy5fd29ybGRXaWR0aF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRXaWR0aCh3aWR0aCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIGhlaWdodCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9dGhpcy5fd29ybGRIZWlnaHRdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdEhlaWdodChoZWlnaHQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gaXQgZml0cyB0aGUgZW50aXJlIHdvcmxkIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRXb3JsZChjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gaXQgZml0cyB0aGUgZW50aXJlIHdvcmxkIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgYSBjZXJ0YWluIHBlcmNlbnQgKGluIGJvdGggeCBhbmQgeSBkaXJlY3Rpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudCBjaGFuZ2UgKGUuZy4sIDAuMjUgd291bGQgaW5jcmVhc2UgYSBzdGFydGluZyBzY2FsZSBvZiAxLjAgdG8gMS4yNSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tUGVyY2VudChwZXJjZW50LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY2FsZS54ICsgdGhpcy5zY2FsZS54ICogcGVyY2VudFxyXG4gICAgICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlKVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgaW5jcmVhc2luZy9kZWNyZWFzaW5nIHdpZHRoIGJ5IGEgY2VydGFpbiBudW1iZXIgb2YgcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlIGluIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb20oY2hhbmdlLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5maXRXaWR0aChjaGFuZ2UgKyB0aGlzLndvcmxkU2NyZWVuV2lkdGgsIGNlbnRlcilcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCB6b29tXHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHJpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueCArIHRoaXMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBsZWZ0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG4gICAgc2V0IGxlZnQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHRvcCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB0b3AoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcbiAgICBzZXQgdG9wKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgYm90dG9tKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueSArIHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBib3R0b20odmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55ICsgdGhpcy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgd2hldGhlciB0aGUgdmlld3BvcnQgaXMgZGlydHkgKGkuZS4sIG5lZWRzIHRvIGJlIHJlbmRlcmVyZWQgdG8gdGhlIHNjcmVlbiBiZWNhdXNlIG9mIGEgY2hhbmdlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBkaXJ0eSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcnR5XHJcbiAgICB9XHJcbiAgICBzZXQgZGlydHkodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGVybWFuZW50bHkgY2hhbmdlcyB0aGUgVmlld3BvcnQncyBoaXRBcmVhXHJcbiAgICAgKiA8cD5OT1RFOiBub3JtYWxseSB0aGUgaGl0QXJlYSA9IFBJWEkuUmVjdGFuZ2xlKFZpZXdwb3J0LmxlZnQsIFZpZXdwb3J0LnRvcCwgVmlld3BvcnQud29ybGRTY3JlZW5XaWR0aCwgVmlld3BvcnQud29ybGRTY3JlZW5IZWlnaHQpPC9wPlxyXG4gICAgICogQHR5cGUgeyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9XHJcbiAgICAgKi9cclxuICAgIGdldCBmb3JjZUhpdEFyZWEoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUhpdEFyZWFcclxuICAgIH1cclxuICAgIHNldCBmb3JjZUhpdEFyZWEodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gdmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCBvZiBtb3VzZS90b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sZWZ0RG93biA/IDEgOiAwKSArIHRoaXMudG91Y2hlcy5sZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHRvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHBvaW50ZXJzW2tleV1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlcy5pbmRleE9mKHBvaW50ZXIucG9pbnRlcklkKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcHMgYW5kIHJlc2V0cyBib3VuY2UgYW5kIGRlY2VsZXJhdGUgKGFzIG5lZWRlZCkgYWZ0ZXIgbWFudWFsbHkgbW92aW5nIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2JvdW5jZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5yZXNldCgpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10uYm91bmNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydzbmFwJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMVUdJTlNcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgaW5zdGFsbGVkIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0gPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCh0eXBlICsgJy1yZW1vdmUnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MTBdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBkcmFnKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkcmFnJ10gPSBuZXcgRHJhZyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcCB0byB3b3JsZCBib3VuZGFyaWVzIG9yIG90aGVyIHByb3ZpZGVkIGJvdW5kYXJpZXNcclxuICAgICAqIE5PVEVTOlxyXG4gICAgICogICBjbGFtcCBpcyBkaXNhYmxlZCBpZiBjYWxsZWQgd2l0aCBubyBvcHRpb25zOyB1c2UgeyBkaXJlY3Rpb246ICdhbGwnIH0gZm9yIGFsbCBlZGdlIGNsYW1waW5nXHJcbiAgICAgKiAgIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgYm91bmNlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXSA9IG5ldyBCb3VuY2UodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIHBpbmNoIHRvIHpvb20gYW5kIHR3by1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHBpbmNoKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydwaW5jaCddID0gbmV3IFBpbmNoKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNuYXAgdG8gYSBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRvcExlZnRdIHNuYXAgdG8gdGhlIHRvcC1sZWZ0IG9mIHZpZXdwb3J0IGluc3RlYWQgb2YgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgbG9jYXRpb25cclxuICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgc25hcCh4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddID0gbmV3IFNuYXAodGhpcywgeCwgeSwgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9sbG93IGEgdGFyZ2V0XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuRGlzcGxheU9iamVjdH0gdGFyZ2V0IHRvIGZvbGxvdyAob2JqZWN0IG11c3QgaW5jbHVkZSB7eDogeC1jb29yZGluYXRlLCB5OiB5LWNvb3JkaW5hdGV9KVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPTBdIHRvIGZvbGxvdyBpbiBwaXhlbHMvZnJhbWUgKDA9dGVsZXBvcnQgdG8gbG9jYXRpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSByYWRpdXMgKGluIHdvcmxkIGNvb3JkaW5hdGVzKSBvZiBjZW50ZXIgY2lyY2xlIHdoZXJlIG1vdmVtZW50IGlzIGFsbG93ZWQgd2l0aG91dCBtb3ZpbmcgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmb2xsb3codGFyZ2V0LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZm9sbG93J10gPSBuZXcgRm9sbG93KHRoaXMsIHRhcmdldCwgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB1c2luZyBtb3VzZSB3aGVlbFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgd2hlZWwob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3doZWVsJ10gPSBuZXcgV2hlZWwodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIGNsYW1waW5nIG9mIHpvb20gdG8gY29uc3RyYWludHNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbldpZHRoXSBtaW5pbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluSGVpZ2h0XSBtaW5pbXVtIGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdpZHRoXSBtYXhpbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4SGVpZ2h0XSBtYXhpbXVtIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10gPSBuZXcgQ2xhbXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMgb3IgcmFkaXVzLWRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbi5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIGRpc3RhbmNlIGZyb20gY2VudGVyIG9mIHNjcmVlbiBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZGlzdGFuY2VdIGRpc3RhbmNlIGZyb20gYWxsIHNpZGVzIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3BdIGFsdGVybmF0aXZlbHksIHNldCB0b3AgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdHRvbV0gYWx0ZXJuYXRpdmVseSwgc2V0IGJvdHRvbSBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubGVmdF0gYWx0ZXJuYXRpdmVseSwgc2V0IGxlZnQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJpZ2h0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgcmlnaHQgZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPThdIHNwZWVkIGluIHBpeGVscy9mcmFtZSB0byBzY3JvbGwgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSBkaXJlY3Rpb24gb2Ygc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRGVjZWxlcmF0ZV0gZG9uJ3QgdXNlIGRlY2VsZXJhdGUgcGx1Z2luIGV2ZW4gaWYgaXQncyBpbnN0YWxsZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGluZWFyXSBpZiB1c2luZyByYWRpdXMsIHVzZSBsaW5lYXIgbW92ZW1lbnQgKCsvLSAxLCArLy0gMSkgaW5zdGVhZCBvZiBhbmdsZWQgbW92ZW1lbnQgKE1hdGguY29zKGFuZ2xlIGZyb20gY2VudGVyKSwgTWF0aC5zaW4oYW5nbGUgZnJvbSBjZW50ZXIpKVxyXG4gICAgICovXHJcbiAgICBtb3VzZUVkZ2VzKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydtb3VzZS1lZGdlcyddID0gbmV3IE1vdXNlRWRnZXModGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2Ugdmlld3BvcnQgKGluY2x1ZGluZyBhbmltYXRpb24gdXBkYXRlcyBzdWNoIGFzIGRlY2VsZXJhdGUpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHBhdXNlKCkgeyByZXR1cm4gdGhpcy5fcGF1c2UgfVxyXG4gICAgc2V0IHBhdXNlKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3BhdXNlID0gdmFsdWVcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gIXZhbHVlXHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyBhZnRlciBhIG1vdXNlIG9yIHRvdWNoIGNsaWNrXHJcbiAqIEBldmVudCBWaWV3cG9ydCNjbGlja2VkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctc3RhcnRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I2RyYWctZW5kXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBlbmRcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBmb3IgYSBtb3VzZSB3aGVlbCBldmVudFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWxcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtvYmplY3R9IHdoZWVsXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHlcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR6XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSB3aGVlbC1zY3JvbGwgb2NjdXJzXHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbC1zY3JvbGxcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgbW91c2UtZWRnZSBzdGFydHMgdG8gc2Nyb2xsXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgbW91c2UtZWRnZSBzY3JvbGxpbmcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHZpZXdwb3J0IG1vdmVzIHRocm91Z2ggVUkgaW50ZXJhY3Rpb24sIGRlY2VsZXJhdGlvbiwgb3IgZm9sbG93XHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3ZlZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydCJdfQ==