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
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires pinch-start
     * @fires pinch-end
     * @fires snap-start
     * @fires snap-end
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires wheel
     * @fires wheel-scroll
     * @fires mouse-edge-start
     * @fires mouse-edge-end
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
        _this.listeners();

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
        value: function listeners() {
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
            document.body.addEventListener('wheel', function (e) {
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
         * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
         * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
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
         * enable clamp to boundaries of world
         * NOTE: screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         * @param {object} options
         * @param {string} [options.direction=all] (all, x, or y)
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
         * @param {boolean} [options.center] snap to the center of the camera instead of the top-left corner of viewport
         * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
         * @param {number} [options.time=1000]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
         * @param {boolean} [options.removeOnComplete=true] removes this plugin after snapping is complete
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
            this.x = value * this.scale.x - this.worldScreenWidth;
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
            this.y = -value * this.scale.y - this.worldScreenHeight;
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

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJQSVhJIiwicmVxdWlyZSIsImV4aXN0cyIsIkRyYWciLCJQaW5jaCIsIkNsYW1wIiwiQ2xhbXBab29tIiwiRGVjZWxlcmF0ZSIsIkJvdW5jZSIsIlNuYXAiLCJTbmFwWm9vbSIsIkZvbGxvdyIsIldoZWVsIiwiTW91c2VFZGdlcyIsIlBMVUdJTl9PUkRFUiIsIlZpZXdwb3J0Iiwib3B0aW9ucyIsInBsdWdpbnMiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZm9yY2VIaXRBcmVhIiwidGhyZXNob2xkIiwibGlzdGVuZXJzIiwidG91Y2hlcyIsInRpY2tlciIsInNoYXJlZCIsImFkZCIsInVwZGF0ZSIsIl9wYXVzZSIsInBsdWdpbiIsImVsYXBzZWRNUyIsImhpdEFyZWEiLCJ4IiwibGVmdCIsInkiLCJ0b3AiLCJ3aWR0aCIsIndvcmxkU2NyZWVuV2lkdGgiLCJoZWlnaHQiLCJ3b3JsZFNjcmVlbkhlaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJ0eXBlIiwicmVzaXplIiwiaW50ZXJhY3RpdmUiLCJSZWN0YW5nbGUiLCJvbiIsImRvd24iLCJtb3ZlIiwidXAiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZVdoZWVsIiwibGVmdERvd24iLCJkYXRhIiwib3JpZ2luYWxFdmVudCIsIk1vdXNlRXZlbnQiLCJidXR0b24iLCJwb2ludGVyVHlwZSIsInB1c2giLCJwb2ludGVySWQiLCJjb3VudERvd25Qb2ludGVycyIsImxhc3QiLCJnbG9iYWwiLCJkZWNlbGVyYXRlIiwiYm91bmNlIiwidG9YIiwidG9ZIiwiY2xpY2tlZEF2YWlsYWJsZSIsImNoYW5nZSIsIk1hdGgiLCJhYnMiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJpIiwibGVuZ3RoIiwic3BsaWNlIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0xvY2FsIiwidG9HbG9iYWwiLCJwb2ludCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJzY2FsZSIsIl9yZXNldCIsImNlbnRlciIsInNhdmUiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicmlnaHQiLCJib3R0b20iLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwicGF1c2UiLCJyZXN1bWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm1vdmVDb3JuZXIiLCJfZGlydHkiLCJfZm9yY2VIaXRBcmVhIiwiQ29udGFpbmVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLE9BQU9DLFFBQVEsU0FBUixDQUFiO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUUsT0FBT0YsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNRyxRQUFRSCxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU1JLFFBQVFKLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUssWUFBWUwsUUFBUSxjQUFSLENBQWxCO0FBQ0EsSUFBTU0sYUFBYU4sUUFBUSxjQUFSLENBQW5CO0FBQ0EsSUFBTU8sU0FBU1AsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNUSxPQUFPUixRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1TLFdBQVdULFFBQVEsYUFBUixDQUFqQjtBQUNBLElBQU1VLFNBQVNWLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFB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QWlCcEgsUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZCA9IDVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaClcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBkcmFnLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgZHJhZy1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1zdGFydFxyXG4gICAgICogQGZpcmVzIHBpbmNoLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLWVuZFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktZW5kXHJcbiAgICAgKiBAZmlyZXMgd2hlZWxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGxcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLnBsdWdpbnMgPSBbXVxyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gb3B0aW9ucy5zY3JlZW5XaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IG9wdGlvbnMuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IG9wdGlvbnMud29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gb3B0aW9ucy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuaGl0QXJlYUZ1bGxTY3JlZW4gPSBleGlzdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbikgPyBvcHRpb25zLmhpdEFyZWFGdWxsU2NyZWVuIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMuZm9yY2VIaXRBcmVhID0gb3B0aW9ucy5mb3JjZUhpdEFyZWFcclxuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IGV4aXN0cyhvcHRpb25zLnRocmVzaG9sZCkgPyBvcHRpb25zLnRocmVzaG9sZCA6IDVcclxuICAgICAgICB0aGlzLmxpc3RlbmVycygpXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGFjdGl2ZSB0b3VjaCBwb2ludCBpZHMgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgICogQHR5cGUge251bWJlcltdfVxyXG4gICAgICAgICAqIEByZWFkb25seVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcblxyXG4gICAgICAgIHRoaXMudGlja2VyID0gb3B0aW9ucy50aWNrZXIgfHwgUElYSS50aWNrZXIuc2hhcmVkXHJcbiAgICAgICAgdGhpcy50aWNrZXIuYWRkKCgpID0+IHRoaXMudXBkYXRlKCkpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgYW5pbWF0aW9uc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3BhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5dLnVwZGF0ZSh0aGlzLnRpY2tlci5lbGFwc2VkTVMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnggPSB0aGlzLmxlZnRcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS55ID0gdGhpcy50b3BcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS53aWR0aCA9IHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaXRBcmVhLmhlaWdodCA9IHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbldpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkSGVpZ2h0XVxyXG4gICAgICovXHJcbiAgICByZXNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXNpemUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoXHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgc2NyZWVuSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRXaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkV2lkdGgodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZEhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBpbnB1dCBsaXN0ZW5lcnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGxpc3RlbmVycygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcclxuICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmRvd24nLCB0aGlzLmRvd24pXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm1vdmUnLCB0aGlzLm1vdmUpXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXBvdXRzaWRlJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyY2FuY2VsJywgdGhpcy51cClcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyb3V0JywgdGhpcy51cClcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSkpXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZG93biBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgIT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMucHVzaChlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2xpY2tlZCBldmVudCBkb2VzIG5vdCBmaXJlIGlmIHZpZXdwb3J0IGlzIGRlY2VsZXJhdGluZyBvciBib3VuY2luZ1xyXG4gICAgICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICAgICAgY29uc3QgYm91bmNlID0gdGhpcy5wbHVnaW5zWydib3VuY2UnXVxyXG4gICAgICAgICAgICBpZiAoKCFkZWNlbGVyYXRlIHx8ICghZGVjZWxlcmF0ZS54ICYmICFkZWNlbGVyYXRlLnkpKSAmJiAoIWJvdW5jZSB8fCAoIWJvdW5jZS50b1ggJiYgIWJvdW5jZS50b1kpKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5kb3duKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFBMVUdJTl9PUkRFUilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5tb3ZlKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0WCA9IGUuZGF0YS5nbG9iYWwueCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RZID0gZS5kYXRhLmdsb2JhbC55IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXNbaV0gPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3VjaGVzLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnVwKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUgJiYgdGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcyB9KVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB3aGVlbCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXS53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gc2NyZWVuIHRvIHdvcmxkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9Xb3JsZCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbChhcmd1bWVudHNbMF0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gd29ybGQgdG8gc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9TY3JlZW4oKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBjZW50ZXIgb2Ygc2NyZWVuIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjZW50ZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB0aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0gdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjZW50ZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBjZW50ZXIgb2Ygdmlld3BvcnQgdG8gcG9pbnRcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxQSVhJLlBvaW50TGlrZSl9IHggb3IgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDZW50ZXIoLyp4LCB5IHwgUElYSS5Qb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB4LCB5XHJcbiAgICAgICAgaWYgKCFpc05hTihhcmd1bWVudHNbMF0pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF0ueFxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzBdLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoKHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB4KSAqIHRoaXMuc2NhbGUueCwgKHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0geSkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0b3AtbGVmdCBjb3JuZXJcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNvcm5lcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogLXRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogLXRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY29ybmVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNvcm5lcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgdmlld3BvcnQncyB0b3AtbGVmdCBjb3JuZXI7IGFsc28gY2xhbXBzIGFuZCByZXNldHMgZGVjZWxlcmF0ZSBhbmQgYm91bmNlIChhcyBuZWVkZWQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4fHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNvcm5lcigvKngsIHkgfCBwb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXS54ICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzBdLnkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0gKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMV0gKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIHdpZHRoIGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoPXRoaXMuX3dvcmxkV2lkdGhdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlclxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V2lkdGgod2lkdGgsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSBoZWlnaHQgZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0PXRoaXMuX3dvcmxkSGVpZ2h0XSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRIZWlnaHQoaGVpZ2h0LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuX3NjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGEgY2VydGFpbiBwZXJjZW50IChpbiBib3RoIHggYW5kIHkgZGlyZWN0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgY2hhbmdlIChlLmcuLCAwLjI1IHdvdWxkIGluY3JlYXNlIGEgc3RhcnRpbmcgc2NhbGUgb2YgMS4wIHRvIDEuMjUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbVBlcmNlbnQocGVyY2VudCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NhbGUueCArIHRoaXMuc2NhbGUueCAqIHBlcmNlbnRcclxuICAgICAgICB0aGlzLnNjYWxlLnNldChzY2FsZSlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGluY3JlYXNpbmcvZGVjcmVhc2luZyB3aWR0aCBieSBhIGNlcnRhaW4gbnVtYmVyIG9mIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSBpbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tKGNoYW5nZSwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZml0V2lkdGgoY2hhbmdlICsgdGhpcy53b3JsZFNjcmVlbldpZHRoLCBjZW50ZXIpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZT10cnVlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIGZpdHRpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHJpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IHZhbHVlICogdGhpcy5zY2FsZS54IC0gdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuICAgIHNldCBsZWZ0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG4gICAgc2V0IHRvcCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGJvdHRvbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgKyB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgYm90dG9tKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueSAtIHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgd2hldGhlciB0aGUgdmlld3BvcnQgaXMgZGlydHkgKGkuZS4sIG5lZWRzIHRvIGJlIHJlbmRlcmVyZWQgdG8gdGhlIHNjcmVlbiBiZWNhdXNlIG9mIGEgY2hhbmdlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBkaXJ0eSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcnR5XHJcbiAgICB9XHJcbiAgICBzZXQgZGlydHkodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGVybWFuZW50bHkgY2hhbmdlcyB0aGUgVmlld3BvcnQncyBoaXRBcmVhXHJcbiAgICAgKiA8cD5OT1RFOiBub3JtYWxseSB0aGUgaGl0QXJlYSA9IFBJWEkuUmVjdGFuZ2xlKFZpZXdwb3J0LmxlZnQsIFZpZXdwb3J0LnRvcCwgVmlld3BvcnQud29ybGRTY3JlZW5XaWR0aCwgVmlld3BvcnQud29ybGRTY3JlZW5IZWlnaHQpPC9wPlxyXG4gICAgICogQHR5cGUgeyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9XHJcbiAgICAgKi9cclxuICAgIGdldCBmb3JjZUhpdEFyZWEoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUhpdEFyZWFcclxuICAgIH1cclxuICAgIHNldCBmb3JjZUhpdEFyZWEodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gdmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCBvZiBtb3VzZS90b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sZWZ0RG93biA/IDEgOiAwKSArIHRoaXMudG91Y2hlcy5sZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHRvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHBvaW50ZXJzW2tleV1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlcy5pbmRleE9mKHBvaW50ZXIucG9pbnRlcklkKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcHMgYW5kIHJlc2V0cyBib3VuY2UgYW5kIGRlY2VsZXJhdGUgKGFzIG5lZWRlZCkgYWZ0ZXIgbWFudWFsbHkgbW92aW5nIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2JvdW5jZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5yZXNldCgpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10uYm91bmNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydzbmFwJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10uY2xhbXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMVUdJTlNcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgaW5zdGFsbGVkIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0gPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2UgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcGF1c2VQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnBhdXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXN1bWUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVzdW1lUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXN1bWUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSBkaXJlY3Rpb24gdG8gZHJhZyAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xMF0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGRyYWcob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RyYWcnXSA9IG5ldyBEcmFnKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBjbGFtcCB0byBib3VuZGFyaWVzIG9mIHdvcmxkXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXSA9IG5ldyBDbGFtcCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWNlbGVyYXRlIGFmdGVyIGEgbW92ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGRlY2VsZXJhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSA9IG5ldyBEZWNlbGVyYXRlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGJvdW5jZSBvbiBib3JkZXJzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWRlcz1hbGxdIGFsbCwgaG9yaXpvbnRhbCwgdmVydGljYWwsIG9yIGNvbWJpbmF0aW9uIG9mIHRvcCwgYm90dG9tLCByaWdodCwgbGVmdCAoZS5nLiwgJ3RvcC1ib3R0b20tcmlnaHQnKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuNV0gZnJpY3Rpb24gdG8gYXBwbHkgdG8gZGVjZWxlcmF0ZSBpZiBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTE1MF0gdGltZSBpbiBtcyB0byBmaW5pc2ggYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW2Vhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGJvdW5jZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10gPSBuZXcgQm91bmNlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBwaW5jaCB0byB6b29tIGFuZCB0d28tZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MS4wXSBwZXJjZW50IHRvIG1vZGlmeSBwaW5jaCBzcGVlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RyYWddIGRpc2FibGUgdHdvLWZpbmdlciBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHR3byBmaW5nZXJzXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBwaW5jaChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1sncGluY2gnXSA9IG5ldyBQaW5jaCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzbmFwIHRvIGEgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jZW50ZXJdIHNuYXAgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2FtZXJhIGluc3RlYWQgb2YgdGhlIHRvcC1sZWZ0IGNvcm5lciBvZiB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlPXRydWVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHNuYXAoeCwgeSwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXSA9IG5ldyBTbmFwKHRoaXMsIHgsIHksIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZvbGxvdyBhIHRhcmdldFxyXG4gICAgICogQHBhcmFtIHtQSVhJLkRpc3BsYXlPYmplY3R9IHRhcmdldCB0byBmb2xsb3cgKG9iamVjdCBtdXN0IGluY2x1ZGUge3g6IHgtY29vcmRpbmF0ZSwgeTogeS1jb29yZGluYXRlfSlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD0wXSB0byBmb2xsb3cgaW4gcGl4ZWxzL2ZyYW1lICgwPXRlbGVwb3J0IHRvIGxvY2F0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gcmFkaXVzIChpbiB3b3JsZCBjb29yZGluYXRlcykgb2YgY2VudGVyIGNpcmNsZSB3aGVyZSBtb3ZlbWVudCBpcyBhbGxvd2VkIHdpdGhvdXQgbW92aW5nIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZm9sbG93KHRhcmdldCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2ZvbGxvdyddID0gbmV3IEZvbGxvdyh0aGlzLCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdXNpbmcgbW91c2Ugd2hlZWxcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHdoZWVsKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWyd3aGVlbCddID0gbmV3IFdoZWVsKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBjbGFtcGluZyBvZiB6b29tIHRvIGNvbnN0cmFpbnRzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5XaWR0aF0gbWluaW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbkhlaWdodF0gbWluaW11bSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXaWR0aF0gbWF4aW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heEhlaWdodF0gbWF4aW11bSBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddID0gbmV3IENsYW1wWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzIG9yIHJhZGl1cy1kaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yaWdodF0gYWx0ZXJuYXRpdmVseSwgc2V0IHJpZ2h0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqL1xyXG4gICAgbW91c2VFZGdlcyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snbW91c2UtZWRnZXMnXSA9IG5ldyBNb3VzZUVkZ2VzKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHZpZXdwb3J0IChpbmNsdWRpbmcgYW5pbWF0aW9uIHVwZGF0ZXMgc3VjaCBhcyBkZWNlbGVyYXRlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBwYXVzZSgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlIH1cclxuICAgIHNldCBwYXVzZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9wYXVzZSA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9ICF2YWx1ZVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgYWZ0ZXIgYSBtb3VzZSBvciB0b3VjaCBjbGlja1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjY2xpY2tlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLXN0YXJ0XHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLWVuZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggZW5kXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZm9yIGEgbW91c2Ugd2hlZWwgZXZlbnRcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB3aGVlbFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5kelxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgd2hlZWwtc2Nyb2xsIG9jY3Vyc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWwtc2Nyb2xsXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIG1vdXNlLWVkZ2Ugc3RhcnRzIHRvIHNjcm9sbFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIG1vdXNlLWVkZ2Ugc2Nyb2xsaW5nIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2UtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0Il19