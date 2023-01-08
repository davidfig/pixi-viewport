const fs = require('fs-extra');
const path = require('path');

const FILES = ['cjs/viewport.js', 'cjs/viewport.js.map', 'viewport.min.js', 'viewport.min.js.map'];

const FROM = 'dist';
const TO = 'docs/dist';

async function copy()
{
    for (const file of FILES)
    {
        await fs.copy(path.join(FROM, file), path.join(TO, file));
    }
    // eslint-disable-next-line no-console
    console.log('copied viewport.* to docs/dist/');

    await fs.copy('docs/public', TO);

    // eslint-disable-next-line no-console
    console.log('copied docs/public/.* to docs/dist/');

    process.exit(0);
}

copy();
