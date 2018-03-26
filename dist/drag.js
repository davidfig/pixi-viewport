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

            if (this.last) {
                var x = e.data.global.x;
                var y = e.data.global.y;
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var distX = x - this.last.x;
                    var distY = y - this.last.y;
                    if (this.moved || this.xDirection && this.parent.checkThreshold(distX) || this.yDirection && this.parent.checkThreshold(distY)) {
                        if (this.xDirection) {
                            this.parent.x += distX;
                        }
                        if (this.yDirection) {
                            this.parent.y += distY;
                        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJ4RGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwieURpcmVjdGlvbiIsInBhcnNlVW5kZXJmbG93IiwidW5kZXJmbG93IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsImUiLCJwYXVzZWQiLCJjb3VudERvd25Qb2ludGVycyIsImxhc3QiLCJ4IiwiZGF0YSIsImdsb2JhbCIsInkiLCJjb3VudCIsInBsdWdpbnMiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJkaXJ0eSIsInRvdWNoZXMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwicG9pbnRlciIsImRlbHRhWCIsImRlbHRhWSIsInByZXZlbnREZWZhdWx0Iiwib29iIiwiT09CIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImRlY2VsZXJhdGUiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJsZWZ0IiwicmlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInRvcCIsImJvdHRvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmO0FBQ0FFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7O0FBWUEsa0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FB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O0FBQ0QsZ0JBQUksS0FBS2YsVUFBTCxLQUFvQixHQUF4QixFQUNBO0FBQ0ksb0JBQUksS0FBS1AsTUFBTCxDQUFZcUQsaUJBQVosR0FBZ0MsS0FBS3JELE1BQUwsQ0FBWXNELFlBQWhELEVBQ0E7QUFDSSw0QkFBUSxLQUFLdEMsVUFBYjtBQUVJLDZCQUFLLENBQUMsQ0FBTjtBQUNJLGlDQUFLaEIsTUFBTCxDQUFZeUIsQ0FBWixHQUFnQixDQUFoQjtBQUNBO0FBQ0osNkJBQUssQ0FBTDtBQUNJLGlDQUFLekIsTUFBTCxDQUFZeUIsQ0FBWixHQUFpQixLQUFLekIsTUFBTCxDQUFZc0QsWUFBWixHQUEyQixLQUFLdEQsTUFBTCxDQUFZcUQsaUJBQXhEO0FBQ0E7QUFDSjtBQUNJLGlDQUFLckQsTUFBTCxDQUFZeUIsQ0FBWixHQUFnQixDQUFDLEtBQUt6QixNQUFMLENBQVlzRCxZQUFaLEdBQTJCLEtBQUt0RCxNQUFMLENBQVlxRCxpQkFBeEMsSUFBNkQsQ0FBN0U7QUFUUjtBQVdILGlCQWJELE1BZUE7QUFDSSx3QkFBSVQsSUFBSVcsR0FBUixFQUNBO0FBQ0ksNkJBQUt2RCxNQUFMLENBQVl5QixDQUFaLEdBQWdCLENBQWhCO0FBQ0F1QixtQ0FBV3ZCLENBQVgsR0FBZSxDQUFmO0FBQ0gscUJBSkQsTUFLSyxJQUFJbUIsSUFBSVksTUFBUixFQUNMO0FBQ0ksNkJBQUt4RCxNQUFMLENBQVl5QixDQUFaLEdBQWdCLENBQUNxQixNQUFNckIsQ0FBdkI7QUFDQXVCLG1DQUFXdkIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQWpPTDtBQUFBO0FBQUEsNEJBNERJO0FBQ0ksbUJBQU8sS0FBS3ZCLEtBQVo7QUFDSDtBQTlETDs7QUFBQTtBQUFBLEVBQW9DTCxNQUFwQyIsImZpbGUiOiJkcmFnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSBleGlzdHMob3B0aW9ucy53aGVlbCkgPyBvcHRpb25zLndoZWVsIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5kYXRhLmdsb2JhbC54LCB5OiBlLmRhdGEuZ2xvYmFsLnkgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUuZGF0YS5nbG9iYWwueVxyXG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WCA9IHggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFkgPSB5IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkIHx8ICgodGhpcy54RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSkgfHwgKHRoaXMueURpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBkaXN0WFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBkaXN0WVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5tb3ZlZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctc3RhcnQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvdWNoZXMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAodG91Y2hlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludGVyID0gdG91Y2hlc1swXVxyXG4gICAgICAgICAgICBpZiAocG9pbnRlci5sYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IHBvaW50ZXIubGFzdC54LCB5OiBwb2ludGVyLmxhc3QueSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLWVuZCcsIHtzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGUuZGVsdGFYICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBlLmRlbHRhWSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtcG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsICE9PSAneCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi50b3ApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IuYm90dG9tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtcG9pbnQueVxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==