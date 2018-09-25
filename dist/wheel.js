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
                    this.smoothing = null;
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
                    this.smoothing = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsInNtb290aCIsImludGVycnVwdCIsInNtb290aGluZyIsInBvaW50Iiwic21vb3RoaW5nQ2VudGVyIiwiY2hhbmdlIiwib2xkUG9pbnQiLCJ0b0xvY2FsIiwic2NhbGUiLCJ4IiwieSIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJjbGFtcCIsInBsdWdpbnMiLCJtb3ZlQ2VudGVyIiwibmV3UG9pbnQiLCJ0b0dsb2JhbCIsInNtb290aGluZ0NvdW50IiwiZSIsInBhdXNlZCIsImdldFBvaW50ZXJQb3NpdGlvbiIsInNpZ24iLCJkZWx0YVkiLCJvcmlnaW5hbCIsIndoZWVsIiwiZHgiLCJkZWx0YVgiLCJkeSIsImR6IiwiZGVsdGFaIiwiZXZlbnQiLCJwYXNzaXZlV2hlZWwiLCJwcmV2ZW50RGVmYXVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7OztBQVlBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE9BQUwsR0FBZUgsUUFBUUcsT0FBdkI7QUFDQSxjQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsY0FBS0MsU0FBTCxHQUFpQixPQUFPTCxRQUFRSyxTQUFmLEtBQTZCLFdBQTdCLEdBQTJDLElBQTNDLEdBQWtETCxRQUFRSyxTQUEzRTtBQVBKO0FBUUM7O0FB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LElBQWlCTixNQUFNTSxDQUFOLEdBQVVRLFNBQVNSLENBQXBDO0FBQ0EseUJBQUtkLE1BQUwsQ0FBWWUsQ0FBWixJQUFpQlAsTUFBTU8sQ0FBTixHQUFVTyxTQUFTUCxDQUFwQztBQUNIO0FBQ0o7QUFDRCxpQkFBS2YsTUFBTCxDQUFZZ0IsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUtqQixNQUFqQixFQUF5QmtCLE1BQU0sT0FBL0IsRUFBMUI7QUFDQSxpQkFBS2xCLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRWUsT0FBTyxFQUFFQyxJQUFJUCxFQUFFUSxNQUFSLEVBQWdCQyxJQUFJVCxFQUFFSSxNQUF0QixFQUE4Qk0sSUFBSVYsRUFBRVcsTUFBcEMsRUFBVCxFQUF1REMsT0FBT1osQ0FBOUQsRUFBaUVSLFVBQVUsS0FBS2pCLE1BQWhGLEVBQTFCO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLQSxNQUFMLENBQVlzQyxZQUFqQixFQUNBO0FBQ0liLGtCQUFFYyxjQUFGO0FBQ0g7QUFDSjtBQXZJTDs7QUFBQTtBQUFBLEVBQXFDM0MsTUFBckMiLCJmaWxlIjoid2hlZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdoZWVsIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNtb290aF0gc21vb3RoIHRoZSB6b29taW5nIGJ5IHByb3ZpZGluZyB0aGUgbnVtYmVyIG9mIGZyYW1lcyB0byB6b29tIGJldHdlZW4gd2hlZWwgc3BpbnNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW50ZXJydXB0PXRydWVdIHN0b3Agc21vb3RoaW5nIHdpdGggYW55IHVzZXIgaW5wdXQgb24gdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHdoZWVsKHt3aGVlbDoge2R4LCBkeSwgZHp9LCBldmVudCwgdmlld3BvcnR9KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDAuMVxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2VcclxuICAgICAgICB0aGlzLnNtb290aCA9IG9wdGlvbnMuc21vb3RoXHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQgPSB0eXBlb2Ygb3B0aW9ucy5pbnRlcnJ1cHQgPT09ICd1bmRlZmluZWQnID8gdHJ1ZSA6IG9wdGlvbnMuaW50ZXJydXB0XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc21vb3RoaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnNtb290aGluZ0NlbnRlclxyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSB0aGlzLnNtb290aGluZ1xyXG4gICAgICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKz0gY2hhbmdlLnhcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSArPSBjaGFuZ2UueVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd6b29tZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3doZWVsJyB9KVxyXG4gICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zbW9vdGhpbmdDb3VudCsrXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNtb290aGluZ0NvdW50ID49IHRoaXMuc21vb3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNtb290aGluZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5wYXJlbnQuZ2V0UG9pbnRlclBvc2l0aW9uKGUpXHJcbiAgICAgICAgbGV0IHNpZ25cclxuICAgICAgICBpZiAodGhpcy5yZXZlcnNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2lnbiA9IGUuZGVsdGFZID4gMCA/IDEgOiAtMVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzaWduID0gZS5kZWx0YVkgPCAwID8gMSA6IC0xXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNoYW5nZSA9IDEgKyB0aGlzLnBlcmNlbnQgKiBzaWduXHJcbiAgICAgICAgaWYgKHRoaXMuc21vb3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLnNtb290aGluZyA/IHRoaXMuc21vb3RoaW5nLnggKiAodGhpcy5zbW9vdGggLSB0aGlzLnNtb290aGluZ0NvdW50KSA6IDAsXHJcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnNtb290aGluZyA/IHRoaXMuc21vb3RoaW5nLnkgKiAodGhpcy5zbW9vdGggLSB0aGlzLnNtb290aGluZ0NvdW50KSA6IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNtb290aGluZyA9IHtcclxuICAgICAgICAgICAgICAgIHg6ICgodGhpcy5wYXJlbnQuc2NhbGUueCArIG9yaWdpbmFsLngpICogY2hhbmdlIC0gdGhpcy5wYXJlbnQuc2NhbGUueCkgLyB0aGlzLnNtb290aCxcclxuICAgICAgICAgICAgICAgIHk6ICgodGhpcy5wYXJlbnQuc2NhbGUueSArIG9yaWdpbmFsLnkpICogY2hhbmdlIC0gdGhpcy5wYXJlbnQuc2NhbGUueSkgLyB0aGlzLnNtb290aFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nQ291bnQgPSAwXHJcbiAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nQ2VudGVyID0gcG9pbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICo9IGNoYW5nZVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICo9IGNoYW5nZVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd6b29tZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3doZWVsJyB9KVxyXG4gICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIHRoaXMuc21vb3RoaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3doZWVsJyB9KVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsJywgeyB3aGVlbDogeyBkeDogZS5kZWx0YVgsIGR5OiBlLmRlbHRhWSwgZHo6IGUuZGVsdGFaIH0sIGV2ZW50OiBlLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQucGFzc2l2ZVdoZWVsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19