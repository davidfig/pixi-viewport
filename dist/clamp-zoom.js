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
        _this.clamp();
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
                this.parent.fitWidth(this.minWidth, false, false, true);
                this.parent.scale.y *= this.parent.scale.x / original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxWidth && width > this.maxWidth) {
                var _original = this.parent.scale.x;
                this.parent.fitWidth(this.maxWidth, false, false, true);
                this.parent.scale.y *= this.parent.scale.x / _original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.minHeight && height < this.minHeight) {
                var _original2 = this.parent.scale.y;
                this.parent.fitHeight(this.minHeight, false, false, true);
                this.parent.scale.x *= this.parent.scale.y / _original2;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.maxHeight && height > this.maxHeight) {
                var _original3 = this.parent.scale.y;
                this.parent.fitHeight(this.maxHeight, false, false, true);
                this.parent.scale.x *= this.parent.scale.y / _original3;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
    }]);

    return ClampZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC16b29tLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJjbGFtcCIsInBhdXNlZCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0Iiwib3JpZ2luYWwiLCJzY2FsZSIsIngiLCJmaXRXaWR0aCIsInkiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwiZml0SGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSx1QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDBIQUNVRCxNQURWOztBQUVJLGNBQUtFLFFBQUwsR0FBZ0JELFFBQVFDLFFBQXhCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQkYsUUFBUUUsU0FBekI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCSCxRQUFRRyxRQUF4QjtBQUNBLGNBQUtDLFNBQUwsR0FBaUJKLFFBQVFJLFNBQXpCO0FBQ0EsY0FBS0MsS0FBTDtBQU5KO0FBT0M7O0FBbEJMO0FBQUE7QUFBQSxpQ0FxQkk7QUFDSSxpQkFBS0EsS0FBTDtBQUNIO0FBdkJMO0FBQUE7QUFBQSxnQ0EwQkk7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJQyxRQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXhCO0FBQ0EsZ0JBQUlDLFNBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBekI7QUFDQSxnQkFBSSxLQUFLVCxRQUFMLElBQWlCTSxRQUFRLEtBQUtOLFFBQWxDLEVBQ0E7QUFDSSxvQkFBTVUsV0FBVyxLQUFLWixNQUFMLENBQVlhLEtBQVosQ0FBa0JDLENBQW5DO0FBQ0EscUJBQUtkLE1BQUwsQ0FBWWUsUUFBWixDQUFxQixLQUFLYixRQUExQixFQUFvQyxLQUFwQyxFQUEyQyxLQUEzQyxFQUFrRCxJQUFsRDtBQUNBLHFCQUFLRixNQUFMLENBQVlhLEtBQVosQ0FBa0JHLENBQWxCLElBQXVCLEtBQUtoQixNQUFMLENBQVlhLEtBQVosQ0FBa0JDLENBQWxCLEdBQXNCRixRQUE3QztBQUNBSix3QkFBUSxLQUFLUixNQUFMLENBQVlTLGdCQUFwQjtBQUNBQyx5QkFBUyxLQUFLVixNQUFMLENBQVlXLGlCQUFyQjtBQUNBLHFCQUFLWCxNQUFMLENBQVlpQixJQUFaLENBQWlCLFFBQWpCLEVBQTJCLEVBQUVDLFVBQVUsS0FBS2xCLE1BQWpCLEVBQXlCbUIsTUFBTSxZQUEvQixFQUEzQjtBQUNIO0FBQ0QsZ0JBQUksS0FBS2YsUUFBTCxJQUFpQkksUUFBUSxLQUFLSixRQUFsQyxFQUNBO0FBQ0ksb0JBQU1RLFlBQVcsS0FBS1osTUFBTCxDQUFZYSxLQUFaLENBQWtCQyxDQUFuQztBQUNBLHFCQUFLZCxNQUFMLENBQVllLFFBQVosQ0FBcUIsS0FBS1gsUUFBMUIsRUFBb0MsS0FBcEMsRUFBMkMsS0FBM0MsRUFBa0QsSUFBbEQ7QUFDQSxxQkFBS0osTUFBTCxDQUFZYSxLQUFaLENBQWtCRyxDQUFsQixJQUF1QixLQUFLaEIsTUFBTCxDQUFZYSxLQUFaLENBQWtCQyxDQUFsQixHQUFzQkYsU0FBN0M7QUFDQUosd0JBQVEsS0FBS1IsTUFBTCxDQUFZUyxnQkFBcEI7QUFDQUMseUJBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBckI7QUFDQSxxQkFBS1gsTUFBTCxDQUFZaUIsSUFBWixDQUFpQixRQUFqQixFQUEyQixFQUFFQyxVQUFVLEtBQUtsQixNQUFqQixFQUF5Qm1CLE1BQU0sWUFBL0IsRUFBM0I7QUFDSDtBQUNELGdCQUFJLEtBQUtoQixTQUFMLElBQWtCTyxTQUFTLEtBQUtQLFNBQXBDLEVBQ0E7QUFDSSxvQkFBTVMsYUFBVyxLQUFLWixNQUFMLENBQVlhLEtBQVosQ0FBa0JHLENBQW5DO0FBQ0EscUJBQUtoQixNQUFMLENBQVlvQixTQUFaLENBQXNCLEtBQUtqQixTQUEzQixFQUFzQyxLQUF0QyxFQUE2QyxLQUE3QyxFQUFvRCxJQUFwRDtBQUNBLHFCQUFLSCxNQUFMLENBQVlhLEtBQVosQ0FBa0JDLENBQWxCLElBQXVCLEtBQUtkLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkcsQ0FBbEIsR0FBc0JKLFVBQTdDO0FBQ0FKLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0EscUJBQUtYLE1BQUwsQ0FBWWlCLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsRUFBRUMsVUFBVSxLQUFLbEIsTUFBakIsRUFBeUJtQixNQUFNLFlBQS9CLEVBQTNCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLZCxTQUFMLElBQWtCSyxTQUFTLEtBQUtMLFNBQXBDLEVBQ0E7QUFDSSxvQkFBTU8sYUFBVyxLQUFLWixNQUFMLENBQVlhLEtBQVosQ0FBa0JHLENBQW5DO0FBQ0EscUJBQUtoQixNQUFMLENBQVlvQixTQUFaLENBQXNCLEtBQUtmLFNBQTNCLEVBQXNDLEtBQXRDLEVBQTZDLEtBQTdDLEVBQW9ELElBQXBEO0FBQ0EscUJBQUtMLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkMsQ0FBbEIsSUFBdUIsS0FBS2QsTUFBTCxDQUFZYSxLQUFaLENBQWtCRyxDQUFsQixHQUFzQkosVUFBN0M7QUFDQSxxQkFBS1osTUFBTCxDQUFZaUIsSUFBWixDQUFpQixRQUFqQixFQUEyQixFQUFFQyxVQUFVLEtBQUtsQixNQUFqQixFQUF5Qm1CLE1BQU0sWUFBL0IsRUFBM0I7QUFDSDtBQUNKO0FBcEVMOztBQUFBO0FBQUEsRUFBeUN2QixNQUF6QyIsImZpbGUiOiJjbGFtcC16b29tLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDbGFtcFpvb20gZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1pbldpZHRoXSBtaW5pbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluSGVpZ2h0XSBtaW5pbXVtIGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdpZHRoXSBtYXhpbXVtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4SGVpZ2h0XSBtYXhpbXVtIGhlaWdodFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHRoaXMubWluV2lkdGggPSBvcHRpb25zLm1pbldpZHRoXHJcbiAgICAgICAgdGhpcy5taW5IZWlnaHQgPSBvcHRpb25zLm1pbkhlaWdodFxyXG4gICAgICAgIHRoaXMubWF4V2lkdGggPSBvcHRpb25zLm1heFdpZHRoXHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSBvcHRpb25zLm1heEhlaWdodFxyXG4gICAgICAgIHRoaXMuY2xhbXAoKVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jbGFtcCgpXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLm1pbldpZHRoICYmIHdpZHRoIDwgdGhpcy5taW5XaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5wYXJlbnQuc2NhbGUueFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRXaWR0aCh0aGlzLm1pbldpZHRoLCBmYWxzZSwgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKj0gdGhpcy5wYXJlbnQuc2NhbGUueCAvIG9yaWdpbmFsXHJcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd6b29tZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXpvb20nIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1heFdpZHRoICYmIHdpZHRoID4gdGhpcy5tYXhXaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5wYXJlbnQuc2NhbGUueFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRXaWR0aCh0aGlzLm1heFdpZHRoLCBmYWxzZSwgZmFsc2UsIHRydWUpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKj0gdGhpcy5wYXJlbnQuc2NhbGUueCAvIG9yaWdpbmFsXHJcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd6b29tZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXpvb20nIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1pbkhlaWdodCAmJiBoZWlnaHQgPCB0aGlzLm1pbkhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRIZWlnaHQodGhpcy5taW5IZWlnaHQsIGZhbHNlLCBmYWxzZSwgdHJ1ZSlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCAqPSB0aGlzLnBhcmVudC5zY2FsZS55IC8gb3JpZ2luYWxcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAtem9vbScgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWF4SGVpZ2h0ICYmIGhlaWdodCA+IHRoaXMubWF4SGVpZ2h0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB0aGlzLnBhcmVudC5zY2FsZS55XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdEhlaWdodCh0aGlzLm1heEhlaWdodCwgZmFsc2UsIGZhbHNlLCB0cnVlKVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICo9IHRoaXMucGFyZW50LnNjYWxlLnkgLyBvcmlnaW5hbFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd6b29tZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXpvb20nIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==