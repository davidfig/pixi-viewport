'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var exists = require('exists');

module.exports = function (_Plugin) {
    _inherits(clamp, _Plugin);

    /**
     * @private
     * @param {object} options
     * @param {(number|boolean)} [options.left] clamp left; true=0
     * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
     * @param {(number|boolean)} [options.top] clamp top; true=0
     * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
     * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    function clamp(parent, options) {
        _classCallCheck(this, clamp);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (clamp.__proto__ || Object.getPrototypeOf(clamp)).call(this, parent));

        if (typeof options.direction === 'undefined') {
            _this.left = exists(options.left) ? options.left : null;
            _this.right = exists(options.right) ? options.right : null;
            _this.top = exists(options.top) ? options.top : null;
            _this.bottom = exists(options.bottom) ? options.bottom : null;
        } else {
            _this.left = options.direction === 'x' || options.direction === 'all';
            _this.right = options.direction === 'x' || options.direction === 'all';
            _this.top = options.direction === 'y' || options.direction === 'all';
            _this.bottom = options.direction === 'y' || options.direction === 'all';
        }
        _this.parseUnderflow(options.underflow || 'center');
        _this.move();
        return _this;
    }

    _createClass(clamp, [{
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
        key: 'move',
        value: function move() {
            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.paused) {
                return;
            }

            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.left !== null || this.right !== null) {
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
                    if (this.left !== null) {
                        if (this.parent.left < (this.left === true ? 0 : this.left)) {
                            this.parent.x = -(this.left === true ? 0 : this.left) * this.parent.scale.x;
                            decelerate.x = 0;
                        }
                    }
                    if (this.right !== null) {
                        if (this.parent.right > (this.right === true ? this.parent.worldWidth : this.right)) {
                            this.x = -(this.right === true ? this.parent.worldWidth : this.right) * this.parent.scale.x + this.parent.screenWidth;
                            decelerate.x = 0;
                        }
                    }
                }
            }
            if (this.top !== null || this.bottom !== null) {
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
                    if (this.top !== null) {
                        if (this.parent.top < (this.top === true ? 0 : this.top)) {
                            this.parent.y = -(this.top === true ? 0 : this.top) * this.parent.scale.y;
                            decelerate.y = 0;
                        }
                    }
                    if (this.bottom !== null) {
                        if (this.parent.bottom > (this.bottom === true ? this.parent.worldHeight : this.bottom)) {
                            this.parent.y = -(this.bottom === true ? this.parent.worldHeight : this.bottom) * this.parent.scale.y + this.parent.screenHeight;
                            decelerate.y = 0;
                        }
                    }
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwiZXhpc3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJkaXJlY3Rpb24iLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsIm1vdmUiLCJjbGFtcCIsInRvTG93ZXJDYXNlIiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJpbmRleE9mIiwidXBkYXRlIiwicGF1c2VkIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJ4Iiwic2NhbGUiLCJ3b3JsZFdpZHRoIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ5Iiwid29ybGRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsUUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7QUFVQSxtQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUNJQSxrQkFBVUEsV0FBVyxFQUFyQjs7QUFESixrSEFFVUQsTUFGVjs7QUFHSSxZQUFJLE9BQU9DLFFBQVFDLFNBQWYsS0FBNkIsV0FBakMsRUFDQTtBQUNJLGtCQUFLQyxJQUFMLEdBQVlOLE9BQU9JLFFBQVFFLElBQWYsSUFBdUJGLFFBQVFFLElBQS9CLEdBQXNDLElBQWxEO0FBQ0Esa0JBQUtDLEtBQUwsR0FBYVAsT0FBT0ksUUFBUUcsS0FBZixJQUF3QkgsUUFBUUcsS0FBaEMsR0FBd0MsSUFBckQ7QUFDQSxrQkFBS0MsR0FBTCxHQUFXUixPQUFPSSxRQUFRSSxHQUFmLElBQXNCSixRQUFRSSxHQUE5QixHQUFvQyxJQUEvQztBQUNBLGtCQUFLQyxNQUFMLEdBQWNULE9BQU9J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RTtBQVRSO0FBV0gsaUJBYkQsTUFlQTtBQUNJLHdCQUFJLEtBQUtuQixHQUFMLEtBQWEsSUFBakIsRUFDQTtBQUNJLDRCQUFJLEtBQUtMLE1BQUwsQ0FBWUssR0FBWixJQUFtQixLQUFLQSxHQUFMLEtBQWEsSUFBYixHQUFvQixDQUFwQixHQUF3QixLQUFLQSxHQUFoRCxDQUFKLEVBQ0E7QUFDSSxpQ0FBS0wsTUFBTCxDQUFZMEIsQ0FBWixHQUFnQixFQUFFLEtBQUtyQixHQUFMLEtBQWEsSUFBYixHQUFvQixDQUFwQixHQUF3QixLQUFLQSxHQUEvQixJQUFzQyxLQUFLTCxNQUFMLENBQVlzQixLQUFaLENBQWtCSSxDQUF4RTtBQUNBVCx1Q0FBV1MsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0Qsd0JBQUksS0FBS3BCLE1BQUwsS0FBZ0IsSUFBcEIsRUFDQTtBQUNJLDRCQUFJLEtBQUtOLE1BQUwsQ0FBWU0sTUFBWixJQUFzQixLQUFLQSxNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtOLE1BQUwsQ0FBWTJCLFdBQW5DLEdBQWlELEtBQUtyQixNQUE1RSxDQUFKLEVBQ0E7QUFDSSxpQ0FBS04sTUFBTCxDQUFZMEIsQ0FBWixHQUFnQixFQUFFLEtBQUtwQixNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtOLE1BQUwsQ0FBWTJCLFdBQW5DLEdBQWlELEtBQUtyQixNQUF4RCxJQUFrRSxLQUFLTixNQUFMLENBQVlzQixLQUFaLENBQWtCSSxDQUFwRixHQUF3RixLQUFLMUIsTUFBTCxDQUFZeUIsWUFBcEg7QUFDQVIsdUNBQVdTLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUFDSjtBQXRJTDs7QUFBQTtBQUFBLEVBQXFDL0IsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIGNsYW1wIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmxlZnRdIGNsYW1wIGxlZnQ7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5yaWdodF0gY2xhbXAgcmlnaHQ7IHRydWU9dmlld3BvcnQud29ybGRXaWR0aFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy50b3BdIGNsYW1wIHRvcDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmJvdHRvbV0gY2xhbXAgYm90dG9tOyB0cnVlPXZpZXdwb3J0LndvcmxkSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uXSAoYWxsLCB4LCBvciB5KSB1c2luZyBjbGFtcHMgb2YgWzAsIHZpZXdwb3J0LndvcmxkV2lkdGgvdmlld3BvcnQud29ybGRIZWlnaHRdOyByZXBsYWNlcyBsZWZ0L3JpZ2h0L3RvcC9ib3R0b20gaWYgc2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSBleGlzdHMob3B0aW9ucy5sZWZ0KSA/IG9wdGlvbnMubGVmdCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IGV4aXN0cyhvcHRpb25zLnJpZ2h0KSA/IG9wdGlvbnMucmlnaHQgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gZXhpc3RzKG9wdGlvbnMudG9wKSA/IG9wdGlvbnMudG9wIDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IGV4aXN0cyhvcHRpb25zLmJvdHRvbSkgPyBvcHRpb25zLmJvdHRvbSA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJ1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsIHx8IHRoaXMucmlnaHQgIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5yaWdodCA+ICh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54ID0gLSh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpICogdGhpcy5wYXJlbnQuc2NhbGUueCArIHRoaXMucGFyZW50LnNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsIHx8IHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRvcCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQudG9wIDwgKHRoaXMudG9wID09PSB0cnVlID8gMCA6IHRoaXMudG9wKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtKHRoaXMudG9wID09PSB0cnVlID8gMCA6IHRoaXMudG9wKSAqIHRoaXMucGFyZW50LnNjYWxlLnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19