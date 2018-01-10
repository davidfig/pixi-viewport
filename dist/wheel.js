'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Wheel, _Plugin);

    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
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
        return _this;
    }

    _createClass(Wheel, [{
        key: 'wheel',
        value: function wheel(e) {
            if (this.paused) {
                return;
            }

            var change = void 0;
            if (this.reverse) {
                change = e.deltaY > 0 ? 1 + this.percent : 1 - this.percent;
            } else {
                change = e.deltaY > 0 ? 1 - this.percent : 1 + this.percent;
            }
            var point = { x: e.clientX, y: e.clientY };
            var oldPoint = void 0;
            if (!this.center) {
                oldPoint = this.parent.toLocal(point);
            }
            this.parent.scale.x *= change;
            this.parent.scale.y *= change;
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
            e.preventDefault();
            this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
        }
    }]);

    return Wheel;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImUiLCJwYXVzZWQiLCJjaGFuZ2UiLCJkZWx0YVkiLCJwb2ludCIsIngiLCJjbGllbnRYIiwieSIsImNsaWVudFkiLCJvbGRQb2ludCIsInRvTG9jYWwiLCJzY2FsZSIsImNsYW1wIiwicGx1Z2lucyIsIm1vdmVDZW50ZXIiLCJuZXdQb2ludCIsInRvR2xvYmFsIiwicHJldmVudERlZmF1bHQiLCJlbWl0Iiwid2hlZWwiLCJkeCIsImRlbHRhWCIsImR5IiwiZHoiLCJkZWx0YVoiLCJldmVudCIsInZpZXdwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7O0FBU0EsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUxKO0FBTUM7O0FBbEJMO0FBQUE7QUFBQSw4QkFvQlVDLENBcEJWLEVBcUJJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSUMsZUFBSjtBQUNBLGdCQUFJLEtBQUtILE9BQVQsRUFDQTtBQUNJRyx5QkFBU0YsRUFBRUcsTUFBRixHQUFXLENBQVgsR0FBZSxJQUFJLEtBQUtOLE9BQXhCLEdBQWtDLElBQUksS0FBS0EsT0FBcEQ7QUFDSCxhQUhELE1BS0E7QUFDSUsseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLTixPQUF4QixHQUFrQyxJQUFJLEtBQUtBLE9BQXBEO0FBQ0g7QUFDRCxnQkFBSU8sUUFBUSxFQUFFQyxHQUFHTCxFQUFFTSxPQUFQLEVBQWdCQyxHQUFHUCxFQUFFUSxPQUFyQixFQUFaO0FBQ0EsZ0JBQUlDLGlCQUFKO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLWCxNQUFWLEVBQ0E7QUFDSVcsMkJBQVcsS0FBS2QsTUFBTCxDQUFZZSxPQUFaLENBQW9CTixLQUFwQixDQUFYO0FBQ0g7QUFDRCxpQkFBS1QsTUFBTCxDQUFZZ0IsS0FBWixDQUFrQk4sQ0FBbEIsSUFBdUJILE1BQXZCO0FBQ0EsaUJBQUtQLE1BQUwsQ0FBWWdCLEtBQVosQ0FBa0JKLENBQWxCLElBQXVCTCxNQUF2QjtBQUNBLGdCQUFNVSxRQUFRLEtBQUtqQixNQUFMLENBQVlrQixPQUFaLENBQW9CLFlBQXBCLENBQWQ7QUFDQSxnQkFBSUQsS0FBSixFQUNBO0FBQ0lBLHNCQUFNQSxLQUFOO0FBQ0g7O0FBRUQsZ0JBQUksS0FBS2QsTUFBVCxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWW1CLFVBQVosQ0FBdUIsS0FBS2hCLE1BQTVCO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksb0JBQU1pQixXQUFXLEtBQUtwQixNQUFMLENBQVlxQixRQUFaLENBQXFCUCxRQUFyQixDQUFqQjtBQUNBLHFCQUFLZCxNQUFMLENBQVlVLENBQVosSUFBaUJELE1BQU1DLENBQU4sR0FBVVUsU0FBU1YsQ0FBcEM7QUFDQSxxQkFBS1YsTUFBTCxDQUFZWSxDQUFaLElBQWlCSCxNQUFNRyxDQUFOLEdBQVVRLFNBQVNSLENBQXBDO0FBQ0g7QUFDRFAsY0FBRWlCLGNBQUY7QUFDQSxpQkFBS3RCLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsT0FBTyxFQUFFQyxJQUFJcEIsRUFBRXFCLE1BQVIsRUFBZ0JDLElBQUl0QixFQUFFRyxNQUF0QixFQUE4Qm9CLElBQUl2QixFQUFFd0IsTUFBcEMsRUFBVCxFQUF1REMsT0FBT3pCLENBQTlELEVBQWlFMEIsVUFBVSxLQUFLL0IsTUFBaEYsRUFBMUI7QUFDSDtBQTlETDs7QUFBQTtBQUFBLEVBQXFDSixNQUFyQyIsImZpbGUiOiJ3aGVlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2hlZWwgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgd2hlZWwoe3doZWVsOiB7ZHgsIGR5LCBken0sIGV2ZW50LCB2aWV3cG9ydH0pXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSBvcHRpb25zLnBlcmNlbnQgfHwgMC4xXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZVxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY2hhbmdlXHJcbiAgICAgICAgaWYgKHRoaXMucmV2ZXJzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IGUuZGVsdGFZID4gMCA/IDEgKyB0aGlzLnBlcmNlbnQgOiAxIC0gdGhpcy5wZXJjZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IGUuZGVsdGFZID4gMCA/IDEgLSB0aGlzLnBlcmNlbnQgOiAxICsgdGhpcy5wZXJjZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwb2ludCA9IHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFkgfVxyXG4gICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKj0gY2hhbmdlXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSBjaGFuZ2VcclxuICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbCcsIHsgd2hlZWw6IHsgZHg6IGUuZGVsdGFYLCBkeTogZS5kZWx0YVksIGR6OiBlLmRlbHRhWiB9LCBldmVudDogZSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgIH1cclxufSJdfQ==