'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Wheel, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {number} [options.smooth] smooth the zooming by providing the number of frames to zoom between wheel spins
     * @param {boolean} [options.interrupt=true] stop smoothing with any user input on the viewport
     * @param {boolean} [options.reverse] reverse the direction of the scroll
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     *
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    function Wheel(parent, options) {
        _classCallCheck(this, Wheel);

        var _this = _possibleConstructorReturn(this, (Wheel.__proto__ || Object.getPrototypeOf(Wheel)).call(this, parent));

        options = options || {};
        _this.percent = options.percent || 0.1;
        _this.center = options.center;
        _this.reverse = options.reverse;
        _this.smooth = options.smooth;
        _this.interrupt = typeof options.interrupt === 'undefined' ? true : options.interrupt;
        return _this;
    }

    _createClass(Wheel, [{
        key: 'down',
        value: function down() {
            if (this.interrupt) {
                this.smoothing = null;
            }
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.smoothing) {
                var point = this.smoothingCenter;
                var change = this.smoothing;
                var oldPoint = void 0;
                if (!this.center) {
                    oldPoint = this.parent.toLocal(point);
                }
                this.parent.scale.x += change.x;
                this.parent.scale.y += change.y;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
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
                this.smoothingCount++;
                if (this.smoothingCount >= this.smooth) {
                    this.smoothing = null;
                }
            }
        }
    }, {
        key: 'wheel',
        value: function wheel(e) {
            if (this.paused) {
                return;
            }

            var point = this.parent.getPointerPosition(e);
            var sign = void 0;
            if (this.reverse) {
                sign = e.deltaY > 0 ? 1 : -1;
            } else {
                sign = e.deltaY < 0 ? 1 : -1;
            }
            var change = 1 + this.percent * sign;
            if (this.smooth) {
                var original = {
                    x: this.smoothing ? this.smoothing.x * (this.smooth - this.smoothingCount) : 0,
                    y: this.smoothing ? this.smoothing.y * (this.smooth - this.smoothingCount) : 0
                };
                this.smoothing = {
                    x: ((this.parent.scale.x + original.x) * change - this.parent.scale.x) / this.smooth,
                    y: ((this.parent.scale.y + original.y) * change - this.parent.scale.y) / this.smooth
                };
                this.smoothingCount = 0;
                this.smoothingCenter = point;
            } else {
                var oldPoint = void 0;
                if (!this.center) {
                    oldPoint = this.parent.toLocal(point);
                }
                this.parent.scale.x *= change;
                this.parent.scale.y *= change;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
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
            }
            this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
            this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
            if (!this.parent.passiveWheel) {
                e.preventDefault();
            }
        }
    }]);

    return Wheel;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsInNtb290aCIsImludGVycnVwdCIsInNtb290aGluZyIsInBvaW50Iiwic21vb3RoaW5nQ2VudGVyIiwiY2hhbmdlIiwib2xkUG9pbnQiLCJ0b0xvY2FsIiwic2NhbGUiLCJ4IiwieSIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJjbGFtcCIsInBsdWdpbnMiLCJtb3ZlQ2VudGVyIiwibmV3UG9pbnQiLCJ0b0dsb2JhbCIsInNtb290aGluZ0NvdW50IiwiZSIsInBhdXNlZCIsImdldFBvaW50ZXJQb3NpdGlvbiIsInNpZ24iLCJkZWx0YVkiLCJvcmlnaW5hbCIsIndoZWVsIiwiZHgiLCJkZWx0YVgiLCJkeSIsImR6IiwiZGVsdGFaIiwiZXZlbnQiLCJwYXNzaXZlV2hlZWwiLCJwcmV2ZW50RGVmYXVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztBQVlBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE9BQUwsR0FBZUgsUUFBUUcsT0FBdkI7QUFDQSxjQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQixPQUFPTCxRQUFRSyxTQUFmLEtBQTZCLFdBQTdCLEdBQTJDLElBQTNDLEdBQWtETCxRQUFRSyxTQUEzRTtBQVBKO0FBUUM7O0FB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QVllLENBQVosSUFBaUJQLE1BQU1PLENBQU4sR0FBVU8sU0FBU1AsQ0FBcEM7QUFDSDtBQUNKO0FBQ0QsaUJBQUtmLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLakIsTUFBakIsRUFBeUJrQixNQUFNLE9BQS9CLEVBQTFCO0FBQ0EsaUJBQUtsQixNQUFMLENBQVlnQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVlLE9BQU8sRUFBRUMsSUFBSVAsRUFBRVEsTUFBUixFQUFnQkMsSUFBSVQsRUFBRUksTUFBdEIsRUFBOEJNLElBQUlWLEVBQUVXLE1BQXBDLEVBQVQsRUFBdURDLE9BQU9aLENBQTlELEVBQWlFUixVQUFVLEtBQUtqQixNQUFoRixFQUExQjtBQUNBLGdCQUFJLENBQUMsS0FBS0EsTUFBTCxDQUFZc0MsWUFBakIsRUFDQTtBQUNJYixrQkFBRWMsY0FBRjtBQUNIO0FBQ0o7QUFySUw7O0FBQUE7QUFBQSxFQUFxQzNDLE1BQXJDIiwiZmlsZSI6IndoZWVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXaGVlbCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zbW9vdGhdIHNtb290aCB0aGUgem9vbWluZyBieSBwcm92aWRpbmcgdGhlIG51bWJlciBvZiBmcmFtZXMgdG8gem9vbSBiZXR3ZWVuIHdoZWVsIHNwaW5zXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBzdG9wIHNtb290aGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICpcclxuICAgICAqIEBldmVudCB3aGVlbCh7d2hlZWw6IHtkeCwgZHksIGR6fSwgZXZlbnQsIHZpZXdwb3J0fSlcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAwLjFcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlXHJcbiAgICAgICAgdGhpcy5zbW9vdGggPSBvcHRpb25zLnNtb290aFxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gdHlwZW9mIG9wdGlvbnMuaW50ZXJydXB0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBvcHRpb25zLmludGVycnVwdFxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNtb290aGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5zbW9vdGhpbmdDZW50ZXJcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5zbW9vdGhpbmdcclxuICAgICAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICs9IGNoYW5nZS54XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKz0gY2hhbmdlLnlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnem9vbWVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICd3aGVlbCcgfSlcclxuICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLnBhcmVudC50b0dsb2JhbChvbGRQb2ludClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNtb290aGluZ0NvdW50KytcclxuICAgICAgICAgICAgaWYgKHRoaXMuc21vb3RoaW5nQ291bnQgPj0gdGhpcy5zbW9vdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLnBhcmVudC5nZXRQb2ludGVyUG9zaXRpb24oZSlcclxuICAgICAgICBsZXQgc2lnblxyXG4gICAgICAgIGlmICh0aGlzLnJldmVyc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzaWduID0gZS5kZWx0YVkgPiAwID8gMSA6IC0xXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNpZ24gPSBlLmRlbHRhWSA8IDAgPyAxIDogLTFcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2hhbmdlID0gMSArIHRoaXMucGVyY2VudCAqIHNpZ25cclxuICAgICAgICBpZiAodGhpcy5zbW9vdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHtcclxuICAgICAgICAgICAgICAgIHg6IHRoaXMuc21vb3RoaW5nID8gdGhpcy5zbW9vdGhpbmcueCAqICh0aGlzLnNtb290aCAtIHRoaXMuc21vb3RoaW5nQ291bnQpIDogMCxcclxuICAgICAgICAgICAgICAgIHk6IHRoaXMuc21vb3RoaW5nID8gdGhpcy5zbW9vdGhpbmcueSAqICh0aGlzLnNtb290aCAtIHRoaXMuc21vb3RoaW5nQ291bnQpIDogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nID0ge1xyXG4gICAgICAgICAgICAgICAgeDogKCh0aGlzLnBhcmVudC5zY2FsZS54ICsgb3JpZ2luYWwueCkgKiBjaGFuZ2UgLSB0aGlzLnBhcmVudC5zY2FsZS54KSAvIHRoaXMuc21vb3RoLFxyXG4gICAgICAgICAgICAgICAgeTogKCh0aGlzLnBhcmVudC5zY2FsZS55ICsgb3JpZ2luYWwueSkgKiBjaGFuZ2UgLSB0aGlzLnBhcmVudC5zY2FsZS55KSAvIHRoaXMuc21vb3RoXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmdDb3VudCA9IDBcclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmdDZW50ZXIgPSBwb2ludFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKj0gY2hhbmdlXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKj0gY2hhbmdlXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnd2hlZWwnIH0pXHJcbiAgICAgICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3doZWVsJyB9KVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsJywgeyB3aGVlbDogeyBkeDogZS5kZWx0YVgsIGR5OiBlLmRlbHRhWSwgZHo6IGUuZGVsdGFaIH0sIGV2ZW50OiBlLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQucGFzc2l2ZVdoZWVsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19