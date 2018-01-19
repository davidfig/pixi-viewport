'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var Ease = require('pixi-ease');
var exists = require('exists');

module.exports = function (_Plugin) {
    _inherits(Snap, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {boolean} [options.topLeft] snap to the top-left of viewport instead of center
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     *
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     */
    function Snap(parent, x, y, options) {
        _classCallCheck(this, Snap);

        var _this = _possibleConstructorReturn(this, (Snap.__proto__ || Object.getPrototypeOf(Snap)).call(this, parent));

        options = options || {};
        _this.friction = options.friction || 0.8;
        _this.time = options.time || 1000;
        _this.ease = options.ease || 'easeInOutSine';
        _this.x = x;
        _this.y = y;
        _this.topLeft = options.topLeft;
        _this.interrupt = exists(options.interrupt) ? options.interrupt : true;
        _this.removeOnComplete = options.removeOnComplete;
        return _this;
    }

    _createClass(Snap, [{
        key: 'startEase',
        value: function startEase() {
            var current = this.topLeft ? this.parent.corner : this.parent.center;
            this.deltaX = this.x - current.x;
            this.deltaY = this.y - current.y;
            this.startX = current.x;
            this.startY = current.y;
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.interrupt) {
                this.snapping = null;
            }
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.parent.countDownPointers() === 0) {
                var decelerate = this.parent.plugins['decelerate'];
                if (decelerate && (decelerate.x || decelerate.y)) {
                    decelerate.percentChangeX = decelerate.percentChangeY = this.friction;
                }
            }
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }
            if (this.interrupt && this.parent.countDownPointers() !== 0) {
                return;
            }
            if (!this.snapping) {
                var current = this.topLeft ? this.parent.corner : this.parent.center;
                if (current.x !== this.x || current.y !== this.y) {
                    this.percent = 0;
                    this.snapping = new Ease.to(this, { percent: 1 }, this.time, { ease: this.ease });
                    this.startEase();
                    this.parent.emit('snap-start', this.parent);
                }
            } else {
                var finished = this.snapping.update(elapsed);
                var x = this.startX + this.deltaX * this.percent;
                var y = this.startY + this.deltaY * this.percent;
                if (this.topLeft) {
                    this.parent.moveCorner(x, y);
                } else {
                    this.parent.moveCenter(x, y);
                }

                if (finished) {
                    if (this.removeOnComplete) {
                        this.parent.removePlugin('snap');
                    }
                    this.parent.emit('snap-end', this.parent);
                    this.snapping = null;
                }
            }
        }
    }]);

    return Snap;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJFYXNlIiwiZXhpc3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIngiLCJ5Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwidGltZSIsImVhc2UiLCJ0b3BMZWZ0IiwiaW50ZXJydXB0IiwicmVtb3ZlT25Db21wbGV0ZSIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJzbmFwcGluZyIsImNvdW50RG93blBvaW50ZXJzIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJwZXJjZW50Q2hhbmdlWCIsInBlcmNlbnRDaGFuZ2VZIiwiZWxhcHNlZCIsInBhdXNlZCIsInBlcmNlbnQiLCJ0byIsInN0YXJ0RWFzZSIsImVtaXQiLCJmaW5pc2hlZCIsInVwZGF0ZSIsIm1vdmVDb3JuZXIiLCJtb3ZlQ2VudGVyIiwicmVtb3ZlUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLGtCQUFZQyxNQUFaLEVBQW9CQyxDQUFwQixFQUF1QkMsQ0FBdkIsRUFBMEJDLE9BQTFCLEVBQ0E7QUFBQTs7QUFBQSxnSEFDVUgsTUFEVjs7QUFFSUcsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCRCxRQUFRQyxRQUFSLElBQW9CLEdBQXBDO0FBQ0EsY0FBS0MsSUFBTCxHQUFZRixRQUFRRSxJQUFSLElBQWdCLElBQTVCO0FBQ0EsY0FBS0MsSUFBTCxHQUFZSCxRQUFRRyxJQUFSLElBQWdCLGVBQTVCO0FBQ0EsY0FBS0wsQ0FBTCxHQUFTQSxDQUFU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SixFQUNBO0FBQ0ksd0JBQUksS0FBS3BCLGdCQUFULEVBQ0E7QUFDSSw2QkFBS1QsTUFBTCxDQUFZaUMsWUFBWixDQUF5QixNQUF6QjtBQUNIO0FBQ0QseUJBQUtqQyxNQUFMLENBQVk0QixJQUFaLENBQWlCLFVBQWpCLEVBQTZCLEtBQUs1QixNQUFsQztBQUNBLHlCQUFLaUIsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0o7QUFDSjtBQTNHTDs7QUFBQTtBQUFBLEVBQW9DdkIsTUFBcEMiLCJmaWxlIjoic25hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgRWFzZSA9IHJlcXVpcmUoJ3BpeGktZWFzZScpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNuYXAgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICpcclxuICAgICAqIEBldmVudCBzbmFwLXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIHNuYXAgYW5pbWF0aW9uIHN0YXJ0c1xyXG4gICAgICogQGV2ZW50IHNuYXAtcmVzdGFydChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgYSBzbmFwIHJlc2V0cyBiZWNhdXNlIG9mIGEgY2hhbmdlIGluIHZpZXdwb3J0IHNpemVcclxuICAgICAqIEBldmVudCBzbmFwLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgc25hcCByZWFjaGVzIGl0cyB0YXJnZXRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOFxyXG4gICAgICAgIHRoaXMudGltZSA9IG9wdGlvbnMudGltZSB8fCAxMDAwXHJcbiAgICAgICAgdGhpcy5lYXNlID0gb3B0aW9ucy5lYXNlIHx8ICdlYXNlSW5PdXRTaW5lJ1xyXG4gICAgICAgIHRoaXMueCA9IHhcclxuICAgICAgICB0aGlzLnkgPSB5XHJcbiAgICAgICAgdGhpcy50b3BMZWZ0ID0gb3B0aW9ucy50b3BMZWZ0XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQgPSBleGlzdHMob3B0aW9ucy5pbnRlcnJ1cHQpID8gb3B0aW9ucy5pbnRlcnJ1cHQgOiB0cnVlXHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkNvbXBsZXRlID0gb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRFYXNlKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b3BMZWZ0ID8gdGhpcy5wYXJlbnQuY29ybmVyIDogdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgdGhpcy5kZWx0YVggPSB0aGlzLnggLSBjdXJyZW50LnhcclxuICAgICAgICB0aGlzLmRlbHRhWSA9IHRoaXMueSAtIGN1cnJlbnQueVxyXG4gICAgICAgIHRoaXMuc3RhcnRYID0gY3VycmVudC54XHJcbiAgICAgICAgdGhpcy5zdGFydFkgPSBjdXJyZW50LnlcclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGlmIChkZWNlbGVyYXRlICYmIChkZWNlbGVyYXRlLnggfHwgZGVjZWxlcmF0ZS55KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9IGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmludGVycnVwdCAmJiB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5zbmFwcGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLnRvcExlZnQgPyB0aGlzLnBhcmVudC5jb3JuZXIgOiB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQueCAhPT0gdGhpcy54IHx8IGN1cnJlbnQueSAhPT0gdGhpcy55KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnQgPSAwXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbmV3IEVhc2UudG8odGhpcywgeyBwZXJjZW50OiAxIH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRFYXNlKClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZCA9IHRoaXMuc25hcHBpbmcudXBkYXRlKGVsYXBzZWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aGlzLnN0YXJ0WCArIHRoaXMuZGVsdGFYICogdGhpcy5wZXJjZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSB0aGlzLnN0YXJ0WSArIHRoaXMuZGVsdGFZICogdGhpcy5wZXJjZW50XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvcExlZnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDb3JuZXIoeCwgeSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIoeCwgeSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkNvbXBsZXRlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLWVuZCcsIHRoaXMucGFyZW50IClcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=