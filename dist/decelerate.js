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
        _this.parent.on('moved', function (data) {
            return _this.moved(data);
        });
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
        key: 'moved',
        value: function moved(data) {
            if (this.saved.length) {
                var last = this.saved[this.saved.length - 1];
                if (data.type === 'clamp-x') {
                    if (last.x === data.original.x) {
                        last.x = this.parent.x;
                    }
                } else if (data.type === 'clamp-y') {
                    if (last.y === data.original.y) {
                        last.y = this.parent.y;
                    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNlbGVyYXRlLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwiYm91bmNlIiwibWluU3BlZWQiLCJzYXZlZCIsInJlc2V0Iiwib24iLCJtb3ZlZCIsImRhdGEiLCJ4IiwieSIsInBhdXNlZCIsImNvdW50IiwiY291bnREb3duUG9pbnRlcnMiLCJwbHVnaW5zIiwicHVzaCIsInRpbWUiLCJwZXJmb3JtYW5jZSIsIm5vdyIsImxlbmd0aCIsInNwbGljZSIsImxhc3QiLCJ0eXBlIiwib3JpZ2luYWwiLCJzYXZlIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJNYXRoIiwiYWJzIiwiZW1pdCIsInZpZXdwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx3QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDRIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsSUFBcEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQVIsSUFBa0IsR0FBaEM7QUFDQSxjQUFLQyxRQUFMLEdBQWdCLE9BQU9ILFFBQVFHLFFBQWYsS0FBNEIsV0FBNUIsR0FBMENILFFBQVFHLFFBQWxELEdBQTZELElBQTdFO0FBQ0EsY0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxjQUFLQyxLQUFMO0FBQ0EsY0FBS04sTUFBTCxDQUFZTyxFQUFaLENBQWUsT0FBZixFQUF3QjtBQUFBLG1CQUFRLE1BQUtDLEtBQUwsQ0FBV0MsSUFBWCxDQUFSO0FBQUEsU0FBeEI7QUFSSjtBQVNDOztBQXBCTDtBQUFBO0FB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O0FBQUEsZ0NBb0pJO0FBQ0ksaUJBQUtiLENBQUwsR0FBUyxLQUFLQyxDQUFMLEdBQVMsSUFBbEI7QUFDSDtBQXRKTDs7QUFBQTtBQUFBLEVBQTBDZixNQUExQyIsImZpbGUiOiJkZWNlbGVyYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWNlbGVyYXRlIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOTVdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSBhZnRlciBtb3ZlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmJvdW5jZT0wLjhdIHBlcmNlbnQgdG8gZGVjZWxlcmF0ZSB3aGVuIHBhc3QgYm91bmRhcmllcyAob25seSBhcHBsaWNhYmxlIHdoZW4gdmlld3BvcnQuYm91bmNlKCkgaXMgYWN0aXZlKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pblNwZWVkPTAuMDFdIG1pbmltdW0gdmVsb2NpdHkgYmVmb3JlIHN0b3BwaW5nL3JldmVyc2luZyBhY2NlbGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOTVcclxuICAgICAgICB0aGlzLmJvdW5jZSA9IG9wdGlvbnMuYm91bmNlIHx8IDAuNVxyXG4gICAgICAgIHRoaXMubWluU3BlZWQgPSB0eXBlb2Ygb3B0aW9ucy5taW5TcGVlZCAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zLm1pblNwZWVkIDogMC4wMVxyXG4gICAgICAgIHRoaXMuc2F2ZWQgPSBbXVxyXG4gICAgICAgIHRoaXMucmVzZXQoKVxyXG4gICAgICAgIHRoaXMucGFyZW50Lm9uKCdtb3ZlZCcsIGRhdGEgPT4gdGhpcy5tb3ZlZChkYXRhKSlcclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNhdmVkID0gW11cclxuICAgICAgICB0aGlzLnggPSB0aGlzLnkgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlzQWN0aXZlKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy54IHx8IHRoaXMueVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpXHJcbiAgICAgICAgaWYgKGNvdW50ID09PSAxIHx8IChjb3VudCA+IDEgJiYgIXRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zYXZlZC5wdXNoKHsgeDogdGhpcy5wYXJlbnQueCwgeTogdGhpcy5wYXJlbnQueSwgdGltZTogcGVyZm9ybWFuY2Uubm93KCkgfSlcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2F2ZWQubGVuZ3RoID4gNjApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZWQuc3BsaWNlKDAsIDMwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVkKGRhdGEpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2F2ZWQubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRoaXMuc2F2ZWRbdGhpcy5zYXZlZC5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnY2xhbXAteCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChsYXN0LnggPT09IGRhdGEub3JpZ2luYWwueClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0LnggPSB0aGlzLnBhcmVudC54XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGF0YS50eXBlID09PSAnY2xhbXAteScpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChsYXN0LnkgPT09IGRhdGEub3JpZ2luYWwueSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0LnkgPSB0aGlzLnBhcmVudC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAwICYmIHRoaXMuc2F2ZWQubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICAgICAgZm9yIChsZXQgc2F2ZSBvZiB0aGlzLnNhdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2F2ZS50aW1lID49IG5vdyAtIDEwMClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gbm93IC0gc2F2ZS50aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gKHRoaXMucGFyZW50LnggLSBzYXZlLngpIC8gdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9ICh0aGlzLnBhcmVudC55IC0gc2F2ZS55KSAvIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsbHkgYWN0aXZhdGUgcGx1Z2luXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueV1cclxuICAgICAqL1xyXG4gICAgYWN0aXZhdGUob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy54ICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueCA9IG9wdGlvbnMueFxyXG4gICAgICAgICAgICB0aGlzLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMueSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnlcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbW92ZWRcclxuICAgICAgICBpZiAodGhpcy54KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSB0aGlzLnggKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueCAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VYXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLngpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy54ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy55KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSB0aGlzLnkgKiBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMueSAqPSB0aGlzLnBlcmNlbnRDaGFuZ2VZXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnkpIDwgdGhpcy5taW5TcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZGVjZWxlcmF0ZScgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMueCA9IHRoaXMueSA9IG51bGxcclxuICAgIH1cclxufSJdfQ==