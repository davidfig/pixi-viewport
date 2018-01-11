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
            this.dirty = true;
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
            if (this.plugins['clamp']) {
                this.plugins['clamp'].update();
            }
            this.dirty = true;
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
         * @private
         * @return {number} count of mouse/touch pointers that are down on the container
         */
        value: function countDownPointers() {
            var count = 0;
            var pointers = this.trackedPointers;
            for (var key in pointers) {
                if (key === 'MOUSE') {
                    count += this.leftDown ? 1 : 0;
                } else {
                    count++;
                }
            }
            return count;
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
         */

    }, {
        key: 'worldScreenHeight',
        get: function get() {
            return this._screenHeight / this.scale.y;
        }

        /**
         * world width in screen coordinates
         * @type {number}
         */

    }, {
        key: 'screenWorldWidth',
        get: function get() {
            return this._worldWidth * this.scale.x;
        }

        /**
         * world height in screen coordinates
         * @type {number}
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
        }
    }, {
        key: 'corner',
        get: function get() {
            return { x: -this.x / this.scale.x, y: -this.y / this.scale.y };
        }
    }, {
        key: 'right',
        get: function get() {
            return -this.x / this.scale.x + this.worldScreenWidth;
        }

        /**
         * world coordinates of the left edge of the screen
         * @type {number}
         */

    }, {
        key: 'left',
        get: function get() {
            return -this.x / this.scale.x;
        }

        /**
         * world coordinates of the top edge of the screen
         * @type {number}
         */

    }, {
        key: 'top',
        get: function get() {
            return -this.y / this.scale.y;
        }

        /**
         * world coordinates of the bottom edge of the screen
         * @type {number}
         */

    }, {
        key: 'bottom',
        get: function get() {
            return -this.y / this.scale.y + this.worldScreenHeight;
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
 * fires when a drag starts
 * @event Viewport#drag
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJQSVhJIiwicmVxdWlyZSIsImV4aXN0cyIsIkRyYWciLCJQaW5jaCIsIkNsYW1wIiwiQ2xhbXBab29tIiwiRGVjZWxlcmF0ZSIsIkJvdW5jZSIsIlNuYXAiLCJTbmFwWm9vbSIsIkZvbGxvdyIsIldoZWVsIiwiTW91c2VFZGdlcyIsIlBMVUdJTl9PUkRFUiIsIlZpZXdwb3J0Iiwib3B0aW9ucyIsInBsdWdpbnMiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZm9yY2VIaXRBcmVhIiwidGhyZXNob2xkIiwibGlzdGVuZXJzIiwidGlja2VyIiwic2hhcmVkIiwiYWRkIiwidXBkYXRlIiwiX3BhdXNlIiwicGx1Z2luIiwiZWxhcHNlZE1TIiwiaGl0QXJlYSIsIngiLCJsZWZ0IiwieSIsInRvcCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0Iiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwicmVzaXplUGx1Z2lucyIsInR5cGUiLCJyZXNpemUiLCJpbnRlcmFjdGl2ZSIsIlJlY3RhbmdsZSIsIm9uIiwiZG93biIsIm1vdmUiLCJ1cCIsImRvY3VtZW50IiwiYm9keSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlV2hlZWwiLCJsZWZ0RG93biIsImRhdGEiLCJvcmlnaW5hbEV2ZW50IiwiTW91c2VFdmVudCIsImJ1dHRvbiIsImNoYW5nZSIsIk1hdGgiLCJhYnMiLCJyZXN1bHQiLCJ3aGVlbCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInRvTG9jYWwiLCJ0b0dsb2JhbCIsInBvaW50IiwiaXNOYU4iLCJwb3NpdGlvbiIsInNldCIsInNjYWxlIiwiX3Jlc2V0IiwiZGlydHkiLCJjZW50ZXIiLCJzYXZlIiwibW92ZUNlbnRlciIsInBlcmNlbnQiLCJmaXRXaWR0aCIsInJpZ2h0IiwiYm90dG9tIiwiY29ybmVyUG9pbnQiLCJjb3VudCIsInBvaW50ZXJzIiwidHJhY2tlZFBvaW50ZXJzIiwia2V5IiwicmVzZXQiLCJib3VuY2UiLCJjbGFtcCIsInBhdXNlIiwicmVzdW1lIiwidGFyZ2V0IiwidmFsdWUiLCJfZGlydHkiLCJfZm9yY2VIaXRBcmVhIiwiQ29udGFpbmVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLE9BQU9DLFFBQVEsU0FBUixDQUFiO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUUsT0FBT0YsUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNRyxRQUFRSCxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU1JLFFBQVFKLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUssWUFBWUwsUUFBUSxjQUFSLENBQWxCO0FBQ0EsSUFBTU0sYUFBYU4sUUFBUSxjQUFSLENBQW5CO0FBQ0EsSUFBTU8sU0FBU1AsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNUSxPQUFPUixRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1TLFdBQVdULFFBQVEsYUFBUixDQUFqQjtBQUNBLElBQU1VLFNBQVNWLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTVcsUUFBUVgsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNWSxhQUFhWixRQUFRLGVBQVIsQ0FBbkI7O0FBRUEsSUFBTWEsZUFBZSxDQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCLEVBQTJCLFFBQTNCLEVBQXFDLGFBQXJDLEVBQW9ELFlBQXBELEVBQWtFLFFBQWxFLEVBQTRFLFdBQTVFLEVBQXlGLFlBQXpGLEVBQXVHLE1BQXZHLEVBQStHLE9BQS9HLENBQXJCOztJQUVNQyxROzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QkFDeEJvRSxLLEVBQ1Y7QUFDSSxpQkFBS3BFLE1BQUwsR0FBY29FLEtBQWQ7QUFDQSxpQkFBS2xELFdBQUwsR0FBbUIsQ0FBQ2tELEtBQXBCO0FBQ0g7Ozs7RUFuNkJrQnRHLEtBQUt5RyxTOztBQXM2QjVCOzs7Ozs7Ozs7QUFTQTs7Ozs7Ozs7O0FBU0E7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7OztBQVdBOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BQyxPQUFPQyxPQUFQLEdBQWlCNUYsUUFBakIiLCJmaWxlIjoidmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZCA9IDVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaClcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIHBpbmNoLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgcGluY2gtZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1lbmRcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2Utc3RhcnRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLWVuZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IFtdXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBvcHRpb25zLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gb3B0aW9ucy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gb3B0aW9ucy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSBvcHRpb25zLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5oaXRBcmVhRnVsbFNjcmVlbiA9IGV4aXN0cyhvcHRpb25zLmhpdEFyZWFGdWxsU2NyZWVuKSA/IG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4gOiB0cnVlXHJcbiAgICAgICAgdGhpcy5mb3JjZUhpdEFyZWEgPSBvcHRpb25zLmZvcmNlSGl0QXJlYVxyXG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gZXhpc3RzKG9wdGlvbnMudGhyZXNob2xkKSA/IG9wdGlvbnMudGhyZXNob2xkIDogNVxyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzKClcclxuICAgICAgICB0aGlzLnRpY2tlciA9IG9wdGlvbnMudGlja2VyIHx8IFBJWEkudGlja2VyLnNoYXJlZFxyXG4gICAgICAgIHRoaXMudGlja2VyLmFkZCgoKSA9PiB0aGlzLnVwZGF0ZSgpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbcGx1Z2luXS51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS54ID0gdGhpcy5sZWZ0XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdEFyZWEud2lkdGggPSB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgIHRoaXMuaGl0QXJlYS5oZWlnaHQgPSB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgdGhpcyB0byBzZXQgc2NyZWVuIGFuZCB3b3JsZCBzaXplcy0tbmVlZGVkIGZvciBwaW5jaC93aGVlbC9jbGFtcC9ib3VuY2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5XaWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbkhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZFdpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZEhlaWdodF1cclxuICAgICAqL1xyXG4gICAgcmVzaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gc2NyZWVuV2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBzY3JlZW5IZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHdvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHdvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCBhZnRlciBhIHdvcmxkV2lkdGgvSGVpZ2h0IGNoYW5nZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVzaXplUGx1Z2lucygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzaXplKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlKSA9PiB0aGlzLmhhbmRsZVdoZWVsKGUpKVxyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRvd24gZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0uZG93bihlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hldGhlciBjaGFuZ2UgZXhjZWVkcyB0aHJlc2hvbGRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIGNoZWNrVGhyZXNob2xkKGNoYW5nZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA+PSB0aGlzLnRocmVzaG9sZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ubW92ZShlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0udXAoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB3aGVlbCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXS53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gc2NyZWVuIHRvIHdvcmxkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9Xb3JsZCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbChhcmd1bWVudHNbMF0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gd29ybGQgdG8gc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9TY3JlZW4oKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIGNlbnRlciBvZiB2aWV3cG9ydCB0byBwb2ludFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfFBJWEkuUG9pbnRMaWtlKX0geCBvciBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNlbnRlcigvKngsIHkgfCBQSVhJLlBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHgsIHlcclxuICAgICAgICBpZiAoIWlzTmFOKGFyZ3VtZW50c1swXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXS54XHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMF0ueVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgodGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHgpICogdGhpcy5zY2FsZS54LCAodGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB5KSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWVcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB2aWV3cG9ydCdzIHRvcC1sZWZ0IGNvcm5lcjsgYWxzbyBjbGFtcHMgYW5kIHJlc2V0cyBkZWNlbGVyYXRlIGFuZCBib3VuY2UgKGFzIG5lZWRlZClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHh8cG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ29ybmVyKC8qeCwgeSB8IHBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdLnggKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMF0ueSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXSAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1sxXSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWVcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIHdpZHRoIGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoPXRoaXMuX3dvcmxkV2lkdGhdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlclxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V2lkdGgod2lkdGgsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSBoZWlnaHQgZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0PXRoaXMuX3dvcmxkSGVpZ2h0XSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRIZWlnaHQoaGVpZ2h0LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuX3NjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGEgY2VydGFpbiBwZXJjZW50IChpbiBib3RoIHggYW5kIHkgZGlyZWN0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgY2hhbmdlIChlLmcuLCAwLjI1IHdvdWxkIGluY3JlYXNlIGEgc3RhcnRpbmcgc2NhbGUgb2YgMS4wIHRvIDEuMjUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbVBlcmNlbnQocGVyY2VudCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NhbGUueCArIHRoaXMuc2NhbGUueCAqIHBlcmNlbnRcclxuICAgICAgICB0aGlzLnNjYWxlLnNldChzY2FsZSlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGluY3JlYXNpbmcvZGVjcmVhc2luZyB3aWR0aCBieSBhIGNlcnRhaW4gbnVtYmVyIG9mIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSBpbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tKGNoYW5nZSwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZml0V2lkdGgoY2hhbmdlICsgdGhpcy53b3JsZFNjcmVlbldpZHRoLCBjZW50ZXIpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZT10cnVlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIGZpdHRpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBib3R0b20oKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55ICsgdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBkaXJ0eSAoaS5lLiwgbmVlZHMgdG8gYmUgcmVuZGVyZXJlZCB0byB0aGUgc2NyZWVuIGJlY2F1c2Ugb2YgYSBjaGFuZ2UpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGRpcnR5KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlydHlcclxuICAgIH1cclxuICAgIHNldCBkaXJ0eSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9kaXJ0eSA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwZXJtYW5lbnRseSBjaGFuZ2VzIHRoZSBWaWV3cG9ydCdzIGhpdEFyZWFcclxuICAgICAqIDxwPk5PVEU6IG5vcm1hbGx5IHRoZSBoaXRBcmVhID0gUElYSS5SZWN0YW5nbGUoVmlld3BvcnQubGVmdCwgVmlld3BvcnQudG9wLCBWaWV3cG9ydC53b3JsZFNjcmVlbldpZHRoLCBWaWV3cG9ydC53b3JsZFNjcmVlbkhlaWdodCk8L3A+XHJcbiAgICAgKiBAdHlwZSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGZvcmNlSGl0QXJlYSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlSGl0QXJlYVxyXG4gICAgfVxyXG4gICAgc2V0IGZvcmNlSGl0QXJlYSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IGNvdW50IG9mIG1vdXNlL3RvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIGNvbnRhaW5lclxyXG4gICAgICovXHJcbiAgICBjb3VudERvd25Qb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gMFxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnTU9VU0UnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCArPSB0aGlzLmxlZnREb3duID8gMSA6IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvdW50KytcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY291bnRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wcyBhbmQgcmVzZXRzIGJvdW5jZSBhbmQgZGVjZWxlcmF0ZSAoYXMgbmVlZGVkKSBhZnRlciBtYW51YWxseSBtb3Zpbmcgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snYm91bmNlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLnJlc2V0KClcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5ib3VuY2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ3NuYXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXS51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBMVUdJTlNcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgaW5zdGFsbGVkIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0gPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2UgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcGF1c2VQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnBhdXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXN1bWUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVzdW1lUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXN1bWUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MTBdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBkcmFnKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkcmFnJ10gPSBuZXcgRHJhZyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXAgdG8gYm91bmRhcmllcyBvZiB3b3JsZFxyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXAob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10gPSBuZXcgQ2xhbXAodGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVjZWxlcmF0ZSBhZnRlciBhIG1vdmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBkZWNlbGVyYXRlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10gPSBuZXcgRGVjZWxlcmF0ZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBib3VuY2Ugb24gYm9yZGVyc1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtlYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBib3VuY2Uob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddID0gbmV3IEJvdW5jZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgcGluY2ggdG8gem9vbSBhbmQgdHdvLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgcGluY2gob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3BpbmNoJ10gPSBuZXcgUGluY2godGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc25hcCB0byBhIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2VudGVyXSBzbmFwIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNhbWVyYSBpbnN0ZWFkIG9mIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2Ygdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZT10cnVlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZvbGxvdyh0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydmb2xsb3cnXSA9IG5ldyBGb2xsb3codGhpcywgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHVzaW5nIG1vdXNlIHdoZWVsXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICB3aGVlbChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snd2hlZWwnXSA9IG5ldyBXaGVlbCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXBpbmcgb2Ygem9vbSB0byBjb25zdHJhaW50c1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSA9IG5ldyBDbGFtcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2Nyb2xsIHZpZXdwb3J0IHdoZW4gbW91c2UgaG92ZXJzIG5lYXIgb25lIG9mIHRoZSBlZGdlcyBvciByYWRpdXMtZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKi9cclxuICAgIG1vdXNlRWRnZXMob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ21vdXNlLWVkZ2VzJ10gPSBuZXcgTW91c2VFZGdlcyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSB2aWV3cG9ydCAoaW5jbHVkaW5nIGFuaW1hdGlvbiB1cGRhdGVzIHN1Y2ggYXMgZGVjZWxlcmF0ZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLl9wYXVzZSB9XHJcbiAgICBzZXQgcGF1c2UodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fcGF1c2UgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSAhdmFsdWVcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZ1xyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1lbmRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIGVuZFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGZvciBhIG1vdXNlIHdoZWVsIGV2ZW50XHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge29iamVjdH0gd2hlZWxcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR4XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keVxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHpcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHdoZWVsLXNjcm9sbCBvY2N1cnNcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsLXNjcm9sbFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBtb3VzZS1lZGdlIHN0YXJ0cyB0byBzY3JvbGxcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2Utc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBtb3VzZS1lZGdlIHNjcm9sbGluZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBWaWV3cG9ydCJdfQ==