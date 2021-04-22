require('./node-shim');
const assert = require('chai').assert;
const Viewport = require('../').Viewport;

describe('mouseEdges', () =>
{
    it('default options', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 });

        viewport.mouseEdges();
        const mouseEdges = viewport.plugins.get('mouse-edges');

        assert.isNull(mouseEdges.options.radius);
        assert.isNull(mouseEdges.options.distance);
        assert.isNull(mouseEdges.options.top);
        assert.isNull(mouseEdges.options.bottom);
        assert.isNull(mouseEdges.options.left);
        assert.isNull(mouseEdges.options.right);
        assert.equal(mouseEdges.options.speed, 8);
        assert.equal(mouseEdges.reverse, -1);
        assert.isFalse(mouseEdges.options.noDecelerate);
        assert.isFalse(mouseEdges.options.linear);
        assert.isFalse(mouseEdges.options.allowButtons);
        viewport.destroy();
    });

    it('options', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 });

        viewport.mouseEdges();
        const mouseEdges = viewport.plugins.get('mouse-edges');

        assert.isNull(mouseEdges.options.radius);
        assert.isNull(mouseEdges.options.distance);
        assert.isNull(mouseEdges.options.top);
        assert.isNull(mouseEdges.options.bottom);
        assert.isNull(mouseEdges.options.left);
        assert.isNull(mouseEdges.options.right);
        assert.equal(mouseEdges.options.speed, 8);
        assert.isFalse(mouseEdges.options.reverse);
        assert.isFalse(mouseEdges.options.noDecelerate);
        assert.isFalse(mouseEdges.options.linear);
        assert.isFalse(mouseEdges.options.allowButtons);
        viewport.destroy();
    });
});
