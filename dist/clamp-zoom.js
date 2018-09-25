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
                var original = this.parent.scale.x;
                this.parent.fitWidth(this.minWidth, false, false);
                this.parent.scale.y *= this.parent.scale.x / original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxWidth && width > this.maxWidth) {
                var _original = this.parent.scale.x;
                this.parent.fitWidth(this.maxWidth, false, false);
                this.parent.scale.y *= this.parent.scale.x / _original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.minHeight && height < this.minHeight) {
                var _original2 = this.parent.scale.y;
                this.parent.fitHeight(this.minHeight, false, false);
                this.parent.scale.x *= this.parent.scale.y / _original2;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxHeight && height > this.maxHeight) {
                var _original3 = this.parent.scale.y;
                this.parent.fitHeight(this.maxHeight, false, false);
                this.parent.scale.x *= this.parent.scale.y / _original3;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
    }]);

    return ClampZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC16b29tLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJjbGFtcCIsInBhdXNlZCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0Iiwib3JpZ2luYWwiLCJzY2FsZSIsIngiLCJmaXRXaWR0aCIsInkiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwiZml0SGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx1QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDBIQUNVRCxNQURWOztBQUVJLGNBQUtFLFFBQUwsR0FBZ0JELFFBQVFDLFFBQXhCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQkYsUUFBUUUsU0FBekI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCSCxRQUFRRyxRQUF4QjtBQUNBLGNBQUtDLFNBQUwsR0FBaUJKLFFBQVFJLFNBQXpCO0FBTEo7QUFNQzs7QUFqQkw7QUFBQTtBQUFBLGlDQW9CSTtBQUNJLGlCQUFLQyxLQUFMO0FBQ0g7QUF0Qkw7QUFBQTtBQUFBLGdDQXlCSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUlDLFFBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBeEI7QUFDQSxnQkFBSUMsU0FBUyxLQUFLVixNQUFMLENBQVlXLGlCQUF6QjtBQUNBLGdCQUFJLEtBQUtULFFBQUwsSUFBaUJNLFFBQVEsS0FBS04sUUFBbEMsRUFDQTtBQUNJLG9CQUFNVSxXQUFXLEtBQUtaLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkMsQ0FBbkM7QUFDQSxxQkFBS2QsTUFBTCxDQUFZZSxRQUFaLENBQXFCLEtBQUtiLFFBQTFCLEVBQW9DLEtBQXBDLEVBQTJDLEtBQTNDO0FBQ0EscUJBQUtGLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkcsQ0FBbEIsSUFBdUIsS0FBS2hCLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkMsQ0FBbEIsR0FBc0JGLFFBQTdDO0FBQ0FKLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0EscUJBQUtYLE1BQUwsQ0FBWWlCLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsRUFBRUMsVUFBVSxLQUFLbEIsTUFBakIsRUFBeUJtQixNQUFNLFlBQS9CLEVBQTNCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLZixRQUFMLElBQWlCSSxRQUFRLEtBQUtKLFFBQWxDLEVBQ0E7QUFDSSxvQkFBTVEsWUFBVyxLQUFLWixNQUFMLENBQVlhLEtBQVosQ0FBa0JDLENBQW5DO0FBQ0EscUJBQUtkLE1BQUwsQ0FBWWUsUUFBWixDQUFxQixLQUFLWCxRQUExQixFQUFvQyxLQUFwQyxFQUEyQyxLQUEzQztBQUNBLHFCQUFLSixNQUFMLENBQVlhLEtBQVosQ0FBa0JHLENBQWxCLElBQXVCLEtBQUtoQixNQUFMLENBQVlhLEtBQVosQ0FBa0JDLENBQWxCLEdBQXNCRixTQUE3QztBQUNBSix3QkFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUFwQjtBQUNBQyx5QkFBUyxLQUFLVixNQUFMLENBQVlXLGlCQUFyQjtBQUNBLHFCQUFLWCxNQUFMLENBQVlpQixJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEVBQUVDLFVBQVUsS0FBS2xCLE1BQWpCLEVBQXlCbUIsTUFBTSxZQUEvQixFQUEzQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS2hCLFNBQUwsSUFBa0JPLFNBQVMsS0FBS1AsU0FBcEMsRUFDQTtBQUNJLG9CQUFNUyxhQUFXLEtBQUtaLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkcsQ0FBbkM7QUFDQSxxQkFBS2hCLE1BQUwsQ0FBWW9CLFNBQVosQ0FBc0IsS0FBS2pCLFNBQTNCLEVBQXNDLEtBQXRDLEVBQTZDLEtBQTdDO0FBQ0EscUJBQUtILE1BQUwsQ0FBWWEsS0FBWixDQUFrQkMsQ0FBbEIsSUFBdUIsS0FBS2QsTUFBTCxDQUFZYSxLQUFaLENBQWtCRyxDQUFsQixHQUFzQkosVUFBN0M7QUFDQUosd0JBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBcEI7QUFDQUMseUJBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBckI7QUFDQSxxQkFBS1gsTUFBTCxDQUFZaUIsSUFBWixDQUFpQixRQUFqQixFQUEyQixFQUFFQyxVQUFVLEtBQUtsQixNQUFqQixFQUF5Qm1CLE1BQU0sWUFBL0IsRUFBM0I7QUFDSDtBQUNELGdCQUFJLEtBQUtkLFNBQUwsSUFBa0JLLFNBQVMsS0FBS0wsU0FBcEMsRUFDQTtBQUNJLG9CQUFNTyxhQUFXLEtBQUtaLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkcsQ0FBbkM7QUFDQSxxQkFBS2hCLE1BQUwsQ0FBWW9CLFNBQVosQ0FBc0IsS0FBS2YsU0FBM0IsRUFBc0MsS0FBdEMsRUFBNkMsS0FBN0M7QUFDQSxxQkFBS0wsTUFBTCxDQUFZYSxLQUFaLENBQWtCQyxDQUFsQixJQUF1QixLQUFLZCxNQUFMLENBQVlhLEtBQVosQ0FBa0JHLENBQWxCLEdBQXNCSixVQUE3QztBQUNBLHFCQUFLWixNQUFMLENBQVlpQixJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEVBQUVDLFVBQVUsS0FBS2xCLE1BQWpCLEVBQXlCbUIsTUFBTSxZQUEvQixFQUEzQjtBQUNIO0FBQ0o7QUFuRUw7O0FBQUE7QUFBQSxFQUF5Q3ZCLE1BQXpDIiwiZmlsZSI6ImNsYW1wLXpvb20uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsYW1wWm9vbSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5taW5XaWR0aCA9IG9wdGlvbnMubWluV2lkdGhcclxuICAgICAgICB0aGlzLm1pbkhlaWdodCA9IG9wdGlvbnMubWluSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5tYXhXaWR0aCA9IG9wdGlvbnMubWF4V2lkdGhcclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IG9wdGlvbnMubWF4SGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMubWluV2lkdGggJiYgd2lkdGggPCB0aGlzLm1pbldpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLnBhcmVudC5zY2FsZS54XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdFdpZHRoKHRoaXMubWluV2lkdGgsIGZhbHNlLCBmYWxzZSlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSB0aGlzLnBhcmVudC5zY2FsZS54IC8gb3JpZ2luYWxcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4V2lkdGggJiYgd2lkdGggPiB0aGlzLm1heFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLnBhcmVudC5zY2FsZS54XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdFdpZHRoKHRoaXMubWF4V2lkdGgsIGZhbHNlLCBmYWxzZSlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSB0aGlzLnBhcmVudC5zY2FsZS54IC8gb3JpZ2luYWxcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWluSGVpZ2h0ICYmIGhlaWdodCA8IHRoaXMubWluSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLnBhcmVudC5zY2FsZS55XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdEhlaWdodCh0aGlzLm1pbkhlaWdodCwgZmFsc2UsIGZhbHNlKVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICo9IHRoaXMucGFyZW50LnNjYWxlLnkgLyBvcmlnaW5hbFxyXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnem9vbWVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC16b29tJyB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tYXhIZWlnaHQgJiYgaGVpZ2h0ID4gdGhpcy5tYXhIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHRoaXMucGFyZW50LnNjYWxlLnlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0SGVpZ2h0KHRoaXMubWF4SGVpZ2h0LCBmYWxzZSwgZmFsc2UpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKj0gdGhpcy5wYXJlbnQuc2NhbGUueSAvIG9yaWdpbmFsXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19