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
     * @param {number} [options.factor=1] factor to multiply drag to increase the speed of movement
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwibW92ZWQiLCJ3aGVlbEFjdGl2ZSIsImRlZmF1bHRzIiwid2hlZWwiLCJ3aGVlbFNjcm9sbCIsInJldmVyc2UiLCJjbGFtcFdoZWVsIiwiZmFjdG9yIiwieERpcmVjdGlvbiIsImRpcmVjdGlvbiIsInlEaXJlY3Rpb24iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJ0b0xvY2FsIiwiZGF0YSIsImdsb2JhbCIsImxhc3QiLCJ4IiwieSIsImN1cnJlbnQiLCJwb2ludGVySWQiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJuZXdQYXJlbnQiLCJlbWl0Iiwic2NyZWVuIiwiUElYSSIsIlBvaW50Iiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJ0eXBlIiwidG91Y2hlcyIsImdldFRvdWNoUG9pbnRlcnMiLCJsZW5ndGgiLCJwb2ludGVyIiwiZGVsdGFYIiwiZGVsdGFZIiwicGFzc2l2ZVdoZWVsIiwicHJldmVudERlZmF1bHQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwid29ybGRXaWR0aCIsInNjYWxlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFFBQVNDLFFBQVEsU0FBUixDQUFmO0FBQ0EsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9B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LENBQVk4RCxHQUFaLEdBQWtCLENBQXRCLEVBQ0E7QUFDSSw2QkFBSzlELE1BQUwsQ0FBWThCLENBQVosR0FBZ0IsQ0FBaEI7QUFDQXVCLG1DQUFXdkIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNELHdCQUFJLEtBQUs5QixNQUFMLENBQVkrRCxNQUFaLEdBQXFCLEtBQUsvRCxNQUFMLENBQVlnRSxXQUFyQyxFQUNBO0FBQ0ksNkJBQUtoRSxNQUFMLENBQVk4QixDQUFaLEdBQWdCLENBQUMsS0FBSzlCLE1BQUwsQ0FBWWdFLFdBQWIsR0FBMkIsS0FBS2hFLE1BQUwsQ0FBWTJELEtBQVosQ0FBa0I3QixDQUE3QyxHQUFpRCxLQUFLOUIsTUFBTCxDQUFZNkQsWUFBN0U7QUFDQVIsbUNBQVd2QixDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBblBMO0FBQUE7QUFBQSw0QkFrRUk7QUFDSSxtQkFBTyxLQUFLNUIsS0FBWjtBQUNIO0FBcEVMOztBQUFBO0FBQUEsRUFBb0NMLE1BQXBDIiwiZmlsZSI6ImRyYWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbj1hbGxdIGRpcmVjdGlvbiB0byBkcmFnIChhbGwsIHgsIG9yIHkpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLndoZWVsPXRydWVdIHVzZSB3aGVlbCB0byBzY3JvbGwgaW4geSBkaXJlY3Rpb24gKHVubGVzcyB3aGVlbCBwbHVnaW4gaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndoZWVsU2Nyb2xsPTFdIG51bWJlciBvZiBwaXhlbHMgdG8gc2Nyb2xsIHdpdGggZWFjaCB3aGVlbCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2hlZWwgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5jbGFtcFdoZWVsXSAodHJ1ZSwgeCwgb3IgeSkgY2xhbXAgd2hlZWwgKHRvIGF2b2lkIHdlaXJkIGJvdW5jZSB3aXRoIG1vdXNlIHdoZWVsKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mYWN0b3I9MV0gZmFjdG9yIHRvIG11bHRpcGx5IGRyYWcgdG8gaW5jcmVhc2UgdGhlIHNwZWVkIG9mIG1vdmVtZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB0aGlzLndoZWVsQWN0aXZlID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy53aGVlbCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLndoZWVsU2Nyb2xsID0gb3B0aW9ucy53aGVlbFNjcm9sbCB8fCAxXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5jbGFtcFdoZWVsID0gb3B0aW9ucy5jbGFtcFdoZWVsXHJcbiAgICAgICAgdGhpcy5mYWN0b3IgPSBvcHRpb25zLmZhY3RvciB8fCAxXHJcbiAgICAgICAgdGhpcy54RGlyZWN0aW9uID0gIW9wdGlvbnMuZGlyZWN0aW9uIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnXHJcbiAgICAgICAgdGhpcy55RGlyZWN0aW9uID0gIW9wdGlvbnMuZGlyZWN0aW9uIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knXHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgaWYgKChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSkgJiYgdGhpcy5wYXJlbnQucGFyZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wYXJlbnQucGFyZW50LnRvTG9jYWwoZS5kYXRhLmdsb2JhbClcclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLmRhdGEuZ2xvYmFsLngsIHk6IGUuZGF0YS5nbG9iYWwueSwgcGFyZW50IH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gZS5kYXRhLnBvaW50ZXJJZFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdmVkXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5sYXN0ICYmIHRoaXMuY3VycmVudCA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUuZGF0YS5nbG9iYWwueVxyXG4gICAgICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WCA9IHggLSB0aGlzLmxhc3QueFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdFkgPSB5IC0gdGhpcy5sYXN0LnlcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkIHx8ICgodGhpcy54RGlyZWN0aW9uICYmIHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSkgfHwgKHRoaXMueURpcmVjdGlvbiAmJiB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXJlbnQgPSB0aGlzLnBhcmVudC5wYXJlbnQudG9Mb2NhbChlLmRhdGEuZ2xvYmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnhEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IChuZXdQYXJlbnQueCAtIHRoaXMubGFzdC5wYXJlbnQueCkgKiB0aGlzLmZhY3RvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy55RGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSAobmV3UGFyZW50LnkgLSB0aGlzLmxhc3QucGFyZW50LnkpICogdGhpcy5mYWN0b3JcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5LCBwYXJlbnQ6IG5ld1BhcmVudCB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1zdGFydCcsIHsgc2NyZWVuOiBuZXcgUElYSS5Qb2ludCh0aGlzLmxhc3QueCwgdGhpcy5sYXN0LnkpLCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdkcmFnJyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG91Y2hlcyA9IHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0b3VjaGVzWzBdXHJcbiAgICAgICAgICAgIGlmIChwb2ludGVyLmxhc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50LnBhcmVudC50b0xvY2FsKHBvaW50ZXIubGFzdClcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogcG9pbnRlci5sYXN0LngsIHk6IHBvaW50ZXIubGFzdC55LCBwYXJlbnQgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gcG9pbnRlci5sYXN0LmRhdGEucG9pbnRlcklkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLWVuZCcsIHtzY3JlZW46IG5ldyBQSVhJLlBvaW50KHRoaXMubGFzdC54LCB0aGlzLmxhc3QueSksIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndoZWVsQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlZWwgPSB0aGlzLnBhcmVudC5wbHVnaW5zWyd3aGVlbCddXHJcbiAgICAgICAgICAgIGlmICghd2hlZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnhEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBlLmRlbHRhWCAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnlEaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBlLmRlbHRhWSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGFyZW50LnBhc3NpdmVXaGVlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmxhc3QgPSBudWxsXHJcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucGFyZW50LnJpZ2h0ID4gdGhpcy5wYXJlbnQud29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXRoaXMucGFyZW50LndvcmxkV2lkdGggKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmJvdHRvbSA+IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19