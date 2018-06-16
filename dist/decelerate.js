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
                this.parent.dirty = true;
                this.parent.emit('moved', this.parent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwiZnJpY3Rpb24iLCJib3VuY2UiLCJtaW5TcGVlZCIsInNhdmVkIiwieCIsInkiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInB1c2giLCJ0aW1lIiwicGVyZm9ybWFuY2UiLCJub3ciLCJsZW5ndGgiLCJzcGxpY2UiLCJzYXZlIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJtb3ZlZCIsIk1hdGgiLCJhYnMiLCJkaXJ0eSIsImVtaXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7O0FBUUEsd0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSw0SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCRCxRQUFRQyxRQUFSLElBQW9CLElBQXBDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUFSLElBQWtCLEdBQWhDO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQixPQUFPSCxRQUFRRyxRQUFmLEtBQTRCLFdBQTVCLEdBQTBDSCxRQUFRRyxRQUFsRCxHQUE2RCxJQUE3RTtBQUNBLGNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBTko7QUFPQzs7QUFsQkw7QUFBQTtBQUFBLCtCQXFCSTtBQUNJLGlCQUFLQSxLQUFMLEdBQWEsRUFBYjtBQUNBLGlCQUFLQyxDQUFMLEdBQVMsS0FBS0MsQ0FBTCxHQUFTLEtBQWxCO0FBRUg7QUF6Qkw7QUFBQTtBQUFBLCtCQTRCSTtBQUNJLGdC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S0FBS0MsR0FBTCxDQUFTLEtBQUtqQixDQUFkLElBQW1CLEtBQUtILFFBQTVCLEVBQ0E7QUFDSSx5QkFBS0csQ0FBTCxHQUFTLENBQVQ7QUFDSDtBQUNEZSx3QkFBUSxJQUFSO0FBQ0g7QUFDRCxnQkFBSUEsS0FBSixFQUNBO0FBQ0kscUJBQUt0QixNQUFMLENBQVl5QixLQUFaLEdBQW9CLElBQXBCO0FBQ0EscUJBQUt6QixNQUFMLENBQVkwQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEtBQUsxQixNQUEvQjtBQUNIO0FBQ0o7QUF0SEw7QUFBQTtBQUFBLGdDQXlISTtBQUNJLGlCQUFLTSxDQUFMLEdBQVMsS0FBS0MsQ0FBTCxHQUFTLElBQWxCO0FBQ0g7QUEzSEw7O0FBQUE7QUFBQSxFQUEwQ1YsTUFBMUMiLCJmaWxlIjoiZGVjZWxlcmF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERlY2VsZXJhdGUgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC45NV0gcGVyY2VudCB0byBkZWNlbGVyYXRlIGFmdGVyIG1vdmVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm91bmNlPTAuOF0gcGVyY2VudCB0byBkZWNlbGVyYXRlIHdoZW4gcGFzdCBib3VuZGFyaWVzIChvbmx5IGFwcGxpY2FibGUgd2hlbiB2aWV3cG9ydC5ib3VuY2UoKSBpcyBhY3RpdmUpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluU3BlZWQ9MC4wMV0gbWluaW11bSB2ZWxvY2l0eSBiZWZvcmUgc3RvcHBpbmcvcmV2ZXJzaW5nIGFjY2VsZXJhdGlvblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC45NVxyXG4gICAgICAgIHRoaXMuYm91bmNlID0gb3B0aW9ucy5ib3VuY2UgfHwgMC41XHJcbiAgICAgICAgdGhpcy5taW5TcGVlZCA9IHR5cGVvZiBvcHRpb25zLm1pblNwZWVkICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMubWluU3BlZWQgOiAwLjAxXHJcbiAgICAgICAgdGhpcy5zYXZlZCA9IFtdXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zYXZlZCA9IFtdXHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gZmFsc2VcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVkLnB1c2goeyB4OiB0aGlzLnBhcmVudC54LCB5OiB0aGlzLnBhcmVudC55LCB0aW1lOiBwZXJmb3JtYW5jZS5ub3coKSB9KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zYXZlZC5sZW5ndGggPiA2MClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlZC5zcGxpY2UoMCwgMzApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAwICYmIHRoaXMuc2F2ZWQubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICAgICAgZm9yIChsZXQgc2F2ZSBvZiB0aGlzLnNhdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZS50aW1lID49IG5vdyAtIDEwMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gbm93IC0gc2F2ZS50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gKHRoaXMucGFyZW50LnggLSBzYXZlLngpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9ICh0aGlzLnBhcmVudC55IC0gc2F2ZS55KSAvIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsbHkgYWN0aXZhdGUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueV1cclxuICAgICAqL1xyXG4gICAgYWN0aXZhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy54ICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IG9wdGlvbnMueFxyXG4gICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMueSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnlcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbW92ZWRcclxuICAgICAgICBpZiAodGhpcy54KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSB0aGlzLnggKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueCAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VYXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLngpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSB0aGlzLnkgKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueSAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VZXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnkpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IG51bGxcclxuICAgIH1cclxufSJdfQ==