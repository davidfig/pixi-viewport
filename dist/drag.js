'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var exists = require('exists');

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
        _this.wheelActive = exists(options.wheel) ? options.wheel : true;
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
            if (this.last) {
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
                        this.parent.dirty = true;
                        this.parent.emit('moved', this.parent);
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
                }
                this.moved = false;
            } else if (this.last) {
                if (this.moved) {
                    this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                    this.last = this.moved = false;
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
                    this.parent.x += e.deltaX * this.wheelScroll * this.reverse;
                    this.parent.y += e.deltaY * this.wheelScroll * this.reverse;
                    if (this.clampWheel) {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.dirty = true;
                    e.preventDefault();
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
            var oob = this.parent.OOB();
            var point = oob.cornerPoint;
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
                    if (oob.left) {
                        this.parent.x = 0;
                        decelerate.x = 0;
                    } else if (oob.right) {
                        this.parent.x = -point.x;
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
                    if (oob.top) {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    } else if (oob.bottom) {
                        this.parent.y = -point.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJ4RGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwieURpcmVjdGlvbiIsInBhcnNlVW5kZXJmbG93IiwidW5kZXJmbG93IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsImUiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInRvTG9jYWwiLCJkYXRhIiwiZ2xvYmFsIiwibGFzdCIsIngiLCJ5IiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwibmV3UGFyZW50IiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZGlydHkiLCJ0b3VjaGVzIiwiZ2V0VG91Y2hQb2ludGVycyIsImxlbmd0aCIsInBvaW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJwcmV2ZW50RGVmYXVsdCIsIm9vYiIsIk9PQiIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjtBQUNBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztBQVlBLGtCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lB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LENBQVl1RCxpQkFBeEQ7QUFDQTtBQUNKO0FBQ0ksaUNBQUt2RCxNQUFMLENBQVk0QixDQUFaLEdBQWdCLENBQUMsS0FBSzVCLE1BQUwsQ0FBWXdELFlBQVosR0FBMkIsS0FBS3hELE1BQUwsQ0FBWXVELGlCQUF4QyxJQUE2RCxDQUE3RTtBQVRSO0FBV0gsaUJBYkQsTUFlQTtBQUNJLHdCQUFJVCxJQUFJVyxHQUFSLEVBQ0E7QUFDSSw2QkFBS3pELE1BQUwsQ0FBWTRCLENBQVosR0FBZ0IsQ0FBaEI7QUFDQXNCLG1DQUFXdEIsQ0FBWCxHQUFlLENBQWY7QUFDSCxxQkFKRCxNQUtLLElBQUlrQixJQUFJWSxNQUFSLEVBQ0w7QUFDSSw2QkFBSzFELE1BQUwsQ0FBWTRCLENBQVosR0FBZ0IsQ0FBQ29CLE1BQU1wQixDQUF2QjtBQUNBc0IsbUNBQVd0QixDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBck9MO0FBQUE7QUFBQSw0QkE4REk7QUFDSSxtQkFBTyxLQUFLMUIsS0FBWjtBQUNIO0FBaEVMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERyYWcgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy53aGVlbEFjdGl2ZSA9IGV4aXN0cyhvcHRpb25zLndoZWVsKSA/IG9wdGlvbnMud2hlZWwgOiB0cnVlXHJcbiAgICAgICAgdGhpcy53aGVlbFNjcm9sbCA9IG9wdGlvbnMud2hlZWxTY3JvbGwgfHwgMVxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZSA/IDEgOiAtMVxyXG4gICAgICAgIHRoaXMuY2xhbXBXaGVlbCA9IG9wdGlvbnMuY2xhbXBXaGVlbFxyXG4gICAgICAgIHRoaXMueERpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4J1xyXG4gICAgICAgIHRoaXMueURpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5J1xyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICgoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpICYmIHRoaXMucGFyZW50LnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnksIHBhcmVudCB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGFjdGl2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZWRcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAoKHRoaXMueERpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WCkpIHx8ICh0aGlzLnlEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBuZXdQYXJlbnQueCAtIHRoaXMubGFzdC5wYXJlbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBuZXdQYXJlbnQueSAtIHRoaXMubGFzdC5wYXJlbnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHksIHBhcmVudDogbmV3UGFyZW50IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctZW5kJywge3NjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0gdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZS5kZWx0YVggKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGUuZGVsdGFZICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsLXNjcm9sbCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBvb2IgPSB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gb29iLmNvcm5lclBvaW50XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd5JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IucmlnaHQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd4JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLnRvcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19