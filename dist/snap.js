'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var Ease = require('pixi-ease');
var exists = require('exists');

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
        _this.ease = options.ease || 'easeInOutSine';
        _this.x = x;
        _this.y = y;
        _this.topLeft = options.topLeft;
        _this.interrupt = exists(options.interrupt) ? options.interrupt : true;
        _this.removeOnComplete = options.removeOnComplete;
        _this.removeOnInterrupt = options.removeOnInterrupt;
        if (options.forceStart) {
            _this.percent = 0;
            _this.snapping = new Ease.to(_this, { percent: 1 }, _this.time, { ease: _this.ease });
            _this.startEase();
            _this.parent.emit('snap-start', _this.parent);
        }
        return _this;
    }

    _createClass(Snap, [{
        key: 'startEase',
        value: function startEase() {
            var current = this.topLeft ? this.parent.corner : this.parent.center;
            this.deltaX = this.x - current.x;
            this.deltaY = this.y - current.y;
            this.startX = current.x;
            this.startY = current.y;
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
                    this.percent = 0;
                    this.snapping = new Ease.to(this, { percent: 1 }, this.time, { ease: this.ease });
                    this.startEase();
                    this.parent.emit('snap-start', this.parent);
                }
            } else {
                var finished = this.snapping.update(elapsed);
                var x = this.startX + this.deltaX * this.percent;
                var y = this.startY + this.deltaY * this.percent;
                if (this.topLeft) {
                    this.parent.moveCorner(x, y);
                } else {
                    this.parent.moveCenter(x, y);
                }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLmpzIl0sIm5hbWVzIjpbIlBsdWdpbiIsInJlcXVpcmUiLCJFYXNlIiwiZXhpc3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIngiLCJ5Iiwib3B0aW9ucyIsImZyaWN0aW9uIiwidGltZSIsImVhc2UiLCJ0b3BMZWZ0IiwiaW50ZXJydXB0IiwicmVtb3ZlT25Db21wbGV0ZSIsInJlbW92ZU9uSW50ZXJydXB0IiwiZm9yY2VTdGFydCIsInBlcmNlbnQiLCJzbmFwcGluZyIsInRvIiwic3RhcnRFYXNlIiwiZW1pdCIsImN1cnJlbnQiLCJjb3JuZXIiLCJjZW50ZXIiLCJkZWx0YVgiLCJkZWx0YVkiLCJzdGFydFgiLCJzdGFydFkiLCJyZW1vdmVQbHVnaW4iLCJjb3VudERvd25Qb2ludGVycyIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsImVsYXBzZWQiLCJwYXVzZWQiLCJmaW5pc2hlZCIsInVwZGF0ZSIsIm1vdmVDb3JuZXIiLCJtb3ZlQ2VudGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBLGtCQUFZQyxNQUFaLEVBQW9CQyxDQUFwQixFQUF1QkMsQ0FBdkIsRUFBMEJDLE9BQTFCLEVBQ0E7QUFBQTs7QUFBQSxnSEFDVUgsTUFEVjs7QUFFSUcsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxRQUFMLEdBQWdCRCxRQUFRQyxRQUFSLElBQW9CLEdBQXBDO0FBQ0EsY0FBS0MsSUFBTCxHQUFZRixRQUFRRSxJQUFSLElBQWdCLElBQTVCO0FBQ0EsY0FBS0MsSUFBTCxHQUFZSCxRQUFRRyxJQUFSLElB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U0FBUyxDQUFYLEVBQWxCLEVBQWtDLEtBQUtQLElBQXZDLEVBQTZDLEVBQUVDLE1BQU0sS0FBS0EsSUFBYixFQUE3QyxDQUFoQjtBQUNBLHlCQUFLUyxTQUFMO0FBQ0EseUJBQUtmLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsWUFBakIsRUFBK0IsS0FBS2hCLE1BQXBDO0FBQ0g7QUFDSixhQVZELE1BWUE7QUFDSSxvQkFBTWdDLFdBQVcsS0FBS25CLFFBQUwsQ0FBY29CLE1BQWQsQ0FBcUJILE9BQXJCLENBQWpCO0FBQ0Esb0JBQU03QixJQUFJLEtBQUtxQixNQUFMLEdBQWMsS0FBS0YsTUFBTCxHQUFjLEtBQUtSLE9BQTNDO0FBQ0Esb0JBQU1WLElBQUksS0FBS3FCLE1BQUwsR0FBYyxLQUFLRixNQUFMLEdBQWMsS0FBS1QsT0FBM0M7QUFDQSxvQkFBSSxLQUFLTCxPQUFULEVBQ0E7QUFDSSx5QkFBS1AsTUFBTCxDQUFZa0MsVUFBWixDQUF1QmpDLENBQXZCLEVBQTBCQyxDQUExQjtBQUNILGlCQUhELE1BS0E7QUFDSSx5QkFBS0YsTUFBTCxDQUFZbUMsVUFBWixDQUF1QmxDLENBQXZCLEVBQTBCQyxDQUExQjtBQUNIOztBQUVELG9CQUFJOEIsUUFBSixFQUNBO0FBQ0ksd0JBQUksS0FBS3ZCLGdCQUFULEVBQ0E7QUFDSSw2QkFBS1QsTUFBTCxDQUFZd0IsWUFBWixDQUF5QixNQUF6QjtBQUNIO0FBQ0QseUJBQUt4QixNQUFMLENBQVlnQixJQUFaLENBQWlCLFVBQWpCLEVBQTZCLEtBQUtoQixNQUFsQztBQUNBLHlCQUFLYSxRQUFMLEdBQWdCLElBQWhCO0FBQ0g7QUFDSjtBQUNKO0FBbElMOztBQUFBO0FBQUEsRUFBb0NuQixNQUFwQyIsImZpbGUiOiJzbmFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCBFYXNlID0gcmVxdWlyZSgncGl4aS1lYXNlJylcclxuY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU25hcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50b3BMZWZ0XSBzbmFwIHRvIHRoZSB0b3AtbGVmdCBvZiB2aWV3cG9ydCBpbnN0ZWFkIG9mIGNlbnRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuOF0gZnJpY3Rpb24vZnJhbWUgdG8gYXBwbHkgaWYgZGVjZWxlcmF0ZSBpcyBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHNuYXAtc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGEgc25hcCBhbmltYXRpb24gc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgc25hcC1yZXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIHNuYXAgcmVzZXRzIGJlY2F1c2Ugb2YgYSBjaGFuZ2UgaW4gdmlld3BvcnQgc2l6ZVxyXG4gICAgICogQGV2ZW50IHNuYXAtZW5kKFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBzbmFwIHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICogQGV2ZW50IHNuYXAtcmVtb3ZlKFZpZXdwb3J0KSBlbWl0dGVkIGlmIHNuYXAgcGx1Z2luIGlzIHJlbW92ZWRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB4LCB5LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuOFxyXG4gICAgICAgIHRoaXMudGltZSA9IG9wdGlvbnMudGltZSB8fCAxMDAwXHJcbiAgICAgICAgdGhpcy5lYXNlID0gb3B0aW9ucy5lYXNlIHx8ICdlYXNlSW5PdXRTaW5lJ1xyXG4gICAgICAgIHRoaXMueCA9IHhcclxuICAgICAgICB0aGlzLnkgPSB5XHJcbiAgICAgICAgdGhpcy50b3BMZWZ0ID0gb3B0aW9ucy50b3BMZWZ0XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQgPSBleGlzdHMob3B0aW9ucy5pbnRlcnJ1cHQpID8gb3B0aW9ucy5pbnRlcnJ1cHQgOiB0cnVlXHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkNvbXBsZXRlID0gb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXHJcbiAgICAgICAgdGhpcy5yZW1vdmVPbkludGVycnVwdCA9IG9wdGlvbnMucmVtb3ZlT25JbnRlcnJ1cHRcclxuICAgICAgICBpZiAob3B0aW9ucy5mb3JjZVN0YXJ0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wZXJjZW50ID0gMFxyXG4gICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbmV3IEVhc2UudG8odGhpcywgeyBwZXJjZW50OiAxIH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgdGhpcy5zdGFydEVhc2UoKVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0RWFzZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9wTGVmdCA/IHRoaXMucGFyZW50LmNvcm5lciA6IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgIHRoaXMuZGVsdGFYID0gdGhpcy54IC0gY3VycmVudC54XHJcbiAgICAgICAgdGhpcy5kZWx0YVkgPSB0aGlzLnkgLSBjdXJyZW50LnlcclxuICAgICAgICB0aGlzLnN0YXJ0WCA9IGN1cnJlbnQueFxyXG4gICAgICAgIHRoaXMuc3RhcnRZID0gY3VycmVudC55XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZU9uSW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA9PT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICAgICAgaWYgKGRlY2VsZXJhdGUgJiYgKGRlY2VsZXJhdGUueCB8fCBkZWNlbGVyYXRlLnkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID0gZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJydXB0ICYmIHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgIT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9wTGVmdCA/IHRoaXMucGFyZW50LmNvcm5lciA6IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgICAgICBpZiAoY3VycmVudC54ICE9PSB0aGlzLnggfHwgY3VycmVudC55ICE9PSB0aGlzLnkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGVyY2VudCA9IDBcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBuZXcgRWFzZS50byh0aGlzLCB7IHBlcmNlbnQ6IDEgfSwgdGhpcy50aW1lLCB7IGVhc2U6IHRoaXMuZWFzZSB9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydEVhc2UoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkID0gdGhpcy5zbmFwcGluZy51cGRhdGUoZWxhcHNlZClcclxuICAgICAgICAgICAgY29uc3QgeCA9IHRoaXMuc3RhcnRYICsgdGhpcy5kZWx0YVggKiB0aGlzLnBlcmNlbnRcclxuICAgICAgICAgICAgY29uc3QgeSA9IHRoaXMuc3RhcnRZICsgdGhpcy5kZWx0YVkgKiB0aGlzLnBlcmNlbnRcclxuICAgICAgICAgICAgaWYgKHRoaXMudG9wTGVmdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNvcm5lcih4LCB5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih4LCB5KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmluaXNoZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU9uQ29tcGxldGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtZW5kJywgdGhpcy5wYXJlbnQgKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==