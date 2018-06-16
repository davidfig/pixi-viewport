'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var utils = require('./utils');

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
        _this.xIndependent = utils.exists(_this.x_scale);
        _this.yIndependent = utils.exists(_this.y_scale);
        _this.x_scale = _this.xIndependent ? _this.x_scale : _this.y_scale;
        _this.y_scale = _this.yIndependent ? _this.y_scale : _this.x_scale;

        _this.time = utils.defaults(options.time, 1000);
        _this.ease = utils.ease(options.ease, 'easeInOutSine');
        _this.center = options.center;
        _this.stopOnResize = options.stopOnResize;
        _this.removeOnInterrupt = options.removeOnInterrupt;
        _this.removeOnComplete = utils.defaults(options.removeOnComplete, true);
        _this.interrupt = utils.defaults(options.interrupt, true);
        if (_this.time === 0) {
            parent.container.scale.x = _this.x_scale;
            parent.container.scale.y = _this.y_scale;
            if (_this.removeOnComplete) {
                _this.parent.removePlugin('snap-zoom');
            }
        } else if (options.forceStart) {
            _this.createSnapping();
        }
        return _this;
    }

    _createClass(SnapZoom, [{
        key: 'createSnapping',
        value: function createSnapping() {
            var scale = this.parent.scale;
            this.snapping = { time: 0, startX: scale.x, startY: scale.y, deltaX: this.x_scale - scale.x, deltaY: this.y_scale - scale.y };
            this.parent.emit('snap-zoom-start', this.parent);
        }
    }, {
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
        key: 'wheel',
        value: function wheel() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap-zoom');
            }
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
                    this.createSnapping();
                }
            } else if (this.snapping) {
                var snapping = this.snapping;
                snapping.time += elapsed;
                if (snapping.time >= this.time) {
                    this.parent.scale.set(this.x_scale, this.y_scale);
                    if (this.removeOnComplete) {
                        this.parent.removePlugin('snap-zoom');
                    }
                    this.parent.emit('snap-zoom-end', this.parent);
                    this.snapping = null;
                } else {
                    var _snapping = this.snapping;
                    this.parent.scale.x = this.ease(_snapping.time, _snapping.startX, _snapping.deltaX, this.time);
                    this.parent.scale.y = this.ease(_snapping.time, _snapping.startY, _snapping.deltaY, this.time);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLXpvb20uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsInV0aWxzIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ3aWR0aCIsImhlaWdodCIsInhfc2NhbGUiLCJfc2NyZWVuV2lkdGgiLCJ5X3NjYWxlIiwiX3NjcmVlbkhlaWdodCIsInhJbmRlcGVuZGVudCIsImV4aXN0cyIsInlJbmRlcGVuZGVudCIsInRpbWUiLCJkZWZhdWx0cyIsImVhc2UiLCJjZW50ZXIiLCJzdG9wT25SZXNpemUiLCJyZW1vdmVPbkludGVycnVwdCIsInJlbW92ZU9uQ29tcGxldGUiLCJpbnRlcnJ1cHQiLCJjb250YWluZXIiLCJzY2FsZSIsIngiLCJ5IiwicmVtb3ZlUGx1Z2luIiwiZm9yY2VTdGFydCIsImNyZWF0ZVNuYXBwaW5nIiwic25hcHBpbmciLCJzdGFydFgiLCJzdGFydFkiLCJkZWx0YVgiLCJkZWx0YVkiLCJlbWl0IiwiZWxhcHNlZCIsInBhdXNlZCIsImNvdW50RG93blBvaW50ZXJzIiwib2xkQ2VudGVyIiwic2V0IiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxRQUFTRCxRQUFRLFNBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkEsc0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSx3SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxLQUFMLEdBQWFELFFBQVFDLEtBQXJCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLFlBQUksTUFBS0QsS0FBTCxHQUFhLENBQWpCLEVBQ0E7QUFDSSxrQkFBS0UsT0FBTCxHQUFlSixPQUFPSyxZQUFQ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NUtMOztBQUFBO0FBQUEsRUFBd0MvQixNQUF4QyIsImZpbGUiOiJzbmFwLXpvb20uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTbmFwWm9vbSBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMucmVtb3ZlT25Db21wbGV0ZV0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBhZnRlciBzbmFwcGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdF0gcmVtb3ZlcyB0aGlzIHBsdWdpbiBpZiBpbnRlcnJ1cHRlZCBieSBhbnkgdXNlciBpbnB1dFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mb3JjZVN0YXJ0XSBzdGFydHMgdGhlIHNuYXAgaW1tZWRpYXRlbHkgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB2aWV3cG9ydCBpcyBhdCB0aGUgZGVzaXJlZCB6b29tXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHNuYXAtem9vbS1zdGFydChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgYSBmaXQgYW5pbWF0aW9uIHN0YXJ0c1xyXG4gICAgICogQGV2ZW50IHNuYXAtem9vbS1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGZpdCByZWFjaGVzIGl0cyB0YXJnZXRcclxuICAgICAqIEBldmVudCBzbmFwLXpvb20tZW5kKFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBmaXQgcmVhY2hlcyBpdHMgdGFyZ2V0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aFxyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHRcclxuICAgICAgICBpZiAodGhpcy53aWR0aCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnhfc2NhbGUgPSBwYXJlbnQuX3NjcmVlbldpZHRoIC8gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5oZWlnaHQgPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy55X3NjYWxlID0gcGFyZW50Ll9zY3JlZW5IZWlnaHQgLyB0aGlzLmhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnhJbmRlcGVuZGVudCA9IHV0aWxzLmV4aXN0cyh0aGlzLnhfc2NhbGUpXHJcbiAgICAgICAgdGhpcy55SW5kZXBlbmRlbnQgPSB1dGlscy5leGlzdHModGhpcy55X3NjYWxlKVxyXG4gICAgICAgIHRoaXMueF9zY2FsZSA9IHRoaXMueEluZGVwZW5kZW50ID8gdGhpcy54X3NjYWxlIDogdGhpcy55X3NjYWxlXHJcbiAgICAgICAgdGhpcy55X3NjYWxlID0gdGhpcy55SW5kZXBlbmRlbnQgPyB0aGlzLnlfc2NhbGUgOiB0aGlzLnhfc2NhbGVcclxuXHJcbiAgICAgICAgdGhpcy50aW1lID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50aW1lLCAxMDAwKVxyXG4gICAgICAgIHRoaXMuZWFzZSA9IHV0aWxzLmVhc2Uob3B0aW9ucy5lYXNlLCAnZWFzZUluT3V0U2luZScpXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMuc3RvcE9uUmVzaXplID0gb3B0aW9ucy5zdG9wT25SZXNpemVcclxuICAgICAgICB0aGlzLnJlbW92ZU9uSW50ZXJydXB0ID0gb3B0aW9ucy5yZW1vdmVPbkludGVycnVwdFxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25Db21wbGV0ZSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMucmVtb3ZlT25Db21wbGV0ZSwgdHJ1ZSlcclxuICAgICAgICB0aGlzLmludGVycnVwdCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuaW50ZXJydXB0LCB0cnVlKVxyXG4gICAgICAgIGlmICh0aGlzLnRpbWUgPT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwYXJlbnQuY29udGFpbmVyLnNjYWxlLnggPSB0aGlzLnhfc2NhbGVcclxuICAgICAgICAgICAgcGFyZW50LmNvbnRhaW5lci5zY2FsZS55ID0gdGhpcy55X3NjYWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU9uQ29tcGxldGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmZvcmNlU3RhcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNuYXBwaW5nKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU25hcHBpbmcoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5wYXJlbnQuc2NhbGVcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0geyB0aW1lOiAwLCBzdGFydFg6IHNjYWxlLngsIHN0YXJ0WTogc2NhbGUueSwgZGVsdGFYOiB0aGlzLnhfc2NhbGUgLSBzY2FsZS54LCBkZWx0YVk6IHRoaXMueV9zY2FsZSAtIHNjYWxlLnkgfVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtem9vbS1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2lkdGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy5wYXJlbnQuX3NjcmVlbldpZHRoIC8gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5oZWlnaHQgPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy55X3NjYWxlID0gdGhpcy5wYXJlbnQuX3NjcmVlbkhlaWdodCAvIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueF9zY2FsZSA9IHRoaXMueEluZGVwZW5kZW50ID8gdGhpcy54X3NjYWxlIDogdGhpcy55X3NjYWxlXHJcbiAgICAgICAgdGhpcy55X3NjYWxlID0gdGhpcy55SW5kZXBlbmRlbnQgPyB0aGlzLnlfc2NhbGUgOiB0aGlzLnhfc2NhbGVcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25JbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlbW92ZU9uSW50ZXJydXB0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwLXpvb20nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbnRlcnJ1cHQgJiYgdGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSAhPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9sZENlbnRlclxyXG4gICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRDZW50ZXIgPSB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnNuYXBwaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjYWxlLnggIT09IHRoaXMueF9zY2FsZSB8fCB0aGlzLnBhcmVudC5zY2FsZS55ICE9PSB0aGlzLnlfc2NhbGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlU25hcHBpbmcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwcGluZyA9IHRoaXMuc25hcHBpbmdcclxuICAgICAgICAgICAgc25hcHBpbmcudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIGlmIChzbmFwcGluZy50aW1lID49IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUuc2V0KHRoaXMueF9zY2FsZSwgdGhpcy55X3NjYWxlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXpvb20tZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hcHBpbmcgPSB0aGlzLnNuYXBwaW5nXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ID0gdGhpcy5lYXNlKHNuYXBwaW5nLnRpbWUsIHNuYXBwaW5nLnN0YXJ0WCwgc25hcHBpbmcuZGVsdGFYLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ID0gdGhpcy5lYXNlKHNuYXBwaW5nLnRpbWUsIHNuYXBwaW5nLnN0YXJ0WSwgc25hcHBpbmcuZGVsdGFZLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcihvbGRDZW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICBzdXBlci5yZXN1bWUoKVxyXG4gICAgfVxyXG59Il19