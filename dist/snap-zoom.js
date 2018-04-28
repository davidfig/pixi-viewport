'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var Ease = require('pixi-ease');
var exists = require('exists');

module.exports = function (_Plugin) {
    _inherits(SnapZoom, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    function SnapZoom(parent, options) {
        _classCallCheck(this, SnapZoom);

        var _this = _possibleConstructorReturn(this, (SnapZoom.__proto__ || Object.getPrototypeOf(SnapZoom)).call(this, parent));

        options = options || {};
        _this.width = options.width;
        _this.height = options.height;
        if (_this.width > 0) {
            _this.x_scale = parent._screenWidth / _this.width;
        }
        if (_this.height > 0) {
            _this.y_scale = parent._screenHeight / _this.height;
        }
        _this.xIndependent = exists(_this.x_scale);
        _this.yIndependent = exists(_this.y_scale);
        _this.x_scale = _this.xIndependent ? _this.x_scale : _this.y_scale;
        _this.y_scale = _this.yIndependent ? _this.y_scale : _this.x_scale;

        _this.time = exists(options.time) ? options.time : 1000;
        _this.ease = options.ease || 'easeInOutSine';
        _this.center = options.center;
        _this.stopOnResize = options.stopOnResize;
        _this.removeOnInterrupt = options.removeOnInterrupt;
        _this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete : true;
        _this.interrupt = exists(options.interrupt) ? options.interrupt : true;
        if (_this.time === 0) {
            parent.container.scale.x = _this.x_scale;
            parent.container.scale.y = _this.y_scale;
            if (_this.removeOnComplete) {
                _this.parent.removePlugin('snap-zoom');
            }
        } else if (options.forceStart) {
            _this.snapping = new Ease.to(_this.parent.scale, { x: _this.x_scale, y: _this.y_scale }, _this.time, { ease: _this.ease });
            _this.parent.emit('snap-zoom-start', _this.parent);
        }
        return _this;
    }

    _createClass(SnapZoom, [{
        key: 'resize',
        value: function resize() {
            this.snapping = null;

            if (this.width > 0) {
                this.x_scale = this.parent._screenWidth / this.width;
            }
            if (this.height > 0) {
                this.y_scale = this.parent._screenHeight / this.height;
            }
            this.x_scale = this.xIndependent ? this.x_scale : this.y_scale;
            this.y_scale = this.yIndependent ? this.y_scale : this.x_scale;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.snapping = null;
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap-zoom');
            } else if (this.interrupt) {
                this.snapping = null;
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

            var oldCenter = void 0;
            if (!this.center) {
                oldCenter = this.parent.center;
            }
            if (!this.snapping) {
                if (this.parent.scale.x !== this.x_scale || this.parent.scale.y !== this.y_scale) {
                    this.snapping = new Ease.to(this.parent.scale, { x: this.x_scale, y: this.y_scale }, this.time, { ease: this.ease });
                    this.parent.emit('snap-zoom-start', this.parent);
                }
            } else if (this.snapping) {
                if (this.snapping.update(elapsed)) {
                    if (this.removeOnComplete) {
                        this.parent.removePlugin('snap-zoom');
                    }
                    this.parent.emit('snap-zoom-end', this.parent);
                    this.snapping = null;
                }
                var clamp = this.parent.plugins['clamp-zoom'];
                if (clamp) {
                    clamp.clamp();
                }
                if (!this.center) {
                    this.parent.moveCenter(oldCenter);
                } else {
                    this.parent.moveCenter(this.center);
                }
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.snapping = null;
            _get(SnapZoom.prototype.__proto__ || Object.getPrototypeOf(SnapZoom.prototype), 'resume', this).call(this);
        }
    }]);

    return SnapZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLXpvb20uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIkVhc2UiLCJleGlzdHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIndpZHRoIiwiaGVpZ2h0IiwieF9zY2FsZSIsIl9zY3JlZW5XaWR0aCIsInlfc2NhbGUiLCJfc2NyZWVuSGVpZ2h0IiwieEluZGVwZW5kZW50IiwieUluZGVwZW5kZW50IiwidGltZSIsImVhc2UiLCJjZW50ZXIiLCJzdG9wT25SZXNpemUiLCJyZW1vdmVPbkludGVycnVwdCIsInJlbW92ZU9uQ29tcGxldGUiLCJpbnRlcnJ1cHQiLCJjb250YWluZXIiLCJzY2FsZSIsIngiLCJ5IiwicmVtb3ZlUGx1Z2luIiwiZm9yY2VTdGFydCIsInNuYXBwaW5nIiwidG8iLCJlbWl0IiwiZWxhcHNlZCIsInBhdXNlZCIsImNvdW50RG93blBvaW50ZXJzIiwib2xkQ2VudGVyIiwidXBkYXRlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxzQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLHdIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLEtBQUwsR0FBYUQsUUFBUUMsS0FBckI7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsWUFBSSxNQUFLRCxLQUFMLEdBQWEsQ0FBakIsRUFDQTtBQUNJLGtCQUFLRSxPQUFMLEdBQWVKLE9BQU9LLFlBQVAsR0FBc0IsTUFBS0gsS0FBMUM7QUFDSDtB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Q0QseUJBQUtyQixNQUFMLENBQVl5QixJQUFaLENBQWlCLGVBQWpCLEVBQWtDLEtBQUt6QixNQUF2QztBQUNBLHlCQUFLdUIsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0Qsb0JBQU1RLFFBQVEsS0FBSy9CLE1BQUwsQ0FBWWdDLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLG9CQUFJRCxLQUFKLEVBQ0E7QUFDSUEsMEJBQU1BLEtBQU47QUFDSDtBQUNELG9CQUFJLENBQUMsS0FBS25CLE1BQVYsRUFDQTtBQUNJLHlCQUFLWixNQUFMLENBQVlpQyxVQUFaLENBQXVCSixTQUF2QjtBQUNILGlCQUhELE1BS0E7QUFDSSx5QkFBSzdCLE1BQUwsQ0FBWWlDLFVBQVosQ0FBdUIsS0FBS3JCLE1BQTVCO0FBQ0g7QUFDSjtBQUNKO0FBaEpMO0FBQUE7QUFBQSxpQ0FtSkk7QUFDSSxpQkFBS1csUUFBTCxHQUFnQixJQUFoQjtBQUNBO0FBQ0g7QUF0Skw7O0FBQUE7QUFBQSxFQUF3QzdCLE1BQXhDIiwiZmlsZSI6InNuYXAtem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgRWFzZSA9IHJlcXVpcmUoJ3BpeGktZWFzZScpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNuYXBab29tIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIHpvb21cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIGZpdCBhbmltYXRpb24gc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgZml0IHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICogQGV2ZW50IHNuYXAtem9vbS1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGZpdCByZWFjaGVzIGl0cyB0YXJnZXRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLndpZHRoID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueF9zY2FsZSA9IHBhcmVudC5fc2NyZWVuV2lkdGggLyB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhlaWdodCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnlfc2NhbGUgPSBwYXJlbnQuX3NjcmVlbkhlaWdodCAvIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueEluZGVwZW5kZW50ID0gZXhpc3RzKHRoaXMueF9zY2FsZSlcclxuICAgICAgICB0aGlzLnlJbmRlcGVuZGVudCA9IGV4aXN0cyh0aGlzLnlfc2NhbGUpXHJcbiAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy54SW5kZXBlbmRlbnQgPyB0aGlzLnhfc2NhbGUgOiB0aGlzLnlfc2NhbGVcclxuICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnlJbmRlcGVuZGVudCA/IHRoaXMueV9zY2FsZSA6IHRoaXMueF9zY2FsZVxyXG5cclxuICAgICAgICB0aGlzLnRpbWUgPSBleGlzdHMob3B0aW9ucy50aW1lKSA/IG9wdGlvbnMudGltZSA6IDEwMDBcclxuICAgICAgICB0aGlzLmVhc2UgPSBvcHRpb25zLmVhc2UgfHwgJ2Vhc2VJbk91dFNpbmUnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMuc3RvcE9uUmVzaXplID0gb3B0aW9ucy5zdG9wT25SZXNpemVcclxuICAgICAgICB0aGlzLnJlbW92ZU9uSW50ZXJydXB0ID0gb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdFxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25Db21wbGV0ZSA9IGV4aXN0cyhvcHRpb25zLnJlbW92ZU9uQ29tcGxldGUpID8gb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gZXhpc3RzKG9wdGlvbnMuaW50ZXJydXB0KSA/IG9wdGlvbnMuaW50ZXJydXB0IDogdHJ1ZVxyXG4gICAgICAgIGlmICh0aGlzLnRpbWUgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwYXJlbnQuY29udGFpbmVyLnNjYWxlLnggPSB0aGlzLnhfc2NhbGVcclxuICAgICAgICAgICAgcGFyZW50LmNvbnRhaW5lci5zY2FsZS55ID0gdGhpcy55X3NjYWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU9uQ29tcGxldGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZvcmNlU3RhcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbmV3IEVhc2UudG8odGhpcy5wYXJlbnQuc2NhbGUsIHsgeDogdGhpcy54X3NjYWxlLCB5OiB0aGlzLnlfc2NhbGUgfSwgdGhpcy50aW1lLCB7IGVhc2U6IHRoaXMuZWFzZSB9KVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXpvb20tc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnhfc2NhbGUgPSB0aGlzLnBhcmVudC5fc2NyZWVuV2lkdGggLyB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhlaWdodCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnBhcmVudC5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy54SW5kZXBlbmRlbnQgPyB0aGlzLnhfc2NhbGUgOiB0aGlzLnlfc2NhbGVcclxuICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnlJbmRlcGVuZGVudCA/IHRoaXMueV9zY2FsZSA6IHRoaXMueF9zY2FsZVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZU9uSW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwLXpvb20nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQgJiYgdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSAhPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9sZENlbnRlclxyXG4gICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRDZW50ZXIgPSB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjYWxlLnggIT09IHRoaXMueF9zY2FsZSB8fCB0aGlzLnBhcmVudC5zY2FsZS55ICE9PSB0aGlzLnlfc2NhbGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBuZXcgRWFzZS50byh0aGlzLnBhcmVudC5zY2FsZSwgeyB4OiB0aGlzLnhfc2NhbGUsIHk6IHRoaXMueV9zY2FsZSB9LCB0aGlzLnRpbWUsIHsgZWFzZTogdGhpcy5lYXNlIH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXpvb20tc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc25hcHBpbmcudXBkYXRlKGVsYXBzZWQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkNvbXBsZXRlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtem9vbS1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcihvbGRDZW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICBzdXBlci5yZXN1bWUoKVxyXG4gICAgfVxyXG59Il19