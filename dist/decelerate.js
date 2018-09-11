'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Decelerate, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
     * @param {number} [options.minSpeed=0.01] minimum velocity before stopping/reversing acceleration
     */
    function Decelerate(parent, options) {
        _classCallCheck(this, Decelerate);

        var _this = _possibleConstructorReturn(this, (Decelerate.__proto__ || Object.getPrototypeOf(Decelerate)).call(this, parent));

        options = options || {};
        _this.friction = options.friction || 0.95;
        _this.bounce = options.bounce || 0.5;
        _this.minSpeed = typeof options.minSpeed !== 'undefined' ? options.minSpeed : 0.01;
        _this.saved = [];
        return _this;
    }

    _createClass(Decelerate, [{
        key: 'down',
        value: function down() {
            this.saved = [];
            this.x = this.y = false;
        }
    }, {
        key: 'move',
        value: function move() {
            if (this.paused) {
                return;
            }

            var count = this.parent.countDownPointers();
            if (count === 1 || count > 1 && !this.parent.plugins['pinch']) {
                this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() });
                if (this.saved.length > 60) {
                    this.saved.splice(0, 30);
                }
            }
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.parent.countDownPointers() === 0 && this.saved.length) {
                var now = performance.now();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.saved[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var save = _step.value;

                        if (save.time >= now - 100) {
                            var time = now - save.time;
                            this.x = (this.parent.x - save.x) / time;
                            this.y = (this.parent.y - save.y) / time;
                            this.percentChangeX = this.percentChangeY = this.friction;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }

        /**
         * manually activate plugin
         * @param {object} options
         * @param {number} [options.x]
         * @param {number} [options.y]
         */

    }, {
        key: 'activate',
        value: function activate(options) {
            options = options || {};
            if (typeof options.x !== 'undefined') {
                this.x = options.x;
                this.percentChangeX = this.friction;
            }
            if (typeof options.y !== 'undefined') {
                this.y = options.y;
                this.percentChangeY = this.friction;
            }
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }

            var moved = void 0;
            if (this.x) {
                this.parent.x += this.x * elapsed;
                this.x *= this.percentChangeX;
                if (Math.abs(this.x) < this.minSpeed) {
                    this.x = 0;
                }
                moved = true;
            }
            if (this.y) {
                this.parent.y += this.y * elapsed;
                this.y *= this.percentChangeY;
                if (Math.abs(this.y) < this.minSpeed) {
                    this.y = 0;
                }
                moved = true;
            }
            if (moved) {
                this.parent.emit('moved', { viewport: this.parent, type: 'decelerate' });
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.x = this.y = null;
        }
    }]);

    return Decelerate;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwiZnJpY3Rpb24iLCJib3VuY2UiLCJtaW5TcGVlZCIsInNhdmVkIiwieCIsInkiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInB1c2giLCJ0aW1lIiwicGVyZm9ybWFuY2UiLCJub3ciLCJsZW5ndGgiLCJzcGxpY2UiLCJzYXZlIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJtb3ZlZCIsIk1hdGgiLCJhYnMiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7OztBQVFBLHdCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsNEhBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQkQsUUFBUUMsUUFBUixJQUFvQixJQUFwQztBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBUixJQUFrQixHQUFoQztBQUNBLGNBQUtDLFFBQUwsR0FBZ0IsT0FBT0gsUUFBUUcsUUFBZixLQUE0QixXQUE1QixHQUEwQ0gsUUFBUUcsUUFBbEQsR0FBNkQsSUFBN0U7QUFDQSxjQUFLQyxLQUFMLEdBQWEsRUFBYjtBQU5KO0FBT0M7O0FBbEJMO0FBQUE7QUFBQSwrQkFxQkk7QUFDSSxpQkFBS0EsS0FBTCxHQUFhLEVBQWI7QUFDQSxpQkFBS0MsQ0FBTCxHQUFTLEtBQUtDLENBQUwsR0FBUyxLQUFsQjtBQUVIO0FBekJMO0FBQUE7QUFBQSwrQkE0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Q0Esb0JBQUlHLEtBQUtDLEdBQUwsQ0FBUyxLQUFLakIsQ0FBZCxJQUFtQixLQUFLSCxRQUE1QixFQUNBO0FBQ0kseUJBQUtHLENBQUwsR0FBUyxDQUFUO0FBQ0g7QUFDRGUsd0JBQVEsSUFBUjtBQUNIO0FBQ0QsZ0JBQUlBLEtBQUosRUFDQTtBQUNJLHFCQUFLdEIsTUFBTCxDQUFZeUIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUsxQixNQUFqQixFQUF5QjJCLE1BQU0sWUFBL0IsRUFBMUI7QUFDSDtBQUNKO0FBckhMO0FBQUE7QUFBQSxnQ0F3SEk7QUFDSSxpQkFBS3JCLENBQUwsR0FBUyxLQUFLQyxDQUFMLEdBQVMsSUFBbEI7QUFDSDtBQTFITDs7QUFBQTtBQUFBLEVBQTBDVixNQUExQyIsImZpbGUiOiJkZWNlbGVyYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGVjZWxlcmF0ZSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjk1XHJcbiAgICAgICAgdGhpcy5ib3VuY2UgPSBvcHRpb25zLmJvdW5jZSB8fCAwLjVcclxuICAgICAgICB0aGlzLm1pblNwZWVkID0gdHlwZW9mIG9wdGlvbnMubWluU3BlZWQgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5taW5TcGVlZCA6IDAuMDFcclxuICAgICAgICB0aGlzLnNhdmVkID0gW11cclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNhdmVkID0gW11cclxuICAgICAgICB0aGlzLnggPSB0aGlzLnkgPSBmYWxzZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZWQucHVzaCh7IHg6IHRoaXMucGFyZW50LngsIHk6IHRoaXMucGFyZW50LnksIHRpbWU6IHBlcmZvcm1hbmNlLm5vdygpIH0pXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNhdmVkLmxlbmd0aCA+IDYwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVkLnNwbGljZSgwLCAzMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPT09IDAgJiYgdGhpcy5zYXZlZC5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzYXZlIG9mIHRoaXMuc2F2ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzYXZlLnRpbWUgPj0gbm93IC0gMTAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBub3cgLSBzYXZlLnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSAodGhpcy5wYXJlbnQueCAtIHNhdmUueCkgLyB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gKHRoaXMucGFyZW50LnkgLSBzYXZlLnkpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyY2VudENoYW5nZVggPSB0aGlzLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtYW51YWxseSBhY3RpdmF0ZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy55XVxyXG4gICAgICovXHJcbiAgICBhY3RpdmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnggIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy54ID0gb3B0aW9ucy54XHJcbiAgICAgICAgICAgIHRoaXMucGVyY2VudENoYW5nZVggPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy55ICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueSA9IG9wdGlvbnMueVxyXG4gICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBtb3ZlZFxyXG4gICAgICAgIGlmICh0aGlzLngpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHRoaXMueCAqIGVsYXBzZWRcclxuICAgICAgICAgICAgdGhpcy54ICo9IHRoaXMucGVyY2VudENoYW5nZVhcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueCkgPCB0aGlzLm1pblNwZWVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnggPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHRoaXMueSAqIGVsYXBzZWRcclxuICAgICAgICAgICAgdGhpcy55ICo9IHRoaXMucGVyY2VudENoYW5nZVlcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueSkgPCB0aGlzLm1pblNwZWVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3ZlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdkZWNlbGVyYXRlJyB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gbnVsbFxyXG4gICAgfVxyXG59Il19