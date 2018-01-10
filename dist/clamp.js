'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(clamp, _Plugin);

    /**
     * @param {object} options
     * @param {string} [options.direction=all] (all, x, or y)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    function clamp(parent, options) {
        _classCallCheck(this, clamp);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (clamp.__proto__ || Object.getPrototypeOf(clamp)).call(this, parent));

        switch (options.direction) {
            case 'x':
                _this.x = true;
                break;
            case 'y':
                _this.y = true;
                break;
            default:
                _this.x = _this.y = true;
                break;
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

            var oob = this.parent.OOB();
            var point = oob.cornerPoint;
            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.x) {
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
                    if (oob.left) {
                        this.parent.x = 0;
                        decelerate.x = 0;
                    } else if (oob.right) {
                        this.parent.x = -point.x;
                        decelerate.x = 0;
                    }
                }
            }
            if (this.y) {
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
                    if (oob.top) {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    } else if (oob.bottom) {
                        this.parent.y = -point.y;
                        decelerate.y = 0;
                    }
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJkaXJlY3Rpb24iLCJ4IiwieSIsInBhcnNlVW5kZXJmbG93IiwidW5kZXJmbG93IiwibW92ZSIsImNsYW1wIiwidG9Mb3dlckNhc2UiLCJ1bmRlcmZsb3dYIiwidW5kZXJmbG93WSIsImluZGV4T2YiLCJ1cGRhdGUiLCJwYXVzZWQiLCJvb2IiLCJPT0IiLCJwb2ludCIsImNvcm5lclBvaW50IiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJsZWZ0IiwicmlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsInNjcmVlbkhlaWdodCIsInRvcCIsImJvdHRvbSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7O0FBS0EsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosa0hBRVVELE1BRlY7O0FBR0ksZ0JBQVFDLFFBQVFDLFNBQWhCO0FBRUksaUJBQUssR0FBTDtBQUNJLHNCQUFLQyxDQUFMLEdBQVMsSUFBVDtBQUNBO0FBQ0osaUJBQUssR0FBTDtBQUNJLHNCQUFLQyxDQUFMLEdBQVMsSUFBVDtBQUNBO0FBQ0o7QUFDSSxzQkFBS0QsQ0FBTCxHQUFTLE1BQUtDLENBQUwsR0FBUyxJQUFsQjtBQUNBO0FBVlI7QUFZQSxjQUFLQyxjQUFMLENBQW9CSixRQUFRSyxTQUFSLElBQXFCLFFBQXpDO0FBQ0EsY0FBS0MsSUFBTDtBQWhCSjtBQWlCQzs7QUF6Qkw7QUFBQTtBQUFBLHVDQTJCbUJDLEtBM0JuQixFQTRCSTtBQUNJQSxvQkFBUUEsTUFBTUMsV0FBTixFQUFSO0FBQ0EsZ0JBQUlE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QWhCO0FBQ0FlLG1DQUFXZixDQUFYLEdBQWUsQ0FBZjtBQUNILHFCQUpELE1BS0ssSUFBSVcsSUFBSWEsTUFBUixFQUNMO0FBQ0ksNkJBQUs1QixNQUFMLENBQVlJLENBQVosR0FBZ0IsQ0FBQ2EsTUFBTWIsQ0FBdkI7QUFDQWUsbUNBQVdmLENBQVgsR0FBZSxDQUFmO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUFySEw7O0FBQUE7QUFBQSxFQUFxQ1IsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIGNsYW1wIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb249YWxsXSAoYWxsLCB4LCBvciB5KVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5kaXJlY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYXNlICd4JzpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IHRydWVcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgJ3knOlxyXG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCA9IHRoaXMueSA9IHRydWVcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICAgICAgdGhpcy5tb3ZlKClcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudXBkYXRlKClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy54KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChvb2IubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLXBvaW50LnhcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMueSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLnRvcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS55ID0gMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19