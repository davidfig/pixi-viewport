'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var utils = require('./utils');

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
            _this.left = utils.defaults(options.left, null);
            _this.right = utils.defaults(options.right, null);
            _this.top = utils.defaults(options.top, null);
            _this.bottom = utils.defaults(options.bottom, null);
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
                            this.parent.x = -(this.right === true ? this.parent.worldWidth : this.right) * this.parent.scale.x + this.parent.screenWidth;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsInVwZGF0ZSIsInBhdXNlZCIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwieCIsInNjYWxlIiwid29ybGRXaWR0aCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwieSIsIndvcmxkSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxRQUFTRCxRQUFRLFNBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosa0hBRVVELE1BRlY7O0FBR0ksWUFBSSxPQUFPQyxRQUFRQyxTQUFmLEtBQTZCLFdBQWpDLEVBQ0E7QUFDSSxrQkFBS0MsSUFBTCxHQUFZTixNQUFNTyxRQUFOLENBQWVILFFBQVFFLElBQXZCLEVBQTZCLElBQTdCLENBQVo7QUFDQSxrQkFBS0UsS0FBTCxHQUFhUixNQUFNTyxRQUFOLENBQWVILFFBQVFJLEtBQXZCLEVBQThCLElBQTlCLENBQWI7QUFDQSxrQkFBS0MsR0FBTCxHQUFXVCxNQUFNTyxRQUFOLENBQWVILFFBQVFLLEdBQXZCLEVBQTRCLElBQTVCLENBQVg7QUFDQSxrQkFBS0MsTUFBTCxHQUFjVixN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QUF4QyxJQUE2RCxDQUE3RTtBQVRSO0FBV0gsaUJBYkQsTUFlQTtBQUNJLHdCQUFJLEtBQUtuQixHQUFMLEtBQWEsSUFBakIsRUFDQTtBQUNJLDRCQUFJLEtBQUtOLE1BQUwsQ0FBWU0sR0FBWixJQUFtQixLQUFLQSxHQUFMLEtBQWEsSUFBYixHQUFvQixDQUFwQixHQUF3QixLQUFLQSxHQUFoRCxDQUFKLEVBQ0E7QUFDSSxpQ0FBS04sTUFBTCxDQUFZMkIsQ0FBWixHQUFnQixFQUFFLEtBQUtyQixHQUFMLEtBQWEsSUFBYixHQUFvQixDQUFwQixHQUF3QixLQUFLQSxHQUEvQixJQUFzQyxLQUFLTixNQUFMLENBQVl1QixLQUFaLENBQWtCSSxDQUF4RTtBQUNBVCx1Q0FBV1MsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0Qsd0JBQUksS0FBS3BCLE1BQUwsS0FBZ0IsSUFBcEIsRUFDQTtBQUNJLDRCQUFJLEtBQUtQLE1BQUwsQ0FBWU8sTUFBWixJQUFzQixLQUFLQSxNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtQLE1BQUwsQ0FBWTRCLFdBQW5DLEdBQWlELEtBQUtyQixNQUE1RSxDQUFKLEVBQ0E7QUFDSSxpQ0FBS1AsTUFBTCxDQUFZMkIsQ0FBWixHQUFnQixFQUFFLEtBQUtwQixNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtQLE1BQUwsQ0FBWTRCLFdBQW5DLEdBQWlELEtBQUtyQixNQUF4RCxJQUFrRSxLQUFLUCxNQUFMLENBQVl1QixLQUFaLENBQWtCSSxDQUFwRixHQUF3RixLQUFLM0IsTUFBTCxDQUFZMEIsWUFBcEg7QUFDQVIsdUNBQVdTLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUFDSjtBQXRJTDs7QUFBQTtBQUFBLEVBQXFDaEMsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBjbGFtcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5sZWZ0LCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5yaWdodCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy50b3AgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRvcCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLmJvdHRvbSwgbnVsbClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJ1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsIHx8IHRoaXMucmlnaHQgIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5yaWdodCA+ICh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC0odGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSAqIHRoaXMucGFyZW50LnNjYWxlLnggKyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRvcCAhPT0gbnVsbCB8fCB0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3AgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnRvcCA8ICh0aGlzLnRvcCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLnRvcCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLnRvcCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLnRvcCkgKiB0aGlzLnBhcmVudC5zY2FsZS55XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib3R0b20gIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmJvdHRvbSA+ICh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy5ib3R0b20gPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZEhlaWdodCA6IHRoaXMuYm90dG9tKSAqIHRoaXMucGFyZW50LnNjYWxlLnkgKyB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==