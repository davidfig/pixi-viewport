'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Bounce, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @fires bounce-start-x
     * @fires bounce.end-x
     * @fires bounce-start-y
     * @fires bounce-end-y
     */
    function Bounce(parent, options) {
        _classCallCheck(this, Bounce);

        var _this = _possibleConstructorReturn(this, (Bounce.__proto__ || Object.getPrototypeOf(Bounce)).call(this, parent));

        options = options || {};
        _this.time = options.time || 150;
        _this.ease = utils.ease(options.ease, 'easeInOutSine');
        _this.friction = options.friction || 0.5;
        options.sides = options.sides || 'all';
        if (options.sides) {
            if (options.sides === 'all') {
                _this.top = _this.bottom = _this.left = _this.right = true;
            } else if (options.sides === 'horizontal') {
                _this.right = _this.left = true;
            } else if (options.sides === 'vertical') {
                _this.top = _this.bottom = true;
            } else {
                _this.top = options.sides.indexOf('top') !== -1;
                _this.bottom = options.sides.indexOf('bottom') !== -1;
                _this.left = options.sides.indexOf('left') !== -1;
                _this.right = options.sides.indexOf('right') !== -1;
            }
        }
        _this.parseUnderflow(options.underflow || 'center');
        _this.last = {};
        _this.reset();
        return _this;
    }

    _createClass(Bounce, [{
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
        key: 'isActive',
        value: function isActive() {
            return this.toX !== null || this.toY !== null;
        }
    }, {
        key: 'down',
        value: function down() {
            this.toX = this.toY = null;
        }
    }, {
        key: 'up',
        value: function up() {
            this.bounce();
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }

            this.bounce();
            if (this.toX) {
                var toX = this.toX;
                toX.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' });
                if (toX.time >= this.time) {
                    this.parent.x = toX.end;
                    this.toX = null;
                    this.parent.emit('bounce-x-end', this.parent);
                } else {
                    this.parent.x = this.ease(toX.time, toX.start, toX.delta, this.time);
                }
            }
            if (this.toY) {
                var toY = this.toY;
                toY.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' });
                if (toY.time >= this.time) {
                    this.parent.y = toY.end;
                    this.toY = null;
                    this.parent.emit('bounce-y-end', this.parent);
                } else {
                    this.parent.y = this.ease(toY.time, toY.start, toY.delta, this.time);
                }
            }
        }
    }, {
        key: 'calcUnderflowX',
        value: function calcUnderflowX() {
            var x = void 0;
            switch (this.underflowX) {
                case -1:
                    x = 0;
                    break;
                case 1:
                    x = this.parent.screenWidth - this.parent.screenWorldWidth;
                    break;
                default:
                    x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
            }
            return x;
        }
    }, {
        key: 'calcUnderflowY',
        value: function calcUnderflowY() {
            var y = void 0;
            switch (this.underflowY) {
                case -1:
                    y = 0;
                    break;
                case 1:
                    y = this.parent.screenHeight - this.parent.screenWorldHeight;
                    break;
                default:
                    y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
            }
            return y;
        }
    }, {
        key: 'bounce',
        value: function bounce() {
            if (this.paused) {
                return;
            }

            var oob = void 0;
            var decelerate = this.parent.plugins['decelerate'];
            if (decelerate && (decelerate.x || decelerate.y)) {
                if (decelerate.x && decelerate.percentChangeX === decelerate.friction || decelerate.y && decelerate.percentChangeY === decelerate.friction) {
                    oob = this.parent.OOB();
                    if (oob.left && this.left || oob.right && this.right) {
                        decelerate.percentChangeX = this.friction;
                    }
                    if (oob.top && this.top || oob.bottom && this.bottom) {
                        decelerate.percentChangeY = this.friction;
                    }
                }
            }
            var drag = this.parent.plugins['drag'] || {};
            var pinch = this.parent.plugins['pinch'] || {};
            decelerate = decelerate || {};
            if (!drag.active && !pinch.active && (!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)) {
                oob = oob || this.parent.OOB();
                var point = oob.cornerPoint;
                if (!this.toX && !decelerate.x) {
                    var x = null;
                    if (oob.left && this.left) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : 0;
                    } else if (oob.right && this.right) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : -point.x;
                    }
                    if (x !== null && this.parent.x !== x) {
                        this.toX = { time: 0, start: this.parent.x, delta: x - this.parent.x, end: x };
                        this.parent.emit('bounce-x-start', this.parent);
                    }
                }
                if (!this.toY && !decelerate.y) {
                    var y = null;
                    if (oob.top && this.top) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : 0;
                    } else if (oob.bottom && this.bottom) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : -point.y;
                    }
                    if (y !== null && this.parent.y !== y) {
                        this.toY = { time: 0, start: this.parent.y, delta: y - this.parent.y, end: y };
                        this.parent.emit('bounce-y-start', this.parent);
                    }
                }
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.toX = this.toY = null;
        }
    }]);

    return Bounce;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsidXRpbHMiLCJyZXF1aXJlIiwiUGx1Z2luIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ0aW1lIiwiZWFzZSIsImZyaWN0aW9uIiwic2lkZXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJpbmRleE9mIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJsYXN0IiwicmVzZXQiLCJjbGFtcCIsInRvTG93ZXJDYXNlIiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJ0b1giLCJ0b1kiLCJib3VuY2UiLCJlbGFwc2VkIiwicGF1c2VkIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsIngiLCJlbmQiLCJzdGFydCIsImRlbHRhIiwieSIsInNjcmVlbldpZHRoIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbkhlaWdodCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwib29iIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJwZXJjZW50Q2hhbmdlWCIsInBlcmNlbnRDaGFuZ2VZIiwiT09CIiwiZHJhZyIsInBpbmNoIiwiYWN0aXZlIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImNhbGNVbmRlcmZsb3dYIiwiY2FsY1VuZGVyZmxvd1kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxJQUFMLEdBQVlELFFBQVFDLElBQVIsSUFBZ0IsR0FBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlSLE1BQU1RLElBQU4sQ0FBV0YsUUFBUUUsSUFBbkIsRUFBeUIsZUFBekIsQ0FBWjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JILFFBQVFHLFFBQVIsSUFBb0IsR0FBcEM7QUFDQUgsZ0JBQVFJLEtBQVIsR0FBZ0JKLFFBQVFJLEtBQVIsSUFBaUIsS0FBakM7QUFDQSxZQUFJSixRQUFRSSxLQUFaLEVBQ0E7QUFDSSxnQkFBSUosUUFBUUksS0FBUixLQUFrQixLQUF0QixFQUNBO0FBQ0ksc0JBQUtDLEdBQUwsR0FBVyxNQUFLQyxNQUFMLEdBQWMsTUFBS0MsSUFBTCxHQUFZLE1BQUtDLEtBQUwsR0FBYSxJQUFsRDtBQUNILGFBSEQsTUFJSyxJQUFJUixRQUFRSSxLQUFSLEtBQWtCLFlBQXRCLEVBQ0w7QUFDSSxzQkFBS0ksS0FBTCxHQUFhLE1BQUtELElBQUwsR0FBWSxJQUF6QjtBQUNILGFBSEksTUFJQSxJQUFJUCxRQUFRSSxLQUFSLEtBQWtCLFVBQXRCLEVBQ0w7QUFDSSxzQkFBS0MsR0FBTCxHQUFXLE1BQUtDLE1BQUwsR0FBYyxJQUF6QjtBQUNILGFBSEksTUFLTDtBQUNJLHNCQUFLRCxHQUFMLEdBQVdMLFFBQVFJLEtBQVIsQ0FBY0ssT0FBZCxDQUFzQixLQUF0QixNQUFpQyxDQUFDLENBQTdDO0FBQ0Esc0JBQUtILE1BQUwsR0FBY04sUUFBUUksS0FBUixDQUFjSyxPQUFkLENBQXNCLFFBQXRCLE1BQW9DLENBQUMsQ0FBbkQ7QUFDQSxzQkFBS0YsSUFBTCxHQUFZUCxRQUFRSSxLQUFSLENBQWNLLE9BQWQsQ0FBc0IsTUFBdEIsTUFBa0MsQ0FBQyxDQUEvQztBQUNBLHNCQUFLRCxLQUFMLEdBQWFSLFFBQVFJLEtBQVIsQ0FBY0ssT0FBZCxDQUFzQixPQUF0QixNQUFtQyxDQUFDLENBQWpEO0FBQ0g7QUFDSjtBQUNELGNBQUtDLGNBQUwsQ0FBb0JWLFFBQVFXLFNBQVIsSUFBcUIsUUFBekM7QUFDQSxjQUFLQyxJQUFMLEdBQVksRUFBWjtBQUNBLGNBQUtDLEtBQUw7QUEvQko7QUFnQ0M7O0FBakRMO0FBQUE7QUFBQSx1Q0FtRG1CQyxLQW5EbkIsRUFvREk7QUFDSUEsb0JBQVFBLE1BQU1DLFdBQU4sRUFBUjtBQUNBLGdCQUFJRCxVQUFVLFFBQWQsRUFDQTtBQUNJLHFCQUFLRSxVQUFMLEdBQWtCLENBQWxCO0FBQ0EscUJBQUtDLFVBQUwsR0FBa0IsQ0FBbEI7QUFDSCxhQUpELE1BTUE7QUFDSSxxQkFBS0QsVUFBTCxHQUFtQkYsTUFBTUwsT0FBTixDQUFjLE1BQWQsTUFBMEIsQ0FBQyxDQUE1QixHQUFpQyxDQUFDLENBQWxDLEdBQXVDSyxNQUFNTCxPQUFOLENBQWMsT0FBZCxNQUEyQixDQUFDLENBQTdCLEdBQWtDLENBQWxDLEdBQXNDLENBQTlGO0FBQ0EscUJBQUtRLFVBQUwsR0FBbUJILE1BQU1MLE9BQU4sQ0FBYyxLQUFkLE1BQXlCLENBQUMsQ0FBM0IsR0FBZ0MsQ0FBQyxDQUFqQyxHQUFzQ0ssTUFBTUwsT0FBTixDQUFjLFFBQWQsTUFBNEIsQ0FBQyxDQUE5QixHQUFtQyxDQUFuQyxHQUF1QyxDQUE5RjtBQUNIO0FBQ0o7QUFoRUw7QUFBQTtBQUFBLG1DQW1FSTtBQUNJLG1CQUFPLEtBQUtTLEdBQUwsS0FBYSxJQUFiLElBQXFCLEtBQUtDLEdBQUwsS0FBYSxJQUF6QztBQUNIO0FBckVMO0FBQUE7QUFBQSwrQkF3RUk7QUFDSSxpQkFBS0QsR0FBTCxHQUFXLEtBQUtDLEdBQUwsR0FBVyxJQUF0QjtBQUNIO0FBMUVMO0FBQUE7QUFBQSw2QkE2RUk7QUFDSSxpQkFBS0MsTUFBTDtBQUNIO0FBL0VMO0FBQUE7QUFBQSwrQkFpRldDLE9BakZYLEVBa0ZJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxpQkFBS0YsTUFBTDtBQUNBLGdCQUFJLEtBQUtGLEdBQVQsRUFDQTtBQUNJLG9CQUFNQSxNQUFNLEtBQUtBLEdBQWpCO0FBQ0FBLG9CQUFJakIsSUFBSixJQUFZb0IsT0FBWjtBQUNBLHFCQUFLdEIsTUFBTCxDQUFZd0IsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUt6QixNQUFqQixFQUF5QjBCLE1BQU0sVUFBL0IsRUFBMUI7QUFDQSxvQkFBSVAsSUFBSWpCLElBQUosSUFBWSxLQUFLQSxJQUFyQixFQUNBO0FBQ0kseUJBQUtGLE1BQUwsQ0FBWTJCLENBQVosR0FBZ0JSLElBQUlTLEdBQXBCO0FBQ0EseUJBQUtULEdBQUwsR0FBVyxJQUFYO0FBQ0EseUJBQUtuQixNQUFMLENBQVl3QixJQUFaLENBQWlCLGNBQWpCLEVBQWlDLEtBQUt4QixNQUF0QztBQUNILGlCQUxELE1BT0E7QUFDSSx5QkFBS0EsTUFBTCxDQUFZMkIsQ0FBWixHQUFnQixLQUFLeEIsSUFBTCxDQUFVZ0IsSUFBSWpCLElBQWQsRUFBb0JpQixJQUFJVSxLQUF4QixFQUErQlYsSUFBSVcsS0FBbkMsRUFBMEMsS0FBSzVCLElBQS9DLENBQWhCO0FBQ0g7QUFDSjtBQUNELGdCQUFJLEtBQUtrQixHQUFULEVBQ0E7QUFDSSxvQkFBTUEsTUFBTSxLQUFLQSxHQUFqQjtBQUNBQSxvQkFBSWxCLElBQUosSUFBWW9CLE9BQVo7QUFDQSxxQkFBS3RCLE1BQUwsQ0FBWXdCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLekIsTUFBakIsRUFBeUIwQixNQUFNLFVBQS9CLEVBQTFCO0FBQ0Esb0JBQUlOLElBQUlsQixJQUFKLElBQVksS0FBS0EsSUFBckIsRUFDQTtBQUNJLHlCQUFLRixNQUFMLENBQVkrQixDQUFaLEdBQWdCWCxJQUFJUSxHQUFwQjtBQUNBLHlCQUFLUixHQUFMLEdBQVcsSUFBWDtBQUNBLHlCQUFLcEIsTUFBTCxDQUFZd0IsSUFBWixDQUFpQixjQUFqQixFQUFpQyxLQUFLeEIsTUFBdEM7QUFDSCxpQkFMRCxNQU9BO0FBQ0kseUJBQUtBLE1BQUwsQ0FBWStCLENBQVosR0FBZ0IsS0FBSzVCLElBQUwsQ0FBVWlCLElBQUlsQixJQUFkLEVBQW9Ca0IsSUFBSVMsS0FBeEIsRUFBK0JULElBQUlVLEtBQW5DLEVBQTBDLEtBQUs1QixJQUEvQyxDQUFoQjtBQUNIO0FBQ0o7QUFDSjtBQXpITDtBQUFBO0FBQUEseUNBNEhJO0FBQ0ksZ0JBQUl5QixVQUFKO0FBQ0Esb0JBQVEsS0FBS1YsVUFBYjtBQUVJLHFCQUFLLENBQUMsQ0FBTjtBQUNJVSx3QkFBSSxDQUFKO0FBQ0E7QUFDSixxQkFBSyxDQUFMO0FBQ0lBLHdCQUFLLEtBQUszQixNQUFMLENBQVlnQyxXQUFaLEdBQTBCLEtBQUtoQyxNQUFMLENBQVlpQyxnQkFBM0M7QUFDQTtBQUNKO0FBQ0lOLHdCQUFJLENBQUMsS0FBSzNCLE1BQUwsQ0FBWWdDLFdBQVosR0FBMEIsS0FBS2hDLE1BQUwsQ0FBWWlDLGdCQUF2QyxJQUEyRCxDQUEvRDtBQVRSO0FBV0EsbUJBQU9OLENBQVA7QUFDSDtBQTFJTDtBQUFBO0FBQUEseUNBNklJO0FBQ0ksZ0JBQUlJLFVBQUo7QUFDQSxvQkFBUSxLQUFLYixVQUFiO0FBRUkscUJBQUssQ0FBQyxDQUFOO0FBQ0lhLHdCQUFJLENBQUo7QUFDQTtBQUNKLHFCQUFLLENBQUw7QUFDSUEsd0JBQUssS0FBSy9CLE1BQUwsQ0FBWWtDLFlBQVosR0FBMkIsS0FBS2xDLE1BQUwsQ0FBWW1DLGlCQUE1QztBQUNBO0FBQ0o7QUFDSUosd0JBQUksQ0FBQyxLQUFLL0IsTUFBTCxDQUFZa0MsWUFBWixHQUEyQixLQUFLbEMsTUFBTCxDQUFZbUMsaUJBQXhDLElBQTZELENBQWpFO0FBVFI7QUFXQSxtQkFBT0osQ0FBUDtBQUNIO0FBM0pMO0FBQUE7QUFBQSxpQ0E4Skk7QUFDSSxnQkFBSSxLQUFLUixNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJYSxZQUFKO0FBQ0EsZ0JBQUlDLGFBQWEsS0FBS3JDLE1BQUwsQ0FBWXNDLE9BQVosQ0FBb0IsWUFBcEIsQ0FBakI7QUFDQSxnQkFBSUQsZUFBZUEsV0FBV1YsQ0FBWCxJQUFnQlUsV0FBV04sQ0FBMUMsQ0FBSixFQUNBO0FBQ0ksb0JBQUtNLFdBQVdWLENBQVgsSUFBZ0JVLFdBQVdFLGNBQVgsS0FBOEJGLFdBQVdqQyxRQUExRCxJQUF3RWlDLFdBQVdOLENBQVgsSUFBZ0JNLFdBQVdHLGNBQVgsS0FBOEJILFdBQVdqQyxRQUFySSxFQUNBO0FBQ0lnQywwQkFBTSxLQUFLcEMsTUFBTCxDQUFZeUMsR0FBWixFQUFOO0FBQ0Esd0JBQUtMLElBQUk1QixJQUFKLElBQVksS0FBS0EsSUFBbEIsSUFBNEI0QixJQUFJM0IsS0FBSixJQUFhLEtBQUtBLEtBQWxELEVBQ0E7QUFDSTRCLG1DQUFXRSxjQUFYLEdBQTRCLEtBQUtuQyxRQUFqQztBQUNIO0FBQ0Qsd0JBQUtnQyxJQUFJOUIsR0FBSixJQUFXLEtBQUtBLEdBQWpCLElBQTBCOEIsSUFBSTdCLE1BQUosSUFBYyxLQUFLQSxNQUFqRCxFQUNBO0FBQ0k4QixtQ0FBV0csY0FBWCxHQUE0QixLQUFLcEMsUUFBakM7QUFDSDtBQUNKO0FBQ0o7QUFDRCxnQkFBTXNDLE9BQU8sS0FBSzFDLE1BQUwsQ0FBWXNDLE9BQVosQ0FBb0IsTUFBcEIsS0FBK0IsRUFBNUM7QUFDQSxnQkFBTUssUUFBUSxLQUFLM0MsTUFBTCxDQUFZc0MsT0FBWixDQUFvQixPQUFwQixLQUFnQyxFQUE5QztBQUNBRCx5QkFBYUEsY0FBYyxFQUEzQjtBQUNBLGdCQUFJLENBQUNLLEtBQUtFLE1BQU4sSUFBZ0IsQ0FBQ0QsTUFBTUMsTUFBdkIsSUFBa0MsQ0FBQyxDQUFDLEtBQUt6QixHQUFOLElBQWEsQ0FBQyxLQUFLQyxHQUFwQixNQUE2QixDQUFDaUIsV0FBV1YsQ0FBWixJQUFpQixDQUFDVSxXQUFXTixDQUExRCxDQUF0QyxFQUNBO0FBQ0lLLHNCQUFNQSxPQUFPLEtBQUtwQyxNQUFMLENBQVl5QyxHQUFaLEVBQWI7QUFDQSxvQkFBTUksUUFBUVQsSUFBSVUsV0FBbEI7QUFDQSxvQkFBSSxDQUFDLEtBQUszQixHQUFOLElBQWEsQ0FBQ2tCLFdBQVdWLENBQTdCLEVBQ0E7QUFDSSx3QkFBSUEsSUFBSSxJQUFSO0FBQ0Esd0JBQUlTLElBQUk1QixJQUFKLElBQVksS0FBS0EsSUFBckIsRUFDQTtBQUNJbUIsNEJBQUssS0FBSzNCLE1BQUwsQ0FBWWlDLGdCQUFaLEdBQStCLEtBQUtqQyxNQUFMLENBQVlnQyxXQUE1QyxHQUEyRCxLQUFLZSxjQUFMLEVBQTNELEdBQW1GLENBQXZGO0FBQ0gscUJBSEQsTUFJSyxJQUFJWCxJQUFJM0IsS0FBSixJQUFhLEtBQUtBLEtBQXRCLEVBQ0w7QUFDSWtCLDRCQUFLLEtBQUszQixNQUFMLENBQVlpQyxnQkFBWixHQUErQixLQUFLakMsTUFBTCxDQUFZZ0MsV0FBNUMsR0FBMkQsS0FBS2UsY0FBTCxFQUEzRCxHQUFtRixDQUFDRixNQUFNbEIsQ0FBOUY7QUFDSDtBQUNELHdCQUFJQSxNQUFNLElBQU4sSUFBYyxLQUFLM0IsTUFBTCxDQUFZMkIsQ0FBWixLQUFrQkEsQ0FBcEMsRUFDQTtBQUNJLDZCQUFLUixHQUFMLEdBQVcsRUFBRWpCLE1BQU0sQ0FBUixFQUFXMkIsT0FBTyxLQUFLN0IsTUFBTCxDQUFZMkIsQ0FBOUIsRUFBaUNHLE9BQU9ILElBQUksS0FBSzNCLE1BQUwsQ0FBWTJCLENBQXhELEVBQTJEQyxLQUFLRCxDQUFoRSxFQUFYO0FBQ0EsNkJBQUszQixNQUFMLENBQVl3QixJQUFaLENBQWlCLGdCQUFqQixFQUFtQyxLQUFLeEIsTUFBeEM7QUFDSDtBQUNKO0FBQ0Qsb0JBQUksQ0FBQyxLQUFLb0IsR0FBTixJQUFhLENBQUNpQixXQUFXTixDQUE3QixFQUNBO0FBQ0ksd0JBQUlBLElBQUksSUFBUjtBQUNBLHdCQUFJSyxJQUFJOUIsR0FBSixJQUFXLEtBQUtBLEdBQXBCLEVBQ0E7QUFDSXlCLDRCQUFLLEtBQUsvQixNQUFMLENBQVltQyxpQkFBWixHQUFnQyxLQUFLbkMsTUFBTCxDQUFZa0MsWUFBN0MsR0FBNkQsS0FBS2MsY0FBTCxFQUE3RCxHQUFxRixDQUF6RjtBQUNILHFCQUhELE1BSUssSUFBSVosSUFBSTdCLE1BQUosSUFBYyxLQUFLQSxNQUF2QixFQUNMO0FBQ0l3Qiw0QkFBSyxLQUFLL0IsTUFBTCxDQUFZbUMsaUJBQVosR0FBZ0MsS0FBS25DLE1BQUwsQ0FBWWtDLFlBQTdDLEdBQTZELEtBQUtjLGNBQUwsRUFBN0QsR0FBcUYsQ0FBQ0gsTUFBTWQsQ0FBaEc7QUFDSDtBQUNELHdCQUFJQSxNQUFNLElBQU4sSUFBYyxLQUFLL0IsTUFBTCxDQUFZK0IsQ0FBWixLQUFrQkEsQ0FBcEMsRUFDQTtBQUNJLDZCQUFLWCxHQUFMLEdBQVcsRUFBRWxCLE1BQU0sQ0FBUixFQUFXMkIsT0FBTyxLQUFLN0IsTUFBTCxDQUFZK0IsQ0FBOUIsRUFBaUNELE9BQU9DLElBQUksS0FBSy9CLE1BQUwsQ0FBWStCLENBQXhELEVBQTJESCxLQUFLRyxDQUFoRSxFQUFYO0FBQ0EsNkJBQUsvQixNQUFMLENBQVl3QixJQUFaLENBQWlCLGdCQUFqQixFQUFtQyxLQUFLeEIsTUFBeEM7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQS9OTDtBQUFBO0FBQUEsZ0NBa09JO0FBQ0ksaUJBQUttQixHQUFMLEdBQVcsS0FBS0MsR0FBTCxHQUFXLElBQXRCO0FBQ0g7QUFwT0w7O0FBQUE7QUFBQSxFQUFzQ3ZCLE1BQXRDIiwiZmlsZSI6ImJvdW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJvdW5jZSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWRlcz1hbGxdIGFsbCwgaG9yaXpvbnRhbCwgdmVydGljYWwsIG9yIGNvbWJpbmF0aW9uIG9mIHRvcCwgYm90dG9tLCByaWdodCwgbGVmdCAoZS5nLiwgJ3RvcC1ib3R0b20tcmlnaHQnKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuNV0gZnJpY3Rpb24gdG8gYXBwbHkgdG8gZGVjZWxlcmF0ZSBpZiBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTE1MF0gdGltZSBpbiBtcyB0byBmaW5pc2ggYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW2Vhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqIEBmaXJlcyBib3VuY2Utc3RhcnQteFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS5lbmQteFxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1zdGFydC15XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLWVuZC15XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnRpbWUgPSBvcHRpb25zLnRpbWUgfHwgMTUwXHJcbiAgICAgICAgdGhpcy5lYXNlID0gdXRpbHMuZWFzZShvcHRpb25zLmVhc2UsICdlYXNlSW5PdXRTaW5lJylcclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjVcclxuICAgICAgICBvcHRpb25zLnNpZGVzID0gb3B0aW9ucy5zaWRlcyB8fCAnYWxsJ1xyXG4gICAgICAgIGlmIChvcHRpb25zLnNpZGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICdhbGwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IHRoaXMuYm90dG9tID0gdGhpcy5sZWZ0ID0gdGhpcy5yaWdodCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLnNpZGVzID09PSAnaG9yaXpvbnRhbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSB0aGlzLmxlZnQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ3ZlcnRpY2FsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCd0b3AnKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCdib3R0b20nKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZignbGVmdCcpICE9PSAtMVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZigncmlnaHQnKSAhPT0gLTFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubGFzdCA9IHt9XHJcbiAgICAgICAgdGhpcy5yZXNldCgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0FjdGl2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9YICE9PSBudWxsIHx8IHRoaXMudG9ZICE9PSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50b1ggPSB0aGlzLnRvWSA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgICAgIGlmICh0aGlzLnRvWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvWCA9IHRoaXMudG9YXHJcbiAgICAgICAgICAgIHRvWC50aW1lICs9IGVsYXBzZWRcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2JvdW5jZS14JyB9KVxyXG4gICAgICAgICAgICBpZiAodG9YLnRpbWUgPj0gdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gdG9YLmVuZFxyXG4gICAgICAgICAgICAgICAgdGhpcy50b1ggPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSB0aGlzLmVhc2UodG9YLnRpbWUsIHRvWC5zdGFydCwgdG9YLmRlbHRhLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9ZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgdG9ZID0gdGhpcy50b1lcclxuICAgICAgICAgICAgdG9ZLnRpbWUgKz0gZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnYm91bmNlLXknIH0pXHJcbiAgICAgICAgICAgIGlmICh0b1kudGltZSA+PSB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSB0b1kuZW5kXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvWSA9IG51bGxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IHRoaXMuZWFzZSh0b1kudGltZSwgdG9ZLnN0YXJ0LCB0b1kuZGVsdGEsIHRoaXMudGltZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYWxjVW5kZXJmbG93WCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHhcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICB4ID0gMFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geFxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVbmRlcmZsb3dZKClcclxuICAgIHtcclxuICAgICAgICBsZXQgeVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgIHkgPSAwXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geVxyXG4gICAgfVxyXG5cclxuICAgIGJvdW5jZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb29iXHJcbiAgICAgICAgbGV0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAoZGVjZWxlcmF0ZSAmJiAoZGVjZWxlcmF0ZS54IHx8IGRlY2VsZXJhdGUueSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGRlY2VsZXJhdGUueCAmJiBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID09PSBkZWNlbGVyYXRlLmZyaWN0aW9uKSB8fCAoZGVjZWxlcmF0ZS55ICYmIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPT09IGRlY2VsZXJhdGUuZnJpY3Rpb24pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvb2IgPSB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgICAgICAgICAgaWYgKChvb2IubGVmdCAmJiB0aGlzLmxlZnQpIHx8IChvb2IucmlnaHQgJiYgdGhpcy5yaWdodCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgob29iLnRvcCAmJiB0aGlzLnRvcCkgfHwgKG9vYi5ib3R0b20gJiYgdGhpcy5ib3R0b20pKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZHJhZyA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RyYWcnXSB8fCB7fVxyXG4gICAgICAgIGNvbnN0IHBpbmNoID0gdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSB8fCB7fVxyXG4gICAgICAgIGRlY2VsZXJhdGUgPSBkZWNlbGVyYXRlIHx8IHt9XHJcbiAgICAgICAgaWYgKCFkcmFnLmFjdGl2ZSAmJiAhcGluY2guYWN0aXZlICYmICgoIXRoaXMudG9YIHx8ICF0aGlzLnRvWSkgJiYgKCFkZWNlbGVyYXRlLnggfHwgIWRlY2VsZXJhdGUueSkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb29iID0gb29iIHx8IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gb29iLmNvcm5lclBvaW50XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b1ggJiYgIWRlY2VsZXJhdGUueClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBudWxsXHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQgJiYgdGhpcy5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodCAmJiB0aGlzLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeCAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC54ICE9PSB4KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9YID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueCwgZGVsdGE6IHggLSB0aGlzLnBhcmVudC54LCBlbmQ6IHggfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS14LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRvWSAmJiAhZGVjZWxlcmF0ZS55KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IG51bGxcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wICYmIHRoaXMudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpID8gdGhpcy5jYWxjVW5kZXJmbG93WSgpIDogMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSAmJiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeSAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC55ICE9PSB5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9ZID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueSwgZGVsdGE6IHkgLSB0aGlzLnBhcmVudC55LCBlbmQ6IHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudG9YID0gdGhpcy50b1kgPSBudWxsXHJcbiAgICB9XHJcbn0iXX0=