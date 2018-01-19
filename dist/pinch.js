'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Pinch, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.noDrag] disable two-finger dragging
     * @param {number} [options.percent=1.0] percent to modify pinch speed
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
     */
    function Pinch(parent, options) {
        _classCallCheck(this, Pinch);

        var _this = _possibleConstructorReturn(this, (Pinch.__proto__ || Object.getPrototypeOf(Pinch)).call(this, parent));

        options = options || {};
        _this.percent = options.percent || 1.0;
        _this.noDrag = options.noDrag;
        _this.center = options.center;
        return _this;
    }

    _createClass(Pinch, [{
        key: 'down',
        value: function down() {
            if (this.parent.countDownPointers() >= 2) {
                this.active = true;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused || !this.active) {
                return;
            }

            var x = e.data.global.x;
            var y = e.data.global.y;

            var pointers = this.parent.getTouchPointers();
            if (pointers.length >= 2) {
                var first = pointers[0];
                var second = pointers[1];
                var last = first.last && second.last ? Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2)) : null;
                if (first.pointerId === e.data.pointerId) {
                    first.last = { x: x, y: y };
                } else if (second.pointerId === e.data.pointerId) {
                    second.last = { x: x, y: y };
                }
                if (last) {
                    var oldPoint = void 0;
                    var point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 };
                    if (!this.center) {
                        oldPoint = this.parent.toLocal(point);
                    }
                    var dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2));
                    var change = (dist - last) / this.parent.screenWidth * this.parent.scale.x * this.percent;
                    this.parent.scale.x += change;
                    this.parent.scale.y += change;
                    var clamp = this.parent.plugins['clamp-zoom'];
                    if (clamp) {
                        clamp.clamp();
                    }
                    if (this.center) {
                        this.parent.moveCenter(this.center);
                    } else {
                        var newPoint = this.parent.toGlobal(oldPoint);
                        this.parent.x += point.x - newPoint.x;
                        this.parent.y += point.y - newPoint.y;
                    }
                    if (!this.noDrag && this.lastCenter) {
                        this.parent.x += point.x - this.lastCenter.x;
                        this.parent.y += point.y - this.lastCenter.y;
                    }
                    this.lastCenter = point;
                    this.moved = true;
                } else {
                    if (!this.pinching) {
                        this.parent.emit('pinch-start', this.parent);
                        this.pinching = true;
                    }
                }
                this.parent.dirty = true;
            }
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.pinching) {
                if (this.parent.touches.length <= 1) {
                    this.active = false;
                    this.lastCenter = null;
                    this.pinching = false;
                    this.moved = false;
                    this.parent.emit('pinch-end', this.parent);
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJsYXN0Q2VudGVyIiwibW92ZWQiLCJwaW5jaGluZyIsImVtaXQiLCJkaXJ0eSIsInRvdWNoZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7OztBQVFBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE1BQUwsR0FBY0gsUUFBUUcsTUFBdEI7QUFMSjtBQU1DOztBQWpCTDtBQUFBO0FBQUEsK0JBb0JJO0FBQ0ksZ0JBQUksS0FBS0osTUFBTCxDQUFZSyxpQkFBWixNQUFtQyxDQUF2QyxFQUNBO0FBQ0kscUJBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0g7QUFDSjtBQXpCTDtBQUFBO0FBQUEs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QUFDQSx5QkFBS0UsUUFBTCxHQUFnQixLQUFoQjtBQUNBLHlCQUFLRCxLQUFMLEdBQWEsS0FBYjtBQUNBLHlCQUFLcEMsTUFBTCxDQUFZc0MsSUFBWixDQUFpQixXQUFqQixFQUE4QixLQUFLdEMsTUFBbkM7QUFDSDtBQUNKO0FBQ0o7QUEvR0w7O0FBQUE7QUFBQSxFQUFxQ0osTUFBckMiLCJmaWxlIjoicGluY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBpbmNoIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RyYWddIGRpc2FibGUgdHdvLWZpbmdlciBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MS4wXSBwZXJjZW50IHRvIG1vZGlmeSBwaW5jaCBzcGVlZFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHR3byBmaW5nZXJzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSBvcHRpb25zLnBlcmNlbnQgfHwgMS4wXHJcbiAgICAgICAgdGhpcy5ub0RyYWcgPSBvcHRpb25zLm5vRHJhZ1xyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA+PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQgfHwgIXRoaXMuYWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgY29uc3QgeSA9IGUuZGF0YS5nbG9iYWwueVxyXG5cclxuICAgICAgICBjb25zdCBwb2ludGVycyA9IHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKVxyXG4gICAgICAgIGlmIChwb2ludGVycy5sZW5ndGggPj0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0ID0gcG9pbnRlcnNbMF1cclxuICAgICAgICAgICAgY29uc3Qgc2Vjb25kID0gcG9pbnRlcnNbMV1cclxuICAgICAgICAgICAgY29uc3QgbGFzdCA9IChmaXJzdC5sYXN0ICYmIHNlY29uZC5sYXN0KSA/IE1hdGguc3FydChNYXRoLnBvdyhzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54LCAyKSArIE1hdGgucG93KHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnksIDIpKSA6IG51bGxcclxuICAgICAgICAgICAgaWYgKGZpcnN0LnBvaW50ZXJJZCA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZmlyc3QubGFzdCA9IHsgeCwgeSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc2Vjb25kLnBvaW50ZXJJZCA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kLmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50ID0geyB4OiBmaXJzdC5sYXN0LnggKyAoc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCkgLyAyLCB5OiBmaXJzdC5sYXN0LnkgKyAoc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSkgLyAyIH1cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdCA9IE1hdGguc3FydChNYXRoLnBvdyhzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54LCAyKSArIE1hdGgucG93KHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnksIDIpKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gKChkaXN0IC0gbGFzdCkgLyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICogdGhpcy5wZXJjZW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSArPSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLnBhcmVudC50b0dsb2JhbChvbGRQb2ludClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm5vRHJhZyAmJiB0aGlzLmxhc3RDZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gdGhpcy5sYXN0Q2VudGVyLnhcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSB0aGlzLmxhc3RDZW50ZXIueVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gcG9pbnRcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGluY2hpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgncGluY2gtc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGluY2hpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQudG91Y2hlcy5sZW5ndGggPD0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19