'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(ClampZoom, _Plugin);

    /**
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC16b29tLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJjbGFtcCIsInBhdXNlZCIsIndpZHRoIiwid29ybGRTY3JlZW5XaWR0aCIsImhlaWdodCIsIndvcmxkU2NyZWVuSGVpZ2h0IiwiZml0V2lkdGgiLCJmaXRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7O0FBT0EsdUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSwwSEFDVUQsTUFEVjs7QUFFSSxjQUFLRSxRQUFMLEdBQWdCRCxRQUFRQyxRQUF4QjtBQUNBLGNBQUtDLFNBQUwsR0FBaUJGLFFBQVFFLFNBQXpCO0FBQ0EsY0FBS0MsUUFBTCxHQUFnQkgsUUFBUUcsUUFBeEI7QUFDQSxjQUFLQyxTQUFMLEdBQWlCSixRQUFRSSxTQUF6QjtBQUxKO0FBTUM7O0FBaEJMO0FBQUE7QUFBQSxpQ0FtQkk7QUFDSSxpQkFBS0MsS0FBTDtBQUNIO0FBckJMO0FBQUE7QUFBQSxnQ0F3Qkk7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJQyxRQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXhCO0FBQ0EsZ0JBQUlDLFNBQVMsS0FBS1YsTUFBTCxDQUFZVyxpQkFBekI7QUFDQSxnQkFBSSxLQUFLVCxRQUFMLElBQWlCTSxRQUFRLEtBQUtOLFFBQWxDLEVBQ0E7QUFDSSxxQkFBS0YsTUFBTCxDQUFZWSxRQUFaLENBQXFCLEtBQUtWLFFBQTFCO0FBQ0FNLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLUCxRQUFMLElBQWlCSSxRQUFRLEtBQUtKLFFBQWxDLEVBQ0E7QUFDSSxxQkFBS0osTUFBTCxDQUFZWSxRQUFaLENBQXFCLEtBQUtSLFFBQTFCO0FBQ0FJLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLUixTQUFMLElBQWtCTyxTQUFTLEtBQUtQLFNBQXBDLEVBQ0E7QUFDSSxxQkFBS0gsTUFBTCxDQUFZYSxTQUFaLENBQXNCLEtBQUtWLFNBQTNCO0FBQ0FLLHdCQUFRLEtBQUtSLE1BQUwsQ0FBWVMsZ0JBQXBCO0FBQ0FDLHlCQUFTLEtBQUtWLE1BQUwsQ0FBWVcsaUJBQXJCO0FBQ0g7QUFDRCxnQkFBSSxLQUFLTixTQUFMLElBQWtCSyxTQUFTLEtBQUtMLFNBQXBDLEVBQ0E7QUFDSSxxQkFBS0wsTUFBTCxDQUFZYSxTQUFaLENBQXNCLEtBQUtSLFNBQTNCO0FBQ0g7QUFDSjtBQXRETDs7QUFBQTtBQUFBLEVBQXlDVCxNQUF6QyIsImZpbGUiOiJjbGFtcC16b29tLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDbGFtcFpvb20gZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWluV2lkdGhdIG1pbmltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5taW5IZWlnaHRdIG1pbmltdW0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2lkdGhdIG1heGltdW0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhIZWlnaHRdIG1heGltdW0gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgdGhpcy5taW5XaWR0aCA9IG9wdGlvbnMubWluV2lkdGhcclxuICAgICAgICB0aGlzLm1pbkhlaWdodCA9IG9wdGlvbnMubWluSGVpZ2h0XHJcbiAgICAgICAgdGhpcy5tYXhXaWR0aCA9IG9wdGlvbnMubWF4V2lkdGhcclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IG9wdGlvbnMubWF4SGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNsYW1wKClcclxuICAgIH1cclxuXHJcbiAgICBjbGFtcCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMubWluV2lkdGggJiYgd2lkdGggPCB0aGlzLm1pbldpZHRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZml0V2lkdGgodGhpcy5taW5XaWR0aClcclxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMucGFyZW50LndvcmxkU2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1heFdpZHRoICYmIHdpZHRoID4gdGhpcy5tYXhXaWR0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmZpdFdpZHRoKHRoaXMubWF4V2lkdGgpXHJcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDwgdGhpcy5taW5IZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRIZWlnaHQodGhpcy5taW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5wYXJlbnQud29ybGRTY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLnBhcmVudC53b3JsZFNjcmVlbkhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tYXhIZWlnaHQgJiYgaGVpZ2h0ID4gdGhpcy5tYXhIZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5maXRIZWlnaHQodGhpcy5tYXhIZWlnaHQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==