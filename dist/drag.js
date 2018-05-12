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
                this.last = this.parent.toWorld(e.data.global);
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
                var count = this.parent.countDownPointers();
                if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                    var pos = this.parent.toWorld(e.data.global);
                    var distX = pos.x - this.last.x;
                    var distY = pos.y - this.last.y;
                    console.log(distX);
                    if (this.moved || this.xDirection && this.parent.checkThreshold(distX) || this.yDirection && this.parent.checkThreshold(distY)) {
                        if (this.xDirection) {
                            this.parent.x += distX;
                        }
                        if (this.yDirection) {
                            this.parent.y += distY;
                        }
                        this.last = pos;
                        if (!this.moved) {
                            this.parent.emit('drag-start', { screen: { x: e.data.x, y: e.data.y }, world: this.last, viewport: this.parent });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJ4RGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwieURpcmVjdGlvbiIsInBhcnNlVW5kZXJmbG93IiwidW5kZXJmbG93IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsImUiLCJwYXVzZWQiLCJjb3VudERvd25Qb2ludGVycyIsImxhc3QiLCJ0b1dvcmxkIiwiZGF0YSIsImdsb2JhbCIsImNvdW50IiwicGx1Z2lucyIsInBvcyIsImRpc3RYIiwieCIsImRpc3RZIiwieSIsImNvbnNvbGUiLCJsb2ciLCJjaGVja1RocmVzaG9sZCIsImVtaXQiLCJzY3JlZW4iLCJ3b3JsZCIsInZpZXdwb3J0IiwiZGlydHkiLCJ0b3VjaGVzIiwiZ2V0VG91Y2hQb2ludGVycyIsImxlbmd0aCIsInBvaW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJwcmV2ZW50RGVmYXVsdCIsIm9vYiIsIk9PQiIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjtBQUNBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztBQVlBLGtCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lB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QWY7QUFDSDtBQUNKO0FBQ0o7QUFDRCxnQkFBSSxLQUFLdEIsVUFBTCxLQUFvQixHQUF4QixFQUNBO0FBQ0ksb0JBQUksS0FBS1AsTUFBTCxDQUFZd0QsaUJBQVosR0FBZ0MsS0FBS3hELE1BQUwsQ0FBWXlELFlBQWhELEVBQ0E7QUFDSSw0QkFBUSxLQUFLekMsVUFBYjtBQUVJLDZCQUFLLENBQUMsQ0FBTjtBQUNJLGlDQUFLaEIsTUFBTCxDQUFZK0IsQ0FBWixHQUFnQixDQUFoQjtBQUNBO0FBQ0osNkJBQUssQ0FBTDtBQUNJLGlDQUFLL0IsTUFBTCxDQUFZK0IsQ0FBWixHQUFpQixLQUFLL0IsTUFBTCxDQUFZeUQsWUFBWixHQUEyQixLQUFLekQsTUFBTCxDQUFZd0QsaUJBQXhEO0FBQ0E7QUFDSjtBQUNJLGlDQUFLeEQsTUFBTCxDQUFZK0IsQ0FBWixHQUFnQixDQUFDLEtBQUsvQixNQUFMLENBQVl5RCxZQUFaLEdBQTJCLEtBQUt6RCxNQUFMLENBQVl3RCxpQkFBeEMsSUFBNkQsQ0FBN0U7QUFUUjtBQVdILGlCQWJELE1BZUE7QUFDSSx3QkFBSVQsSUFBSVcsR0FBUixFQUNBO0FBQ0ksNkJBQUsxRCxNQUFMLENBQVkrQixDQUFaLEdBQWdCLENBQWhCO0FBQ0FvQixtQ0FBV3BCLENBQVgsR0FBZSxDQUFmO0FBQ0gscUJBSkQsTUFLSyxJQUFJZ0IsSUFBSVksTUFBUixFQUNMO0FBQ0ksNkJBQUszRCxNQUFMLENBQVkrQixDQUFaLEdBQWdCLENBQUNrQixNQUFNbEIsQ0FBdkI7QUFDQW9CLG1DQUFXcEIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQWpPTDtBQUFBO0FBQUEsNEJBNERJO0FBQ0ksbUJBQU8sS0FBSzdCLEtBQVo7QUFDSDtBQTlETDs7QUFBQTtBQUFBLEVBQW9DTCxNQUFwQyIsImZpbGUiOiJkcmFnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSBleGlzdHMob3B0aW9ucy53aGVlbCkgPyBvcHRpb25zLndoZWVsIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHRoaXMucGFyZW50LnRvV29ybGQoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZFxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSB0aGlzLnBhcmVudC50b1dvcmxkKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WCA9IHBvcy54IC0gdGhpcy5sYXN0LnhcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RZID0gcG9zLnkgLSB0aGlzLmxhc3QueVxyXG5jb25zb2xlLmxvZyhkaXN0WClcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkIHx8ICgodGhpcy54RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSkgfHwgKHRoaXMueURpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBkaXN0WFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBkaXN0WVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSBwb3NcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHsgeDogZS5kYXRhLngsIHk6IGUuZGF0YS55IH0sIHdvcmxkOiB0aGlzLmxhc3QsIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG91Y2hlcyA9IHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0b3VjaGVzWzBdXHJcbiAgICAgICAgICAgIGlmIChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogcG9pbnRlci5sYXN0LngsIHk6IHBvaW50ZXIubGFzdC55IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2RyYWctZW5kJywge3NjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0gdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZS5kZWx0YVggKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGUuZGVsdGFZICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsLXNjcm9sbCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBvb2IgPSB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgIGNvbnN0IHBvaW50ID0gb29iLmNvcm5lclBvaW50XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd5JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IucmlnaHQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwgIT09ICd4JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLnRvcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19