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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwiZnJpY3Rpb24iLCJib3VuY2UiLCJtaW5TcGVlZCIsInNhdmVkIiwieCIsInkiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInB1c2giLCJ0aW1lIiwicGVyZm9ybWFuY2UiLCJub3ciLCJsZW5ndGgiLCJzcGxpY2UiLCJzYXZlIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJtb3ZlZCIsIk1hdGgiLCJhYnMiLCJkaXJ0eSIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7O0FBUUEsd0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSw0SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCRCxRQUFRQyxRQUFSLElBQW9CLElBQXBDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUFSLElBQWtCLEdBQWhDO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQixPQUFPSCxRQUFRRyxRQUFmLEtBQTRCLFdBQTVCLEdBQTBDSCxRQUFRRyxRQUFsRCxHQUE2RCxJQUE3RTtBQUNBLGNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBTko7QUFPQzs7QUFsQkw7QUFBQTtBQUFBLCtCQXFCSTtBQUNJLGlCQUFLQSxLQUFMLEdBQWEsRUFBYjtBQUNBLGlCQUFLQyxDQUFMLEdBQVMsS0FBS0MsQ0FBTCxHQUFTLEtBQWxCO0FBRUg7QUF6Qkw7QUFBQTtB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LGNBQWY7QUFDQSxvQkFBSUcsS0FBS0MsR0FBTCxDQUFTLEtBQUtqQixDQUFkLElBQW1CLEtBQUtILFFBQTVCLEVBQ0E7QUFDSSx5QkFBS0csQ0FBTCxHQUFTLENBQVQ7QUFDSDtBQUNEZSx3QkFBUSxJQUFSO0FBQ0g7QUFDRCxnQkFBSUEsS0FBSixFQUNBO0FBQ0kscUJBQUt0QixNQUFMLENBQVl5QixLQUFaLEdBQW9CLElBQXBCO0FBQ0EscUJBQUt6QixNQUFMLENBQVkwQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLFVBQVUsS0FBSzNCLE1BQWpCLEVBQXlCNEIsTUFBTSxZQUEvQixFQUExQjtBQUNIO0FBQ0o7QUF0SEw7QUFBQTtBQUFBLGdDQXlISTtBQUNJLGlCQUFLdEIsQ0FBTCxHQUFTLEtBQUtDLENBQUwsR0FBUyxJQUFsQjtBQUNIO0FBM0hMOztBQUFBO0FBQUEsRUFBMENWLE1BQTFDIiwiZmlsZSI6ImRlY2VsZXJhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWNlbGVyYXRlIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOTVcclxuICAgICAgICB0aGlzLmJvdW5jZSA9IG9wdGlvbnMuYm91bmNlIHx8IDAuNVxyXG4gICAgICAgIHRoaXMubWluU3BlZWQgPSB0eXBlb2Ygb3B0aW9ucy5taW5TcGVlZCAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zLm1pblNwZWVkIDogMC4wMVxyXG4gICAgICAgIHRoaXMuc2F2ZWQgPSBbXVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc2F2ZWQgPSBbXVxyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IGZhbHNlXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zYXZlZC5wdXNoKHsgeDogdGhpcy5wYXJlbnQueCwgeTogdGhpcy5wYXJlbnQueSwgdGltZTogcGVyZm9ybWFuY2Uubm93KCkgfSlcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2F2ZWQubGVuZ3RoID4gNjApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWQuc3BsaWNlKDAsIDMwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMCAmJiB0aGlzLnNhdmVkLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICAgICAgICAgIGZvciAobGV0IHNhdmUgb2YgdGhpcy5zYXZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUudGltZSA+PSBub3cgLSAxMDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IG5vdyAtIHNhdmUudGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCA9ICh0aGlzLnBhcmVudC54IC0gc2F2ZS54KSAvIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSAodGhpcy5wYXJlbnQueSAtIHNhdmUueSkgLyB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWCA9IHRoaXMucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1hbnVhbGx5IGFjdGl2YXRlIHBsdWdpblxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy54XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnldXHJcbiAgICAgKi9cclxuICAgIGFjdGl2YXRlKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMueCAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnggPSBvcHRpb25zLnhcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWCA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnkgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy55ID0gb3B0aW9ucy55XHJcbiAgICAgICAgICAgIHRoaXMucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgaWYgKHRoaXMueClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gdGhpcy54ICogZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnggKj0gdGhpcy5wZXJjZW50Q2hhbmdlWFxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy54KSA8IHRoaXMubWluU3BlZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gdGhpcy55ICogZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnkgKj0gdGhpcy5wZXJjZW50Q2hhbmdlWVxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy55KSA8IHRoaXMubWluU3BlZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdkZWNlbGVyYXRlJyB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gbnVsbFxyXG4gICAgfVxyXG59Il19