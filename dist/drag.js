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
            if (this.parent.touches.length <= 1) {
                this.last = { x: e.data.global.x, y: e.data.global.y };
                this.clickedAvailable = true;
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
                this.clickedAvailable = false;
                this.moved = false;
            } else if (this.last) {
                if (this.moved) {
                    this.parent.emit('drag-end', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
                    this.last = this.moved = false;
                } else if (this.clickedAvailable) {
                    this.parent.emit('clicked', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcmFnLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1vdmVkIiwid2hlZWxBY3RpdmUiLCJ3aGVlbCIsIndoZWVsU2Nyb2xsIiwicmV2ZXJzZSIsImNsYW1wV2hlZWwiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJlIiwicGF1c2VkIiwidG91Y2hlcyIsImxlbmd0aCIsImxhc3QiLCJ4IiwiZGF0YSIsImdsb2JhbCIsInkiLCJjbGlja2VkQXZhaWxhYmxlIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJkaXN0WCIsImRpc3RZIiwiY2hlY2tUaHJlc2hvbGQiLCJlbWl0Iiwic2NyZWVuIiwid29ybGQiLCJ0b1dvcmxkIiwidmlld3BvcnQiLCJkaXJ0eSIsImdldFRvdWNoUG9pbnRlcnMiLCJwb2ludGVyIiwiZHgiLCJkeSIsIm9vYiIsIk9PQiIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJkZWNlbGVyYXRlIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwibGVmdCIsInJpZ2h0Iiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ0b3AiLCJib3R0b20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7QUFFQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjtBQUNBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7O0FBV0Esa0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosZ0hBRVVELE1BRlY7O0FBR0ksY0FBS0UsS0FBTCxHQUFhLEtBQWI7QUFD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SyxDQUFDLENBQU47QUFDSSxpQ0FBS2IsTUFBTCxDQUFZdUIsQ0FBWixHQUFnQixDQUFoQjtBQUNBO0FBQ0osNkJBQUssQ0FBTDtBQUNJLGlDQUFLdkIsTUFBTCxDQUFZdUIsQ0FBWixHQUFpQixLQUFLdkIsTUFBTCxDQUFZbUQsWUFBWixHQUEyQixLQUFLbkQsTUFBTCxDQUFZa0QsaUJBQXhEO0FBQ0E7QUFDSjtBQUNJLGlDQUFLbEQsTUFBTCxDQUFZdUIsQ0FBWixHQUFnQixDQUFDLEtBQUt2QixNQUFMLENBQVltRCxZQUFaLEdBQTJCLEtBQUtuRCxNQUFMLENBQVlrRCxpQkFBeEMsSUFBNkQsQ0FBN0U7QUFUUjtBQVdILGlCQWJELE1BZUE7QUFDSSx3QkFBSVQsSUFBSVcsR0FBUixFQUNBO0FBQ0ksNkJBQUtwRCxNQUFMLENBQVl1QixDQUFaLEdBQWdCLENBQWhCO0FBQ0FzQixtQ0FBV3RCLENBQVgsR0FBZSxDQUFmO0FBQ0gscUJBSkQsTUFLSyxJQUFJa0IsSUFBSVksTUFBUixFQUNMO0FBQ0ksNkJBQUtyRCxNQUFMLENBQVl1QixDQUFaLEdBQWdCLENBQUNvQixNQUFNcEIsQ0FBdkI7QUFDQXNCLG1DQUFXdEIsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQXpOTDtBQUFBO0FBQUEsNEJBc0RJO0FBQ0ksbUJBQU8sS0FBS3JCLEtBQVo7QUFDSDtBQXhETDs7QUFBQTtBQUFBLEVBQW9DTCxNQUFwQyIsImZpbGUiOiJkcmFnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEcmFnIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogZW5hYmxlIG9uZS1maW5nZXIgdG91Y2ggdG8gZHJhZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy53aGVlbD10cnVlXSB1c2Ugd2hlZWwgdG8gc2Nyb2xsIGluIHkgZGlyZWN0aW9uICh1bmxlc3Mgd2hlZWwgcGx1Z2luIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aGVlbFNjcm9sbD0xXSBudW1iZXIgb2YgcGl4ZWxzIHRvIHNjcm9sbCB3aXRoIGVhY2ggd2hlZWwgc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHdoZWVsIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gW29wdGlvbnMuY2xhbXBXaGVlbF0gKHRydWUsIHgsIG9yIHkpIGNsYW1wIHdoZWVsICh0byBhdm9pZCB3ZWlyZCBib3VuY2Ugd2l0aCBtb3VzZSB3aGVlbClcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICB0aGlzLndoZWVsQWN0aXZlID0gZXhpc3RzKG9wdGlvbnMud2hlZWwpID8gb3B0aW9ucy53aGVlbCA6IHRydWVcclxuICAgICAgICB0aGlzLndoZWVsU2Nyb2xsID0gb3B0aW9ucy53aGVlbFNjcm9sbCB8fCAxXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5jbGFtcFdoZWVsID0gb3B0aW9ucy5jbGFtcFdoZWVsXHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LnRvdWNoZXMubGVuZ3RoIDw9IDEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUuZGF0YS5nbG9iYWwueCwgeTogZS5kYXRhLmdsb2JhbC55IH1cclxuICAgICAgICAgICAgdGhpcy5jbGlja2VkQXZhaWxhYmxlID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlZFxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcbiAgICAgICAgaWYgKHRoaXMubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RYID0geCAtIHRoaXMubGFzdC54XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0WSA9IHkgLSB0aGlzLmxhc3QueVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWQgfHwgKHRoaXMucGFyZW50LmNoZWNrVGhyZXNob2xkKGRpc3RYKSB8fCB0aGlzLnBhcmVudC5jaGVja1RocmVzaG9sZChkaXN0WSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gZGlzdFhcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IGRpc3RZXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4LCB5IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdkcmFnLXN0YXJ0JywgeyBzY3JlZW46IHRoaXMubGFzdCwgd29ybGQ6IHRoaXMucGFyZW50LnRvV29ybGQodGhpcy5sYXN0KSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3VjaGVzID0gdGhpcy5wYXJlbnQuZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICAgICAgaWYgKHRvdWNoZXMubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRlciA9IHRvdWNoZXNbMF1cclxuICAgICAgICAgICAgaWYgKHBvaW50ZXIubGFzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBwb2ludGVyLmxhc3QueCwgeTogcG9pbnRlci5sYXN0LnkgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tlZEF2YWlsYWJsZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmxhc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnZHJhZy1lbmQnLCB7c2NyZWVuOiB0aGlzLmxhc3QsIHdvcmxkOiB0aGlzLnBhcmVudC50b1dvcmxkKHRoaXMubGFzdCksIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3QgPSB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmNsaWNrZWRBdmFpbGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2NsaWNrZWQnLCB7IHNjcmVlbjogdGhpcy5sYXN0LCB3b3JsZDogdGhpcy5wYXJlbnQudG9Xb3JsZCh0aGlzLmxhc3QpLCB2aWV3cG9ydDogdGhpcy5wYXJlbnQgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChkeCwgZHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy53aGVlbEFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZWVsID0gdGhpcy5wYXJlbnQucGx1Z2luc1snd2hlZWwnXVxyXG4gICAgICAgICAgICBpZiAoIXdoZWVsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IGR4ICogdGhpcy53aGVlbFNjcm9sbCAqIHRoaXMucmV2ZXJzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBkeSAqIHRoaXMud2hlZWxTY3JvbGwgKiB0aGlzLnJldmVyc2VcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYW1wV2hlZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbC1zY3JvbGwnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMubGFzdCA9IG51bGxcclxuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG9vYiA9IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgY29uc3QgcG9pbnQgPSBvb2IuY29ybmVyUG9pbnRcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3knKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXBvaW50LnhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhbXBXaGVlbCAhPT0gJ3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLXBvaW50LnlcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=