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
                this.parent.emit('moved', { viewport: this.parent, type: 'snap' });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJ1dGlscyIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ4IiwieSIsIm9wdGlvbnMiLCJmcmljdGlvbiIsInRpbWUiLCJlYXNlIiwidG9wTGVmdCIsImludGVycnVwdCIsImRlZmF1bHRzIiwicmVtb3ZlT25Db21wbGV0ZSIsInJlbW92ZU9uSW50ZXJydXB0IiwiZm9yY2VTdGFydCIsInN0YXJ0RWFzZSIsInBlcmNlbnQiLCJzbmFwcGluZyIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJlbWl0IiwicmVtb3ZlUGx1Z2luIiwiY291bnREb3duUG9pbnRlcnMiLCJkZWNlbGVyYXRlIiwicGx1Z2lucyIsInBlcmNlbnRDaGFuZ2VYIiwicGVyY2VudENoYW5nZVkiLCJlbGFwc2VkIiwicGF1c2VkIiwic25hcFN0YXJ0IiwiZmluaXNoZWQiLCJtb3ZlQ29ybmVyIiwibW92ZUNlbnRlciIsInZpZXdwb3J0IiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsa0JBQVlDLE1BQVosRUFBb0JDLENBQXBCLEVBQXVCQyxDQUF2QixFQUEwQkMsT0FBMUIsRUFDQTtBQUFBOztBQUFBLGdIQUNVSCxNQURWOztBQUVJRyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsR0FBcEM7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIsSUFBZ0IsSUFBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlULE1BQU1TLElBQU4sQ0FBV0gsUUFBUUcsSUFB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Li9wbHVnaW4nKVxyXG5jb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU25hcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50b3BMZWZ0XSBzbmFwIHRvIHRoZSB0b3AtbGVmdCBvZiB2aWV3cG9ydCBpbnN0ZWFkIG9mIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHNuYXAtc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGEgc25hcCBhbmltYXRpb24gc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgc25hcC1yZXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIHNuYXAgcmVzZXRzIGJlY2F1c2Ugb2YgYSBjaGFuZ2UgaW4gdmlld3BvcnQgc2l6ZVxyXG4gICAgICogQGV2ZW50IHNuYXAtZW5kKFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBzbmFwIHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICogQGV2ZW50IHNuYXAtcmVtb3ZlKFZpZXdwb3J0KSBlbWl0dGVkIGlmIHNuYXAgcGx1Z2luIGlzIHJlbW92ZWRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOFxyXG4gICAgICAgIHRoaXMudGltZSA9IG9wdGlvbnMudGltZSB8fCAxMDAwXHJcbiAgICAgICAgdGhpcy5lYXNlID0gdXRpbHMuZWFzZShvcHRpb25zLmVhc2UsICdlYXNlSW5PdXRTaW5lJylcclxuICAgICAgICB0aGlzLnggPSB4XHJcbiAgICAgICAgdGhpcy55ID0geVxyXG4gICAgICAgIHRoaXMudG9wTGVmdCA9IG9wdGlvbnMudG9wTGVmdFxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5pbnRlcnJ1cHQsIHRydWUpXHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkNvbXBsZXRlID0gb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkludGVycnVwdCA9IG9wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRcclxuICAgICAgICBpZiAob3B0aW9ucy5mb3JjZVN0YXJ0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEVhc2UoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzbmFwU3RhcnQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IDBcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0geyB0aW1lOiAwIH1cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b3BMZWZ0ID8gdGhpcy5wYXJlbnQuY29ybmVyIDogdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgdGhpcy5kZWx0YVggPSB0aGlzLnggLSBjdXJyZW50LnhcclxuICAgICAgICB0aGlzLmRlbHRhWSA9IHRoaXMueSAtIGN1cnJlbnQueVxyXG4gICAgICAgIHRoaXMuc3RhcnRYID0gY3VycmVudC54XHJcbiAgICAgICAgdGhpcy5zdGFydFkgPSBjdXJyZW50LnlcclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZU9uSW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICAgICAgaWYgKGRlY2VsZXJhdGUgJiYgKGRlY2VsZXJhdGUueCB8fCBkZWNlbGVyYXRlLnkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID0gZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJydXB0ICYmIHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgIT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9wTGVmdCA/IHRoaXMucGFyZW50LmNvcm5lciA6IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgICAgICBpZiAoY3VycmVudC54ICE9PSB0aGlzLnggfHwgY3VycmVudC55ICE9PSB0aGlzLnkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcFN0YXJ0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwcGluZyA9IHRoaXMuc25hcHBpbmdcclxuICAgICAgICAgICAgc25hcHBpbmcudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIGxldCBmaW5pc2hlZCwgeCwgeVxyXG4gICAgICAgICAgICBpZiAoc25hcHBpbmcudGltZSA+IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5zdGFydFggKyB0aGlzLmRlbHRhWFxyXG4gICAgICAgICAgICAgICAgeSA9IHRoaXMuc3RhcnRZICsgdGhpcy5kZWx0YVlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBlcmNlbnQgPSB0aGlzLmVhc2Uoc25hcHBpbmcudGltZSwgMCwgMSwgdGhpcy50aW1lKVxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMuc3RhcnRYICsgdGhpcy5kZWx0YVggKiBwZXJjZW50XHJcbiAgICAgICAgICAgICAgICB5ID0gdGhpcy5zdGFydFkgKyB0aGlzLmRlbHRhWSAqIHBlcmNlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy50b3BMZWZ0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ29ybmVyKHgsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHgsIHkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3NuYXAnIH0pXHJcbiAgICAgICAgICAgIGlmIChmaW5pc2hlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=