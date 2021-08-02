const fs = require('fs-extra');
const path = require('path');

const FILES = ['cjs/viewport.js', 'cjs/viewport.js.map', 'viewport.min.js', 'viewport.min.js.map'];

const FROM = 'dist';
const TO = 'docs';

async function copy()
{
    for (const file of FILES)
    {
        await fs.copy(path.join(FROM, file), path.join(TO, file));
    }
    console.log('copied viewport.* to docs/');
    process.exit(0);
}

copy();
