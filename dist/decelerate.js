'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        _this.reset();
        return _this;
    }

    _createClass(Decelerate, [{
        key: 'down',
        value: function down() {
            this.saved = [];
            this.x = this.y = false;
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return this.x || this.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwiYm91bmNlIiwibWluU3BlZWQiLCJzYXZlZCIsInJlc2V0IiwieCIsInkiLCJwYXVzZWQiLCJjb3VudCIsImNvdW50RG93blBvaW50ZXJzIiwicGx1Z2lucyIsInB1c2giLCJ0aW1lIiwicGVyZm9ybWFuY2UiLCJub3ciLCJsZW5ndGgiLCJzcGxpY2UiLCJzYXZlIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJtb3ZlZCIsIk1hdGgiLCJhYnMiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx3QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDRIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsSUFBcEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQVIsSUFBa0IsR0FBaEM7QUFDQSxjQUFLQyxRQUFMLEdBQWdCLE9BQU9ILFFBQVFHLFFBQWYsS0FBNEIsV0FBNUIsR0FBMENILFFBQVFHLFFBQWxELEdBQTZELElBQTdFO0FBQ0EsY0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxjQUFLQyxLQUFMO0FBUEo7QUFRQzs7QUFuQkw7QUFBQTtBQUFBLCtCQXNCSTtBQUNJLGlCQUFLRCxLQUFMLEdBQWEsRUFBYjtBQUNBLGlCQUFLRSxDQUFMLEdBQVMsS0FBS0MsQ0FBTCxHQUFTLEtBQWxCO0FBQ0g7QUF6Qkw7QUFBQTtBQUFBLG1DQTRCSTtBQUNJLG1CQUFPLEtBQUtELENBQUwsSUFBVSxLQUFLQyxDQUF0QjtBQUNIO0FBOUJMO0FBQUE7QUFBQSwrQkFpQ0k7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFNQyxRQUFRLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQVosRUFBZDtBQUNBLGdCQUFJRCxVQUFVLENBQVYsSUFBZ0JBLFFBQVEsQ0FBUixJQUFhLENBQUMsS0FBS1YsTUFBTCxDQUFZWSxPQUFaLENBQW9CLE9BQXBCLENBQWxDLEVBQ0E7QUFDSSxxQkFBS1AsS0FBTCxDQUFXUSxJQUFYLENBQWdCLEVBQUVOLEdBQUcsS0FBS1AsTUFBTCxDQUFZTyxDQUFqQixFQUFvQkMsR0FBRyxLQUFLUixNQUFMLENBQVlRLENBQW5DLEVBQXNDTSxNQUFNQyxZQUFZQyxHQUFaLEVBQTVDLEVBQWhCO0FBQ0Esb0JBQUksS0FBS1gsS0FBTCxDQUFXWSxNQUFYLEdBQW9CLEVBQXhCLEVBQ0E7QUFDSSx5QkFBS1osS0FBTCxDQUFXYSxNQUFYLENBQWtCLENBQWxCLEVBQXFCLEVBQXJCO0FBQ0g7QUFDSjtBQUNKO0FBaERMO0FBQUE7QUFBQSw2QkFtREk7QUFDSSxnQkFBSSxLQUFLbEIsTUFBTCxDQUFZVyxpQkFBWixPQUFvQyxDQUFwQyxJQUF5QyxLQUFLTixLQUFMLENBQVdZLE1BQXhELEVBQ0E7QUFDSSxvQkFBTUQsTUFBTUQsWUFBWUMsR0FBWixFQUFaO0FBREo7QUFBQTtBQUFBOztBQUFBO0FBRUkseUNBQWlCLEtBQUtYLEtBQXRCLDhIQUNBO0FBQUEsNEJBRFNjLElBQ1Q7O0FBQ0ksNEJBQUlBLEtBQUtMLElBQUwsSUFBYUUsTUFBTSxHQUF2QixFQUNBO0FBQ0ksZ0NBQU1GLE9BQU9FLE1BQU1HLEtBQUtMLElBQXhCO0FBQ0EsaUNBQUtQLENBQUwsR0FBUyxDQUFDLEtBQUtQLE1BQUwsQ0FBWU8sQ0FBWixHQUFnQlksS0FBS1osQ0FBdEIsSUFBMkJPLElBQXBDO0FBQ0EsaUNBQUtOLENBQUwsR0FBUyxDQUFDLEtBQUtSLE1BQUwsQ0FBWVEsQ0FBWixHQUFnQlcsS0FBS1gsQ0FBdEIsSUFBMkJNLElBQXBDO0FBQ0EsaUNBQUtNLGNBQUwsR0FBc0IsS0FBS0MsY0FBTCxHQUFzQixLQUFLbkIsUUFBakQ7QUFDQTtBQUNIO0FBQ0o7QUFaTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBYUM7QUFDSjs7QUFFRDs7Ozs7OztBQXJFSjtBQUFBO0FBQUEsaUNBMkVhRCxPQTNFYixFQTRFSTtBQUNJQSxzQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGdCQUFJLE9BQU9BLFFBQVFNLENBQWYsS0FBcUIsV0FBekIsRUFDQTtBQUNJLHFCQUFLQSxDQUFMLEdBQVNOLFFBQVFNLENBQWpCO0FBQ0EscUJBQUthLGNBQUwsR0FBc0IsS0FBS2xCLFFBQTNCO0FBQ0g7QUFDRCxnQkFBSSxPQUFPRCxRQUFRTyxDQUFmLEtBQXFCLFdBQXpCLEVBQ0E7QUFDSSxxQkFBS0EsQ0FBTCxHQUFTUCxRQUFRTyxDQUFqQjtBQUNBLHFCQUFLYSxjQUFMLEdBQXNCLEtBQUtuQixRQUEzQjtBQUNIO0FBQ0o7QUF4Rkw7QUFBQTtBQUFBLCtCQTBGV29CLE9BMUZYLEVBMkZJO0FBQ0ksZ0JBQUksS0FBS2IsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSWMsY0FBSjtBQUNBLGdCQUFJLEtBQUtoQixDQUFULEVBQ0E7QUFDSSxxQkFBS1AsTUFBTCxDQUFZTyxDQUFaLElBQWlCLEtBQUtBLENBQUwsR0FBU2UsT0FBMUI7QUFDQSxxQkFBS2YsQ0FBTCxJQUFVLEtBQUthLGNBQWY7QUFDQSxvQkFBSUksS0FBS0MsR0FBTCxDQUFTLEtBQUtsQixDQUFkLElBQW1CLEtBQUtILFFBQTVCLEVBQ0E7QUFDSSx5QkFBS0csQ0FBTCxHQUFTLENBQVQ7QUFDSDtBQUNEZ0Isd0JBQVEsSUFBUjtBQUNIO0FBQ0QsZ0JBQUksS0FBS2YsQ0FBVCxFQUNBO0FBQ0kscUJBQUtSLE1BQUwsQ0FBWVEsQ0FBWixJQUFpQixLQUFLQSxDQUFMLEdBQVNjLE9BQTFCO0FBQ0EscUJBQUtkLENBQUwsSUFBVSxLQUFLYSxjQUFmO0FBQ0Esb0JBQUlHLEtBQUtDLEdBQUwsQ0FBUyxLQUFLakIsQ0FBZCxJQUFtQixLQUFLSixRQUE1QixFQUNBO0FBQ0kseUJBQUtJLENBQUwsR0FBUyxDQUFUO0FBQ0g7QUFDRGUsd0JBQVEsSUFBUjtBQUNIO0FBQ0QsZ0JBQUlBLEtBQUosRUFDQTtBQUNJLHFCQUFLdkIsTUFBTCxDQUFZMEIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUszQixNQUFqQixFQUF5QjRCLE1BQU0sWUFBL0IsRUFBMUI7QUFDSDtBQUNKO0FBMUhMO0FBQUE7QUFBQSxnQ0E2SEk7QUFDSSxpQkFBS3JCLENBQUwsR0FBUyxLQUFLQyxDQUFMLEdBQVMsSUFBbEI7QUFDSDtBQS9ITDs7QUFBQTtBQUFBLEVBQTBDWixNQUExQyIsImZpbGUiOiJkZWNlbGVyYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWNlbGVyYXRlIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOTVcclxuICAgICAgICB0aGlzLmJvdW5jZSA9IG9wdGlvbnMuYm91bmNlIHx8IDAuNVxyXG4gICAgICAgIHRoaXMubWluU3BlZWQgPSB0eXBlb2Ygb3B0aW9ucy5taW5TcGVlZCAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zLm1pblNwZWVkIDogMC4wMVxyXG4gICAgICAgIHRoaXMuc2F2ZWQgPSBbXVxyXG4gICAgICAgIHRoaXMucmVzZXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc2F2ZWQgPSBbXVxyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaXNBY3RpdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnggfHwgdGhpcy55XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKClcclxuICAgICAgICBpZiAoY291bnQgPT09IDEgfHwgKGNvdW50ID4gMSAmJiAhdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNhdmVkLnB1c2goeyB4OiB0aGlzLnBhcmVudC54LCB5OiB0aGlzLnBhcmVudC55LCB0aW1lOiBwZXJmb3JtYW5jZS5ub3coKSB9KVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zYXZlZC5sZW5ndGggPiA2MClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlZC5zcGxpY2UoMCwgMzApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAwICYmIHRoaXMuc2F2ZWQubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICAgICAgZm9yIChsZXQgc2F2ZSBvZiB0aGlzLnNhdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZS50aW1lID49IG5vdyAtIDEwMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gbm93IC0gc2F2ZS50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gKHRoaXMucGFyZW50LnggLSBzYXZlLngpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9ICh0aGlzLnBhcmVudC55IC0gc2F2ZS55KSAvIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsbHkgYWN0aXZhdGUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueV1cclxuICAgICAqL1xyXG4gICAgYWN0aXZhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy54ICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IG9wdGlvbnMueFxyXG4gICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMueSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnlcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbW92ZWRcclxuICAgICAgICBpZiAodGhpcy54KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSB0aGlzLnggKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueCAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VYXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLngpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSB0aGlzLnkgKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueSAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VZXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnkpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZGVjZWxlcmF0ZScgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IG51bGxcclxuICAgIH1cclxufSJdfQ==