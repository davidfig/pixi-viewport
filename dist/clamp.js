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
                            this.parent.left = this.left === true ? 0 : this.left;
                            decelerate.x = 0;
                        }
                    }
                    if (this.right !== null) {
                        if (this.parent.right > (this.right === true ? this.parent.worldWidth : this.right)) {
                            this.parent.right = this.right === true ? this.parent.worldWidth : this.right;
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
                            this.parent.top = this.top === true ? 0 : this.top;
                            decelerate.y = 0;
                        }
                    }
                    if (this.bottom !== null) {
                        if (this.parent.bottom > (this.bottom === true ? this.parent.worldHeight : this.bottom)) {
                            this.parent.bottom = this.bottom === true ? this.parent.worldHeight : this.bottom;
                            decelerate.y = 0;
                        }
                    }
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwiZXhpc3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJkaXJlY3Rpb24iLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsIm1vdmUiLCJjbGFtcCIsInRvTG93ZXJDYXNlIiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJpbmRleE9mIiwidXBkYXRlIiwicGF1c2VkIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJ4Iiwid29ybGRXaWR0aCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwieSIsIndvcmxkSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFFBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosa0hBRVVELE1BRlY7O0FBR0ksWUFBSSxPQUFPQyxRQUFRQyxTQUFmLEtBQTZCLFdBQWpDLEVBQ0E7QUFDSSxrQkFBS0MsSUFBTCxHQUFZTixPQUFPSSxRQUFRRSxJQUFmLElBQXVCRixRQUFRRSxJQUEvQixHQUFzQyxJQUFsRDtBQUNBLGtCQUFLQyxLQUFMLEdBQWFQLE9BQU9JLFFBQVFHLEtBQWYsSUFBd0JILFFBQVFHLEtBQWhDLEdBQXdDLElBQXJEO0FBQ0Esa0JBQUtDLEdBQUwsR0FBV1IsT0FBT0ksUUFBUUksR0FBZixJQUFzQkosUUFBUUksR0FBOUIsR0FBb0MsSUFBL0M7QUFDQSxrQkFBS0MsTUFBTCxHQUFjVCxPQUFPSSxRQUFRSyxN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b0IsQ0FBcEIsR0FBd0IsS0FBS0EsR0FBaEQsQ0FBSixFQUNBO0FBQ0ksaUNBQUtMLE1BQUwsQ0FBWUssR0FBWixHQUFrQixLQUFLQSxHQUFMLEtBQWEsSUFBYixHQUFvQixDQUFwQixHQUF3QixLQUFLQSxHQUEvQztBQUNBWSx1Q0FBV1EsQ0FBWCxHQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0Qsd0JBQUksS0FBS25CLE1BQUwsS0FBZ0IsSUFBcEIsRUFDQTtBQUNJLDRCQUFJLEtBQUtOLE1BQUwsQ0FBWU0sTUFBWixJQUFzQixLQUFLQSxNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtOLE1BQUwsQ0FBWTBCLFdBQW5DLEdBQWlELEtBQUtwQixNQUE1RSxDQUFKLEVBQ0E7QUFDSSxpQ0FBS04sTUFBTCxDQUFZTSxNQUFaLEdBQXFCLEtBQUtBLE1BQUwsS0FBZ0IsSUFBaEIsR0FBdUIsS0FBS04sTUFBTCxDQUFZMEIsV0FBbkMsR0FBaUQsS0FBS3BCLE1BQTNFO0FBQ0FXLHVDQUFXUSxDQUFYLEdBQWUsQ0FBZjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBQ0o7QUF0SUw7O0FBQUE7QUFBQSxFQUFxQzlCLE1BQXJDIiwiZmlsZSI6ImNsYW1wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBjbGFtcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gZXhpc3RzKG9wdGlvbnMubGVmdCkgPyBvcHRpb25zLmxlZnQgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSBleGlzdHMob3B0aW9ucy5yaWdodCkgPyBvcHRpb25zLnJpZ2h0IDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IGV4aXN0cyhvcHRpb25zLnRvcCkgPyBvcHRpb25zLnRvcCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSBleGlzdHMob3B0aW9ucy5ib3R0b20pID8gb3B0aW9ucy5ib3R0b20gOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJ1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneScgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLm1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCAhPT0gbnVsbCB8fCB0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgKHRoaXMubGVmdCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLmxlZnQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubGVmdCA9IHRoaXMubGVmdCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLmxlZnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5yaWdodCA+ICh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucmlnaHQgPSB0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50b3AgIT09IG51bGwgfHwgdGhpcy5ib3R0b20gIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQudG9wID0gdGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3BcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5ib3R0b20gPSB0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b21cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==