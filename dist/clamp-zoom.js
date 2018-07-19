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
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxWidth && width > this.maxWidth) {
                this.parent.fitWidth(this.maxWidth);
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.minHeight && height < this.minHeight) {
                this.parent.fitHeight(this.minHeight);
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxHeight && height > this.maxHeight) {
                this.parent.fitHeight(this.maxHeight);
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
    }]);

    return ClampZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC16b29tLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJjbGFtcCIsInBhdXNlZCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiZml0V2lkdGgiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwiZml0SGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx1QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDBIQUNVRCxNQURWOztBQUVJLGNBQUtFLFFBQUwsR0FBZ0JELFFBQVFDLFFBQXhCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQkYsUUFBUUUsU0FBekI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCSCxRQUFRRyxRQUF4QjtBQUNBLGNBQUtDLFNBQUwsR0FBaUJKLFFBQVFJLFNBQXpCO0FBTEo7QUFNQzs7QUFqQkw7QUFBQTtBQUFBLGlDQW9CSTtBQUNJLGlCQUFLQyxLQUFMO0FBQ0g7QUF0Qkw7QUFBQTtBQUFBLGdDQXlCSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUlDLFFBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBeEI7QUFDQSxnQkFBSUMsU0FBUyxLQUFLVixNQUFMLENBQVlXLGlCQUF6QjtBQUNBLGdCQUFJLEtBQUtULFFBQUwsSUFBaUJNLFFBQVEsS0FBS04sUUFBbEMsRUFDQTtBQUNJLHFCQUFLRixNQUFMLENBQVlZLFFBQVosQ0FBcUIsS0FBS1YsUUFBMUI7QUFDQU0sd0JBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBcEI7QUFDQUMseUJBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBckI7QUFDQSxxQkFBS1gsTUFBTCxDQUFZYSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEVBQUVDLFVBQVUsS0FBS2QsTUFBakIsRUFBeUJlLE1BQU0sWUFBL0IsRUFBM0I7QUFDSDtBQUNELGdCQUFJLEtBQUtYLFFBQUwsSUFBaUJJLFFBQVEsS0FBS0osUUFBbEMsRUFDQTtBQUNJLHFCQUFLSixNQUFMLENBQVlZLFFBQVosQ0FBcUIsS0FBS1IsUUFBMUI7QUFDQUksd0JBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBcEI7QUFDQUMseUJBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBckI7QUFDQSxxQkFBS1gsTUFBTCxDQUFZYSxJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEVBQUVDLFVBQVUsS0FBS2QsTUFBakIsRUFBeUJlLE1BQU0sWUFBL0IsRUFBM0I7QUFDSDtBQUNELGdCQUFJLEtBQUtaLFNBQUwsSUFBa0JPLFNBQVMsS0FBS1AsU0FBcEMsRUFDQTtBQUNJLHFCQUFLSCxNQUFMLENBQVlnQixTQUFaLENBQXNCLEtBQUtiLFNBQTNCO0FBQ0FLLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0EscUJBQUtYLE1BQUwsQ0FBWWEsSUFBWixDQUFpQixRQUFqQixFQUEyQixFQUFFQyxVQUFVLEtBQUtkLE1BQWpCLEVBQXlCZSxNQUFNLFlBQS9CLEVBQTNCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLVixTQUFMLElBQWtCSyxTQUFTLEtBQUtMLFNBQXBDLEVBQ0E7QUFDSSxxQkFBS0wsTUFBTCxDQUFZZ0IsU0FBWixDQUFzQixLQUFLWCxTQUEzQjtBQUNBLHFCQUFLTCxNQUFMLENBQVlhLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsRUFBRUMsVUFBVSxLQUFLZCxNQUFqQixFQUF5QmUsTUFBTSxZQUEvQixFQUEzQjtBQUNIO0FBQ0o7QUEzREw7O0FBQUE7QUFBQSxFQUF5Q25CLE1BQXpDIiwiZmlsZSI6ImNsYW1wLXpvb20uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsYW1wWm9vbSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5taW5XaWR0aCA9IG9wdGlvbnMubWluV2lkdGhcclxuICAgICAgICB0aGlzLm1pbkhlaWdodCA9IG9wdGlvbnMubWluSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5tYXhXaWR0aCA9IG9wdGlvbnMubWF4V2lkdGhcclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IG9wdGlvbnMubWF4SGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMubWluV2lkdGggJiYgd2lkdGggPCB0aGlzLm1pbldpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0V2lkdGgodGhpcy5taW5XaWR0aClcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4V2lkdGggJiYgd2lkdGggPiB0aGlzLm1heFdpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0V2lkdGgodGhpcy5tYXhXaWR0aClcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWluSGVpZ2h0ICYmIGhlaWdodCA8IHRoaXMubWluSGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0SGVpZ2h0KHRoaXMubWluSGVpZ2h0KVxyXG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5IZWlnaHRcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnem9vbWVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC16b29tJyB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tYXhIZWlnaHQgJiYgaGVpZ2h0ID4gdGhpcy5tYXhIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRIZWlnaHQodGhpcy5tYXhIZWlnaHQpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19