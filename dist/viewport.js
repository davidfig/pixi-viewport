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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJEcmFnIiwiUGluY2giLCJDbGFtcCIsIkNsYW1wWm9vbSIsIkRlY2VsZXJhdGUiLCJCb3VuY2UiLCJTbmFwIiwiU25hcFpvb20iLCJGb2xsb3ciLCJXaGVlbCIsIk1vdXNlRWRnZXMiLCJQTFVHSU5fT1JERVIiLCJWaWV3cG9ydCIsIm9wdGlvbnMiLCJwbHVnaW5zIiwicGx1Z2luc0xpc3QiLCJfc2NyZWVuV2lkdGgiLCJzY3JlZW5XaWR0aCIsIl9zY3JlZW5IZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJfd29ybGRXaWR0aCIsIndvcmxkV2lkdGgiLCJfd29ybGRIZWlnaHQiLCJ3b3JsZEhlaWdodCIsImhpdEFyZWFGdWxsU2NyZWVuIiwiZGVmYXVsdHMiLCJmb3JjZUhpdEFyZWEiLCJ0aHJlc2hvbGQiLCJpbnRlcmFjdGlvbiIsImxpc3RlbmVycyIsImRpdldoZWVsIiwiZG9jdW1lbnQiLCJib2R5IiwidG91Y2hlcyIsInRpY2tlciIsIlBJWEkiLCJzaGFyZWQiLCJhZGQiLCJ1cGRhdGUiLCJwYXVzZSIsInBsdWdpbiIsImVsYXBzZWRNUyIsImhpdEFyZWEiLCJ4IiwibGVmdCIsInkiLCJ0b3AiLCJ3aWR0aCIsIndvcmxkU2NyZWVuV2lkdGgiLCJoZWlnaHQiLCJ3b3JsZFNjcmVlbkhlaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsInJlc2l6ZVBsdWdpbnMiLCJyZXNpemUiLCJkaXYiLCJpbnRlcmFjdGl2ZSIsIlJlY3RhbmdsZSIsIm9uIiwiZG93biIsIm1vdmUiLCJ1cCIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlV2hlZWwiLCJsZWZ0RG93biIsImRhdGEiLCJwb2ludGVyVHlwZSIsIm9yaWdpbmFsRXZlbnQiLCJidXR0b24iLCJwdXNoIiwicG9pbnRlcklkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwiZ2xvYmFsIiwiZGVjZWxlcmF0ZSIsImJvdW5jZSIsInRvWCIsInRvWSIsImNsaWNrZWRBdmFpbGFibGUiLCJjaGFuZ2UiLCJNYXRoIiwiYWJzIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwiTW91c2VFdmVudCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJwb2ludCIsInRvTG9jYWwiLCJjbGllbnRYIiwiY2xpZW50WSIsInJpZ2h0IiwiYm90dG9tIiwicmVzdWx0Iiwid2hlZWwiLCJhcmd1bWVudHMiLCJ0b0dsb2JhbCIsImlzTmFOIiwicG9zaXRpb24iLCJzZXQiLCJzY2FsZSIsIl9yZXNldCIsImNlbnRlciIsInNhdmUiLCJtb3ZlQ2VudGVyIiwicGVyY2VudCIsImZpdFdpZHRoIiwicGx1Z2luc1NvcnQiLCJjb3JuZXJQb2ludCIsInJlc3VsdHMiLCJwb2ludGVycyIsInRyYWNrZWRQb2ludGVycyIsImtleSIsInBvaW50ZXIiLCJpbmRleE9mIiwicmVzZXQiLCJjbGFtcCIsImRpcnR5IiwidHlwZSIsInJlc3VtZSIsInRhcmdldCIsInZhbHVlIiwibW92ZUNvcm5lciIsIl9kaXJ0eSIsIl9mb3JjZUhpdEFyZWEiLCJfcGF1c2UiLCJDb250YWluZXIiLCJleHRyYXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkO0FBQ0EsSUFBTUcsUUFBUUgsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNSSxZQUFZSixRQUFRLGNBQVIsQ0FBbEI7QUFDQSxJQUFNSyxhQUFhTCxRQUFRLGNBQVIsQ0FBbkI7QUFDQSxJQUFNTSxTQUFTTixRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1PLE9BQU9QLFFBQVEsUUFBUixDQUFiO0FBQ0EsSUFB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QVNBOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7Ozs7QUFRQTs7Ozs7Ozs7QUFRQXBHLEtBQUtxRyxNQUFMLENBQVk1SCxRQUFaLEdBQXVCQSxRQUF2Qjs7QUFFQTZILE9BQU9DLE9BQVAsR0FBaUI5SCxRQUFqQiIsImZpbGUiOiJ2aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBEcmFnID0gcmVxdWlyZSgnLi9kcmFnJylcclxuY29uc3QgUGluY2ggPSByZXF1aXJlKCcuL3BpbmNoJylcclxuY29uc3QgQ2xhbXAgPSByZXF1aXJlKCcuL2NsYW1wJylcclxuY29uc3QgQ2xhbXBab29tID0gcmVxdWlyZSgnLi9jbGFtcC16b29tJylcclxuY29uc3QgRGVjZWxlcmF0ZSA9IHJlcXVpcmUoJy4vZGVjZWxlcmF0ZScpXHJcbmNvbnN0IEJvdW5jZSA9IHJlcXVpcmUoJy4vYm91bmNlJylcclxuY29uc3QgU25hcCA9IHJlcXVpcmUoJy4vc25hcCcpXHJcbmNvbnN0IFNuYXBab29tID0gcmVxdWlyZSgnLi9zbmFwLXpvb20nKVxyXG5jb25zdCBGb2xsb3cgPSByZXF1aXJlKCcuL2ZvbGxvdycpXHJcbmNvbnN0IFdoZWVsID0gcmVxdWlyZSgnLi93aGVlbCcpXHJcbmNvbnN0IE1vdXNlRWRnZXMgPSByZXF1aXJlKCcuL21vdXNlLWVkZ2VzJylcclxuXHJcbmNvbnN0IFBMVUdJTl9PUkRFUiA9IFsnZHJhZycsICdwaW5jaCcsICd3aGVlbCcsICdmb2xsb3cnLCAnbW91c2UtZWRnZXMnLCAnZGVjZWxlcmF0ZScsICdib3VuY2UnLCAnc25hcC16b29tJywgJ2NsYW1wLXpvb20nLCAnc25hcCcsICdjbGFtcCddXHJcblxyXG5jbGFzcyBWaWV3cG9ydCBleHRlbmRzIFBJWEkuQ29udGFpbmVyXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQGV4dGVuZHMgUElYSS5Db250YWluZXJcclxuICAgICAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbldpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNjcmVlbkhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud29ybGRXaWR0aD10aGlzLndpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndvcmxkSGVpZ2h0PXRoaXMuaGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZCA9IDVdIG51bWJlciBvZiBwaXhlbHMgdG8gbW92ZSB0byB0cmlnZ2VyIGFuIGlucHV0IGV2ZW50IChlLmcuLCBkcmFnLCBwaW5jaClcclxuICAgICAqIEBwYXJhbSB7KFBJWEkuUmVjdGFuZ2xlfFBJWEkuQ2lyY2xlfFBJWEkuRWxsaXBzZXxQSVhJLlBvbHlnb258UElYSS5Sb3VuZGVkUmVjdGFuZ2xlKX0gW29wdGlvbnMuZm9yY2VIaXRBcmVhXSBjaGFuZ2UgdGhlIGRlZmF1bHQgaGl0QXJlYSBmcm9tIHdvcmxkIHNpemUgdG8gYSBuZXcgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7UElYSS50aWNrZXIuVGlja2VyfSBbb3B0aW9ucy50aWNrZXI9UElYSS50aWNrZXIuc2hhcmVkXSB1c2UgdGhpcyBQSVhJLnRpY2tlciBmb3IgdXBkYXRlc1xyXG4gICAgICogQHBhcmFtIHtQSVhJLkludGVyYWN0aW9uTWFuYWdlcn0gW29wdGlvbnMuaW50ZXJhY3Rpb249bnVsbF0gSW50ZXJhY3Rpb25NYW5hZ2VyLCB1c2VkIHRvIGNhbGN1bGF0ZSBwb2ludGVyIHBvc3Rpb24gcmVsYXRpdmUgdG9cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdldoZWVsPWRvY3VtZW50LmJvZHldIGRpdiB0byBhdHRhY2ggdGhlIHdoZWVsIGV2ZW50XHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIGRyYWctc3RhcnRcclxuICAgICAqIEBmaXJlcyBkcmFnLWVuZFxyXG4gICAgICogQGZpcmVzIGRyYWctcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgcGluY2gtc3RhcnRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1lbmRcclxuICAgICAqIEBmaXJlcyBwaW5jaC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBzbmFwLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgc25hcC1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1zdGFydFxyXG4gICAgICogQGZpcmVzIHNuYXAtem9vbS1lbmRcclxuICAgICAqIEBmaXJlcyBzbmFwLXpvb20tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXgtc3RhcnRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteC1lbmRcclxuICAgICAqIEBmaXJlcyBib3VuY2UteS1zdGFydFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS15LWVuZFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyB3aGVlbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbFxyXG4gICAgICogQGZpcmVzIHdoZWVsLXNjcm9sbC1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXN0YXJ0XHJcbiAgICAgKiBAZmlyZXMgbW91c2UtZWRnZS1lbmRcclxuICAgICAqIEBmaXJlcyBtb3VzZS1lZGdlLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG1vdmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICB0aGlzLl9zY3JlZW5XaWR0aCA9IG9wdGlvbnMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSBvcHRpb25zLnNjcmVlbkhlaWdodFxyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSBvcHRpb25zLndvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLl93b3JsZEhlaWdodCA9IG9wdGlvbnMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLmhpdEFyZWFGdWxsU2NyZWVuID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5oaXRBcmVhRnVsbFNjcmVlbiwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmZvcmNlSGl0QXJlYSA9IG9wdGlvbnMuZm9yY2VIaXRBcmVhXHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRocmVzaG9sZCwgNSlcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uID0gb3B0aW9ucy5pbnRlcmFjdGlvbiB8fCBudWxsXHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMob3B0aW9ucy5kaXZXaGVlbCB8fCBkb2N1bWVudC5ib2R5KVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhY3RpdmUgdG91Y2ggcG9pbnQgaWRzIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJbXX1cclxuICAgICAgICAgKiBAcmVhZG9ubHlcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnRvdWNoZXMgPSBbXVxyXG5cclxuICAgICAgICB0aGlzLnRpY2tlciA9IG9wdGlvbnMudGlja2VyIHx8IFBJWEkudGlja2VyLnNoYXJlZFxyXG4gICAgICAgIHRoaXMudGlja2VyLmFkZCgoKSA9PiB0aGlzLnVwZGF0ZSgpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGFuaW1hdGlvbnNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBsdWdpbi51cGRhdGUodGhpcy50aWNrZXIuZWxhcHNlZE1TKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5mb3JjZUhpdEFyZWEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueCA9IHRoaXMubGVmdFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEueSA9IHRoaXMudG9wXHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYS53aWR0aCA9IHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICB0aGlzLmhpdEFyZWEuaGVpZ2h0ID0gdGhpcy53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIHNldCBzY3JlZW4gYW5kIHdvcmxkIHNpemVzLS1uZWVkZWQgZm9yIHBpbmNoL3doZWVsL2NsYW1wL2JvdW5jZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjcmVlbldpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NyZWVuSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3dvcmxkSGVpZ2h0XVxyXG4gICAgICovXHJcbiAgICByZXNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fc2NyZWVuV2lkdGggPSBzY3JlZW5XaWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIHRoaXMuX3NjcmVlbkhlaWdodCA9IHNjcmVlbkhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLl93b3JsZFdpZHRoID0gd29ybGRXaWR0aFxyXG4gICAgICAgIHRoaXMuX3dvcmxkSGVpZ2h0ID0gd29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnJlc2l6ZVBsdWdpbnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2FsbGVkIGFmdGVyIGEgd29ybGRXaWR0aC9IZWlnaHQgY2hhbmdlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZXNpemVQbHVnaW5zKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiB3aWR0aCBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgc2NyZWVuV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbldpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3NjcmVlbldpZHRoID0gdmFsdWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbkhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbkhlaWdodFxyXG4gICAgfVxyXG4gICAgc2V0IHNjcmVlbkhlaWdodCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9zY3JlZW5IZWlnaHQgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgd2lkdGggaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRXaWR0aCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dvcmxkV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd29ybGRXaWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldCB3b3JsZFdpZHRoKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuX3dvcmxkV2lkdGggPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gcGl4ZWxzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgd29ybGRIZWlnaHQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLl93b3JsZEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXQgd29ybGRIZWlnaHQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fd29ybGRIZWlnaHQgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMucmVzaXplUGx1Z2lucygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgaW5wdXQgbGlzdGVuZXJzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBsaXN0ZW5lcnMoZGl2KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgaWYgKCF0aGlzLmZvcmNlSGl0QXJlYSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGl0QXJlYSA9IG5ldyBQSVhJLlJlY3RhbmdsZSgwLCAwLCB0aGlzLndvcmxkV2lkdGgsIHRoaXMud29ybGRIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJkb3duJywgdGhpcy5kb3duKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJtb3ZlJywgdGhpcy5tb3ZlKVxyXG4gICAgICAgIHRoaXMub24oJ3BvaW50ZXJ1cCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcnVwb3V0c2lkZScsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcmNhbmNlbCcsIHRoaXMudXApXHJcbiAgICAgICAgdGhpcy5vbigncG9pbnRlcm91dCcsIHRoaXMudXApXHJcbiAgICAgICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHRoaXMuaGFuZGxlV2hlZWwoZSkpXHJcbiAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZG93biBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnREb3duID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcy5wdXNoKGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb3VudERvd25Qb2ludGVycygpID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSB9XHJcblxyXG4gICAgICAgICAgICAvLyBjbGlja2VkIGV2ZW50IGRvZXMgbm90IGZpcmUgaWYgdmlld3BvcnQgaXMgZGVjZWxlcmF0aW5nIG9yIGJvdW5jaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBjb25zdCBib3VuY2UgPSB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddXHJcbiAgICAgICAgICAgIGlmICgoIWRlY2VsZXJhdGUgfHwgKCFkZWNlbGVyYXRlLnggJiYgIWRlY2VsZXJhdGUueSkpICYmICghYm91bmNlIHx8ICghYm91bmNlLnRvWCAmJiAhYm91bmNlLnRvWSkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrZWRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLmRvd24oZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3aGV0aGVyIGNoYW5nZSBleGNlZWRzIHRocmVzaG9sZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFuZ2VcclxuICAgICAqL1xyXG4gICAgY2hlY2tUaHJlc2hvbGQoY2hhbmdlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChNYXRoLmFicyhjaGFuZ2UpID49IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZSBldmVudHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2luc0xpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwbHVnaW4ubW92ZShlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2tlZEF2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RYID0gZS5kYXRhLmdsb2JhbC54IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgY29uc3QgZGlzdFkgPSBlLmRhdGEuZ2xvYmFsLnkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja1RocmVzaG9sZChkaXN0WCkgfHwgdGhpcy5jaGVja1RocmVzaG9sZChkaXN0WSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXAgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1cChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLm9yaWdpbmFsRXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50ICYmIGUuZGF0YS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0RG93biA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZS5kYXRhLnBvaW50ZXJUeXBlICE9PSAnbW91c2UnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdWNoZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvdWNoZXNbaV0gPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b3VjaGVzLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLnBsdWdpbnNMaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGx1Z2luLnVwKGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGlja2VkQXZhaWxhYmxlICYmIHRoaXMuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMgfSlcclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgd2hlZWwgZXZlbnRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVXaGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBvbmx5IGhhbmRsZSB3aGVlbCBldmVudHMgd2hlcmUgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIHZpZXdwb3J0XHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnRvTG9jYWwoeyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9KVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgPD0gcG9pbnQueCAmJiBwb2ludC54IDw9IHRoaXMucmlnaHQgJiYgdGhpcy50b3AgPD0gcG9pbnQueSAmJiBwb2ludC55IDw9IHRoaXMuYm90dG9tKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdFxyXG4gICAgICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5wbHVnaW5zTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsdWdpbi53aGVlbChlKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHNjcmVlbiB0byB3b3JsZFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvV29ybGQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICBjb25zdCB5ID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoeyB4LCB5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTG9jYWwoYXJndW1lbnRzWzBdKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjb29yZGluYXRlcyBmcm9tIHdvcmxkIHRvIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt5XVxyXG4gICAgICogQHJldHVybnMge1BJWEkuUG9pbnR9XHJcbiAgICAgKi9cclxuICAgIHRvU2NyZWVuKClcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgY29uc3QgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b0dsb2JhbCh7IHgsIHkgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9HbG9iYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2NyZWVuIHdpZHRoIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCB3b3JsZFNjcmVlbldpZHRoKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuV2lkdGggLyB0aGlzLnNjYWxlLnhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNjcmVlbiBoZWlnaHQgaW4gd29ybGQgY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHdvcmxkU2NyZWVuSGVpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCB3aWR0aCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNjcmVlbldvcmxkV2lkdGgoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93b3JsZFdpZHRoICogdGhpcy5zY2FsZS54XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBoZWlnaHQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBzY3JlZW5Xb3JsZEhlaWdodCgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmxkSGVpZ2h0ICogdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgY2VudGVyIG9mIHNjcmVlbiBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHR5cGUge1BJWEkuUG9pbnRMaWtlfVxyXG4gICAgICovXHJcbiAgICBnZXQgY2VudGVyKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4geyB4OiB0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0gdGhpcy54IC8gdGhpcy5zY2FsZS54LCB5OiB0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHRoaXMueSAvIHRoaXMuc2NhbGUueSB9XHJcbiAgICB9XHJcbiAgICBzZXQgY2VudGVyKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubW92ZUNlbnRlcih2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgY2VudGVyIG9mIHZpZXdwb3J0IHRvIHBvaW50XHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8UElYSS5Qb2ludExpa2UpfSB4IG9yIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3ldXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBtb3ZlQ2VudGVyKC8qeCwgeSB8IFBJWEkuUG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBsZXQgeCwgeVxyXG4gICAgICAgIGlmICghaXNOYU4oYXJndW1lbnRzWzBdKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHggPSBhcmd1bWVudHNbMF1cclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB4ID0gYXJndW1lbnRzWzBdLnhcclxuICAgICAgICAgICAgeSA9IGFyZ3VtZW50c1swXS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zaXRpb24uc2V0KCh0aGlzLndvcmxkU2NyZWVuV2lkdGggLyAyIC0geCkgKiB0aGlzLnNjYWxlLngsICh0aGlzLndvcmxkU2NyZWVuSGVpZ2h0IC8gMiAtIHkpICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdG9wLWxlZnQgY29ybmVyXHJcbiAgICAgKiBAdHlwZSB7UElYSS5Qb2ludExpa2V9XHJcbiAgICAgKi9cclxuICAgIGdldCBjb3JuZXIoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB7IHg6IC10aGlzLnggLyB0aGlzLnNjYWxlLngsIHk6IC10aGlzLnkgLyB0aGlzLnNjYWxlLnkgfVxyXG4gICAgfVxyXG4gICAgc2V0IGNvcm5lcih2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1vdmVDb3JuZXIodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHZpZXdwb3J0J3MgdG9wLWxlZnQgY29ybmVyOyBhbHNvIGNsYW1wcyBhbmQgcmVzZXRzIGRlY2VsZXJhdGUgYW5kIGJvdW5jZSAoYXMgbmVlZGVkKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ8UElYSS5Qb2ludH0geHxwb2ludFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG1vdmVDb3JuZXIoLyp4LCB5IHwgcG9pbnQqLylcclxuICAgIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24uc2V0KC1hcmd1bWVudHNbMF0ueCAqIHRoaXMuc2NhbGUueCwgLWFyZ3VtZW50c1swXS55ICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCgtYXJndW1lbnRzWzBdICogdGhpcy5zY2FsZS54LCAtYXJndW1lbnRzWzFdICogdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIHRoZSB3aWR0aCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aD10aGlzLl93b3JsZFdpZHRoXSBpbiB3b3JsZCBjb29yZGluYXRlc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2VudGVyXSBtYWludGFpbiB0aGUgc2FtZSBjZW50ZXJcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdFdpZHRoKHdpZHRoLCBjZW50ZXIpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHNhdmVcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2F2ZSA9IHRoaXMuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53b3JsZFdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUNlbnRlcihzYXZlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIHpvb20gc28gdGhlIGhlaWdodCBmaXRzIGluIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9dGhpcy5fd29ybGRIZWlnaHRdIGluIHdvcmxkIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZpdEhlaWdodChoZWlnaHQsIGNlbnRlcilcclxuICAgIHtcclxuICAgICAgICBsZXQgc2F2ZVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzYXZlID0gdGhpcy5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMud29ybGRIZWlnaHRcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjcmVlbkhlaWdodCAvIGhlaWdodFxyXG4gICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZml0V29ybGQoY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNjYWxlLnggPSB0aGlzLl9zY3JlZW5XaWR0aCAvIHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLl9zY3JlZW5IZWlnaHQgLyB0aGlzLl93b3JsZEhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLnNjYWxlLnggPCB0aGlzLnNjYWxlLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlLnkgPSB0aGlzLnNjYWxlLnhcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY2FsZS55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDZW50ZXIoc2F2ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSB6b29tIHNvIGl0IGZpdHMgdGhlIHNpemUgb3IgdGhlIGVudGlyZSB3b3JsZCBpbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aF0gZGVzaXJlZCB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHRdIGRlc2lyZWQgaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBmaXQoY2VudGVyLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud29ybGRXaWR0aFxyXG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLndvcmxkSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gdGhpcy5zY3JlZW5XaWR0aCAvIHdpZHRoXHJcbiAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY3JlZW5IZWlnaHQgLyBoZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5zY2FsZS54IDwgdGhpcy5zY2FsZS55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZS55ID0gdGhpcy5zY2FsZS54XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUueCA9IHRoaXMuc2NhbGUueVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGEgY2VydGFpbiBwZXJjZW50IChpbiBib3RoIHggYW5kIHkgZGlyZWN0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQgY2hhbmdlIChlLmcuLCAwLjI1IHdvdWxkIGluY3JlYXNlIGEgc3RhcnRpbmcgc2NhbGUgb2YgMS4wIHRvIDEuMjUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjZW50ZXJdIG1haW50YWluIHRoZSBzYW1lIGNlbnRlciBvZiB0aGUgc2NyZWVuIGFmdGVyIHpvb21cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgem9vbVBlcmNlbnQocGVyY2VudCwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBzYXZlXHJcbiAgICAgICAgaWYgKGNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNhdmUgPSB0aGlzLmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NhbGUueCArIHRoaXMuc2NhbGUueCAqIHBlcmNlbnRcclxuICAgICAgICB0aGlzLnNjYWxlLnNldChzY2FsZSlcclxuICAgICAgICBpZiAoY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQ2VudGVyKHNhdmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHZpZXdwb3J0IGJ5IGluY3JlYXNpbmcvZGVjcmVhc2luZyB3aWR0aCBieSBhIGNlcnRhaW4gbnVtYmVyIG9mIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5nZSBpbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NlbnRlcl0gbWFpbnRhaW4gdGhlIHNhbWUgY2VudGVyIG9mIHRoZSBzY3JlZW4gYWZ0ZXIgem9vbVxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICB6b29tKGNoYW5nZSwgY2VudGVyKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZml0V2lkdGgoY2hhbmdlICsgdGhpcy53b3JsZFNjcmVlbldpZHRoLCBjZW50ZXIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCB6b29tXHJcbiAgICAgKi9cclxuICAgIHNuYXBab29tKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwLXpvb20nXSA9IG5ldyBTbmFwWm9vbSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHR5cGVkZWYgT3V0T2ZCb3VuZHNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpcyBjb250YWluZXIgb3V0IG9mIHdvcmxkIGJvdW5kc1xyXG4gICAgICogQHJldHVybiB7T3V0T2ZCb3VuZHN9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBPT0IoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XHJcbiAgICAgICAgcmVzdWx0LmxlZnQgPSB0aGlzLmxlZnQgPCAwXHJcbiAgICAgICAgcmVzdWx0LnJpZ2h0ID0gdGhpcy5yaWdodCA+IHRoaXMuX3dvcmxkV2lkdGhcclxuICAgICAgICByZXN1bHQudG9wID0gdGhpcy50b3AgPCAwXHJcbiAgICAgICAgcmVzdWx0LmJvdHRvbSA9IHRoaXMuYm90dG9tID4gdGhpcy5fd29ybGRIZWlnaHRcclxuICAgICAgICByZXN1bHQuY29ybmVyUG9pbnQgPSB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuX3dvcmxkV2lkdGggKiB0aGlzLnNjYWxlLnggLSB0aGlzLl9zY3JlZW5XaWR0aCxcclxuICAgICAgICAgICAgeTogdGhpcy5fd29ybGRIZWlnaHQgKiB0aGlzLnNjYWxlLnkgLSB0aGlzLl9zY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIHNjcmVlblxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0IHJpZ2h0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueCArIHRoaXMud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgfVxyXG4gICAgc2V0IHJpZ2h0KHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueCArIHRoaXMuc2NyZWVuV2lkdGhcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB3b3JsZCBjb29yZGluYXRlcyBvZiB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCBsZWZ0KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueCAvIHRoaXMuc2NhbGUueFxyXG4gICAgfVxyXG4gICAgc2V0IGxlZnQodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gLXZhbHVlICogdGhpcy5zY2FsZS54XHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogd29ybGQgY29vcmRpbmF0ZXMgb2YgdGhlIHRvcCBlZGdlIG9mIHRoZSBzY3JlZW5cclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldCB0b3AoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAtdGhpcy55IC8gdGhpcy5zY2FsZS55XHJcbiAgICB9XHJcbiAgICBzZXQgdG9wKHZhbHVlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueSA9IC12YWx1ZSAqIHRoaXMuc2NhbGUueVxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHdvcmxkIGNvb3JkaW5hdGVzIG9mIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXQgYm90dG9tKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gLXRoaXMueSAvIHRoaXMuc2NhbGUueSArIHRoaXMud29ybGRTY3JlZW5IZWlnaHRcclxuICAgIH1cclxuICAgIHNldCBib3R0b20odmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy55ID0gLXZhbHVlICogdGhpcy5zY2FsZS55ICsgdGhpcy5zY3JlZW5IZWlnaHRcclxuICAgICAgICB0aGlzLl9yZXNldCgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgd2hldGhlciB0aGUgdmlld3BvcnQgaXMgZGlydHkgKGkuZS4sIG5lZWRzIHRvIGJlIHJlbmRlcmVyZWQgdG8gdGhlIHNjcmVlbiBiZWNhdXNlIG9mIGEgY2hhbmdlKVxyXG4gICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGdldCBkaXJ0eSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcnR5XHJcbiAgICB9XHJcbiAgICBzZXQgZGlydHkodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGVybWFuZW50bHkgY2hhbmdlcyB0aGUgVmlld3BvcnQncyBoaXRBcmVhXHJcbiAgICAgKiA8cD5OT1RFOiBub3JtYWxseSB0aGUgaGl0QXJlYSA9IFBJWEkuUmVjdGFuZ2xlKFZpZXdwb3J0LmxlZnQsIFZpZXdwb3J0LnRvcCwgVmlld3BvcnQud29ybGRTY3JlZW5XaWR0aCwgVmlld3BvcnQud29ybGRTY3JlZW5IZWlnaHQpPC9wPlxyXG4gICAgICogQHR5cGUgeyhQSVhJLlJlY3RhbmdsZXxQSVhJLkNpcmNsZXxQSVhJLkVsbGlwc2V8UElYSS5Qb2x5Z29ufFBJWEkuUm91bmRlZFJlY3RhbmdsZSl9XHJcbiAgICAgKi9cclxuICAgIGdldCBmb3JjZUhpdEFyZWEoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUhpdEFyZWFcclxuICAgIH1cclxuICAgIHNldCBmb3JjZUhpdEFyZWEodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gdmFsdWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fZm9yY2VIaXRBcmVhID0gZmFsc2VcclxuICAgICAgICAgICAgdGhpcy5oaXRBcmVhID0gbmV3IFBJWEkuUmVjdGFuZ2xlKDAsIDAsIHRoaXMud29ybGRXaWR0aCwgdGhpcy53b3JsZEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCBvZiBtb3VzZS90b3VjaCBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5sZWZ0RG93biA/IDEgOiAwKSArIHRoaXMudG91Y2hlcy5sZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IG9mIHRvdWNoIHBvaW50ZXJzIHRoYXQgYXJlIGRvd24gb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHJldHVybiB7UElYSS5JbnRlcmFjdGlvblRyYWNraW5nRGF0YVtdfVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaFBvaW50ZXJzKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHBvaW50ZXJzW2tleV1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG91Y2hlcy5pbmRleE9mKHBvaW50ZXIucG9pbnRlcklkKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwb2ludGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBvZiBwb2ludGVycyB0aGF0IGFyZSBkb3duIG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEByZXR1cm4ge1BJWEkuSW50ZXJhY3Rpb25UcmFja2luZ0RhdGFbXX1cclxuICAgICAqL1xyXG4gICAgZ2V0UG9pbnRlcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gcG9pbnRlcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gocG9pbnRlcnNba2V5XSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsYW1wcyBhbmQgcmVzZXRzIGJvdW5jZSBhbmQgZGVjZWxlcmF0ZSAoYXMgbmVlZGVkKSBhZnRlciBtYW51YWxseSBtb3Zpbmcgdmlld3BvcnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snYm91bmNlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddLnJlc2V0KClcclxuICAgICAgICAgICAgdGhpcy5wbHVnaW5zWydib3VuY2UnXS5ib3VuY2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydkZWNlbGVyYXRlJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2RlY2VsZXJhdGUnXS5yZXNldCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbJ3NuYXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snc25hcCddLnJlc2V0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1snY2xhbXAnXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1snY2xhbXAnXS51cGRhdGUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wbHVnaW5zWydjbGFtcC16b29tJ10pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXS5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGlydHkgPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUExVR0lOU1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBpbnN0YWxsZWQgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBvZiBwbHVnaW4gKGUuZy4sICdkcmFnJywgJ3BpbmNoJylcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXSA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5lbWl0KHR5cGUgKyAnLXJlbW92ZScpXHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhdXNlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHBhdXNlUGx1Z2luKHR5cGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luc1t0eXBlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luc1t0eXBlXS5wYXVzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzdW1lIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgb2YgcGx1Z2luIChlLmcuLCAnZHJhZycsICdwaW5jaCcpXHJcbiAgICAgKi9cclxuICAgIHJlc3VtZVBsdWdpbih0eXBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbnNbdHlwZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnNbdHlwZV0ucmVzdW1lKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzb3J0IHBsdWdpbnMgZm9yIHVwZGF0ZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHBsdWdpbnNTb3J0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNMaXN0ID0gW11cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgUExVR0lOX09SREVSKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luc1twbHVnaW5dKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnNMaXN0LnB1c2godGhpcy5wbHVnaW5zW3BsdWdpbl0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MTBdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBkcmFnKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydkcmFnJ10gPSBuZXcgRHJhZyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGFtcCB0byB3b3JsZCBib3VuZGFyaWVzIG9yIG90aGVyIHByb3ZpZGVkIGJvdW5kYXJpZXNcclxuICAgICAqIE5PVEVTOlxyXG4gICAgICogICBjbGFtcCBpcyBkaXNhYmxlZCBpZiBjYWxsZWQgd2l0aCBubyBvcHRpb25zOyB1c2UgeyBkaXJlY3Rpb246ICdhbGwnIH0gZm9yIGFsbCBlZGdlIGNsYW1waW5nXHJcbiAgICAgKiAgIHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGNsYW1wKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydjbGFtcCddID0gbmV3IENsYW1wKHRoaXMsIG9wdGlvbnMpXHJcbiAgICAgICAgdGhpcy5wbHVnaW5zU29ydCgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlY2VsZXJhdGUgYWZ0ZXIgYSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZGVjZWxlcmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snZGVjZWxlcmF0ZSddID0gbmV3IERlY2VsZXJhdGUodGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYm91bmNlIG9uIGJvcmRlcnNcclxuICAgICAqIE5PVEU6IHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQsIHdvcmxkV2lkdGgsIGFuZCB3b3JsZEhlaWdodCBuZWVkcyB0byBiZSBzZXQgZm9yIHRoaXMgdG8gd29yayBwcm9wZXJseVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBib3VuY2Uob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2JvdW5jZSddID0gbmV3IEJvdW5jZSh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgcGluY2ggdG8gem9vbSBhbmQgdHdvLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBOT1RFOiBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0LCB3b3JsZFdpZHRoLCBhbmQgd29ybGRIZWlnaHQgbmVlZHMgdG8gYmUgc2V0IGZvciB0aGlzIHRvIHdvcmsgcHJvcGVybHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICogQHJldHVybiB7Vmlld3BvcnR9IHRoaXNcclxuICAgICAqL1xyXG4gICAgcGluY2gob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ3BpbmNoJ10gPSBuZXcgUGluY2godGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc25hcCB0byBhIHBvaW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvblxyXG4gKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBzbmFwKHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydzbmFwJ10gPSBuZXcgU25hcCh0aGlzLCB4LCB5LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb2xsb3cgYSB0YXJnZXRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqIEByZXR1cm4ge1ZpZXdwb3J0fSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGZvbGxvdyh0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wbHVnaW5zWydmb2xsb3cnXSA9IG5ldyBGb2xsb3codGhpcywgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB6b29tIHVzaW5nIG1vdXNlIHdoZWVsXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICB3aGVlbChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGx1Z2luc1snd2hlZWwnXSA9IG5ldyBXaGVlbCh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgY2xhbXBpbmcgb2Ygem9vbSB0byBjb25zdHJhaW50c1xyXG4gICAgICogTk9URTogc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodCwgd29ybGRXaWR0aCwgYW5kIHdvcmxkSGVpZ2h0IG5lZWRzIHRvIGJlIHNldCBmb3IgdGhpcyB0byB3b3JrIHByb3Blcmx5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtWaWV3cG9ydH0gdGhpc1xyXG4gICAgICovXHJcbiAgICBjbGFtcFpvb20ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ2NsYW1wLXpvb20nXSA9IG5ldyBDbGFtcFpvb20odGhpcywgb3B0aW9ucylcclxuICAgICAgICB0aGlzLnBsdWdpbnNTb3J0KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2Nyb2xsIHZpZXdwb3J0IHdoZW4gbW91c2UgaG92ZXJzIG5lYXIgb25lIG9mIHRoZSBlZGdlcyBvciByYWRpdXMtZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKi9cclxuICAgIG1vdXNlRWRnZXMob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBsdWdpbnNbJ21vdXNlLWVkZ2VzJ10gPSBuZXcgTW91c2VFZGdlcyh0aGlzLCBvcHRpb25zKVxyXG4gICAgICAgIHRoaXMucGx1Z2luc1NvcnQoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwYXVzZSB2aWV3cG9ydCAoaW5jbHVkaW5nIGFuaW1hdGlvbiB1cGRhdGVzIHN1Y2ggYXMgZGVjZWxlcmF0ZSlcclxuICAgICAqIE5PVEU6IHdoZW4gc2V0dGluZyBwYXVzZT10cnVlLCBhbGwgdG91Y2hlcyBhbmQgbW91c2UgYWN0aW9ucyBhcmUgY2xlYXJlZCAoaS5lLiwgaWYgbW91c2Vkb3duIHdhcyBhY3RpdmUsIGl0IGJlY29tZXMgaW5hY3RpdmUgZm9yIHB1cnBvc2VzIG9mIHRoZSB2aWV3cG9ydClcclxuICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBnZXQgcGF1c2UoKSB7IHJldHVybiB0aGlzLl9wYXVzZSB9XHJcbiAgICBzZXQgcGF1c2UodmFsdWUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5fcGF1c2UgPSB2YWx1ZVxyXG4gICAgICAgIGlmICh2YWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hlcyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMubGVmdERvd24gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIGFmdGVyIGEgbW91c2Ugb3IgdG91Y2ggY2xpY2tcclxuICogQGV2ZW50IFZpZXdwb3J0I2NsaWNrZWRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBkcmFnIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1zdGFydFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge1BJWEkuUG9pbnRMaWtlfSBzY3JlZW5cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gd29ybGRcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGRyYWcgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjZHJhZy1lbmRcclxuICogQHR5cGUge29iamVjdH1cclxuICogQHByb3BlcnR5IHtQSVhJLlBvaW50TGlrZX0gc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7UElYSS5Qb2ludExpa2V9IHdvcmxkXHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBwaW5jaCBzdGFydHNcclxuICogQGV2ZW50IFZpZXdwb3J0I3BpbmNoLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHBpbmNoIGVuZFxyXG4gKiBAZXZlbnQgVmlld3BvcnQjcGluY2gtZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgc3RhcnRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAgZW5kc1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc25hcC16b29tIHN0YXJ0c1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjc25hcC16b29tLXN0YXJ0XHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNuYXAtem9vbSBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNzbmFwLXpvb20tZW5kXHJcbiAqIEB0eXBlIHtWaWV3cG9ydH1cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGJvdW5jZSBzdGFydHMgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteC1zdGFydFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2UgZW5kcyBpbiB0aGUgeCBkaXJlY3Rpb25cclxuICogQGV2ZW50IFZpZXdwb3J0I2JvdW5jZS14LWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBib3VuY2Ugc3RhcnRzIGluIHRoZSB5IGRpcmVjdGlvblxyXG4gKiBAZXZlbnQgVmlld3BvcnQjYm91bmNlLXktc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgYm91bmNlIGVuZHMgaW4gdGhlIHkgZGlyZWN0aW9uXHJcbiAqIEBldmVudCBWaWV3cG9ydCNib3VuY2UteS1lbmRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGZvciBhIG1vdXNlIHdoZWVsIGV2ZW50XHJcbiAqIEBldmVudCBWaWV3cG9ydCN3aGVlbFxyXG4gKiBAdHlwZSB7b2JqZWN0fVxyXG4gKiBAcHJvcGVydHkge29iamVjdH0gd2hlZWxcclxuICogQHByb3BlcnR5IHtudW1iZXJ9IHdoZWVsLmR4XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB3aGVlbC5keVxyXG4gKiBAcHJvcGVydHkge251bWJlcn0gd2hlZWwuZHpcclxuICogQHByb3BlcnR5IHtWaWV3cG9ydH0gdmlld3BvcnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHdoZWVsLXNjcm9sbCBvY2N1cnNcclxuICogQGV2ZW50IFZpZXdwb3J0I3doZWVsLXNjcm9sbFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBtb3VzZS1lZGdlIHN0YXJ0cyB0byBzY3JvbGxcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdXNlLWVkZ2Utc3RhcnRcclxuICogQHR5cGUge1ZpZXdwb3J0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBtb3VzZS1lZGdlIHNjcm9sbGluZyBlbmRzXHJcbiAqIEBldmVudCBWaWV3cG9ydCNtb3VzZS1lZGdlLWVuZFxyXG4gKiBAdHlwZSB7Vmlld3BvcnR9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdmlld3BvcnQgbW92ZXMgdGhyb3VnaCBVSSBpbnRlcmFjdGlvbiwgZGVjZWxlcmF0aW9uLCBvciBmb2xsb3dcclxuICogQGV2ZW50IFZpZXdwb3J0I21vdmVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLCBzbmFwLCBwaW5jaCwgZm9sbG93LCBib3VuY2UteCwgYm91bmNlLXksIGNsYW1wLXgsIGNsYW1wLXksIGRlY2VsZXJhdGUsIG1vdXNlLWVkZ2VzLCB3aGVlbClcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB2aWV3cG9ydCBtb3ZlcyB0aHJvdWdoIFVJIGludGVyYWN0aW9uLCBkZWNlbGVyYXRpb24sIG9yIGZvbGxvd1xyXG4gKiBAZXZlbnQgVmlld3BvcnQjem9vbWVkXHJcbiAqIEB0eXBlIHtvYmplY3R9XHJcbiAqIEBwcm9wZXJ0eSB7Vmlld3BvcnR9IHZpZXdwb3J0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlIChkcmFnLXpvb20sIHBpbmNoLCB3aGVlbCwgY2xhbXAtem9vbSlcclxuICovXHJcblxyXG5QSVhJLmV4dHJhcy5WaWV3cG9ydCA9IFZpZXdwb3J0XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0Il19