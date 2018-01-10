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
            if (this.parent.countDownPointers() === 1 && this.saved.length) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbImV4aXN0cyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwiYm91bmNlIiwibWluU3BlZWQiLCJzYXZlZCIsIngiLCJ5IiwicGF1c2VkIiwiY291bnQiLCJjb3VudERvd25Qb2ludGVycyIsInBsdWdpbnMiLCJwdXNoIiwidGltZSIsInBlcmZvcm1hbmNlIiwibm93IiwibGVuZ3RoIiwic3BsaWNlIiwic2F2ZSIsInBlcmNlbnRDaGFuZ2VYIiwicGVyY2VudENoYW5nZVkiLCJlbGFwc2VkIiwiTWF0aCIsImFicyIsImRpcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTUMsU0FBU0QsUUFBUSxVQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7OztBQU9BLHdCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsNEhBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQkQsUUFBUUMsUUFBUixJQUFvQixJQUFwQztBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBUixJQUFrQixHQUFoQztBQUNBLGNBQUtDLFFBQUwsR0FBZ0IsT0FBT0gsUUFBUUcsUUFBZixLQUE0QixXQUE1QixHQUEwQ0gsUUFBUUcsUUFBbEQsR0FBNkQsSUFBN0U7QUFDQSxjQUFLQyxLQUFMLEdBQWEsRUFBYjtBQU5KO0FBT0M7O0FBakJMO0FBQUE7QUFBQSwrQkFvQkk7QUFDSSxpQkFBS0EsS0FBTCxHQUFhLEVBQWI7QUFDQSxpQkFBS0MsQ0FBTCxHQUFTLEtBQUtDLENBQUwsR0FBUyxLQUFsQjtBQUVIO0FBeEJMO0FBQUE7QUFBQSwrQkEyQkk7QUFDSSxnQkFBSSxLQUFLQyxNQUFU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QixFQUNBO0FBQ0kseUJBQUtHLENBQUwsR0FBUyxDQUFUO0FBQ0g7QUFDRCxxQkFBS1AsTUFBTCxDQUFZd0IsS0FBWixHQUFvQixJQUFwQjtBQUNIO0FBQ0o7QUE5R0w7QUFBQTtBQUFBLGdDQWlISTtBQUNJLGlCQUFLbEIsQ0FBTCxHQUFTLEtBQUtDLENBQUwsR0FBUyxJQUFsQjtBQUNIO0FBbkhMOztBQUFBO0FBQUEsRUFBMENWLE1BQTFDIiwiZmlsZSI6ImRlY2VsZXJhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWNlbGVyYXRlIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC45NVxyXG4gICAgICAgIHRoaXMuYm91bmNlID0gb3B0aW9ucy5ib3VuY2UgfHwgMC41XHJcbiAgICAgICAgdGhpcy5taW5TcGVlZCA9IHR5cGVvZiBvcHRpb25zLm1pblNwZWVkICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMubWluU3BlZWQgOiAwLjAxXHJcbiAgICAgICAgdGhpcy5zYXZlZCA9IFtdXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zYXZlZCA9IFtdXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gZmFsc2VcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVkLnB1c2goeyB4OiB0aGlzLnBhcmVudC54LCB5OiB0aGlzLnBhcmVudC55LCB0aW1lOiBwZXJmb3JtYW5jZS5ub3coKSB9KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zYXZlZC5sZW5ndGggPiA2MClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlZC5zcGxpY2UoMCwgMzApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAxICYmIHRoaXMuc2F2ZWQubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICAgICAgZm9yIChsZXQgc2F2ZSBvZiB0aGlzLnNhdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZS50aW1lID49IG5vdyAtIDEwMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gbm93IC0gc2F2ZS50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gKHRoaXMucGFyZW50LnggLSBzYXZlLngpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9ICh0aGlzLnBhcmVudC55IC0gc2F2ZS55KSAvIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsbHkgYWN0aXZhdGUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueV1cclxuICAgICAqL1xyXG4gICAgYWN0aXZhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBpZiAoZXhpc3RzKG9wdGlvbnMueCkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnggPSBvcHRpb25zLnhcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWCA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGV4aXN0cyhvcHRpb25zLnkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy55ID0gb3B0aW9ucy55XHJcbiAgICAgICAgICAgIHRoaXMucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMueClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gdGhpcy54ICogZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnggKj0gdGhpcy5wZXJjZW50Q2hhbmdlWFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy54KSA8IHRoaXMubWluU3BlZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gdGhpcy55ICogZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnkgKj0gdGhpcy5wZXJjZW50Q2hhbmdlWVxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy55KSA8IHRoaXMubWluU3BlZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IG51bGxcclxuICAgIH1cclxufSJdfQ==