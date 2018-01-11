'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(ClampZoom, _Plugin);

    /**
     * @private
     * @param {object} [options]
     * @param {number} [options.minWidth] minimum width
     * @param {number} [options.minHeight] minimum height
     * @param {number} [options.maxWidth] maximum width
     * @param {number} [options.maxHeight] maximum height
     */
    function ClampZoom(parent, options) {
        _classCallCheck(this, ClampZoom);

        var _this = _possibleConstructorReturn(this, (ClampZoom.__proto__ || Object.getPrototypeOf(ClampZoom)).call(this, parent));

        _this.minWidth = options.minWidth;
        _this.minHeight = options.minHeight;
        _this.maxWidth = options.maxWidth;
        _this.maxHeight = options.maxHeight;
        return _this;
    }

    _createClass(ClampZoom, [{
        key: 'resize',
        value: function resize() {
            this.clamp();
        }
    }, {
        key: 'clamp',
        value: function clamp() {
            if (this.paused) {
                return;
            }

            var width = this.parent.worldScreenWidth;
            var height = this.parent.worldScreenHeight;
            if (this.minWidth && width < this.minWidth) {
                this.parent.fitWidth(this.minWidth);
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
            }
            if (this.maxWidth && width > this.maxWidth) {
                this.parent.fitWidth(this.maxWidth);
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
            }
            if (this.minHeight && height < this.minHeight) {
                this.parent.fitHeight(this.minHeight);
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
            }
            if (this.maxHeight && height > this.maxHeight) {
                this.parent.fitHeight(this.maxHeight);
            }
        }
    }]);

    return ClampZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC16b29tLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJjbGFtcCIsInBhdXNlZCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiZml0V2lkdGgiLCJmaXRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7OztBQVFBLHVCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsMEhBQ1VELE1BRFY7O0FBRUksY0FBS0UsUUFBTCxHQUFnQkQsUUFBUUMsUUFBeEI7QUFDQSxjQUFLQyxTQUFMLEdBQWlCRixRQUFRRSxTQUF6QjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JILFFBQVFHLFFBQXhCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQkosUUFBUUksU0FBekI7QUFMSjtBQU1DOztBQWpCTDtBQUFBO0FBQUEsaUNBb0JJO0FBQ0ksaUJBQUtDLEtBQUw7QUFDSDtBQXRCTDtBQUFBO0FBQUEsZ0NBeUJJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSUMsUUFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUF4QjtBQUNBLGdCQUFJQyxTQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXpCO0FBQ0EsZ0JBQUksS0FBS1QsUUFBTCxJQUFpQk0sUUFBUSxLQUFLTixRQUFsQyxFQUNBO0FBQ0kscUJBQUtGLE1BQUwsQ0FBWVksUUFBWixDQUFxQixLQUFLVixRQUExQjtBQUNBTSx3QkFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUFwQjtBQUNBQyx5QkFBUyxLQUFLVixNQUFMLENBQVlXLGlCQUFyQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS1AsUUFBTCxJQUFpQkksUUFBUSxLQUFLSixRQUFsQyxFQUNBO0FBQ0kscUJBQUtKLE1BQUwsQ0FBWVksUUFBWixDQUFxQixLQUFLUixRQUExQjtBQUNBSSx3QkFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUFwQjtBQUNBQyx5QkFBUyxLQUFLVixNQUFMLENBQVlXLGlCQUFyQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS1IsU0FBTCxJQUFrQk8sU0FBUyxLQUFLUCxTQUFwQyxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWWEsU0FBWixDQUFzQixLQUFLVixTQUEzQjtBQUNBSyx3QkFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUFwQjtBQUNBQyx5QkFBUyxLQUFLVixNQUFMLENBQVlXLGlCQUFyQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS04sU0FBTCxJQUFrQkssU0FBUyxLQUFLTCxTQUFwQyxFQUNBO0FBQ0kscUJBQUtMLE1BQUwsQ0FBWWEsU0FBWixDQUFzQixLQUFLUixTQUEzQjtBQUNIO0FBQ0o7QUF2REw7O0FBQUE7QUFBQSxFQUF5Q1QsTUFBekMiLCJmaWxlIjoiY2xhbXAtem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ2xhbXBab29tIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5XaWR0aF0gbWluaW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbkhlaWdodF0gbWluaW11bSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXaWR0aF0gbWF4aW11bSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heEhlaWdodF0gbWF4aW11bSBoZWlnaHRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICB0aGlzLm1pbldpZHRoID0gb3B0aW9ucy5taW5XaWR0aFxyXG4gICAgICAgIHRoaXMubWluSGVpZ2h0ID0gb3B0aW9ucy5taW5IZWlnaHRcclxuICAgICAgICB0aGlzLm1heFdpZHRoID0gb3B0aW9ucy5tYXhXaWR0aFxyXG4gICAgICAgIHRoaXMubWF4SGVpZ2h0ID0gb3B0aW9ucy5tYXhIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICByZXNpemUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2xhbXAoKVxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICBpZiAodGhpcy5taW5XaWR0aCAmJiB3aWR0aCA8IHRoaXMubWluV2lkdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRXaWR0aCh0aGlzLm1pbldpZHRoKVxyXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4V2lkdGggJiYgd2lkdGggPiB0aGlzLm1heFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0V2lkdGgodGhpcy5tYXhXaWR0aClcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1pbkhlaWdodCAmJiBoZWlnaHQgPCB0aGlzLm1pbkhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdEhlaWdodCh0aGlzLm1pbkhlaWdodClcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1heEhlaWdodCAmJiBoZWlnaHQgPiB0aGlzLm1heEhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdEhlaWdodCh0aGlzLm1heEhlaWdodClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19