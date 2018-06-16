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
                    this.parent.emit('moved', this.parent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIm5ld1BhcmVudCIsImVtaXQiLCJzY3JlZW4iLCJ3b3JsZCIsInRvV29ybGQiLCJ2aWV3cG9ydCIsImRpcnR5IiwidG91Y2hlcyIsImdldFRvdWNoUG9pbnRlcnMiLCJsZW5ndGgiLCJwb2ludGVyIiwiZGVsdGFYIiwiZGVsdGFZIiwicHJldmVudERlZmF1bHQiLCJvb2IiLCJPT0IiLCJwb2ludCIsImNvcm5lclBvaW50IiwiZGVjZWxlcmF0ZSIsInNjcmVlbldvcmxkV2lkdGgiLCJzY3JlZW5XaWR0aCIsImxlZnQiLCJyaWdodCIsIndvcmxkV2lkdGgiLCJzY2FsZSIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwidG9wIiwiYm90dG9tIiwid29ybGRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztB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dXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERyYWcgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uPWFsbF0gZGlyZWN0aW9uIHRvIGRyYWcgKGFsbCwgeCwgb3IgeSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy53aGVlbEFjdGl2ZSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMud2hlZWwsIHRydWUpXHJcbiAgICAgICAgdGhpcy53aGVlbFNjcm9sbCA9IG9wdGlvbnMud2hlZWxTY3JvbGwgfHwgMVxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZSA/IDEgOiAtMVxyXG4gICAgICAgIHRoaXMuY2xhbXBXaGVlbCA9IG9wdGlvbnMuY2xhbXBXaGVlbFxyXG4gICAgICAgIHRoaXMueERpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4J1xyXG4gICAgICAgIHRoaXMueURpcmVjdGlvbiA9ICFvcHRpb25zLmRpcmVjdGlvbiB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5J1xyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICgoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpICYmIHRoaXMucGFyZW50LnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnksIHBhcmVudCB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGFjdGl2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZWRcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAoKHRoaXMueERpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WCkpIHx8ICh0aGlzLnlEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFkpKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBuZXdQYXJlbnQueCAtIHRoaXMubGFzdC5wYXJlbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBuZXdQYXJlbnQueSAtIHRoaXMubGFzdC5wYXJlbnQueVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHksIHBhcmVudDogbmV3UGFyZW50IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctZW5kJywge3NjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0gdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZS5kZWx0YVggKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGUuZGVsdGFZICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsLXNjcm9sbCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5wYXJlbnQucmlnaHQgPiB0aGlzLnBhcmVudC53b3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtdGhpcy5wYXJlbnQud29ybGRXaWR0aCAqIHRoaXMucGFyZW50LnNjYWxlLnggKyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnRvcCA8IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC10aGlzLnBhcmVudC53b3JsZEhlaWdodCAqIHRoaXMucGFyZW50LnNjYWxlLnkgKyB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=