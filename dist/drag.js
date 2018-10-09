'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        _this.xDirection = !options.direction || options.direction === 'all' || options.direction === 'x';
        _this.yDirection = !options.direction || options.direction === 'all' || options.direction === 'y';
        _this.parseUnderflow(options.underflow || 'center');
        return _this;
    }

    _createClass(Drag, [{
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
        key: 'down',
        value: function down(e) {
            if (this.paused) {
                return;
            }
            var count = this.parent.countDownPointers();
            if ((count === 1 || count > 1 && !this.parent.plugins['pinch']) && this.parent.parent) {
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
                            this.parent.x += newParent.x - this.last.parent.x;
                        }
                        if (this.yDirection) {
                            this.parent.y += newParent.y - this.last.parent.y;
                        }
                        this.last = { x: x, y: y, parent: newParent };
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
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
                    this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImN1cnJlbnQiLCJwb2ludGVySWQiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJuZXdQYXJlbnQiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJ0eXBlIiwidG91Y2hlcyIsImdldFRvdWNoUG9pbnRlcnMiLCJsZW5ndGgiLCJwb2ludGVyIiwiZGVsdGFYIiwiZGVsdGFZIiwicGFzc2l2ZVdoZWVsIiwicHJldmVudERlZmF1bHQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwid29ybGRXaWR0aCIsInNjYWxlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVNDLFFBQVEsU0FBUixDQUFmO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7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TUFBTCxDQUFZd0QsS0FBWixDQUFrQjNCLENBQTdDLEdBQWlELEtBQUs3QixNQUFMLENBQVkwRCxZQUE3RTtBQUNBUixtQ0FBV3JCLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUFqUEw7QUFBQTtBQUFBLDRCQWdFSTtBQUNJLG1CQUFPLEtBQUszQixLQUFaO0FBQ0g7QUFsRUw7O0FBQUE7QUFBQSxFQUFvQ0wsTUFBcEMiLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERyYWcgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy53aGVlbEFjdGl2ZSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMud2hlZWwsIHRydWUpXHJcbiAgICAgICAgdGhpcy53aGVlbFNjcm9sbCA9IG9wdGlvbnMud2hlZWxTY3JvbGwgfHwgMVxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZSA/IDEgOiAtMVxyXG4gICAgICAgIHRoaXMuY2xhbXBXaGVlbCA9IG9wdGlvbnMuY2xhbXBXaGVlbFxyXG4gICAgICAgIHRoaXMueERpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4J1xyXG4gICAgICAgIHRoaXMueURpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5J1xyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICgoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpICYmIHRoaXMucGFyZW50LnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnksIHBhcmVudCB9XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGUuZGF0YS5wb2ludGVySWRcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZFxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubGFzdCAmJiB0aGlzLmN1cnJlbnQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAoKHRoaXMueERpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WCkpIHx8ICh0aGlzLnlEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBuZXdQYXJlbnQueCAtIHRoaXMubGFzdC5wYXJlbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBuZXdQYXJlbnQueSAtIHRoaXMubGFzdC5wYXJlbnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHksIHBhcmVudDogbmV3UGFyZW50IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZHJhZycgfSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHBvaW50ZXIubGFzdC5kYXRhLnBvaW50ZXJJZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnhEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBlLmRlbHRhWCAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnlEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBlLmRlbHRhWSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGFyZW50LnBhc3NpdmVXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucGFyZW50LnJpZ2h0ID4gdGhpcy5wYXJlbnQud29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXRoaXMucGFyZW50LndvcmxkV2lkdGggKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmJvdHRvbSA+IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19