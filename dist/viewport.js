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
 * @type {Viewport}
 */

PIXI.extras.Viewport = Viewport;

module.exports = Viewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImxpc3RlbmVycyIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJhZGQiLCJ1cGRhdGUiLCJwYXVzZSIsInBsdWdpbiIsImVsYXBzZWRNUyIsImhpdEFyZWEiLCJ4IiwibGVmdCIsInkiLCJ0b3AiLCJ3aWR0aCIsIndvcmxkU2NyZWVuV2lkdGgiLCJoZWlnaHQiLCJ3b3JsZFNjcmVlbkhlaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJyZXNpemUiLCJkaXYiLCJpbnRlcmFjdGl2ZSIsIlJlY3RhbmdsZSIsIm9uIiwiZG93biIsIm1vdmUiLCJ1cCIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlV2hlZWwiLCJsZWZ0RG93biIsImRhdGEiLCJvcmlnaW5hbEV2ZW50IiwiTW91c2VFdmVudCIsImJ1dHRvbiIsInBvaW50ZXJUeXBlIiwicHVzaCIsInBvaW50ZXJJZCIsImNvdW50RG93blBvaW50ZXJzIiwibGFzdCIsImdsb2JhbCIsImRlY2VsZXJhdGUiLCJib3VuY2UiLCJ0b1giLCJ0b1kiLCJjbGlja2VkQXZhaWxhYmxlIiwiY2hhbmdlIiwiTWF0aCIsImFicyIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJwb2ludCIsInRvTG9jYWwiLCJjbGllbnRYIiwiY2xpZW50WSIsInJpZ2h0IiwiYm90dG9tIiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0dsb2JhbCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJzY2FsZSIsIl9yZXNldCIsImNlbnRlciIsInNhdmUiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwidHlwZSIsInJlc3VtZSIsInRhcmdldCIsInZhbHVlIiwibW92ZUNvcm5lciIsIl9kaXJ0eSIsIl9mb3JjZUhpdEFyZWEiLCJfcGF1c2UiLCJDb250YWluZXIiLCJleHRyYXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUcsUUFBUUgsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNSSxZQUFZSixRQUFRLGNBQVIsQ0FBbEI7QUFDQSxJQUFNSyxhQUFhTCxRQUFRLGNBQVIsQ0FBbkI7QUFDQSxJQUFNTSxTQUFTTixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1PLE9BQU9QLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFB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QUFNQXBHLEtBQUtxRyxNQUFMLENBQVk1SCxRQUFaLEdBQXVCQSxRQUF2Qjs7QUFFQTZILE9BQU9DLE9BQVAsR0FBaUI5SCxRQUFqQiIsImZpbGUiOiJ2aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZCA9IDVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaClcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQHBhcmFtIHtQSVhJLkludGVyYWN0aW9uTWFuYWdlcn0gW29wdGlvbnMuaW50ZXJhY3Rpb249bnVsbF0gSW50ZXJhY3Rpb25NYW5hZ2VyLCB1c2VkIHRvIGNhbGN1bGF0ZSBwb2ludGVyIHBvc3Rpb24gcmVsYXRpdmUgdG9cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIGRyYWctcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRocmVzaG9sZCwgNSlcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gb3B0aW9ucy5pbnRlcmFjdGlvbiB8fCBudWxsXHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMob3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5KVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhY3RpdmUgdG91Y2ggcG9pbnQgaWRzIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJbXX1cclxuICAgICAgICAgKiBAcmVhZG9ubHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG5cclxuICAgICAgICB0aGlzLnRpY2tlciA9IG9wdGlvbnMudGlja2VyIHx8IFBJWEkudGlja2VyLnNoYXJlZFxyXG4gICAgICAgIHRoaXMudGlja2VyLmFkZCgoKSA9PiB0aGlzLnVwZGF0ZSgpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbi51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS53aWR0aCA9IHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbldpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkSGVpZ2h0XVxyXG4gICAgICovXHJcbiAgICByZXNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoZGl2KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSkpXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZG93biBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IHRydWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlLmRhdGEucG9pbnRlclR5cGUgIT09ICdtb3VzZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRvdWNoZXMucHVzaChlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG5cclxuICAgICAgICAgICAgLy8gY2xpY2tlZCBldmVudCBkb2VzIG5vdCBmaXJlIGlmIHZpZXdwb3J0IGlzIGRlY2VsZXJhdGluZyBvciBib3VuY2luZ1xyXG4gICAgICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICAgICAgY29uc3QgYm91bmNlID0gdGhpcy5wbHVnaW5zWydib3VuY2UnXVxyXG4gICAgICAgICAgICBpZiAoKCFkZWNlbGVyYXRlIHx8ICghZGVjZWxlcmF0ZS54ICYmICFkZWNlbGVyYXRlLnkpKSAmJiAoIWJvdW5jZSB8fCAoIWJvdW5jZS50b1ggJiYgIWJvdW5jZS50b1kpKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5kb3duKGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd2hldGhlciBjaGFuZ2UgZXhjZWVkcyB0aHJlc2hvbGRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIGNoZWNrVGhyZXNob2xkKGNoYW5nZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoTWF0aC5hYnMoY2hhbmdlKSA+PSB0aGlzLnRocmVzaG9sZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmUgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLm1vdmUoZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0WCA9IGUuZGF0YS5nbG9iYWwueCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RZID0gZS5kYXRhLmdsb2JhbC55IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCAmJiBlLmRhdGEub3JpZ2luYWxFdmVudC5idXR0b24gPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGUuZGF0YS5wb2ludGVyVHlwZSAhPT0gJ21vdXNlJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3VjaGVzW2ldID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG91Y2hlcy5zcGxpY2UoaSwgMSlcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi51cChlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSAmJiB0aGlzLmNvdW50RG93blBvaW50ZXJzKCkgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzIH0pXHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHdoZWVsIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgaGFuZGxlV2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb25seSBoYW5kbGUgd2hlZWwgZXZlbnRzIHdoZXJlIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy50b0xvY2FsKHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFkgfSlcclxuICAgICAgICBpZiAodGhpcy5sZWZ0IDw9IHBvaW50LnggJiYgcG9pbnQueCA8PSB0aGlzLnJpZ2h0ICYmIHRoaXMudG9wIDw9IHBvaW50LnkgJiYgcG9pbnQueSA8PSB0aGlzLmJvdHRvbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHRcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbHVnaW4ud2hlZWwoZSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSBzY3JlZW4gdG8gd29ybGRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1dvcmxkKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKHsgeCwgeSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0xvY2FsKGFyZ3VtZW50c1swXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY29vcmRpbmF0ZXMgZnJvbSB3b3JsZCB0byBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeV1cclxuICAgICAqIEByZXR1cm5zIHtQSVhJLlBvaW50fVxyXG4gICAgICovXHJcbiAgICB0b1NjcmVlbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvR2xvYmFsKHBvaW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRTY3JlZW5XaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbldpZHRoIC8gdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JlZW4gaGVpZ2h0IGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodCAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZFdpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aCAqIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgaGVpZ2h0IGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodCAqIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGNlbnRlciBvZiBzY3JlZW4gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtQSVhJLlBvaW50TGlrZX1cclxuICAgICAqL1xyXG4gICAgZ2V0IGNlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogdGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHRoaXMueCAvIHRoaXMuc2NhbGUueCwgeTogdGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB0aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNlbnRlcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDZW50ZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIGNlbnRlciBvZiB2aWV3cG9ydCB0byBwb2ludFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfFBJWEkuUG9pbnRMaWtlKX0geCBvciBwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgbW92ZUNlbnRlcigvKngsIHkgfCBQSVhJLlBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHgsIHlcclxuICAgICAgICBpZiAoIWlzTmFOKGFyZ3VtZW50c1swXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdXHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgeCA9IGFyZ3VtZW50c1swXS54XHJcbiAgICAgICAgICAgIHkgPSBhcmd1bWVudHNbMF0ueVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgodGhpcy53b3JsZFNjcmVlbldpZHRoIC8gMiAtIHgpICogdGhpcy5zY2FsZS54LCAodGhpcy53b3JsZFNjcmVlbkhlaWdodCAvIDIgLSB5KSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRvcC1sZWZ0IGNvcm5lclxyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY29ybmVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiAtdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiAtdGhpcy55IC8gdGhpcy5zY2FsZS55IH1cclxuICAgIH1cclxuICAgIHNldCBjb3JuZXIodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQ29ybmVyKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB2aWV3cG9ydCdzIHRvcC1sZWZ0IGNvcm5lcjsgYWxzbyBjbGFtcHMgYW5kIHJlc2V0cyBkZWNlbGVyYXRlIGFuZCBib3VuY2UgKGFzIG5lZWRlZClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfFBJWEkuUG9pbnR9IHh8cG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ29ybmVyKC8qeCwgeSB8IHBvaW50Ki8pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdLnggKiB0aGlzLnNjYWxlLngsIC1hcmd1bWVudHNbMF0ueSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5zZXQoLWFyZ3VtZW50c1swXSAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1sxXSAqIHRoaXMuc2NhbGUueSlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyB0aGUgd2lkdGggZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGg9dGhpcy5fd29ybGRXaWR0aF0gaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRXaWR0aCh3aWR0aCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSBoZWlnaHQgZml0cyBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0PXRoaXMuX3dvcmxkSGVpZ2h0XSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXRIZWlnaHQoaGVpZ2h0LCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdvcmxkKGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2Ugem9vbSBzbyBpdCBmaXRzIHRoZSBzaXplIG9yIHRoZSBlbnRpcmUgd29ybGQgaW4gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIGRlc2lyZWQgd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBkZXNpcmVkIGhlaWdodFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0KGNlbnRlciwgd2lkdGgsIGhlaWdodClcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCB0aGlzLndvcmxkV2lkdGhcclxuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy53b3JsZEhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NyZWVuV2lkdGggLyB3aWR0aFxyXG4gICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NyZWVuSGVpZ2h0IC8gaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMuc2NhbGUueCA8IHRoaXMuc2NhbGUueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueSA9IHRoaXMuc2NhbGUueFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLnNjYWxlLnlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBhIGNlcnRhaW4gcGVyY2VudCAoaW4gYm90aCB4IGFuZCB5IGRpcmVjdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50IGNoYW5nZSAoZS5nLiwgMC4yNSB3b3VsZCBpbmNyZWFzZSBhIHN0YXJ0aW5nIHNjYWxlIG9mIDEuMCB0byAxLjI1KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXIgb2YgdGhlIHNjcmVlbiBhZnRlciB6b29tXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIHpvb21QZXJjZW50KHBlcmNlbnQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlLnggKyB0aGlzLnNjYWxlLnggKiBwZXJjZW50XHJcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoc2NhbGUpXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogem9vbSB2aWV3cG9ydCBieSBpbmNyZWFzaW5nL2RlY3JlYXNpbmcgd2lkdGggYnkgYSBjZXJ0YWluIG51bWJlciBvZiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2UgaW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbShjaGFuZ2UsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmZpdFdpZHRoKGNoYW5nZSArIHRoaXMud29ybGRTY3JlZW5XaWR0aCwgY2VudGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGhdIHRoZSBkZXNpcmVkIHdpZHRoIHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodF0gdGhlIGRlc2lyZWQgaGVpZ2h0IHRvIHNuYXAgKHRvIG1haW50YWluIGFzcGVjdCByYXRpbywgY2hvb3NlIG9ubHkgd2lkdGggb3IgaGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgem9vbVxyXG4gICAgICovXHJcbiAgICBzbmFwWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snc25hcC16b29tJ10gPSBuZXcgU25hcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEB0eXBlZGVmIE91dE9mQm91bmRzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBsZWZ0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHJpZ2h0XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IHRvcFxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBib3R0b21cclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaXMgY29udGFpbmVyIG91dCBvZiB3b3JsZCBib3VuZHNcclxuICAgICAqIEByZXR1cm4ge091dE9mQm91bmRzfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgT09CKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fVxyXG4gICAgICAgIHJlc3VsdC5sZWZ0ID0gdGhpcy5sZWZ0IDwgMFxyXG4gICAgICAgIHJlc3VsdC5yaWdodCA9IHRoaXMucmlnaHQgPiB0aGlzLl93b3JsZFdpZHRoXHJcbiAgICAgICAgcmVzdWx0LnRvcCA9IHRoaXMudG9wIDwgMFxyXG4gICAgICAgIHJlc3VsdC5ib3R0b20gPSB0aGlzLmJvdHRvbSA+IHRoaXMuX3dvcmxkSGVpZ2h0XHJcbiAgICAgICAgcmVzdWx0LmNvcm5lclBvaW50ID0ge1xyXG4gICAgICAgICAgICB4OiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54IC0gdGhpcy5fc2NyZWVuV2lkdGgsXHJcbiAgICAgICAgICAgIHk6IHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55IC0gdGhpcy5fc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSByaWdodCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCByaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnggKyB0aGlzLndvcmxkU2NyZWVuV2lkdGhcclxuICAgIH1cclxuICAgIHNldCByaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnggPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnggKyB0aGlzLnNjcmVlbldpZHRoXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgbGVmdCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuICAgIHNldCBsZWZ0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSB0b3AgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgdG9wKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueVxyXG4gICAgfVxyXG4gICAgc2V0IHRvcCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnkgPSAtdmFsdWUgKiB0aGlzLnNjYWxlLnlcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGJvdHRvbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgKyB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICB9XHJcbiAgICBzZXQgYm90dG9tKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueSArIHRoaXMuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGRpcnR5IChpLmUuLCBuZWVkcyB0byBiZSByZW5kZXJlcmVkIHRvIHRoZSBzY3JlZW4gYmVjYXVzZSBvZiBhIGNoYW5nZSlcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgZGlydHkoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJ0eVxyXG4gICAgfVxyXG4gICAgc2V0IGRpcnR5KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX2RpcnR5ID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBlcm1hbmVudGx5IGNoYW5nZXMgdGhlIFZpZXdwb3J0J3MgaGl0QXJlYVxyXG4gICAgICogPHA+Tk9URTogbm9ybWFsbHkgdGhlIGhpdEFyZWEgPSBQSVhJLlJlY3RhbmdsZShWaWV3cG9ydC5sZWZ0LCBWaWV3cG9ydC50b3AsIFZpZXdwb3J0LndvcmxkU2NyZWVuV2lkdGgsIFZpZXdwb3J0LndvcmxkU2NyZWVuSGVpZ2h0KTwvcD5cclxuICAgICAqIEB0eXBlIHsoUElYSS5SZWN0YW5nbGV8UElYSS5DaXJjbGV8UElYSS5FbGxpcHNlfFBJWEkuUG9seWdvbnxQSVhJLlJvdW5kZWRSZWN0YW5nbGUpfVxyXG4gICAgICovXHJcbiAgICBnZXQgZm9yY2VIaXRBcmVhKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VIaXRBcmVhXHJcbiAgICB9XHJcbiAgICBzZXQgZm9yY2VIaXRBcmVhKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IHZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlSGl0QXJlYSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgb2YgbW91c2UvdG91Y2ggcG9pbnRlcnMgdGhhdCBhcmUgZG93biBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGNvdW50RG93blBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGVmdERvd24gPyAxIDogMCkgKyB0aGlzLnRvdWNoZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiB0b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBwb2ludGVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXMuaW5kZXhPZihwb2ludGVyLnBvaW50ZXJJZCkgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xhbXBzIGFuZCByZXNldHMgYm91bmNlIGFuZCBkZWNlbGVyYXRlIChhcyBuZWVkZWQpIGFmdGVyIG1hbnVhbGx5IG1vdmluZyB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3Jlc2V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydib3VuY2UnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10ucmVzZXQoKVxyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLmJvdW5jZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snc25hcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10ucmVzZXQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcCddKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddLnVwZGF0ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddLmNsYW1wKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICAvLyBQTFVHSU5TXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGluc3RhbGxlZCBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIG9mIHBsdWdpbiAoZS5nLiwgJ2RyYWcnLCAncGluY2gnKVxyXG4gICAgICovXHJcbiAgICByZW1vdmVQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmVtaXQodHlwZSArICctcmVtb3ZlJylcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGF1c2UgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcGF1c2VQbHVnaW4odHlwZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3R5cGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zW3R5cGVdLnBhdXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXN1bWUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVzdW1lUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5yZXN1bWUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNvcnQgcGx1Z2lucyBmb3IgdXBkYXRlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcGx1Z2luc1NvcnQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc0xpc3QgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiBQTFVHSU5fT1JERVIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc0xpc3QucHVzaCh0aGlzLnBsdWdpbnNbcGx1Z2luXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSBkaXJlY3Rpb24gdG8gZHJhZyAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xMF0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGRyYWcob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2RyYWcnXSA9IG5ldyBEcmFnKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wIHRvIHdvcmxkIGJvdW5kYXJpZXMgb3Igb3RoZXIgcHJvdmlkZWQgYm91bmRhcmllc1xyXG4gICAgICogTk9URVM6XHJcbiAgICAgKiAgIGNsYW1wIGlzIGRpc2FibGVkIGlmIGNhbGxlZCB3aXRoIG5vIG9wdGlvbnM7IHVzZSB7IGRpcmVjdGlvbjogJ2FsbCcgfSBmb3IgYWxsIGVkZ2UgY2xhbXBpbmdcclxuICAgICAqICAgc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmxlZnRdIGNsYW1wIGxlZnQ7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5yaWdodF0gY2xhbXAgcmlnaHQ7IHRydWU9dmlld3BvcnQud29ybGRXaWR0aFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy50b3BdIGNsYW1wIHRvcDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmJvdHRvbV0gY2xhbXAgYm90dG9tOyB0cnVlPXZpZXdwb3J0LndvcmxkSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uXSAoYWxsLCB4LCBvciB5KSB1c2luZyBjbGFtcHMgb2YgWzAsIHZpZXdwb3J0LndvcmxkV2lkdGgvdmlld3BvcnQud29ybGRIZWlnaHRdOyByZXBsYWNlcyBsZWZ0L3JpZ2h0L3RvcC9ib3R0b20gaWYgc2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgY2xhbXAob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wJ10gPSBuZXcgQ2xhbXAodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVjZWxlcmF0ZSBhZnRlciBhIG1vdmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBkZWNlbGVyYXRlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10gPSBuZXcgRGVjZWxlcmF0ZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBib3VuY2Ugb24gYm9yZGVyc1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGJvdW5jZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snYm91bmNlJ10gPSBuZXcgQm91bmNlKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBwaW5jaCB0byB6b29tIGFuZCB0d28tZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MS4wXSBwZXJjZW50IHRvIG1vZGlmeSBwaW5jaCBzcGVlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RyYWddIGRpc2FibGUgdHdvLWZpbmdlciBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHR3byBmaW5nZXJzXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBwaW5jaChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1sncGluY2gnXSA9IG5ldyBQaW5jaCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzbmFwIHRvIGEgcG9pbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50b3BMZWZ0XSBzbmFwIHRvIHRoZSB0b3AtbGVmdCBvZiB2aWV3cG9ydCBpbnN0ZWFkIG9mIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uXHJcbiAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHNuYXAoeCwgeSwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3NuYXAnXSA9IG5ldyBTbmFwKHRoaXMsIHgsIHksIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZvbGxvdyBhIHRhcmdldFxyXG4gICAgICogQHBhcmFtIHtQSVhJLkRpc3BsYXlPYmplY3R9IHRhcmdldCB0byBmb2xsb3cgKG9iamVjdCBtdXN0IGluY2x1ZGUge3g6IHgtY29vcmRpbmF0ZSwgeTogeS1jb29yZGluYXRlfSlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD0wXSB0byBmb2xsb3cgaW4gcGl4ZWxzL2ZyYW1lICgwPXRlbGVwb3J0IHRvIGxvY2F0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gcmFkaXVzIChpbiB3b3JsZCBjb29yZGluYXRlcykgb2YgY2VudGVyIGNpcmNsZSB3aGVyZSBtb3ZlbWVudCBpcyBhbGxvd2VkIHdpdGhvdXQgbW92aW5nIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZm9sbG93KHRhcmdldCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2ZvbGxvdyddID0gbmV3IEZvbGxvdyh0aGlzLCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHpvb20gdXNpbmcgbW91c2Ugd2hlZWxcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHdoZWVsKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWyd3aGVlbCddID0gbmV3IFdoZWVsKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBjbGFtcGluZyBvZiB6b29tIHRvIGNvbnN0cmFpbnRzXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5XaWR0aF0gbWluaW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbkhlaWdodF0gbWluaW11bSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXaWR0aF0gbWF4aW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heEhlaWdodF0gbWF4aW11bSBoZWlnaHRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wWm9vbShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAtem9vbSddID0gbmV3IENsYW1wWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzIG9yIHJhZGl1cy1kaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yaWdodF0gYWx0ZXJuYXRpdmVseSwgc2V0IHJpZ2h0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqL1xyXG4gICAgbW91c2VFZGdlcyhvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snbW91c2UtZWRnZXMnXSA9IG5ldyBNb3VzZUVkZ2VzKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHZpZXdwb3J0IChpbmNsdWRpbmcgYW5pbWF0aW9uIHVwZGF0ZXMgc3VjaCBhcyBkZWNlbGVyYXRlKVxyXG4gICAgICogTk9URTogd2hlbiBzZXR0aW5nIHBhdXNlPXRydWUsIGFsbCB0b3VjaGVzIGFuZCBtb3VzZSBhY3Rpb25zIGFyZSBjbGVhcmVkIChpLmUuLCBpZiBtb3VzZWRvd24gd2FzIGFjdGl2ZSwgaXQgYmVjb21lcyBpbmFjdGl2ZSBmb3IgcHVycG9zZXMgb2YgdGhlIHZpZXdwb3J0KVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBwYXVzZSgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlIH1cclxuICAgIHNldCBwYXVzZSh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9wYXVzZSA9IHZhbHVlXHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50b3VjaGVzID0gW11cclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgYWZ0ZXIgYSBtb3VzZSBvciB0b3VjaCBjbGlja1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjY2xpY2tlZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLXN0YXJ0XHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSB3b3JsZFxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgZHJhZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNkcmFnLWVuZFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgcGluY2ggZW5kXHJcbiAqIEBldmVudCBWaWV3cG9ydCNwaW5jaC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcCBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzbmFwLXpvb20gc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3NuYXAtem9vbS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIHN0YXJ0cyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBlbmRzIGluIHRoZSB4IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXgtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeSBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS15LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZm9yIGEgbW91c2Ugd2hlZWwgZXZlbnRcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB3aGVlbFxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHhcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5kelxyXG4gKiBAcHJvcGVydHkge1ZpZXdwb3J0fSB2aWV3cG9ydFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgd2hlZWwtc2Nyb2xsIG9jY3Vyc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjd2hlZWwtc2Nyb2xsXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIG1vdXNlLWVkZ2Ugc3RhcnRzIHRvIHNjcm9sbFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW91c2UtZWRnZS1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIG1vdXNlLWVkZ2Ugc2Nyb2xsaW5nIGVuZHNcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2UtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjbW92ZWRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcblBJWEkuZXh0cmFzLlZpZXdwb3J0ID0gVmlld3BvcnRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQiXX0=