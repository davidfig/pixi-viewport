'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Drag, _Plugin);

    /**
     * enable one-finger touch to drag
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.direction=all] direction to drag (all, x, or y)
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @param {number} [options.factor=1] factor to multiply drag to increase the speed of movement
     * @param {string} [options.mouseButtons=all] changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'
     */
    function Drag(parent, options) {
        _classCallCheck(this, Drag);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (Drag.__proto__ || Object.getPrototypeOf(Drag)).call(this, parent));

        _this.moved = false;
        _this.wheelActive = utils.defaults(options.wheel, true);
        _this.wheelScroll = options.wheelScroll || 1;
        _this.reverse = options.reverse ? 1 : -1;
        _this.clampWheel = options.clampWheel;
        _this.factor = options.factor || 1;
        _this.xDirection = !options.direction || options.direction === 'all' || options.direction === 'x';
        _this.yDirection = !options.direction || options.direction === 'all' || options.direction === 'y';
        _this.parseUnderflow(options.underflow || 'center');
        _this.mouseButtons(options.mouseButtons);
        return _this;
    }

    _createClass(Drag, [{
        key: 'mouseButtons',
        value: function mouseButtons(buttons) {
            if (!buttons || buttons === 'all') {
                this.mouse = [1, 1, 1];
            } else {
                this.mouse = [buttons.indexOf('left') === -1 ? false : true, buttons.indexOf('middle') === -1 ? false : true, buttons.indexOf('right') === -1 ? false : true];
            }
        }
    }, {
        key: 'parseUnderflow',
        value: function parseUnderflow(clamp) {
            clamp = clamp.toLowerCase();
            if (clamp === 'center') {
                this.underflowX = 0;
                this.underflowY = 0;
            } else {
                this.underflowX = clamp.indexOf('left') !== -1 ? -1 : clamp.indexOf('right') !== -1 ? 1 : 0;
                this.underflowY = clamp.indexOf('top') !== -1 ? -1 : clamp.indexOf('bottom') !== -1 ? 1 : 0;
            }
        }
    }, {
        key: 'checkButtons',
        value: function checkButtons(e) {
            var isMouse = e.data.pointerType === 'mouse';
            var count = this.parent.countDownPointers();
            if (this.parent.parent) {
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    if (!isMouse || this.mouse[e.data.button]) {
                        return true;
                    }
                }
            }
            return false;
        }
    }, {
        key: 'down',
        value: function down(e) {
            if (this.paused) {
                return;
            }
            if (this.checkButtons(e)) {
                var parent = this.parent.parent.toLocal(e.data.global);
                this.last = { x: e.data.global.x, y: e.data.global.y, parent: parent };
                this.current = e.data.pointerId;
                return true;
            } else {
                this.last = null;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused) {
                return;
            }
            if (this.last && this.current === e.data.pointerId) {
                var x = e.data.global.x;
                var y = e.data.global.y;
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var distX = x - this.last.x;
                    var distY = y - this.last.y;
                    if (this.moved || this.xDirection && this.parent.checkThreshold(distX) || this.yDirection && this.parent.checkThreshold(distY)) {
                        var newParent = this.parent.parent.toLocal(e.data.global);
                        if (this.xDirection) {
                            this.parent.x += (newParent.x - this.last.parent.x) * this.factor;
                        }
                        if (this.yDirection) {
                            this.parent.y += (newParent.y - this.last.parent.y) * this.factor;
                        }
                        this.last = { x: x, y: y, parent: newParent };
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent });
                        }
                        this.moved = true;
                        this.parent.emit('moved', { viewport: this.parent, type: 'drag' });
                        return true;
                    }
                } else {
                    this.moved = false;
                }
            }
        }
    }, {
        key: 'up',
        value: function up() {
            var touches = this.parent.getTouchPointers();
            if (touches.length === 1) {
                var pointer = touches[0];
                if (pointer.last) {
                    var parent = this.parent.parent.toLocal(pointer.last);
                    this.last = { x: pointer.last.x, y: pointer.last.y, parent: parent };
                    this.current = pointer.last.data.pointerId;
                }
                this.moved = false;
                return true;
            } else if (this.last) {
                if (this.moved) {
                    this.parent.emit('drag-end', { screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent });
                    this.last = this.moved = false;
                    return true;
                }
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(e) {
            if (this.paused) {
                return;
            }

            if (this.wheelActive) {
                var wheel = this.parent.plugins['wheel'];
                if (!wheel) {
                    if (this.xDirection) {
                        this.parent.x += e.deltaX * this.wheelScroll * this.reverse;
                    }
                    if (this.yDirection) {
                        this.parent.y += e.deltaY * this.wheelScroll * this.reverse;
                    }
                    if (this.clampWheel) {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.emit('moved', this.parent);
                    if (!this.parent.passiveWheel) {
                        e.preventDefault();
                    }
                    return true;
                }
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.last = null;
            this.paused = false;
        }
    }, {
        key: 'clamp',
        value: function clamp() {
            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.clampWheel !== 'y') {
                if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                    switch (this.underflowX) {
                        case -1:
                            this.parent.x = 0;
                            break;
                        case 1:
                            this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                            break;
                        default:
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                    }
                } else {
                    if (this.parent.left < 0) {
                        this.parent.x = 0;
                        decelerate.x = 0;
                    } else if (this.parent.right > this.parent.worldWidth) {
                        this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth;
                        decelerate.x = 0;
                    }
                }
            }
            if (this.clampWheel !== 'x') {
                if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                    switch (this.underflowY) {
                        case -1:
                            this.parent.y = 0;
                            break;
                        case 1:
                            this.parent.y = this.parent.screenHeight - this.parent.screenWorldHeight;
                            break;
                        default:
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                    }
                } else {
                    if (this.parent.top < 0) {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    }
                    if (this.parent.bottom > this.parent.worldHeight) {
                        this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight;
                        decelerate.y = 0;
                    }
                }
            }
        }
    }, {
        key: 'active',
        get: function get() {
            return this.moved;
        }
    }]);

    return Drag;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbIlBJWEkiLCJyZXF1aXJlIiwidXRpbHMiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJkZWZhdWx0cyIsIndoZWVsIiwid2hlZWxTY3JvbGwiLCJyZXZlcnNlIiwiY2xhbXBXaGVlbCIsImZhY3RvciIsInhEaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJ5RGlyZWN0aW9uIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3VzZUJ1dHRvbnMiLCJidXR0b25zIiwibW91c2UiLCJpbmRleE9mIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiZSIsImlzTW91c2UiLCJkYXRhIiwicG9pbnRlclR5cGUiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsImJ1dHRvbiIsInBhdXNlZCIsImNoZWNrQnV0dG9ucyIsInRvTG9jYWwiLCJnbG9iYWwiLCJsYXN0IiwieCIsInkiLCJjdXJyZW50IiwicG9pbnRlcklkIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwibmV3UGFyZW50IiwiZW1pdCIsInNjcmVlbiIsIlBvaW50Iiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJ0eXBlIiwidG91Y2hlcyIsImdldFRvdWNoUG9pbnRlcnMiLCJsZW5ndGgiLCJwb2ludGVyIiwiZGVsdGFYIiwiZGVsdGFZIiwicGFzc2l2ZVdoZWVsIiwicHJldmVudERlZmF1bHQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwid29ybGRXaWR0aCIsInNjYWxlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7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QUFDQXNCLG1DQUFXdEIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNELHdCQUFJLEtBQUtyQyxNQUFMLENBQVlxRSxNQUFaLEdBQXFCLEtBQUtyRSxNQUFMLENBQVlzRSxXQUFyQyxFQUNBO0FBQ0ksNkJBQUt0RSxNQUFMLENBQVlxQyxDQUFaLEdBQWdCLENBQUMsS0FBS3JDLE1BQUwsQ0FBWXNFLFdBQWIsR0FBMkIsS0FBS3RFLE1BQUwsQ0FBWWlFLEtBQVosQ0FBa0I1QixDQUE3QyxHQUFpRCxLQUFLckMsTUFBTCxDQUFZbUUsWUFBN0U7QUFDQVIsbUNBQVd0QixDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBclJMO0FBQUE7QUFBQSw0QkFvR0k7QUFDSSxtQkFBTyxLQUFLbkMsS0FBWjtBQUNIO0FBdEdMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpXHJcblxyXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERyYWcgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZhY3Rvcj0xXSBmYWN0b3IgdG8gbXVsdGlwbHkgZHJhZyB0byBpbmNyZWFzZSB0aGUgc3BlZWQgb2YgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5tb3VzZUJ1dHRvbnM9YWxsXSBjaGFuZ2VzIHdoaWNoIG1vdXNlIGJ1dHRvbnMgdHJpZ2dlciBkcmFnLCB1c2U6ICdhbGwnLCAnbGVmdCcsIHJpZ2h0JyAnbWlkZGxlJywgb3Igc29tZSBjb21iaW5hdGlvbiwgbGlrZSwgJ21pZGRsZS1yaWdodCdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLndoZWVsLCB0cnVlKVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLmZhY3RvciA9IG9wdGlvbnMuZmFjdG9yIHx8IDFcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW91c2VCdXR0b25zKG9wdGlvbnMubW91c2VCdXR0b25zKVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlQnV0dG9ucyhidXR0b25zKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghYnV0dG9ucyB8fCBidXR0b25zID09PSAnYWxsJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2UgPSBbMSwgMSwgMV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZSA9IFtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbnMuaW5kZXhPZignbGVmdCcpID09PSAtMSA/IGZhbHNlIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGJ1dHRvbnMuaW5kZXhPZignbWlkZGxlJykgPT09IC0xID8gZmFsc2UgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYnV0dG9ucy5pbmRleE9mKCdyaWdodCcpID09PSAtMSA/IGZhbHNlIDogdHJ1ZVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tCdXR0b25zKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgaXNNb3VzZSA9IGUuZGF0YS5wb2ludGVyVHlwZSA9PT0gJ21vdXNlJ1xyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGNvdW50ID09PSAxKSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc01vdXNlIHx8IHRoaXMubW91c2VbZS5kYXRhLmJ1dHRvbl0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrQnV0dG9ucyhlKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnksIHBhcmVudCB9XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGUuZGF0YS5wb2ludGVySWRcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZFxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubGFzdCAmJiB0aGlzLmN1cnJlbnQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAoKHRoaXMueERpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WCkpIHx8ICh0aGlzLnlEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSAobmV3UGFyZW50LnggLSB0aGlzLmxhc3QucGFyZW50LngpICogdGhpcy5mYWN0b3JcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueURpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gKG5ld1BhcmVudC55IC0gdGhpcy5sYXN0LnBhcmVudC55KSAqIHRoaXMuZmFjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeCwgeSwgcGFyZW50OiBuZXdQYXJlbnQgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb3ZlZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctc3RhcnQnLCB7IHNjcmVlbjogbmV3IFBJWEkuUG9pbnQodGhpcy5sYXN0LngsIHRoaXMubGFzdC55KSwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZHJhZycgfSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHBvaW50ZXIubGFzdC5kYXRhLnBvaW50ZXJJZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiBuZXcgUElYSS5Qb2ludCh0aGlzLmxhc3QueCwgdGhpcy5sYXN0LnkpLCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0gdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZS5kZWx0YVggKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gZS5kZWx0YVkgKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xhbXAoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnd2hlZWwtc2Nyb2xsJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhcmVudC5wYXNzaXZlV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd5JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQubGVmdCA8IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLnBhcmVudC5yaWdodCA+IHRoaXMucGFyZW50LndvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC10aGlzLnBhcmVudC53b3JsZFdpZHRoICogdGhpcy5wYXJlbnQuc2NhbGUueCArIHRoaXMucGFyZW50LnNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd4JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQudG9wIDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5ib3R0b20gPiB0aGlzLnBhcmVudC53b3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLXRoaXMucGFyZW50LndvcmxkSGVpZ2h0ICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==