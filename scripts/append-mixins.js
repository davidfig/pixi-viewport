// Addes a reference to global.d.ts to the top of index.d.ts

import fs from 'fs';

const INDEX_D_TS = './dist/index.d.ts';

const data = fs.readFileSync(INDEX_D_TS);
const fd = fs.openSync(INDEX_D_TS, 'w+');
const buffer = Buffer.from('///<reference path="./global.d.ts" />\n');

fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, data, 0, data.length, buffer.length);
fs.close(fd);
