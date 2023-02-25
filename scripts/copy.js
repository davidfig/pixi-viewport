import { copy as _copy } from 'fs-extra';
import { join } from 'path';

const FILES = ['pixi_viewport.js', 'pixi_viewport.umd.cjs'];

const FROM = 'dist';
const TO = 'docs/dist';

async function copy()
{
    for (const file of FILES)
    {
        await _copy(join(FROM, file), join(TO, file));
    }
    // eslint-disable-next-line no-console
    console.log('copied viewport.* to docs/dist/');

    await _copy('docs/public', TO);

    // eslint-disable-next-line no-console
    console.log('copied docs/public/.* to docs/dist/');

    process.exit(0);
}

copy();
