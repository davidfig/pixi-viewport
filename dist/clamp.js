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
                this.parent.emit('moved', { viewport: this.parent, type: 'clamp-x' });
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
                this.parent.emit('moved', { viewport: this.parent, type: 'clamp-y' });
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsInVwZGF0ZSIsInBhdXNlZCIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbldpZHRoIiwieCIsInNjYWxlIiwid29ybGRXaWR0aCIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInkiLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7OztBQVVBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCOztBQURKLGtIQUVVRCxNQUZWOztBQUdJLFlBQUksT0FBT0MsUUFBUUMsU0FBZixLQUE2QixXQUFqQyxFQUNBO0FBQ0ksa0JBQUtDLElBQUwsR0FBWU4sTUFBTU8sUUFBTixDQUFlSCxRQUFRRSxJQUF2QixFQUE2QixJQUE3QixDQUFaO0FBQ0Esa0JBQUtFLEtBQUwsR0FBYVIsTUFBTU8sUUFBTixDQUFlSCxRQUFRSSxLQUF2QixFQUE4QixJQUE5QixDQUFiO0FBQ0Esa0JBQUtDLEdBQUwsR0FBV1QsTUFBTU8sUUFBTixDQUFlSCxRQUFRSyxHQUF2QixFQUE0QixJQUE1QixDQUFY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akIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLMUIsTUFBakIsRUFBeUIyQixNQUFNLFNBQS9CLEVBQTFCO0FBQ0g7QUFDSjtBQXhJTDs7QUFBQTtBQUFBLEVBQXFDaEMsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBjbGFtcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5sZWZ0LCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5yaWdodCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy50b3AgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnRvcCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLmJvdHRvbSwgbnVsbClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd4JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJ1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsIHx8IHRoaXMucmlnaHQgIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5yaWdodCA+ICh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC0odGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSAqIHRoaXMucGFyZW50LnNjYWxlLnggKyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC14JyB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50b3AgIT09IG51bGwgfHwgdGhpcy5ib3R0b20gIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApICogdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5ib3R0b20gPiAodGhpcy5ib3R0b20gPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZEhlaWdodCA6IHRoaXMuYm90dG9tKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXknIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19