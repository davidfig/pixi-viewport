'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var utils = require('./utils');

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
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
     *
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     * @event snap-remove(Viewport) emitted if snap plugin is removed
     */
    function Snap(parent, x, y, options) {
        _classCallCheck(this, Snap);

        var _this = _possibleConstructorReturn(this, (Snap.__proto__ || Object.getPrototypeOf(Snap)).call(this, parent));

        options = options || {};
        _this.friction = options.friction || 0.8;
        _this.time = options.time || 1000;
        _this.ease = utils.ease(options.ease, 'easeInOutSine');
        _this.x = x;
        _this.y = y;
        _this.topLeft = options.topLeft;
        _this.interrupt = utils.defaults(options.interrupt, true);
        _this.removeOnComplete = options.removeOnComplete;
        _this.removeOnInterrupt = options.removeOnInterrupt;
        if (options.forceStart) {
            _this.startEase();
        }
        return _this;
    }

    _createClass(Snap, [{
        key: 'snapStart',
        value: function snapStart() {
            this.percent = 0;
            this.snapping = { time: 0 };
            var current = this.topLeft ? this.parent.corner : this.parent.center;
            this.deltaX = this.x - current.x;
            this.deltaY = this.y - current.y;
            this.startX = current.x;
            this.startY = current.y;
            this.parent.emit('snap-start', this.parent);
        }
    }, {
        key: 'wheel',
        value: function wheel() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap');
            }
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap');
            } else if (this.interrupt) {
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
                    this.snapStart();
                }
            } else {
                var snapping = this.snapping;
                snapping.time += elapsed;
                var finished = void 0,
                    x = void 0,
                    y = void 0;
                if (snapping.time > this.time) {
                    finished = true;
                    x = this.startX + this.deltaX;
                    y = this.startY + this.deltaY;
                } else {
                    var percent = this.ease(snapping.time, 0, 1, this.time);
                    x = this.startX + this.deltaX * percent;
                    y = this.startY + this.deltaY * percent;
                }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJ1dGlscyIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ4IiwieSIsIm9wdGlvbnMiLCJmcmljdGlvbiIsInRpbWUiLCJlYXNlIiwidG9wTGVmdCIsImludGVycnVwdCIsImRlZmF1bHRzIiwicmVtb3ZlT25Db21wbGV0ZSIsInJlbW92ZU9uSW50ZXJydXB0IiwiZm9yY2VTdGFydCIsInN0YXJ0RWFzZSIsInBlcmNlbnQiLCJzbmFwcGluZyIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJlbWl0IiwicmVtb3ZlUGx1Z2luIiwiY291bnREb3duUG9pbnRlcnMiLCJkZWNlbGVyYXRlIiwicGx1Z2lucyIsInBlcmNlbnRDaGFuZ2VYIiwicGVyY2VudENoYW5nZVkiLCJlbGFwc2VkIiwicGF1c2VkIiwic25hcFN0YXJ0IiwiZmluaXNoZWQiLCJtb3ZlQ29ybmVyIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsa0JBQVlDLE1BQVosRUFBb0JDLENBQXBCLEVBQXVCQyxDQUF2QixFQUEwQkMsT0FBMUIsRUFDQTtBQUFBOztBQUFBLGdIQUNVSCxNQURWOztBQUVJRyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsR0FBcEM7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIsSUFBZ0IsSUFBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlULE1BQU1TLElBQU4sQ0FBV0gsUUFBUUcsSUFBbkIsRUFBeUIsZUFBekIsQ0FB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SUFBekIsRUFDQTtBQUNJNEIsK0JBQVcsSUFBWDtBQUNBaEMsd0JBQUksS0FBS29CLE1BQUwsR0FBYyxLQUFLRixNQUF2QjtBQUNBakIsd0JBQUksS0FBS29CLE1BQUwsR0FBYyxLQUFLRixNQUF2QjtBQUNILGlCQUxELE1BT0E7QUFDSSx3QkFBTU4sVUFBVSxLQUFLUixJQUFMLENBQVVTLFNBQVNWLElBQW5CLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLEtBQUtBLElBQXBDLENBQWhCO0FBQ0FKLHdCQUFJLEtBQUtvQixNQUFMLEdBQWMsS0FBS0YsTUFBTCxHQUFjTCxPQUFoQztBQUNBWix3QkFBSSxLQUFLb0IsTUFBTCxHQUFjLEtBQUtGLE1BQUwsR0FBY04sT0FBaEM7QUFDSDtBQUNELG9CQUFJLEtBQUtQLE9BQVQsRUFDQTtBQUNJLHlCQUFLUCxNQUFMLENBQVlrQyxVQUFaLENBQXVCakMsQ0FBdkIsRUFBMEJDLENBQTFCO0FBQ0gsaUJBSEQsTUFLQTtBQUNJLHlCQUFLRixNQUFMLENBQVltQyxVQUFaLENBQXVCbEMsQ0FBdkIsRUFBMEJDLENBQTFCO0FBQ0g7O0FBRUQsb0JBQUkrQixRQUFKLEVBQ0E7QUFDSSx3QkFBSSxLQUFLdkIsZ0JBQVQsRUFDQTtBQUNJLDZCQUFLVixNQUFMLENBQVl3QixZQUFaLENBQXlCLE1BQXpCO0FBQ0g7QUFDRCx5QkFBS3hCLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUIsVUFBakIsRUFBNkIsS0FBS3ZCLE1BQWxDO0FBQ0EseUJBQUtlLFFBQUwsR0FBZ0IsSUFBaEI7QUFDSDtBQUNKO0FBQ0o7QUEzSUw7O0FBQUE7QUFBQSxFQUFvQ3BCLE1BQXBDIiwiZmlsZSI6InNuYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTbmFwIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRvcExlZnRdIHNuYXAgdG8gdGhlIHRvcC1sZWZ0IG9mIHZpZXdwb3J0IGluc3RlYWQgb2YgY2VudGVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC44XSBmcmljdGlvbi9mcmFtZSB0byBhcHBseSBpZiBkZWNlbGVyYXRlIGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTAwMF1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHBhdXNlIHNuYXBwaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgc25hcHBpbmcgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRdIHJlbW92ZXMgdGhpcyBwbHVnaW4gaWYgaW50ZXJydXB0ZWQgYnkgYW55IHVzZXIgaW5wdXRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZm9yY2VTdGFydF0gc3RhcnRzIHRoZSBzbmFwIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdmlld3BvcnQgaXMgYXQgdGhlIGRlc2lyZWQgbG9jYXRpb25cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgc25hcC1zdGFydChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgYSBzbmFwIGFuaW1hdGlvbiBzdGFydHNcclxuICAgICAqIEBldmVudCBzbmFwLXJlc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGEgc25hcCByZXNldHMgYmVjYXVzZSBvZiBhIGNoYW5nZSBpbiB2aWV3cG9ydCBzaXplXHJcbiAgICAgKiBAZXZlbnQgc25hcC1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIHNuYXAgcmVhY2hlcyBpdHMgdGFyZ2V0XHJcbiAgICAgKiBAZXZlbnQgc25hcC1yZW1vdmUoVmlld3BvcnQpIGVtaXR0ZWQgaWYgc25hcCBwbHVnaW4gaXMgcmVtb3ZlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHgsIHksIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC44XHJcbiAgICAgICAgdGhpcy50aW1lID0gb3B0aW9ucy50aW1lIHx8IDEwMDBcclxuICAgICAgICB0aGlzLmVhc2UgPSB1dGlscy5lYXNlKG9wdGlvbnMuZWFzZSwgJ2Vhc2VJbk91dFNpbmUnKVxyXG4gICAgICAgIHRoaXMueCA9IHhcclxuICAgICAgICB0aGlzLnkgPSB5XHJcbiAgICAgICAgdGhpcy50b3BMZWZ0ID0gb3B0aW9ucy50b3BMZWZ0XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLmludGVycnVwdCwgdHJ1ZSlcclxuICAgICAgICB0aGlzLnJlbW92ZU9uQ29tcGxldGUgPSBvcHRpb25zLnJlbW92ZU9uQ29tcGxldGVcclxuICAgICAgICB0aGlzLnJlbW92ZU9uSW50ZXJydXB0ID0gb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdFxyXG4gICAgICAgIGlmIChvcHRpb25zLmZvcmNlU3RhcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0RWFzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNuYXBTdGFydCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMFxyXG4gICAgICAgIHRoaXMuc25hcHBpbmcgPSB7IHRpbWU6IDAgfVxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLnRvcExlZnQgPyB0aGlzLnBhcmVudC5jb3JuZXIgOiB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICB0aGlzLmRlbHRhWCA9IHRoaXMueCAtIGN1cnJlbnQueFxyXG4gICAgICAgIHRoaXMuZGVsdGFZID0gdGhpcy55IC0gY3VycmVudC55XHJcbiAgICAgICAgdGhpcy5zdGFydFggPSBjdXJyZW50LnhcclxuICAgICAgICB0aGlzLnN0YXJ0WSA9IGN1cnJlbnQueVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuaW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgICAgICBpZiAoZGVjZWxlcmF0ZSAmJiAoZGVjZWxlcmF0ZS54IHx8IGRlY2VsZXJhdGUueSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVggPSBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQgJiYgdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSAhPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b3BMZWZ0ID8gdGhpcy5wYXJlbnQuY29ybmVyIDogdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50LnggIT09IHRoaXMueCB8fCBjdXJyZW50LnkgIT09IHRoaXMueSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFwU3RhcnQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNuYXBwaW5nID0gdGhpcy5zbmFwcGluZ1xyXG4gICAgICAgICAgICBzbmFwcGluZy50aW1lICs9IGVsYXBzZWRcclxuICAgICAgICAgICAgbGV0IGZpbmlzaGVkLCB4LCB5XHJcbiAgICAgICAgICAgIGlmIChzbmFwcGluZy50aW1lID4gdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLnN0YXJ0WCArIHRoaXMuZGVsdGFYXHJcbiAgICAgICAgICAgICAgICB5ID0gdGhpcy5zdGFydFkgKyB0aGlzLmRlbHRhWVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IHRoaXMuZWFzZShzbmFwcGluZy50aW1lLCAwLCAxLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5zdGFydFggKyB0aGlzLmRlbHRhWCAqIHBlcmNlbnRcclxuICAgICAgICAgICAgICAgIHkgPSB0aGlzLnN0YXJ0WSArIHRoaXMuZGVsdGFZICogcGVyY2VudFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvcExlZnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDb3JuZXIoeCwgeSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIoeCwgeSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkNvbXBsZXRlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLWVuZCcsIHRoaXMucGFyZW50IClcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=