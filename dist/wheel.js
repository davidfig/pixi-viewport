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
            var sign = this.reverse ? -1 : 1;
            var step = sign * -e.deltaY * (e.deltaMode ? 120 : 1) / 500;
            var change = Math.pow(2, (1 + this.percent) * step);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsInNtb290aCIsImludGVycnVwdCIsInNtb290aGluZyIsInBvaW50Iiwic21vb3RoaW5nQ2VudGVyIiwiY2hhbmdlIiwib2xkUG9pbnQiLCJ0b0xvY2FsIiwic2NhbGUiLCJ4IiwieSIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJjbGFtcCIsInBsdWdpbnMiLCJtb3ZlQ2VudGVyIiwibmV3UG9pbnQiLCJ0b0dsb2JhbCIsInNtb290aGluZ0NvdW50IiwiZSIsInBhdXNlZCIsImdldFBvaW50ZXJQb3NpdGlvbiIsInNpZ24iLCJzdGVwIiwiZGVsdGFZIiwiZGVsdGFNb2RlIiwiTWF0aCIsInBvdyIsIm9yaWdpbmFsIiwid2hlZWwiLCJkeCIsImRlbHRhWCIsImR5IiwiZHoiLCJkZWx0YVoiLCJldmVudCIsInBhc3NpdmVXaGVlbCIsInByZXZlbnREZWZhdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7Ozs7O0FBWUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUNBLGNBQUtDLE1BQUwsR0FBY0osUUFBUUksTUFBdEI7QUFDQSxjQUFLQyxTQUFMLEdBQWlCLE9BQU9MLFFBQVFLLFNBQWYsS0FBNkIsV0FBN0IsR0FBMkMsSUFBM0Ms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QUFVUSxTQUFTUixDQUFwQztBQUNBLHlCQUFLZCxNQUFMLENBQVllLENBQVosSUFBaUJQLE1BQU1PLENBQU4sR0FBVU8sU0FBU1AsQ0FBcEM7QUFDSDtBQUNKO0FBQ0QsaUJBQUtmLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLakIsTUFBakIsRUFBeUJrQixNQUFNLE9BQS9CLEVBQTFCO0FBQ0EsaUJBQUtsQixNQUFMLENBQVlnQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVtQixPQUFPLEVBQUVDLElBQUlYLEVBQUVZLE1BQVIsRUFBZ0JDLElBQUliLEVBQUVLLE1BQXRCLEVBQThCUyxJQUFJZCxFQUFFZSxNQUFwQyxFQUFULEVBQXVEQyxPQUFPaEIsQ0FBOUQsRUFBaUVSLFVBQVUsS0FBS2pCLE1BQWhGLEVBQTFCO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLQSxNQUFMLENBQVkwQyxZQUFqQixFQUNBO0FBQ0lqQixrQkFBRWtCLGNBQUY7QUFDSDtBQUNKO0FBOUhMOztBQUFBO0FBQUEsRUFBcUMvQyxNQUFyQyIsImZpbGUiOiJ3aGVlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2hlZWwgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc21vb3RoXSBzbW9vdGggdGhlIHpvb21pbmcgYnkgcHJvdmlkaW5nIHRoZSBudW1iZXIgb2YgZnJhbWVzIHRvIHpvb20gYmV0d2VlbiB3aGVlbCBzcGluc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gc3RvcCBzbW9vdGhpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgd2hlZWwoe3doZWVsOiB7ZHgsIGR5LCBken0sIGV2ZW50LCB2aWV3cG9ydH0pXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSBvcHRpb25zLnBlcmNlbnQgfHwgMC4xXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZVxyXG4gICAgICAgIHRoaXMuc21vb3RoID0gb3B0aW9ucy5zbW9vdGhcclxuICAgICAgICB0aGlzLmludGVycnVwdCA9IHR5cGVvZiBvcHRpb25zLmludGVycnVwdCA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5pbnRlcnJ1cHRcclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNtb290aGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zbW9vdGhpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuc21vb3RoaW5nQ2VudGVyXHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuc21vb3RoaW5nXHJcbiAgICAgICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCArPSBjaGFuZ2UueFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICs9IGNoYW5nZS55XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnd2hlZWwnIH0pXHJcbiAgICAgICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmdDb3VudCsrXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNtb290aGluZ0NvdW50ID49IHRoaXMuc21vb3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNtb290aGluZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5wYXJlbnQuZ2V0UG9pbnRlclBvc2l0aW9uKGUpXHJcbiAgICAgICAgY29uc3Qgc2lnbiA9IHRoaXMucmV2ZXJzZSA/IC0xIDogMVxyXG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzaWduICogLWUuZGVsdGFZICogKGUuZGVsdGFNb2RlID8gMTIwIDogMSkgLyA1MDBcclxuICAgICAgICBjb25zdCBjaGFuZ2UgPSBNYXRoLnBvdygyLCAoMSArIHRoaXMucGVyY2VudCkgKiBzdGVwKVxyXG4gICAgICAgIGlmICh0aGlzLnNtb290aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5zbW9vdGhpbmcgPyB0aGlzLnNtb290aGluZy54ICogKHRoaXMuc21vb3RoIC0gdGhpcy5zbW9vdGhpbmdDb3VudCkgOiAwLFxyXG4gICAgICAgICAgICAgICAgeTogdGhpcy5zbW9vdGhpbmcgPyB0aGlzLnNtb290aGluZy55ICogKHRoaXMuc21vb3RoIC0gdGhpcy5zbW9vdGhpbmdDb3VudCkgOiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICB4OiAoKHRoaXMucGFyZW50LnNjYWxlLnggKyBvcmlnaW5hbC54KSAqIGNoYW5nZSAtIHRoaXMucGFyZW50LnNjYWxlLngpIC8gdGhpcy5zbW9vdGgsXHJcbiAgICAgICAgICAgICAgICB5OiAoKHRoaXMucGFyZW50LnNjYWxlLnkgKyBvcmlnaW5hbC55KSAqIGNoYW5nZSAtIHRoaXMucGFyZW50LnNjYWxlLnkpIC8gdGhpcy5zbW9vdGhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNtb290aGluZ0NvdW50ID0gMFxyXG4gICAgICAgICAgICB0aGlzLnNtb290aGluZ0NlbnRlciA9IHBvaW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCAqPSBjaGFuZ2VcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSBjaGFuZ2VcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnem9vbWVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICd3aGVlbCcgfSlcclxuICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLnBhcmVudC50b0dsb2JhbChvbGRQb2ludClcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnd2hlZWwnIH0pXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnd2hlZWwnLCB7IHdoZWVsOiB7IGR4OiBlLmRlbHRhWCwgZHk6IGUuZGVsdGFZLCBkejogZS5kZWx0YVogfSwgZXZlbnQ6IGUsIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudC5wYXNzaXZlV2hlZWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19