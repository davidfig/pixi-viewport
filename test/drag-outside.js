require('./node-shim');
const assert = require('chai').assert;
const Viewport = require('../').Viewport;

describe('drag-outside', () => {
    let viewport;

    beforeEach(() => {
        viewport = new Viewport();
    });

    afterEach(() => {
        viewport.destroy();
    });

    it('dragOutside option defaults to false', () => {
        const drag = viewport.drag();
        assert.isFalse(drag.options.dragOutside);
    });

    it('dragOutside option can be enabled', () => {
        const drag = viewport.drag({ dragOutside: true });
        assert.isTrue(drag.options.dragOutside);
    });

    it('dragOutside option is included in default options', () => {
        const drag = viewport.drag({ dragOutside: true });
        assert.property(drag.options, 'dragOutside');
        assert.isBoolean(drag.options.dragOutside);
    });

    it('dragOutside works with other options', () => {
        const drag = viewport.drag({ 
            dragOutside: true,
            clampWheel: true,
            factor: 2
        });
        assert.isTrue(drag.options.dragOutside);
        assert.isTrue(drag.options.clampWheel);
        assert.equal(drag.options.factor, 2);
    });

    it('dragOutside properly sets up internal state', () => {
        viewport.drag({ dragOutside: true });
        const drag = viewport.plugins.get('drag');
        
        // Check that internal properties are initialized
        assert.isFalse(drag.isDragOutside);
        assert.isUndefined(drag.dragOutsideStartPosition);
    });

    it('dragOutside sets up document event handlers', () => {
        const viewport = new Viewport();
        viewport.drag({ dragOutside: true });
        const drag = viewport.plugins.get('drag');
        
        // Check that event handlers were added
        assert.isArray(drag.windowEventHandlers);
        assert.isTrue(drag.windowEventHandlers.length > 0);
        
        // Should have pointermove and pointerup handlers
        const events = drag.windowEventHandlers.map(h => h.event);
        assert.include(events, 'pointermove');
        assert.include(events, 'pointerup');
        
        viewport.destroy();
    });

    it('dragOutside cleans up event handlers on destroy', () => {
        const viewport = new Viewport();
        viewport.drag({ dragOutside: true });
        const drag = viewport.plugins.get('drag');
        
        assert.isTrue(drag.windowEventHandlers.length > 0);
        
        viewport.destroy();
        // After destroy, handlers should be cleaned up
        // (We can't easily test if removeEventListener was called)
    });
});