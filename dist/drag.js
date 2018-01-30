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
            if (this.parent.countDownPointers() === 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y };
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
        value: function up() {
            var touches = this.parent.getTouchPointers();
            if (touches.length === 1) {
                var pointer = touches[0];
                if (pointer.last) {
                    this.last = { x: pointer.last.x, y: pointer.last.y };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnREb3duUG9pbnRlcnMiLCJsYXN0IiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwiY291bnQiLCJwbHVnaW5zIiwiZGlzdFgiLCJkaXN0WSIsImNoZWNrVGhyZXNob2xkIiwiZW1pdCIsInNjcmVlbiIsIndvcmxkIiwidG9Xb3JsZCIsInZpZXdwb3J0IiwiZGlydHkiLCJ0b3VjaGVzIiwiZ2V0VG91Y2hQb2ludGVycyIsImxlbmd0aCIsInBvaW50ZXIiLCJkeCIsImR5Iiwib29iIiwiT09CIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImRlY2VsZXJhdGUiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJsZWZ0IiwicmlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInRvcCIsImJvdHRvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmO0FBQ0FFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7QUFXQSxrQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUNJQSxrQkFBVUEsV0FBVyxFQUFyQjs7QUFESixnSEFFVUQsTUFGVjs7QUFHSSxjQUFLRSxLQUFMLEdBQWEsS0FBYjtBQUNBLGNBQUtDLFdBQUwsR0FBbUJS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QUwsQ0FBWWlELGlCQUF4QyxJQUE2RCxDQUE3RTtBQVRSO0FBV0gsaUJBYkQsTUFlQTtBQUNJLHdCQUFJVCxJQUFJVyxHQUFSLEVBQ0E7QUFDSSw2QkFBS25ELE1BQUwsQ0FBWXNCLENBQVosR0FBZ0IsQ0FBaEI7QUFDQXNCLG1DQUFXdEIsQ0FBWCxHQUFlLENBQWY7QUFDSCxxQkFKRCxNQUtLLElBQUlrQixJQUFJWSxNQUFSLEVBQ0w7QUFDSSw2QkFBS3BELE1BQUwsQ0FBWXNCLENBQVosR0FBZ0IsQ0FBQ29CLE1BQU1wQixDQUF2QjtBQUNBc0IsbUNBQVd0QixDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBdk5MO0FBQUE7QUFBQSw0QkF5REk7QUFDSSxtQkFBTyxLQUFLcEIsS0FBWjtBQUNIO0FBM0RMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERyYWcgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBlbmFibGUgb25lLWZpbmdlciB0b3VjaCB0byBkcmFnXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSBleGlzdHMob3B0aW9ucy53aGVlbCkgPyBvcHRpb25zLndoZWVsIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuICAgICAgICBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFggPSB4IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0geSAtIHRoaXMubGFzdC55XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3ZlZCB8fCAodGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFgpIHx8IHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RZKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBkaXN0WFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gZGlzdFlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb3ZlZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctc3RhcnQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLWVuZCcsIHtzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGR4LCBkeSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZHggKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGR5ICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsLXNjcm9sbCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtcG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi50b3ApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IuYm90dG9tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtcG9pbnQueVxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==