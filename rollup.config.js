import { main } from '@pixi-build-tools/rollup-configurator/main';

export default main({
    excludeExternals: ['penner'],
    production: true,
});
