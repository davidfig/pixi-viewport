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

            var pointers = this.parent.trackedPointers;
            if (Object.keys(pointers).length >= 2) {
                var first = pointers[0];
                var second = pointers[1];
                var last = void 0;
                if (first.last && second.last) {
                    last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2));
                }
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
                if (this.parent.countDownPointers() <= 2) {
                    this.active = false;
                    this.lastCenter = null;
                    this.pinching = false;
                    this.parent.emit('pinch-end', this.parent);
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJ0cmFja2VkUG9pbnRlcnMiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJsYXN0Q2VudGVyIiwicGluY2hpbmciLCJlbWl0IiwiZGlydHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7OztBQVFBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE1BQUwsR0FBY0gsUUFBUUcsTUFBdEI7QUFMSjtBQU1DOztBQWpCTDtBQUFBO0FBQUEsK0JBb0JJO0FBQ0ksZ0JBQUksS0FBS0osTUFBTCxDQUFZSyxpQkFBWixNQUFtQyxDQUF2QyxFQUNBO0FBQ0kscUJBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0g7QUFDSjtBQXpCTDtBQUFBO0FBQUEsNkJB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Q0EseUJBQUtDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSx5QkFBS3RDLE1BQUwsQ0FBWXVDLElBQVosQ0FBaUIsV0FBakIsRUFBOEIsS0FBS3ZDLE1BQW5DO0FBQ0g7QUFDSjtBQUNKO0FBbEhMOztBQUFBO0FBQUEsRUFBcUNKLE1BQXJDIiwiZmlsZSI6InBpbmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQaW5jaCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDEuMFxyXG4gICAgICAgIHRoaXMubm9EcmFnID0gb3B0aW9ucy5ub0RyYWdcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPj0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkIHx8ICF0aGlzLmFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnBhcmVudC50cmFja2VkUG9pbnRlcnNcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMocG9pbnRlcnMpLmxlbmd0aCA+PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3QgPSBwb2ludGVyc1swXVxyXG4gICAgICAgICAgICBjb25zdCBzZWNvbmQgPSBwb2ludGVyc1sxXVxyXG4gICAgICAgICAgICBsZXQgbGFzdFxyXG4gICAgICAgICAgICBpZiAoZmlyc3QubGFzdCAmJiBzZWNvbmQubGFzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFzdCA9IE1hdGguc3FydChNYXRoLnBvdyhzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54LCAyKSArIE1hdGgucG93KHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnksIDIpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmaXJzdC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0Lmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZC5sYXN0ID0geyB4LCB5IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGFzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludCA9IHsgeDogZmlyc3QubGFzdC54ICsgKHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngpIC8gMiwgeTogZmlyc3QubGFzdC55ICsgKHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnkpIC8gMiB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3QgPSBNYXRoLnNxcnQoTWF0aC5wb3coc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCwgMikgKyBNYXRoLnBvdyhzZWNvbmQubGFzdC55IC0gZmlyc3QubGFzdC55LCAyKSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9ICgoZGlzdCAtIGxhc3QpIC8gdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpICogdGhpcy5wYXJlbnQuc2NhbGUueCAqIHRoaXMucGVyY2VudFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCArPSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKz0gY2hhbmdlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubm9EcmFnICYmIHRoaXMubGFzdENlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSB0aGlzLmxhc3RDZW50ZXIueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIHRoaXMubGFzdENlbnRlci55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDZW50ZXIgPSBwb2ludFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPD0gMilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdwaW5jaC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==