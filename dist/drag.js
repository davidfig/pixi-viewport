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
                        this.parent.emit('moved', { viewport: this.parent, type: 'drag' });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImRpc3RYIiwiZGlzdFkiLCJjaGVja1RocmVzaG9sZCIsIm5ld1BhcmVudCIsImVtaXQiLCJzY3JlZW4iLCJ3b3JsZCIsInRvV29ybGQiLCJ2aWV3cG9ydCIsImRpcnR5IiwidHlwZSIsInRvdWNoZXMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwicG9pbnRlciIsImRlbHRhWCIsImRlbHRhWSIsInByZXZlbnREZWZhdWx0IiwiZGVjZWxlcmF0ZSIsInNjcmVlbldvcmxkV2lkdGgiLCJzY3JlZW5XaWR0aCIsImxlZnQiLCJyaWdodCIsIndvcmxkV2lkdGgiLCJzY2FsZSIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwidG9wIiwiYm90dG9tIiwid29ybGRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztBQVlBLGtCQUFZQyxNQUFaLEVBQW9CQyxPQUFw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RUFDQTtBQUNJLDRCQUFRLEtBQUt2QyxVQUFiO0FBRUksNkJBQUssQ0FBQyxDQUFOO0FBQ0ksaUNBQUtqQixNQUFMLENBQVk2QixDQUFaLEdBQWdCLENBQWhCO0FBQ0E7QUFDSiw2QkFBSyxDQUFMO0FBQ0ksaUNBQUs3QixNQUFMLENBQVk2QixDQUFaLEdBQWlCLEtBQUs3QixNQUFMLENBQVl3RCxZQUFaLEdBQTJCLEtBQUt4RCxNQUFMLENBQVl1RCxpQkFBeEQ7QUFDQTtBQUNKO0FBQ0ksaUNBQUt2RCxNQUFMLENBQVk2QixDQUFaLEdBQWdCLENBQUMsS0FBSzdCLE1BQUwsQ0FBWXdELFlBQVosR0FBMkIsS0FBS3hELE1BQUwsQ0FBWXVELGlCQUF4QyxJQUE2RCxDQUE3RTtBQVRSO0FBV0gsaUJBYkQsTUFlQTtBQUNJLHdCQUFJLEtBQUt2RCxNQUFMLENBQVl5RCxHQUFaLEdBQWtCLENBQXRCLEVBQ0E7QUFDSSw2QkFBS3pELE1BQUwsQ0FBWTZCLENBQVosR0FBZ0IsQ0FBaEI7QUFDQW1CLG1DQUFXbkIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNELHdCQUFJLEtBQUs3QixNQUFMLENBQVkwRCxNQUFaLEdBQXFCLEtBQUsxRCxNQUFMLENBQVkyRCxXQUFyQyxFQUNBO0FBQ0ksNkJBQUszRCxNQUFMLENBQVk2QixDQUFaLEdBQWdCLENBQUMsS0FBSzdCLE1BQUwsQ0FBWTJELFdBQWIsR0FBMkIsS0FBSzNELE1BQUwsQ0FBWXNELEtBQVosQ0FBa0J6QixDQUE3QyxHQUFpRCxLQUFLN0IsTUFBTCxDQUFZd0QsWUFBN0U7QUFDQVIsbUNBQVduQixDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBcE9MO0FBQUE7QUFBQSw0QkE4REk7QUFDSSxtQkFBTyxLQUFLM0IsS0FBWjtBQUNIO0FBaEVMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMud2hlZWxBY3RpdmUgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLndoZWVsLCB0cnVlKVxyXG4gICAgICAgIHRoaXMud2hlZWxTY3JvbGwgPSBvcHRpb25zLndoZWVsU2Nyb2xsIHx8IDFcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLmNsYW1wV2hlZWwgPSBvcHRpb25zLmNsYW1wV2hlZWxcclxuICAgICAgICB0aGlzLnhEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCdcclxuICAgICAgICB0aGlzLnlEaXJlY3Rpb24gPSAhb3B0aW9ucy5kaXJlY3Rpb24gfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneSdcclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKSAmJiB0aGlzLnBhcmVudC5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55LCBwYXJlbnQgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5sYXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RYID0geCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WSA9IHkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQgfHwgKCh0aGlzLnhEaXJlY3Rpb24gJiYgdGhpcy5wYXJlbnQuY2hlY2tUaHJlc2hvbGQoZGlzdFgpKSB8fCAodGhpcy55RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RZKSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKGUuZGF0YS5nbG9iYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueERpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gbmV3UGFyZW50LnggLSB0aGlzLmxhc3QucGFyZW50LnhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMueURpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gbmV3UGFyZW50LnkgLSB0aGlzLmxhc3QucGFyZW50LnlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5LCBwYXJlbnQ6IG5ld1BhcmVudCB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1zdGFydCcsIHsgc2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2RyYWcnIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG91Y2hlcyA9IHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0b3VjaGVzWzBdXHJcbiAgICAgICAgICAgIGlmIChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKHBvaW50ZXIubGFzdClcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogcG9pbnRlci5sYXN0LngsIHk6IHBvaW50ZXIubGFzdC55LCBwYXJlbnQgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2hlZWxBY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB3aGVlbCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ3doZWVsJ11cclxuICAgICAgICAgICAgaWYgKCF3aGVlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBlLmRlbHRhWCAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gZS5kZWx0YVkgKiB0aGlzLndoZWVsU2Nyb2xsICogdGhpcy5yZXZlcnNlXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jbGFtcFdoZWVsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xhbXAoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnd2hlZWwtc2Nyb2xsJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucGFyZW50LnJpZ2h0ID4gdGhpcy5wYXJlbnQud29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXRoaXMucGFyZW50LndvcmxkV2lkdGggKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmJvdHRvbSA+IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19