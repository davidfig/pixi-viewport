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
                this.parent.emit('moved', this.parent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJ1dGlscyIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ4IiwieSIsIm9wdGlvbnMiLCJmcmljdGlvbiIsInRpbWUiLCJlYXNlIiwidG9wTGVmdCIsImludGVycnVwdCIsImRlZmF1bHRzIiwicmVtb3ZlT25Db21wbGV0ZSIsInJlbW92ZU9uSW50ZXJydXB0IiwiZm9yY2VTdGFydCIsInN0YXJ0RWFzZSIsInBlcmNlbnQiLCJzbmFwcGluZyIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJlbWl0IiwicmVtb3ZlUGx1Z2luIiwiY291bnREb3duUG9pbnRlcnMiLCJkZWNlbGVyYXRlIiwicGx1Z2lucyIsInBlcmNlbnRDaGFuZ2VYIiwicGVyY2VudENoYW5nZVkiLCJlbGFwc2VkIiwicGF1c2VkIiwic25hcFN0YXJ0IiwiZmluaXNoZWQiLCJtb3ZlQ29ybmVyIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsa0JBQVlDLE1BQVosRUFBb0JDLENBQXBCLEVBQXVCQyxDQUF2QixFQUEwQkMsT0FBMUIsRUFDQTtBQUFBOztBQUFBLGdIQUNVSCxNQURWOztBQUVJRyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLFFBQUwsR0FBZ0JELFFBQVFDLFFBQVIsSUFBb0IsR0FBcEM7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIsSUFBZ0IsSUFBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlULE1BQU1TLElBQU4sQ0FBV0gsUUFBUUcsSUFBbkIsRUFBeUIsZUFBekIsQ0FB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SUFBekIsRUFDQTtBQUNJNEIsK0JBQVcsSUFBWDtBQUNBaEMsd0JBQUksS0FBS29CLE1BQUwsR0FBYyxLQUFLRixNQUF2QjtBQUNBakIsd0JBQUksS0FBS29CLE1BQUwsR0FBYyxLQUFLRixNQUF2QjtBQUNILGlCQUxELE1BT0E7QUFDSSx3QkFBTU4sVUFBVSxLQUFLUixJQUFMLENBQVVTLFNBQVNWLElBQW5CLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLEtBQUtBLElBQXBDLENBQWhCO0FBQ0FKLHdCQUFJLEtBQUtvQixNQUFMLEdBQWMsS0FBS0YsTUFBTCxHQUFjTCxPQUFoQztBQUNBWix3QkFBSSxLQUFLb0IsTUFBTCxHQUFjLEtBQUtGLE1BQUwsR0FBY04sT0FBaEM7QUFDSDtBQUNELG9CQUFJLEtBQUtQLE9BQVQsRUFDQTtBQUNJLHlCQUFLUCxNQUFMLENBQVlrQyxVQUFaLENBQXVCakMsQ0FBdkIsRUFBMEJDLENBQTFCO0FBQ0gsaUJBSEQsTUFLQTtBQUNJLHlCQUFLRixNQUFMLENBQVltQyxVQUFaLENBQXVCbEMsQ0FBdkIsRUFBMEJDLENBQTFCO0FBQ0g7QUFDRCxxQkFBS0YsTUFBTCxDQUFZdUIsSUFBWixDQUFpQixPQUFqQixFQUEwQixLQUFLdkIsTUFBL0I7QUFDQSxvQkFBSWlDLFFBQUosRUFDQTtBQUNJLHdCQUFJLEtBQUt2QixnQkFBVCxFQUNBO0FBQ0ksNkJBQUtWLE1BQUwsQ0FBWXdCLFlBQVosQ0FBeUIsTUFBekI7QUFDSDtBQUNELHlCQUFLeEIsTUFBTCxDQUFZdUIsSUFBWixDQUFpQixVQUFqQixFQUE2QixLQUFLdkIsTUFBbEM7QUFDQSx5QkFBS2UsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0o7QUFDSjtBQTNJTDs7QUFBQTtBQUFBLEVBQW9DcEIsTUFBcEMiLCJmaWxlIjoic25hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNuYXAgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudG9wTGVmdF0gc25hcCB0byB0aGUgdG9wLWxlZnQgb2Ygdmlld3BvcnQgaW5zdGVhZCBvZiBjZW50ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjhdIGZyaWN0aW9uL2ZyYW1lIHRvIGFwcGx5IGlmIGRlY2VsZXJhdGUgaXMgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvblxyXG4gICAgICpcclxuICAgICAqIEBldmVudCBzbmFwLXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIHNuYXAgYW5pbWF0aW9uIHN0YXJ0c1xyXG4gICAgICogQGV2ZW50IHNuYXAtcmVzdGFydChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgYSBzbmFwIHJlc2V0cyBiZWNhdXNlIG9mIGEgY2hhbmdlIGluIHZpZXdwb3J0IHNpemVcclxuICAgICAqIEBldmVudCBzbmFwLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgc25hcCByZWFjaGVzIGl0cyB0YXJnZXRcclxuICAgICAqIEBldmVudCBzbmFwLXJlbW92ZShWaWV3cG9ydCkgZW1pdHRlZCBpZiBzbmFwIHBsdWdpbiBpcyByZW1vdmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgeCwgeSwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjhcclxuICAgICAgICB0aGlzLnRpbWUgPSBvcHRpb25zLnRpbWUgfHwgMTAwMFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IHV0aWxzLmVhc2Uob3B0aW9ucy5lYXNlLCAnZWFzZUluT3V0U2luZScpXHJcbiAgICAgICAgdGhpcy54ID0geFxyXG4gICAgICAgIHRoaXMueSA9IHlcclxuICAgICAgICB0aGlzLnRvcExlZnQgPSBvcHRpb25zLnRvcExlZnRcclxuICAgICAgICB0aGlzLmludGVycnVwdCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaW50ZXJydXB0LCB0cnVlKVxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25Db21wbGV0ZSA9IG9wdGlvbnMucmVtb3ZlT25Db21wbGV0ZVxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQgPSBvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZm9yY2VTdGFydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRFYXNlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc25hcFN0YXJ0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAwXHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IHsgdGltZTogMCB9XHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9wTGVmdCA/IHRoaXMucGFyZW50LmNvcm5lciA6IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgIHRoaXMuZGVsdGFYID0gdGhpcy54IC0gY3VycmVudC54XHJcbiAgICAgICAgdGhpcy5kZWx0YVkgPSB0aGlzLnkgLSBjdXJyZW50LnlcclxuICAgICAgICB0aGlzLnN0YXJ0WCA9IGN1cnJlbnQueFxyXG4gICAgICAgIHRoaXMuc3RhcnRZID0gY3VycmVudC55XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcCcpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZU9uSW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwJylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgICAgIGlmIChkZWNlbGVyYXRlICYmIChkZWNlbGVyYXRlLnggfHwgZGVjZWxlcmF0ZS55KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9IGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmludGVycnVwdCAmJiB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5zbmFwcGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLnRvcExlZnQgPyB0aGlzLnBhcmVudC5jb3JuZXIgOiB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQueCAhPT0gdGhpcy54IHx8IGN1cnJlbnQueSAhPT0gdGhpcy55KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBTdGFydCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc25hcHBpbmcgPSB0aGlzLnNuYXBwaW5nXHJcbiAgICAgICAgICAgIHNuYXBwaW5nLnRpbWUgKz0gZWxhcHNlZFxyXG4gICAgICAgICAgICBsZXQgZmluaXNoZWQsIHgsIHlcclxuICAgICAgICAgICAgaWYgKHNuYXBwaW5nLnRpbWUgPiB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMuc3RhcnRYICsgdGhpcy5kZWx0YVhcclxuICAgICAgICAgICAgICAgIHkgPSB0aGlzLnN0YXJ0WSArIHRoaXMuZGVsdGFZXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50ID0gdGhpcy5lYXNlKHNuYXBwaW5nLnRpbWUsIDAsIDEsIHRoaXMudGltZSlcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLnN0YXJ0WCArIHRoaXMuZGVsdGFYICogcGVyY2VudFxyXG4gICAgICAgICAgICAgICAgeSA9IHRoaXMuc3RhcnRZICsgdGhpcy5kZWx0YVkgKiBwZXJjZW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMudG9wTGVmdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNvcm5lcih4LCB5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih4LCB5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIGlmIChmaW5pc2hlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=