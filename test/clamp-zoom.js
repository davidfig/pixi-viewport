require('./node-shim');
const assert = require('chai').assert;
const Viewport = require('../').Viewport;

describe('pixi-viewport', () =>
{
    it('clampZoom with default options', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 100, worldWidth: 200, worldHeight: 200 });

        viewport.clampZoom();
        const clampZoom = viewport.plugins.get('clamp-zoom');

        assert.isNull(clampZoom.options.minWidth);
        assert.isNull(clampZoom.options.minHeight);
        assert.isNull(clampZoom.options.maxWidth);
        assert.isNull(clampZoom.options.maxHeight);
        assert.isNull(clampZoom.options.minScale);
        assert.isNull(clampZoom.options.maxScale);
        viewport.destroy();
    });

    it('clampZoom with minScale/maxScale', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 100, worldWidth: 200, worldHeight: 200 });

        viewport.clampZoom({ minScale: 0.25 });
        viewport.setZoom(0.15);
        assert.equal(viewport.scale.x, 0.25);
        assert.equal(viewport.scale.y, 0.25);
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 0.3);
        assert.equal(viewport.scale.y, 0.3);
        viewport.clampZoom({ maxScale: 2 });
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 2);
        assert.equal(viewport.scale.y, 2);
        viewport.setZoom(1.8);
        assert.equal(viewport.scale.x, 1.8);
        assert.equal(viewport.scale.y, 1.8);

        viewport.clampZoom({ minScale: 0.5, maxScale: 2 });
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 0.5);
        assert.equal(viewport.scale.y, 0.5);
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 2);
        assert.equal(viewport.scale.y, 2);
        viewport.setZoom(1.2);
        assert.equal(viewport.scale.x, 1.2);
        assert.equal(viewport.scale.y, 1.2);

        viewport.clampZoom({ minScale: { x: 1 }, maxScale: { x: 1 } });
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 0.3);
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 3);
        viewport.setZoom(1.2);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 1.2);
        viewport.clampZoom({ minScale: { y: 1 }, maxScale: { y: 1 } });
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 0.3);
        assert.equal(viewport.scale.y, 1);
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 3);
        assert.equal(viewport.scale.y, 1);
        viewport.setZoom(1.2);
        assert.equal(viewport.scale.x, 1.2);
        assert.equal(viewport.scale.y, 1);
        viewport.clampZoom({ minScale: { x: 1, y: 0.5 }, maxScale: { x: 1, y: 2 } });
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 0.5);
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 2);
        viewport.setZoom(1.2);
        assert.equal(viewport.scale.x, 1);
        assert.equal(viewport.scale.y, 1.2);
        viewport.clampZoom({ minScale: { x: 0.5, y: 1 }, maxScale: { x: 2, y: 1 } });
        viewport.setZoom(0.3);
        assert.equal(viewport.scale.x, 0.5);
        assert.equal(viewport.scale.y, 1);
        viewport.setZoom(3);
        assert.equal(viewport.scale.x, 2);
        assert.equal(viewport.scale.y, 1);
        viewport.setZoom(1.2);
        assert.equal(viewport.scale.x, 1.2);
        assert.equal(viewport.scale.y, 1);
        viewport.destroy();
    });

    it('clampZoom with min/max Width/Height', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 100, worldWidth: 200, worldHeight: 200 });

        viewport.clampZoom({ minWidth: 50 });
        viewport.fitWidth(25);
        assert.equal(viewport.worldScreenWidth, 50);
        viewport.fitWidth(60);
        assert.equal(viewport.worldScreenWidth, 60);

        viewport.clampZoom({ maxWidth: 100 });
        viewport.fitWidth(200);
        assert.equal(viewport.worldScreenWidth, 100);
        viewport.fitWidth(75);
        assert.equal(viewport.worldScreenWidth, 75);

        viewport.clampZoom({ minHeight: 50 });
        viewport.fitHeight(25);
        assert.equal(viewport.worldScreenHeight, 50);
        viewport.fitHeight(60);
        assert.equal(viewport.worldScreenHeight, 60);

        viewport.clampZoom({ maxHeight: 100 });
        viewport.fitHeight(200);
        assert.equal(viewport.worldScreenHeight, 100);
        viewport.fitHeight(75);
        assert.equal(viewport.worldScreenHeight, 75);

        viewport.clampZoom({ minWidth: 10, minHeight: 20, maxWidth: 100, maxHeight: 150 });
        viewport.fitWidth(5);
        assert.equal(viewport.worldScreenWidth, 20);
        viewport.fitWidth(110);
        assert.equal(viewport.worldScreenWidth, 100);
        viewport.fitHeight(10);
        assert.equal(viewport.worldScreenHeight, 20);
        viewport.fitHeight(160);
        assert.equal(viewport.worldScreenHeight, 100);

        viewport.destroy();
    });
});
