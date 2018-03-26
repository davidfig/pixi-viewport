'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PIXI = require('pixi.js');

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Wheel, _Plugin);

    /**
     * @private
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
        key: 'getPointerPosition',
        value: function getPointerPosition(evt) {
            var point = new PIXI.Point();
            if (this.parent.interaction) {
                this.parent.interaction.mapPositionToPoint(point, evt.clientX, evt.clientY);
            } else {
                point.x = evt.clientX;
                point.y = evt.clientY;
            }
            return point;
        }
    }, {
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
            var point = this.getPointerPosition(e);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQSVhJIiwicmVxdWlyZSIsIlBsdWdpbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJvcHRpb25zIiwicGVyY2VudCIsImNlbnRlciIsInJldmVyc2UiLCJldnQiLCJwb2ludCIsIlBvaW50IiwiaW50ZXJhY3Rpb24iLCJtYXBQb3NpdGlvblRvUG9pbnQiLCJjbGllbnRYIiwiY2xpZW50WSIsIngiLCJ5IiwiZSIsInBhdXNlZCIsImNoYW5nZSIsImRlbHRhWSIsImdldFBvaW50ZXJQb3NpdGlvbiIsIm9sZFBvaW50IiwidG9Mb2NhbCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJwcmV2ZW50RGVmYXVsdCIsImVtaXQiLCJ3aGVlbCIsImR4IiwiZGVsdGFYIiwiZHkiLCJkeiIsImRlbHRhWiIsImV2ZW50Iiwidmlld3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxPQUFPQyxRQUFRLFNBQVIsQ0FBYjs7QUFFQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUxKO0FBTUM7O0FBbkJMO0FBQUE7QUFBQSwyQ0FxQnVCQyxHQXJCdkIsRUFzQkk7QUFDSSxnQkFBSUMsUUFBUSxJQUFJWCxLQUFLWSxLQUFULEVBQVo7QUFDQSxnQkFBSSxLQUFLUCxNQUFMLENBQVlRLFdBQWhCLEVBQ0E7QUFDSSxxQkFBS1IsTUFBTCxDQUFZUSxXQUFaLENBQXdCQyxrQkFBeEIsQ0FBMkNILEtBQTNDLEVBQWtERCxJQUFJSyxPQUF0RCxFQUErREwsSUFBSU0sT0FBbkU7QUFDSCxhQUhELE1BS0E7QUFDSUwsc0JBQU1NLENBQU4sR0FBVVAsSUFBSUssT0FBZDtBQUNBSixzQkFBTU8sQ0FBTixHQUFVUixJQUFJTSxPQUFkO0FBQ0g7QUFDRCxtQkFBT0wsS0FBUDtBQUNIO0FBbENMO0FBQUE7QUFBQSw4QkFvQ1VRLENBcENWLEVBcUNJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSUMsZUFBSjtBQUNBLGdCQUFJLEtBQUtaLE9BQVQsRUFDQTtBQUNJWSx5QkFBU0YsRUFBRUcsTUFBRixHQUFXLENBQVgsR0FBZSxJQUFJLEtBQUtmLE9BQXhCLEdBQWtDLElBQUksS0FBS0EsT0FBcEQ7QUFDSCxhQUhELE1BS0E7QUFDSWMseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLZixPQUF4QixHQUFrQyxJQUFJLEtBQUtBLE9BQXBEO0FBQ0g7QUFDRCxnQkFBSUksUUFBUSxLQUFLWSxrQkFBTCxDQUF3QkosQ0FBeEIsQ0FBWjs7QUFFQSxnQkFBSUssaUJBQUo7QUFDQSxnQkFBSSxDQUFDLEtBQUtoQixNQUFWLEVBQ0E7QUFDSWdCLDJCQUFXLEtBQUtuQixNQUFMLENBQVlvQixPQUFaLENBQW9CZCxLQUFwQixDQUFYO0FBQ0g7QUFDRCxpQkFBS04sTUFBTCxDQUFZcUIsS0FBWixDQUFrQlQsQ0FBbEIsSUFBdUJJLE1BQXZCO0FBQ0EsaUJBQUtoQixNQUFMLENBQVlxQixLQUFaLENBQWtCUixDQUFsQixJQUF1QkcsTUFBdkI7QUFDQSxnQkFBTU0sUUFBUSxLQUFLdEIsTUFBTCxDQUFZdUIsT0FBWixDQUFvQixZQUFwQixDQUFkO0FBQ0EsZ0JBQUlELEtBQUosRUFDQTtBQUNJQSxzQkFBTUEsS0FBTjtBQUNIOztBQUVELGdCQUFJLEtBQUtuQixNQUFULEVBQ0E7QUFDSSxxQkFBS0gsTUFBTCxDQUFZd0IsVUFBWixDQUF1QixLQUFLckIsTUFBNUI7QUFDSCxhQUhELE1BS0E7QUFDSSxvQkFBTXNCLFdBQVcsS0FBS3pCLE1BQUwsQ0FBWTBCLFFBQVosQ0FBcUJQLFFBQXJCLENBQWpCO0FBQ0EscUJBQUtuQixNQUFMLENBQVlZLENBQVosSUFBaUJOLE1BQU1NLENBQU4sR0FBVWEsU0FBU2IsQ0FBcEM7QUFDQSxxQkFBS1osTUFBTCxDQUFZYSxDQUFaLElBQWlCUCxNQUFNTyxDQUFOLEdBQVVZLFNBQVNaLENBQXBDO0FBQ0g7QUFDREMsY0FBRWEsY0FBRjtBQUNBLGlCQUFLM0IsTUFBTCxDQUFZNEIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxPQUFPLEVBQUVDLElBQUloQixFQUFFaUIsTUFBUixFQUFnQkMsSUFBSWxCLEVBQUVHLE1BQXRCLEVBQThCZ0IsSUFBSW5CLEVBQUVvQixNQUFwQyxFQUFULEVBQXVEQyxPQUFPckIsQ0FBOUQsRUFBaUVzQixVQUFVLEtBQUtwQyxNQUFoRixFQUExQjtBQUNIO0FBL0VMOztBQUFBO0FBQUEsRUFBcUNILE1BQXJDIiwiZmlsZSI6IndoZWVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXaGVlbCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTAuMV0gcGVyY2VudCB0byBzY3JvbGwgd2l0aCBlYWNoIHNwaW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmV2ZXJzZV0gcmV2ZXJzZSB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGN1cnJlbnQgbW91c2UgcG9zaXRpb25cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgd2hlZWwoe3doZWVsOiB7ZHgsIGR5LCBken0sIGV2ZW50LCB2aWV3cG9ydH0pXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSBvcHRpb25zLnBlcmNlbnQgfHwgMC4xXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMucmV2ZXJzZSA9IG9wdGlvbnMucmV2ZXJzZVxyXG4gICAgfVxyXG5cclxuICAgIGdldFBvaW50ZXJQb3NpdGlvbihldnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHBvaW50ID0gbmV3IFBJWEkuUG9pbnQoKVxyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5pbnRlcmFjdGlvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmludGVyYWN0aW9uLm1hcFBvc2l0aW9uVG9Qb2ludChwb2ludCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwb2ludC54ID0gZXZ0LmNsaWVudFhcclxuICAgICAgICAgICAgcG9pbnQueSA9IGV2dC5jbGllbnRZXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwb2ludFxyXG4gICAgfVxyXG5cclxuICAgIHdoZWVsKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY2hhbmdlXHJcbiAgICAgICAgaWYgKHRoaXMucmV2ZXJzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IGUuZGVsdGFZID4gMCA/IDEgKyB0aGlzLnBlcmNlbnQgOiAxIC0gdGhpcy5wZXJjZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IGUuZGVsdGFZID4gMCA/IDEgLSB0aGlzLnBlcmNlbnQgOiAxICsgdGhpcy5wZXJjZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRlclBvc2l0aW9uKGUpXHJcblxyXG4gICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKj0gY2hhbmdlXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSBjaGFuZ2VcclxuICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbCcsIHsgd2hlZWw6IHsgZHg6IGUuZGVsdGFYLCBkeTogZS5kZWx0YVksIGR6OiBlLmRlbHRhWiB9LCBldmVudDogZSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgIH1cclxufSJdfQ==