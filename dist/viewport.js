'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
            if (this.pause) {
                return;
            }
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

PIXI.extras.Viewport = Viewport;

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImxpc3RlbmVycyIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJhZGQiLCJ1cGRhdGUiLCJwYXVzZSIsInBsdWdpbiIsImVsYXBzZWRNUyIsImhpdEFyZWEiLCJ4IiwibGVmdCIsInkiLCJ0b3AiLCJ3aWR0aCIsIndvcmxkU2NyZWVuV2lkdGgiLCJoZWlnaHQiLCJ3b3JsZFNjcmVlbkhlaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJyZXNpemUiLCJkaXYiLCJpbnRlcmFjdGl2ZSIsIlJlY3RhbmdsZSIsIm9uIiwiZG93biIsIm1vdmUiLCJ1cCIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlV2hlZWwiLCJsZWZ0RG93biIsImRhdGEiLCJvcmlnaW5hbEV2ZW50IiwiTW91c2VFdmVudCIsImJ1dHRvbiIsInBvaW50ZXJUeXBlIiwicHVzaCIsInBvaW50ZXJJZCIsImNvdW50RG93blBvaW50ZXJzIiwibGFzdCIsImdsb2JhbCIsImRlY2VsZXJhdGUiLCJib3VuY2UiLCJ0b1giLCJ0b1kiLCJjbGlja2VkQXZhaWxhYmxlIiwiY2hhbmdlIiwiTWF0aCIsImFicyIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJwb2ludCIsInRvTG9jYWwiLCJjbGllbnRYIiwiY2xpZW50WSIsInJpZ2h0IiwiYm90dG9tIiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0dsb2JhbCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJzY2FsZSIsIl9yZXNldCIsImNlbnRlciIsInNhdmUiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwidHlwZSIsInJlc3VtZSIsInRhcmdldCIsInZhbHVlIiwibW92ZUNvcm5lciIsIl9kaXJ0eSIsIl9mb3JjZUhpdEFyZWEiLCJfcGF1c2UiLCJDb250YWluZXIiLCJleHRyYXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUcsUUFBUUgsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNSSxZQUFZSixRQUFRLGNBQVIsQ0FBbEI7QUFDQSxJQUFNSyxhQUFhTCxRQUFRLGNBQVIsQ0FBbkI7QUFDQSxJQUFNTSxTQUFTTixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1PLE9BQU9QLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFB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dmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgRHJhZyA9IHJlcXVpcmUoJy4vZHJhZycpXHJcbmNvbnN0IFBpbmNoID0gcmVxdWlyZSgnLi9waW5jaCcpXHJcbmNvbnN0IENsYW1wID0gcmVxdWlyZSgnLi9jbGFtcCcpXHJcbmNvbnN0IENsYW1wWm9vbSA9IHJlcXVpcmUoJy4vY2xhbXAtem9vbScpXHJcbmNvbnN0IERlY2VsZXJhdGUgPSByZXF1aXJlKCcuL2RlY2VsZXJhdGUnKVxyXG5jb25zdCBCb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpXHJcbmNvbnN0IFNuYXAgPSByZXF1aXJlKCcuL3NuYXAnKVxyXG5jb25zdCBTbmFwWm9vbSA9IHJlcXVpcmUoJy4vc25hcC16b29tJylcclxuY29uc3QgRm9sbG93ID0gcmVxdWlyZSgnLi9mb2xsb3cnKVxyXG5jb25zdCBXaGVlbCA9IHJlcXVpcmUoJy4vd2hlZWwnKVxyXG5jb25zdCBNb3VzZUVkZ2VzID0gcmVxdWlyZSgnLi9tb3VzZS1lZGdlcycpXHJcblxyXG5jb25zdCBQTFVHSU5fT1JERVIgPSBbJ2RyYWcnLCAncGluY2gnLCAnd2hlZWwnLCAnZm9sbG93JywgJ21vdXNlLWVkZ2VzJywgJ2RlY2VsZXJhdGUnLCAnYm91bmNlJywgJ3NuYXAtem9vbScsICdjbGFtcC16b29tJywgJ3NuYXAnLCAnY2xhbXAnXVxyXG5cclxuY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lclxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbiAgICAgKiBAZXh0ZW5kcyBFdmVudEVtaXR0ZXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5XaWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zY3JlZW5IZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkV2lkdGg9dGhpcy53aWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53b3JsZEhlaWdodD10aGlzLmhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQgPSA1XSBudW1iZXIgb2YgcGl4ZWxzIHRvIG1vdmUgdG8gdHJpZ2dlciBhbiBpbnB1dCBldmVudCAoZS5nLiwgZHJhZywgcGluY2gpXHJcbiAgICAgKiBAcGFyYW0geyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9IFtvcHRpb25zLmZvcmNlSGl0QXJlYV0gY2hhbmdlIHRoZSBkZWZhdWx0IGhpdEFyZWEgZnJvbSB3b3JsZCBzaXplIHRvIGEgbmV3IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkudGlja2VyLlRpY2tlcn0gW29wdGlvbnMudGlja2VyPVBJWEkudGlja2VyLnNoYXJlZF0gdXNlIHRoaXMgUElYSS50aWNrZXIgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwYXJhbSB7UElYSS5JbnRlcmFjdGlvbk1hbmFnZXJ9IFtvcHRpb25zLmludGVyYWN0aW9uPW51bGxdIEludGVyYWN0aW9uTWFuYWdlciwgdXNlZCB0byBjYWxjdWxhdGUgcG9pbnRlciBwb3N0aW9uIHJlbGF0aXZlIHRvXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5kaXZXaGVlbD1kb2N1bWVudC5ib2R5XSBkaXYgdG8gYXR0YWNoIHRoZSB3aGVlbCBldmVudFxyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBkcmFnLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgZHJhZy1lbmRcclxuICAgICAqIEBmaXJlcyBkcmFnLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHBpbmNoLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgcGluY2gtZW5kXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgc25hcC1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tc3RhcnRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tZW5kXHJcbiAgICAgKiBAZmlyZXMgc25hcC16b29tLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS14LXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtZW5kXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXktc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgd2hlZWxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGxcclxuICAgICAqIEBmaXJlcyB3aGVlbC1zY3JvbGwtcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1zdGFydFxyXG4gICAgICogQGZpcmVzIG1vdXNlLWVkZ2UtZW5kXHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3ZlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zTGlzdCA9IFtdXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBvcHRpb25zLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gb3B0aW9ucy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gb3B0aW9ucy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSBvcHRpb25zLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5oaXRBcmVhRnVsbFNjcmVlbiA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaGl0QXJlYUZ1bGxTY3JlZW4sIHRydWUpXHJcbiAgICAgICAgdGhpcy5mb3JjZUhpdEFyZWEgPSBvcHRpb25zLmZvcmNlSGl0QXJlYVxyXG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50aHJlc2hvbGQsIDUpXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbiA9IG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwgbnVsbFxyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzKG9wdGlvbnMuZGl2V2hlZWwgfHwgZG9jdW1lbnQuYm9keSlcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWN0aXZlIHRvdWNoIHBvaW50IGlkcyBvbiB0aGUgdmlld3BvcnRcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyW119XHJcbiAgICAgICAgICogQHJlYWRvbmx5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuXHJcbiAgICAgICAgdGhpcy50aWNrZXIgPSBvcHRpb25zLnRpY2tlciB8fCBQSVhJLnRpY2tlci5zaGFyZWRcclxuICAgICAgICB0aGlzLnRpY2tlci5hZGQoKCkgPT4gdGhpcy51cGRhdGUoKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSBhbmltYXRpb25zXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwbHVnaW4udXBkYXRlKHRoaXMudGlja2VyLmVsYXBzZWRNUylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZm9yY2VIaXRBcmVhKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnggPSB0aGlzLmxlZnRcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhLnkgPSB0aGlzLnRvcFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEud2lkdGggPSB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhLmhlaWdodCA9IHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgdGhpcyB0byBzZXQgc2NyZWVuIGFuZCB3b3JsZCBzaXplcy0tbmVlZGVkIGZvciBwaW5jaC93aGVlbC9jbGFtcC9ib3VuY2VcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY3JlZW5XaWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbkhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZFdpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3b3JsZEhlaWdodF1cclxuICAgICAqL1xyXG4gICAgcmVzaXplKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gc2NyZWVuV2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBzY3JlZW5IZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fd29ybGRXaWR0aCA9IHdvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IHdvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZXNpemVQbHVnaW5zKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCBhZnRlciBhIHdvcmxkV2lkdGgvSGVpZ2h0IGNoYW5nZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVzaXplUGx1Z2lucygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4ucmVzaXplKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5XaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBzY3JlZW5IZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuSGVpZ2h0ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRXaWR0aCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5fd29ybGRIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0IHdvcmxkSGVpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gdmFsdWVcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGlucHV0IGxpc3RlbmVyc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbGlzdGVuZXJzKGRpdilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVyZG93bicsIHRoaXMuZG93bilcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVybW92ZScsIHRoaXMubW92ZSlcclxuICAgICAgICB0aGlzLm9uKCdwb2ludGVydXAnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cG91dHNpZGUnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLnVwKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJvdXQnLCB0aGlzLnVwKVxyXG4gICAgICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlKSA9PiB0aGlzLmhhbmRsZVdoZWVsKGUpKVxyXG4gICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRvd24gZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzLnB1c2goZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNsaWNrZWQgZXZlbnQgZG9lcyBub3QgZmlyZSBpZiB2aWV3cG9ydCBpcyBkZWNlbGVyYXRpbmcgb3IgYm91bmNpbmdcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGNvbnN0IGJvdW5jZSA9IHRoaXMucGx1Z2luc1snYm91bmNlJ11cclxuICAgICAgICAgICAgaWYgKCghZGVjZWxlcmF0ZSB8fCAoIWRlY2VsZXJhdGUueCAmJiAhZGVjZWxlcmF0ZS55KSkgJiYgKCFib3VuY2UgfHwgKCFib3VuY2UudG9YICYmICFib3VuY2UudG9ZKSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4uZG93bihlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdoZXRoZXIgY2hhbmdlIGV4Y2VlZHMgdGhyZXNob2xkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZVxyXG4gICAgICovXHJcbiAgICBjaGVja1RocmVzaG9sZChjaGFuZ2UpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKE1hdGguYWJzKGNoYW5nZSkgPj0gdGhpcy50aHJlc2hvbGQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtb3ZlIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5tb3ZlKGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGlzdFggPSBlLmRhdGEuZ2xvYmFsLnggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICBjb25zdCBkaXN0WSA9IGUuZGF0YS5nbG9iYWwueSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLmNoZWNrVGhyZXNob2xkKGRpc3RZKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEub3JpZ2luYWxFdmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQgJiYgZS5kYXRhLm9yaWdpbmFsRXZlbnQuYnV0dG9uID09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnREb3duID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgIT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudG91Y2hlcy5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlc1tpXSA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvdWNoZXMuc3BsaWNlKGksIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4udXAoZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUgJiYgdGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcyB9KVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB3aGVlbCBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhhbmRsZVdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG9ubHkgaGFuZGxlIHdoZWVsIGV2ZW50cyB3aGVyZSB0aGUgbW91c2UgaXMgb3ZlciB0aGUgdmlld3BvcnRcclxuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMudG9Mb2NhbCh7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH0pXHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCA8PSBwb2ludC54ICYmIHBvaW50LnggPD0gdGhpcy5yaWdodCAmJiB0aGlzLnRvcCA8PSBwb2ludC55ICYmIHBvaW50LnkgPD0gdGhpcy5ib3R0b20pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGx1Z2luLndoZWVsKGUpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gc2NyZWVuIHRvIHdvcmxkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9Xb3JsZCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Mb2NhbChhcmd1bWVudHNbMF0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGNvb3JkaW5hdGVzIGZyb20gd29ybGQgdG8gc2NyZWVuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJucyB7UElYSS5Qb2ludH1cclxuICAgICAqL1xyXG4gICAgdG9TY3JlZW4oKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gd2lkdGggaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIGhlaWdodCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5IZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIHdpZHRoIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGhlaWdodCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBjZW50ZXIgb2Ygc2NyZWVuIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjZW50ZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB0aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0gdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjZW50ZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBjZW50ZXIgb2Ygdmlld3BvcnQgdG8gcG9pbnRcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxQSVhJLlBvaW50TGlrZSl9IHggb3IgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDZW50ZXIoLyp4LCB5IHwgUElYSS5Qb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB4LCB5XHJcbiAgICAgICAgaWYgKCFpc05hTihhcmd1bWVudHNbMF0pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF0ueFxyXG4gICAgICAgICAgICB5ID0gYXJndW1lbnRzWzBdLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoKHRoaXMud29ybGRTY3JlZW5XaWR0aCAvIDIgLSB4KSAqIHRoaXMuc2NhbGUueCwgKHRoaXMud29ybGRTY3JlZW5IZWlnaHQgLyAyIC0geSkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0b3AtbGVmdCBjb3JuZXJcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNvcm5lcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogLXRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogLXRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY29ybmVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNvcm5lcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgdmlld3BvcnQncyB0b3AtbGVmdCBjb3JuZXI7IGFsc28gY2xhbXBzIGFuZCByZXNldHMgZGVjZWxlcmF0ZSBhbmQgYm91bmNlIChhcyBuZWVkZWQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcnxQSVhJLlBvaW50fSB4fHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNvcm5lcigvKngsIHkgfCBwb2ludCovKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXS54ICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzBdLnkgKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0gKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMV0gKiB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIHdpZHRoIGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoPXRoaXMuX3dvcmxkV2lkdGhdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlclxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V2lkdGgod2lkdGgsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjcmVlbldpZHRoIC8gd2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgaGVpZ2h0IGZpdHMgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD10aGlzLl93b3JsZEhlaWdodF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0SGVpZ2h0KGhlaWdodCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gaXQgZml0cyB0aGUgZW50aXJlIHdvcmxkIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRXb3JsZChjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gaXQgZml0cyB0aGUgc2l6ZSBvciB0aGUgZW50aXJlIHdvcmxkIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSBkZXNpcmVkIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gZGVzaXJlZCBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdChjZW50ZXIsIHdpZHRoLCBoZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjcmVlbldpZHRoIC8gd2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgYSBjZXJ0YWluIHBlcmNlbnQgKGluIGJvdGggeCBhbmQgeSBkaXJlY3Rpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudCBjaGFuZ2UgKGUuZy4sIDAuMjUgd291bGQgaW5jcmVhc2UgYSBzdGFydGluZyBzY2FsZSBvZiAxLjAgdG8gMS4yNSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tUGVyY2VudChwZXJjZW50LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY2FsZS54ICsgdGhpcy5zY2FsZS54ICogcGVyY2VudFxyXG4gICAgICAgIHRoaXMuc2NhbGUuc2V0KHNjYWxlKVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdmlld3BvcnQgYnkgaW5jcmVhc2luZy9kZWNyZWFzaW5nIHdpZHRoIGJ5IGEgY2VydGFpbiBudW1iZXIgb2YgcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlIGluIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb20oY2hhbmdlLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5maXRXaWR0aChjaGFuZ2UgKyB0aGlzLndvcmxkU2NyZWVuV2lkdGgsIGNlbnRlcilcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIHpvb21cclxuICAgICAqL1xyXG4gICAgc25hcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAtem9vbSddID0gbmV3IFNuYXBab29tKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAdHlwZWRlZiBPdXRPZkJvdW5kc1xyXG4gICAgICogQHR5cGUge29iamVjdH1cclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gbGVmdFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSByaWdodFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSB0b3BcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gYm90dG9tXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIGlzIGNvbnRhaW5lciBvdXQgb2Ygd29ybGQgYm91bmRzXHJcbiAgICAgKiBAcmV0dXJuIHtPdXRPZkJvdW5kc31cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIE9PQigpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge31cclxuICAgICAgICByZXN1bHQubGVmdCA9IHRoaXMubGVmdCA8IDBcclxuICAgICAgICByZXN1bHQucmlnaHQgPSB0aGlzLnJpZ2h0ID4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIHJlc3VsdC50b3AgPSB0aGlzLnRvcCA8IDBcclxuICAgICAgICByZXN1bHQuYm90dG9tID0gdGhpcy5ib3R0b20gPiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIHJlc3VsdC5jb3JuZXJQb2ludCA9IHtcclxuICAgICAgICAgICAgeDogdGhpcy5fd29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueCAtIHRoaXMuX3NjcmVlbldpZHRoLFxyXG4gICAgICAgICAgICB5OiB0aGlzLl93b3JsZEhlaWdodCAqIHRoaXMuc2NhbGUueSAtIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgcmlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy54IC8gdGhpcy5zY2FsZS54ICsgdGhpcy53b3JsZFNjcmVlbldpZHRoXHJcbiAgICB9XHJcbiAgICBzZXQgcmlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54ICsgdGhpcy5zY3JlZW5XaWR0aFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGxlZnQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy54IC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcbiAgICBzZXQgbGVmdCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgdG9wIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHRvcCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnlcclxuICAgIH1cclxuICAgIHNldCB0b3AodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGJvdHRvbSBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBib3R0b20oKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55ICsgdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IGJvdHRvbSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnkgKyB0aGlzLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBkaXJ0eSAoaS5lLiwgbmVlZHMgdG8gYmUgcmVuZGVyZXJlZCB0byB0aGUgc2NyZWVuIGJlY2F1c2Ugb2YgYSBjaGFuZ2UpXHJcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGRpcnR5KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlydHlcclxuICAgIH1cclxuICAgIHNldCBkaXJ0eSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9kaXJ0eSA9IHZhbHVlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwZXJtYW5lbnRseSBjaGFuZ2VzIHRoZSBWaWV3cG9ydCdzIGhpdEFyZWFcclxuICAgICAqIDxwPk5PVEU6IG5vcm1hbGx5IHRoZSBoaXRBcmVhID0gUElYSS5SZWN0YW5nbGUoVmlld3BvcnQubGVmdCwgVmlld3BvcnQudG9wLCBWaWV3cG9ydC53b3JsZFNjcmVlbldpZHRoLCBWaWV3cG9ydC53b3JsZFNjcmVlbkhlaWdodCk8L3A+XHJcbiAgICAgKiBAdHlwZSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGZvcmNlSGl0QXJlYSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlSGl0QXJlYVxyXG4gICAgfVxyXG4gICAgc2V0IGZvcmNlSGl0QXJlYSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSB2YWx1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9mb3JjZUhpdEFyZWEgPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEgPSBuZXcgUElYSS5SZWN0YW5nbGUoMCwgMCwgdGhpcy53b3JsZFdpZHRoLCB0aGlzLndvcmxkSGVpZ2h0KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvdW50IG9mIG1vdXNlL3RvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBjb3VudERvd25Qb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxlZnREb3duID8gMSA6IDApICsgdGhpcy50b3VjaGVzLmxlbmd0aFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgb2YgdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkludGVyYWN0aW9uVHJhY2tpbmdEYXRhW119XHJcbiAgICAgKi9cclxuICAgIGdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gcG9pbnRlcnNba2V5XVxyXG4gICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzLmluZGV4T2YocG9pbnRlci5wb2ludGVySWQpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBvaW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wcyBhbmQgcmVzZXRzIGJvdW5jZSBhbmQgZGVjZWxlcmF0ZSAoYXMgbmVlZGVkKSBhZnRlciBtYW51YWxseSBtb3Zpbmcgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snYm91bmNlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLnJlc2V0KClcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5ib3VuY2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ3NuYXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXS51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExVR0lOU1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBpbnN0YWxsZWQgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXSA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5lbWl0KHR5cGUgKyAnLXJlbW92ZScpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzb3J0IHBsdWdpbnMgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHBsdWdpbnNTb3J0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNMaXN0LnB1c2godGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MTBdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBkcmFnKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkcmFnJ10gPSBuZXcgRHJhZyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcCB0byB3b3JsZCBib3VuZGFyaWVzIG9yIG90aGVyIHByb3ZpZGVkIGJvdW5kYXJpZXNcclxuICAgICAqIE5PVEVTOlxyXG4gICAgICogICBjbGFtcCBpcyBkaXNhYmxlZCBpZiBjYWxsZWQgd2l0aCBubyBvcHRpb25zOyB1c2UgeyBkaXJlY3Rpb246ICdhbGwnIH0gZm9yIGFsbCBlZGdlIGNsYW1waW5nXHJcbiAgICAgKiAgIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBib3VuY2Uob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddID0gbmV3IEJvdW5jZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgcGluY2ggdG8gem9vbSBhbmQgdHdvLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgcGluY2gob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3BpbmNoJ10gPSBuZXcgUGluY2godGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc25hcCB0byBhIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvblxyXG4gKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZvbGxvdyh0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydmb2xsb3cnXSA9IG5ldyBGb2xsb3codGhpcywgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHVzaW5nIG1vdXNlIHdoZWVsXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICB3aGVlbChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snd2hlZWwnXSA9IG5ldyBXaGVlbCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXBpbmcgb2Ygem9vbSB0byBjb25zdHJhaW50c1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSA9IG5ldyBDbGFtcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2Nyb2xsIHZpZXdwb3J0IHdoZW4gbW91c2UgaG92ZXJzIG5lYXIgb25lIG9mIHRoZSBlZGdlcyBvciByYWRpdXMtZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKi9cclxuICAgIG1vdXNlRWRnZXMob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ21vdXNlLWVkZ2VzJ10gPSBuZXcgTW91c2VFZGdlcyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSB2aWV3cG9ydCAoaW5jbHVkaW5nIGFuaW1hdGlvbiB1cGRhdGVzIHN1Y2ggYXMgZGVjZWxlcmF0ZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLl9wYXVzZSB9XHJcbiAgICBzZXQgcGF1c2UodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fcGF1c2UgPSB2YWx1ZVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgYWZ0ZXIgYSBtb3VzZSBvciB0b3VjaCBjbGlja1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjY2xpY2tlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLXN0YXJ0XHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLWVuZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggZW5kXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZm9yIGEgbW91c2Ugd2hlZWwgZXZlbnRcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB3aGVlbFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5kelxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgd2hlZWwtc2Nyb2xsIG9jY3Vyc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWwtc2Nyb2xsXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIG1vdXNlLWVkZ2Ugc3RhcnRzIHRvIHNjcm9sbFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIG1vdXNlLWVkZ2Ugc2Nyb2xsaW5nIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2UtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcblBJWEkuZXh0cmFzLlZpZXdwb3J0ID0gVmlld3BvcnRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQiXX0=