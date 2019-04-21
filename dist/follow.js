'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Follow, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
     * @param {number} [options.acceleration] set acceleration to accelerate and decelerate at this rate; speed cannot be 0 to use acceleration
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     */
    function Follow(parent, target, options) {
        _classCallCheck(this, Follow);

        var _this = _possibleConstructorReturn(this, (Follow.__proto__ || Object.getPrototypeOf(Follow)).call(this, parent));

        options = options || {};
        _this.speed = options.speed || 0;
        _this.acceleration = options.acceleration || 0;
        _this.velocity = { x: 0, y: 0 };
        _this.target = target;
        _this.radius = options.radius;
        return _this;
    }

    _createClass(Follow, [{
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }

            var center = this.parent.center;
            var toX = this.target.x,
                toY = this.target.y;
            if (this.radius) {
                var distance = Math.sqrt(Math.pow(this.target.y - center.y, 2) + Math.pow(this.target.x - center.x, 2));
                if (distance > this.radius) {
                    var angle = Math.atan2(this.target.y - center.y, this.target.x - center.x);
                    toX = this.target.x - Math.cos(angle) * this.radius;
                    toY = this.target.y - Math.sin(angle) * this.radius;
                } else {
                    return;
                }
            }
            var deltaX = toX - center.x;
            var deltaY = toY - center.y;
            if (deltaX || deltaY) {
                if (this.speed) {
                    if (this.acceleration) {
                        var _angle = Math.atan2(toY - center.y, toX - center.x);
                        var _distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                        if (_distance) {
                            var decelerationDistance = (Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) / (2 * this.acceleration);
                            if (_distance > decelerationDistance) {
                                this.velocity = {
                                    x: Math.min(this.velocity.x + this.acceleration * elapsed, this.speed),
                                    y: Math.min(this.velocity.y + this.acceleration * elapsed, this.speed)
                                };
                            } else {
                                this.velocity = {
                                    x: Math.max(this.velocity.x - this.acceleration * this.speed, 0),
                                    y: Math.max(this.velocity.y - this.acceleration * this.speed, 0)
                                };
                            }
                            var changeX = Math.cos(_angle) * this.velocity.x;
                            var changeY = Math.sin(_angle) * this.velocity.y;
                            var x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                            var y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                            this.parent.moveCenter(x, y);
                            this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                        }
                    } else {
                        var _angle2 = Math.atan2(toY - center.y, toX - center.x);
                        var _changeX = Math.cos(_angle2) * this.speed;
                        var _changeY = Math.sin(_angle2) * this.speed;
                        var _x = Math.abs(_changeX) > Math.abs(deltaX) ? toX : center.x + _changeX;
                        var _y = Math.abs(_changeY) > Math.abs(deltaY) ? toY : center.y + _changeY;
                        this.parent.moveCenter(_x, _y);
                        this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                    }
                } else {
                    this.parent.moveCenter(toX, toY);
                    this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                }
            }
        }
    }]);

    return Follow;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mb2xsb3cuanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ0YXJnZXQiLCJvcHRpb25zIiwic3BlZWQiLCJhY2NlbGVyYXRpb24iLCJ2ZWxvY2l0eSIsIngiLCJ5IiwicmFkaXVzIiwiZWxhcHNlZCIsInBhdXNlZCIsImNlbnRlciIsInRvWCIsInRvWSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJhbmdsZSIsImF0YW4yIiwiY29zIiwic2luIiwiZGVsdGFYIiwiZGVsdGFZIiwiZGVjZWxlcmF0aW9uRGlzdGFuY2UiLCJtaW4iLCJtYXgiLCJjaGFuZ2VYIiwiY2hhbmdlWSIsImFicyIsIm1vdmVDZW50ZXIiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7O0FBU0Esb0JBQVlDLE1BQVosRUFBb0JDLE1BQXBCLEVBQTRCQyxPQUE1QixFQUNBO0FBQUE7O0FBQUEsb0hBQ1VGLE1BRFY7O0FBRUlFLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsS0FBTCxHQUFhRCxRQUFRQyxLQUFSLElBQWlCLENBQTlCO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQkYsUUFBUUUsWUFBUixJQUF3QixDQUE1QztBQUNBLGNBQUtDLFFBQUwsR0FBZ0IsRUFBRUMsR0FBRyxDQUFMLEVBQVFDLEdBQUcsQ0FBWCxFQUFoQjtBQUNBLGNBQUtOLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGNBQUtPLE1BQUwsR0FBY04sUUFBUU0sTUFBdEI7QUFQSjtBQVFDOztBQXBCTDtBQUFBO0FBQUEsK0JBc0JXQyxPQXRCWCxFQXVCSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQU1DLFNBQVMsS0FBS1gsTUFBTCxD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R0FBdUNWLEdBQXZDLEdBQTZDRixPQUFPSixDQUFQLEdBQVdxQixRQUFsRTtBQUNBLDZCQUFLNUIsTUFBTCxDQUFZOEIsVUFBWixDQUF1QnhCLEVBQXZCLEVBQTBCQyxFQUExQjtBQUNBLDZCQUFLUCxNQUFMLENBQVkrQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLFVBQVUsS0FBS2hDLE1BQWpCLEVBQXlCaUMsTUFBTSxRQUEvQixFQUExQjtBQUNIO0FBQ0osaUJBekNELE1BMkNBO0FBQ0kseUJBQUtqQyxNQUFMLENBQVk4QixVQUFaLENBQXVCbEIsR0FBdkIsRUFBNEJDLEdBQTVCO0FBQ0EseUJBQUtiLE1BQUwsQ0FBWStCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLaEMsTUFBakIsRUFBeUJpQyxNQUFNLFFBQS9CLEVBQTFCO0FBQ0g7QUFDSjtBQUNKO0FBakdMOztBQUFBO0FBQUEsRUFBc0NyQyxNQUF0QyIsImZpbGUiOiJmb2xsb3cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZvbGxvdyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5hY2NlbGVyYXRpb25dIHNldCBhY2NlbGVyYXRpb24gdG8gYWNjZWxlcmF0ZSBhbmQgZGVjZWxlcmF0ZSBhdCB0aGlzIHJhdGU7IHNwZWVkIGNhbm5vdCBiZSAwIHRvIHVzZSBhY2NlbGVyYXRpb25cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQgfHwgMFxyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uID0gb3B0aW9ucy5hY2NlbGVyYXRpb24gfHwgMFxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB7IHg6IDAsIHk6IDAgfVxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1c1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgbGV0IHRvWCA9IHRoaXMudGFyZ2V0LngsIHRvWSA9IHRoaXMudGFyZ2V0LnlcclxuICAgICAgICBpZiAodGhpcy5yYWRpdXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh0aGlzLnRhcmdldC55IC0gY2VudGVyLnksIDIpICsgTWF0aC5wb3codGhpcy50YXJnZXQueCAtIGNlbnRlci54LCAyKSlcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gdGhpcy5yYWRpdXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLnRhcmdldC55IC0gY2VudGVyLnksIHRoaXMudGFyZ2V0LnggLSBjZW50ZXIueClcclxuICAgICAgICAgICAgICAgIHRvWCA9IHRoaXMudGFyZ2V0LnggLSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnJhZGl1c1xyXG4gICAgICAgICAgICAgICAgdG9ZID0gdGhpcy50YXJnZXQueSAtIE1hdGguc2luKGFuZ2xlKSAqIHRoaXMucmFkaXVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkZWx0YVggPSB0b1ggLSBjZW50ZXIueFxyXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IHRvWSAtIGNlbnRlci55XHJcbiAgICAgICAgaWYgKGRlbHRhWCB8fCBkZWx0YVkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zcGVlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWNjZWxlcmF0aW9uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMih0b1kgLSBjZW50ZXIueSwgdG9YIC0gY2VudGVyLngpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coZGVsdGFYLCAyKSArIE1hdGgucG93KGRlbHRhWSwgMikpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVjZWxlcmF0aW9uRGlzdGFuY2UgPSAoTWF0aC5wb3codGhpcy52ZWxvY2l0eS54LCAyKSArIE1hdGgucG93KHRoaXMudmVsb2NpdHkueSwgMikpIC8gKDIgKiB0aGlzLmFjY2VsZXJhdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gZGVjZWxlcmF0aW9uRGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogTWF0aC5taW4odGhpcy52ZWxvY2l0eS54ICsgdGhpcy5hY2NlbGVyYXRpb24gKiBlbGFwc2VkLCB0aGlzLnNwZWVkKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBNYXRoLm1pbih0aGlzLnZlbG9jaXR5LnkgKyB0aGlzLmFjY2VsZXJhdGlvbiAqIGVsYXBzZWQsIHRoaXMuc3BlZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IE1hdGgubWF4KHRoaXMudmVsb2NpdHkueCAtIHRoaXMuYWNjZWxlcmF0aW9uICogdGhpcy5zcGVlZCwgMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogTWF0aC5tYXgodGhpcy52ZWxvY2l0eS55IC0gdGhpcy5hY2NlbGVyYXRpb24gKiB0aGlzLnNwZWVkLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVggPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnZlbG9jaXR5LnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlWSA9IE1hdGguc2luKGFuZ2xlKSAqIHRoaXMudmVsb2NpdHkueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5hYnMoY2hhbmdlWCkgPiBNYXRoLmFicyhkZWx0YVgpID8gdG9YIDogY2VudGVyLnggKyBjaGFuZ2VYXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHkgPSBNYXRoLmFicyhjaGFuZ2VZKSA+IE1hdGguYWJzKGRlbHRhWSkgPyB0b1kgOiBjZW50ZXIueSArIGNoYW5nZVlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih4LCB5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZm9sbG93JyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIodG9ZIC0gY2VudGVyLnksIHRvWCAtIGNlbnRlci54KVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVggPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlWSA9IE1hdGguc2luKGFuZ2xlKSAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5hYnMoY2hhbmdlWCkgPiBNYXRoLmFicyhkZWx0YVgpID8gdG9YIDogY2VudGVyLnggKyBjaGFuZ2VYXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeSA9IE1hdGguYWJzKGNoYW5nZVkpID4gTWF0aC5hYnMoZGVsdGFZKSA/IHRvWSA6IGNlbnRlci55ICsgY2hhbmdlWVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIoeCwgeSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZm9sbG93JyB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0b1gsIHRvWSlcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdmb2xsb3cnIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=