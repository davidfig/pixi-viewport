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
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     */
    function Follow(parent, target, options) {
        _classCallCheck(this, Follow);

        var _this = _possibleConstructorReturn(this, (Follow.__proto__ || Object.getPrototypeOf(Follow)).call(this, parent));

        options = options || {};
        _this.speed = options.speed || 0;
        _this.target = target;
        _this.radius = options.radius;
        return _this;
    }

    _createClass(Follow, [{
        key: 'update',
        value: function update() {
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
            if (this.speed) {
                var deltaX = toX - center.x;
                var deltaY = toY - center.y;
                if (deltaX || deltaY) {
                    var _angle = Math.atan2(toY - center.y, toX - center.x);
                    var changeX = Math.cos(_angle) * this.speed;
                    var changeY = Math.sin(_angle) * this.speed;
                    var x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                    var y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                    this.parent.moveCenter(x, y);
                    this.parent.emit('moved', this.parent);
                }
            } else {
                this.parent.moveCenter(toX, toY);
                this.parent.emit('moved', this.parent);
            }
        }
    }]);

    return Follow;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mb2xsb3cuanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ0YXJnZXQiLCJvcHRpb25zIiwic3BlZWQiLCJyYWRpdXMiLCJwYXVzZWQiLCJjZW50ZXIiLCJ0b1giLCJ4IiwidG9ZIiwieSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJhbmdsZSIsImF0YW4yIiwiY29zIiwic2luIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2hhbmdlWCIsImNoYW5nZVkiLCJhYnMiLCJtb3ZlQ2VudGVyIiwiZW1pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7O0FBUUEsb0JBQVlDLE1BQVosRUFBb0JDLE1BQXBCLEVBQTRCQyxPQUE1QixFQUNBO0FBQUE7O0FBQUEsb0hBQ1VGLE1BRFY7O0FBRUlFLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsS0FBTCxHQUFhRCxRQUFRQyxLQUFSLElBQWlCLENBQTlCO0FBQ0EsY0FBS0YsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsY0FBS0csTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUxKO0FBTUM7O0FBakJMO0FBQUE7QUFBQSxpQ0FvQkk7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFNQyxTQUFTLEtBQUtOLE1BQUwsQ0FBWU0sTUFBM0I7QUFDQSxnQkFBSUMsTUFBTSxLQUFLTixNQUFMLENBQVlPLENBQXRCO0FBQUEsZ0JBQXlCQyxNQUFNLEtBQUtSLE1BQUwsQ0FBWVMsQ0FBM0M7QUFDQSxnQkFBSSxLQUFLTixNQUFULEVBQ0E7QUFDSSxvQkFBTU8sV0FBV0MsS0FBS0MsSUFBTCxDQUFVRCxLQUFLRSxHQUFMLENBQVMsS0FBS2IsTUFBTCxDQUFZUyxDQUFaLEdBQWdCSixPQUFPSSxDQUFoQyxFQUFtQyxDQUFuQyxJQUF3Q0UsS0FBS0UsR0FBTCxDQUFTLEtBQUtiLE1BQUwsQ0FBWU8sQ0FBWixHQUFnQkYsT0FBT0UsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBbEQsQ0FBakI7QUFDQSxvQkFBSUcsV0FBVyxLQUFLUCxNQUFwQixFQUNBO0FBQ0ksd0JBQU1XLFFBQVFILEtBQUtJLEtBQUwsQ0FBVyxLQUFLZixNQUFMLENBQVlTLENBQVosR0FBZ0JKLE9BQU9JLENBQWxDLEVBQXFDLEtBQUtULE1BQUwsQ0FBWU8sQ0FBWixHQUFnQkYsT0FBT0UsQ0FBNUQsQ0FBZDtBQUNBRCwwQkFBTSxLQUFLTixNQUFMLENBQVlPLENBQVosR0FBZ0JJLEtBQUtLLEdBQUwsQ0FBU0YsS0FBVCxJQUFrQixLQUFLWCxNQUE3QztBQUNBSywwQkFBTSxLQUFLUixNQUFMLENBQVlTLENBQVosR0FBZ0JFLEtBQUtNLEdBQUwsQ0FBU0gsS0FBVCxJQUFrQixLQUFLWCxNQUE3QztBQUNILGlCQUxELE1BT0E7QUFDSTtBQUNIO0FBQ0o7QUFDRCxnQkFBSSxLQUFLRCxLQUFULEVBQ0E7QUFDSSxvQkFBTWdCLFNBQVNaLE1BQU1ELE9BQU9FLENBQTVCO0FBQ0Esb0JBQU1ZLFNBQVNYLE1BQU1ILE9BQU9JLENBQTVCO0FBQ0Esb0JBQUlTLFVBQVVDLE1BQWQsRUFDQTtBQUNJLHdCQUFNTCxTQUFRSCxLQUFLSSxLQUFMLENBQVdQLE1BQU1ILE9BQU9JLENBQXhCLEVBQTJCSCxNQUFNRCxPQUFPRSxDQUF4QyxDQUFkO0FBQ0Esd0JBQU1hLFVBQVVULEtBQUtLLEdBQUwsQ0FBU0YsTUFBVCxJQUFrQixLQUFLWixLQUF2QztBQUNBLHdCQUFNbUIsVUFBVVYsS0FBS00sR0FBTCxDQUFTSCxNQUFULElBQWtCLEtBQUtaLEtBQXZDO0FBQ0Esd0JBQU1LLElBQUlJLEtBQUtXLEdBQUwsQ0FBU0YsT0FBVCxJQUFvQlQsS0FBS1csR0FBTCxDQUFTSixNQUFULENBQXBCLEdBQXVDWixHQUF2QyxHQUE2Q0QsT0FBT0UsQ0FBUCxHQUFXYSxPQUFsRTtBQUNBLHdCQUFNWCxJQUFJRSxLQUFLVyxHQUFMLENBQVNELE9BQVQsSUFBb0JWLEtBQUtXLEdBQUwsQ0FBU0gsTUFBVCxDQUFwQixHQUF1Q1gsR0FBdkMsR0FBNkNILE9BQU9JLENBQVAsR0FBV1ksT0FBbEU7QUFDQSx5QkFBS3RCLE1BQUwsQ0FBWXdCLFVBQVosQ0FBdUJoQixDQUF2QixFQUEwQkUsQ0FBMUI7QUFDQSx5QkFBS1YsTUFBTCxDQUFZeUIsSUFBWixDQUFpQixPQUFqQixFQUEwQixLQUFLekIsTUFBL0I7QUFDSDtBQUNKLGFBZEQsTUFnQkE7QUFDSSxxQkFBS0EsTUFBTCxDQUFZd0IsVUFBWixDQUF1QmpCLEdBQXZCLEVBQTRCRSxHQUE1QjtBQUNBLHFCQUFLVCxNQUFMLENBQVl5QixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEtBQUt6QixNQUEvQjtBQUNIO0FBQ0o7QUE5REw7O0FBQUE7QUFBQSxFQUFzQ0osTUFBdEMiLCJmaWxlIjoiZm9sbG93LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGb2xsb3cgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuRGlzcGxheU9iamVjdH0gdGFyZ2V0IHRvIGZvbGxvdyAob2JqZWN0IG11c3QgaW5jbHVkZSB7eDogeC1jb29yZGluYXRlLCB5OiB5LWNvb3JkaW5hdGV9KVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnNwZWVkPTBdIHRvIGZvbGxvdyBpbiBwaXhlbHMvZnJhbWUgKDA9dGVsZXBvcnQgdG8gbG9jYXRpb24pXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSByYWRpdXMgKGluIHdvcmxkIGNvb3JkaW5hdGVzKSBvZiBjZW50ZXIgY2lyY2xlIHdoZXJlIG1vdmVtZW50IGlzIGFsbG93ZWQgd2l0aG91dCBtb3ZpbmcgdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgdGFyZ2V0LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBvcHRpb25zLnNwZWVkIHx8IDBcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gb3B0aW9ucy5yYWRpdXNcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgbGV0IHRvWCA9IHRoaXMudGFyZ2V0LngsIHRvWSA9IHRoaXMudGFyZ2V0LnlcclxuICAgICAgICBpZiAodGhpcy5yYWRpdXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh0aGlzLnRhcmdldC55IC0gY2VudGVyLnksIDIpICsgTWF0aC5wb3codGhpcy50YXJnZXQueCAtIGNlbnRlci54LCAyKSlcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gdGhpcy5yYWRpdXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLnRhcmdldC55IC0gY2VudGVyLnksIHRoaXMudGFyZ2V0LnggLSBjZW50ZXIueClcclxuICAgICAgICAgICAgICAgIHRvWCA9IHRoaXMudGFyZ2V0LnggLSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnJhZGl1c1xyXG4gICAgICAgICAgICAgICAgdG9ZID0gdGhpcy50YXJnZXQueSAtIE1hdGguc2luKGFuZ2xlKSAqIHRoaXMucmFkaXVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zcGVlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhWCA9IHRvWCAtIGNlbnRlci54XHJcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhWSA9IHRvWSAtIGNlbnRlci55XHJcbiAgICAgICAgICAgIGlmIChkZWx0YVggfHwgZGVsdGFZKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIodG9ZIC0gY2VudGVyLnksIHRvWCAtIGNlbnRlci54KVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlWCA9IE1hdGguY29zKGFuZ2xlKSAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVkgPSBNYXRoLnNpbihhbmdsZSkgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5hYnMoY2hhbmdlWCkgPiBNYXRoLmFicyhkZWx0YVgpID8gdG9YIDogY2VudGVyLnggKyBjaGFuZ2VYXHJcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gTWF0aC5hYnMoY2hhbmdlWSkgPiBNYXRoLmFicyhkZWx0YVkpID8gdG9ZIDogY2VudGVyLnkgKyBjaGFuZ2VZXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHgsIHkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodG9YLCB0b1kpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19