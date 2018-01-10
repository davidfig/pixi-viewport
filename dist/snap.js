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
            if (this.parent.countDownPointers() === 1) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJFYXNlIiwiZXhpc3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIngiLCJ5Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwidGltZSIsImVhc2UiLCJ0b3BMZWZ0IiwiaW50ZXJydXB0IiwicmVtb3ZlT25Db21wbGV0ZSIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJzbmFwcGluZyIsImNvdW50RG93blBvaW50ZXJzIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJwZXJjZW50Q2hhbmdlWCIsInBlcmNlbnRDaGFuZ2VZIiwiZWxhcHNlZCIsInBhdXNlZCIsInBlcmNlbnQiLCJ0byIsInN0YXJ0RWFzZSIsImVtaXQiLCJmaW5pc2hlZCIsInVwZGF0ZSIsIm1vdmVDb3JuZXIiLCJtb3ZlQ2VudGVyIiwicmVtb3ZlUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsa0JBQVlDLE1BQVosRUFBb0JDLENBQXBCLEVBQXVCQyxDQUF2QixFQUEwQkMsT0FBMUIsRUFDQTtBQUFBOztBQUFBLGdIQUNVSCxNQURWOztBQUVJRyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsR0FBcEM7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIsSUFBZ0IsSUFBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlILFFBQVFHLElBQVIsSUFBZ0IsZUFBNUI7QUFDQSxjQUFLTCxDQUFMLEdBQVNBLENBQVQ7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LEVBQ0E7QUFDSSx3QkFBSSxLQUFLcEIsZ0JBQVQsRUFDQTtBQUNJLDZCQUFLVCxNQUFMLENBQVlpQyxZQUFaLENBQXlCLE1BQXpCO0FBQ0g7QUFDRCx5QkFBS2pDLE1BQUwsQ0FBWTRCLElBQVosQ0FBaUIsVUFBakIsRUFBNkIsS0FBSzVCLE1BQWxDO0FBQ0EseUJBQUtpQixRQUFMLEdBQWdCLElBQWhCO0FBQ0g7QUFDSjtBQUNKO0FBMUdMOztBQUFBO0FBQUEsRUFBb0N2QixNQUFwQyIsImZpbGUiOiJzbmFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCBFYXNlID0gcmVxdWlyZSgncGl4aS1lYXNlJylcclxuY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU25hcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRvcExlZnRdIHNuYXAgdG8gdGhlIHRvcC1sZWZ0IG9mIHZpZXdwb3J0IGluc3RlYWQgb2YgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgc25hcC1zdGFydChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgYSBzbmFwIGFuaW1hdGlvbiBzdGFydHNcclxuICAgICAqIEBldmVudCBzbmFwLXJlc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGEgc25hcCByZXNldHMgYmVjYXVzZSBvZiBhIGNoYW5nZSBpbiB2aWV3cG9ydCBzaXplXHJcbiAgICAgKiBAZXZlbnQgc25hcC1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIHNuYXAgcmVhY2hlcyBpdHMgdGFyZ2V0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgeCwgeSwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjhcclxuICAgICAgICB0aGlzLnRpbWUgPSBvcHRpb25zLnRpbWUgfHwgMTAwMFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IG9wdGlvbnMuZWFzZSB8fCAnZWFzZUluT3V0U2luZSdcclxuICAgICAgICB0aGlzLnggPSB4XHJcbiAgICAgICAgdGhpcy55ID0geVxyXG4gICAgICAgIHRoaXMudG9wTGVmdCA9IG9wdGlvbnMudG9wTGVmdFxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gZXhpc3RzKG9wdGlvbnMuaW50ZXJydXB0KSA/IG9wdGlvbnMuaW50ZXJydXB0IDogdHJ1ZVxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25Db21wbGV0ZSA9IG9wdGlvbnMucmVtb3ZlT25Db21wbGV0ZVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0RWFzZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9wTGVmdCA/IHRoaXMucGFyZW50LmNvcm5lciA6IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgIHRoaXMuZGVsdGFYID0gdGhpcy54IC0gY3VycmVudC54XHJcbiAgICAgICAgdGhpcy5kZWx0YVkgPSB0aGlzLnkgLSBjdXJyZW50LnlcclxuICAgICAgICB0aGlzLnN0YXJ0WCA9IGN1cnJlbnQueFxyXG4gICAgICAgIHRoaXMuc3RhcnRZID0gY3VycmVudC55XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAxKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBpZiAoZGVjZWxlcmF0ZSAmJiAoZGVjZWxlcmF0ZS54IHx8IGRlY2VsZXJhdGUueSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVggPSBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQgJiYgdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSAhPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b3BMZWZ0ID8gdGhpcy5wYXJlbnQuY29ybmVyIDogdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnggIT09IHRoaXMueCB8fCBjdXJyZW50LnkgIT09IHRoaXMueSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wZXJjZW50ID0gMFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG5ldyBFYXNlLnRvKHRoaXMsIHsgcGVyY2VudDogMSB9LCB0aGlzLnRpbWUsIHsgZWFzZTogdGhpcy5lYXNlIH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RWFzZSgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZmluaXNoZWQgPSB0aGlzLnNuYXBwaW5nLnVwZGF0ZShlbGFwc2VkKVxyXG4gICAgICAgICAgICBjb25zdCB4ID0gdGhpcy5zdGFydFggKyB0aGlzLmRlbHRhWCAqIHRoaXMucGVyY2VudFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gdGhpcy5zdGFydFkgKyB0aGlzLmRlbHRhWSAqIHRoaXMucGVyY2VudFxyXG4gICAgICAgICAgICBpZiAodGhpcy50b3BMZWZ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ29ybmVyKHgsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHgsIHkpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmaW5pc2hlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC1lbmQnLCB0aGlzLnBhcmVudCApXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19