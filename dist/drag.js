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

            if (this.parent.countDownPointers() <= 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y };
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused) {
                return;
            }

            var x = e.data.global.x;
            var y = e.data.global.y;
            if (this.last) {
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var distX = x - this.last.x;
                    var distY = y - this.last.y;
                    if (this.moved || this.parent.checkThreshold(distX) || this.parent.checkThreshold(distY)) {
                        this.parent.x += distX;
                        this.parent.y += distY;
                        this.last = { x: x, y: y };
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                        }
                        this.moved = true;
                        this.parent.dirty = true;
                    }
                } else {
                    this.moved = false;
                }
            }
        }
    }, {
        key: 'up',
        value: function up(e) {
            if (this.parent.countDownPointers() === 2) {
                if (e.data.originalEvent.touches) {
                    var pointers = this.parent.trackedPointers;
                    for (var key in pointers) {
                        var pointer = pointers[key];
                        if (pointer.pointerId !== 'MOUSE' && pointer.pointerId !== e.data.pointerId) {
                            this.last = { x: pointer.last.x, y: pointer.last.y };
                        }
                    }
                    this.moved = false;
                }
            } else if (this.last && this.moved) {
                this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                this.last = this.moved = false;
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(dx, dy) {
            if (this.paused) {
                return;
            }

            if (this.wheelActive) {
                var wheel = this.parent.plugins['wheel'];
                if (!wheel) {
                    this.parent.x += dx * this.wheelScroll * this.reverse;
                    this.parent.y += dy * this.wheelScroll * this.reverse;
                    if (this.clampWheel) {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.dirty = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwiY291bnQiLCJwbHVnaW5zIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZGlydHkiLCJvcmlnaW5hbEV2ZW50IiwidG91Y2hlcyIsInBvaW50ZXJzIiwidHJhY2tlZFBvaW50ZXJzIiwia2V5IiwicG9pbnRlciIsInBvaW50ZXJJZCIsImR4IiwiZHkiLCJvb2IiLCJPT0IiLCJwb2ludCIsImNvcm5lclBvaW50IiwiZGVjZWxlcmF0ZSIsInNjcmVlbldvcmxkV2lkdGgiLCJzY3JlZW5XaWR0aCIsImxlZnQiLCJyaWdodCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwidG9wIiwiYm90dG9tIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7QUFDQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7OztBQVdBLGtCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCOztBQURKLGdIQUVVRCxNQUZWOztBQUdJLGNBQUtFLEtB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Q0FBWXNCLENBQVosR0FBaUIsS0FBS3RCLE1BQUwsQ0FBWXFELFlBQVosR0FBMkIsS0FBS3JELE1BQUwsQ0FBWW9ELGlCQUF4RDtBQUNBO0FBQ0o7QUFDSSxpQ0FBS3BELE1BQUwsQ0FBWXNCLENBQVosR0FBZ0IsQ0FBQyxLQUFLdEIsTUFBTCxDQUFZcUQsWUFBWixHQUEyQixLQUFLckQsTUFBTCxDQUFZb0QsaUJBQXhDLElBQTZELENBQTdFO0FBVFI7QUFXSCxpQkFiRCxNQWVBO0FBQ0ksd0JBQUlULElBQUlXLEdBQVIsRUFDQTtBQUNJLDZCQUFLdEQsTUFBTCxDQUFZc0IsQ0FBWixHQUFnQixDQUFoQjtBQUNBeUIsbUNBQVd6QixDQUFYLEdBQWUsQ0FBZjtBQUNILHFCQUpELE1BS0ssSUFBSXFCLElBQUlZLE1BQVIsRUFDTDtBQUNJLDZCQUFLdkQsTUFBTCxDQUFZc0IsQ0FBWixHQUFnQixDQUFDdUIsTUFBTXZCLENBQXZCO0FBQ0F5QixtQ0FBV3pCLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUF2Tkw7QUFBQTtBQUFBLDRCQXNESTtBQUNJLG1CQUFPLEtBQUtwQixLQUFaO0FBQ0g7QUF4REw7O0FBQUE7QUFBQSxFQUFvQ0wsTUFBcEMiLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRHJhZyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGVuYWJsZSBvbmUtZmluZ2VyIHRvdWNoIHRvIGRyYWdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMud2hlZWw9dHJ1ZV0gdXNlIHdoZWVsIHRvIHNjcm9sbCBpbiB5IGRpcmVjdGlvbiAodW5sZXNzIHdoZWVsIHBsdWdpbiBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2hlZWxTY3JvbGw9MV0gbnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgd2l0aCBlYWNoIHdoZWVsIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSB3aGVlbCBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLmNsYW1wV2hlZWxdICh0cnVlLCB4LCBvciB5KSBjbGFtcCB3aGVlbCAodG8gYXZvaWQgd2VpcmQgYm91bmNlIHdpdGggbW91c2Ugd2hlZWwpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy53aGVlbEFjdGl2ZSA9IGV4aXN0cyhvcHRpb25zLndoZWVsKSA/IG9wdGlvbnMud2hlZWwgOiB0cnVlXHJcbiAgICAgICAgdGhpcy53aGVlbFNjcm9sbCA9IG9wdGlvbnMud2hlZWxTY3JvbGwgfHwgMVxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZSA/IDEgOiAtMVxyXG4gICAgICAgIHRoaXMuY2xhbXBXaGVlbCA9IG9wdGlvbnMuY2xhbXBXaGVlbFxyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA8PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAodGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RZKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBkaXN0WFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gZGlzdFlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb3ZlZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctc3RhcnQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChlLmRhdGEub3JpZ2luYWxFdmVudC50b3VjaGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMucGFyZW50LnRyYWNrZWRQb2ludGVyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHBvaW50ZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSBwb2ludGVyc1trZXldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50ZXIucG9pbnRlcklkICE9PSAnTU9VU0UnICYmIHBvaW50ZXIucG9pbnRlcklkICE9PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBwb2ludGVyLmxhc3QueCwgeTogcG9pbnRlci5sYXN0LnkgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdCAmJiB0aGlzLm1vdmVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChkeCwgZHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGR4ICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBkeSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG9vYiA9IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSBvb2IuY29ybmVyUG9pbnRcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXBvaW50LnhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLXBvaW50LnlcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=