'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var exists = require('exists');

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
            if (exists(options.x)) {
                this.x = options.x;
                this.percentChangeX = this.friction;
            }
            if (exists(options.y)) {
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

            if (this.x) {
                this.parent.x += this.x * elapsed;
                this.x *= this.percentChangeX;
                if (Math.abs(this.x) < this.minSpeed) {
                    this.x = 0;
                }
                this.parent.dirty = true;
            }
            if (this.y) {
                this.parent.y += this.y * elapsed;
                this.y *= this.percentChangeY;
                if (Math.abs(this.y) < this.minSpeed) {
                    this.y = 0;
                }
                this.parent.dirty = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwiYm91bmNlIiwibWluU3BlZWQiLCJzYXZlZCIsIngiLCJ5IiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJwdXNoIiwidGltZSIsInBlcmZvcm1hbmNlIiwibm93IiwibGVuZ3RoIiwic3BsaWNlIiwic2F2ZSIsInBlcmNlbnRDaGFuZ2VYIiwicGVyY2VudENoYW5nZVkiLCJlbGFwc2VkIiwiTWF0aCIsImFicyIsImRpcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx3QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDRIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsSUFBcEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQVIsSUFBa0IsR0FBaEM7QUFDQSxjQUFLQyxRQUFMLEdBQWdCLE9BQU9ILFFBQVFHLFFBQWYsS0FBNEIsV0FBNUIsR0FBMENILFFBQVFHLFFBQWxELEdBQTZELElBQTdFO0FBQ0EsY0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFOSjtBQU9DOztBQWxCTDtBQUFBO0FBQUEsK0JBcUJJO0FBQ0ksaUJBQUtBLEtBQUwsR0FBYSxFQUFiO0FBQ0EsaUJBQUtDLENBQUwsR0FBUyxLQUFLQyxDQUFMLEdBQVMsS0FBbEI7QUFFSDtBQXpCTDtBQUFBO0FBQUEsK0JBNEJJO0FBQ0ksZ0JBQUksS0FBS0MsTUFB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NUIsRUFDQTtBQUNJLHlCQUFLRyxDQUFMLEdBQVMsQ0FBVDtBQUNIO0FBQ0QscUJBQUtQLE1BQUwsQ0FBWXdCLEtBQVosR0FBb0IsSUFBcEI7QUFDSDtBQUNKO0FBL0dMO0FBQUE7QUFBQSxnQ0FrSEk7QUFDSSxpQkFBS2xCLENBQUwsR0FBUyxLQUFLQyxDQUFMLEdBQVMsSUFBbEI7QUFDSDtBQXBITDs7QUFBQTtBQUFBLEVBQTBDVixNQUExQyIsImZpbGUiOiJkZWNlbGVyYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGVjZWxlcmF0ZSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjk1XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgYWZ0ZXIgbW92ZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3VuY2U9MC44XSBwZXJjZW50IHRvIGRlY2VsZXJhdGUgd2hlbiBwYXN0IGJvdW5kYXJpZXMgKG9ubHkgYXBwbGljYWJsZSB3aGVuIHZpZXdwb3J0LmJvdW5jZSgpIGlzIGFjdGl2ZSlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5TcGVlZD0wLjAxXSBtaW5pbXVtIHZlbG9jaXR5IGJlZm9yZSBzdG9wcGluZy9yZXZlcnNpbmcgYWNjZWxlcmF0aW9uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjk1XHJcbiAgICAgICAgdGhpcy5ib3VuY2UgPSBvcHRpb25zLmJvdW5jZSB8fCAwLjVcclxuICAgICAgICB0aGlzLm1pblNwZWVkID0gdHlwZW9mIG9wdGlvbnMubWluU3BlZWQgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5taW5TcGVlZCA6IDAuMDFcclxuICAgICAgICB0aGlzLnNhdmVkID0gW11cclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNhdmVkID0gW11cclxuICAgICAgICB0aGlzLnggPSB0aGlzLnkgPSBmYWxzZVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmIChjb3VudCA9PT0gMSB8fCAoY291bnQgPiAxICYmICF0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZWQucHVzaCh7IHg6IHRoaXMucGFyZW50LngsIHk6IHRoaXMucGFyZW50LnksIHRpbWU6IHBlcmZvcm1hbmNlLm5vdygpIH0pXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNhdmVkLmxlbmd0aCA+IDYwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVkLnNwbGljZSgwLCAzMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPT09IDAgJiYgdGhpcy5zYXZlZC5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzYXZlIG9mIHRoaXMuc2F2ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzYXZlLnRpbWUgPj0gbm93IC0gMTAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBub3cgLSBzYXZlLnRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSAodGhpcy5wYXJlbnQueCAtIHNhdmUueCkgLyB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gKHRoaXMucGFyZW50LnkgLSBzYXZlLnkpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyY2VudENoYW5nZVggPSB0aGlzLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtYW51YWxseSBhY3RpdmF0ZSBwbHVnaW5cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy55XVxyXG4gICAgICovXHJcbiAgICBhY3RpdmF0ZShvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChleGlzdHMob3B0aW9ucy54KSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IG9wdGlvbnMueFxyXG4gICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXhpc3RzKG9wdGlvbnMueSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnlcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy54KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSB0aGlzLnggKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueCAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VYXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLngpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSB0aGlzLnkgKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueSAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VZXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnkpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gbnVsbFxyXG4gICAgfVxyXG59Il19