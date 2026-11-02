import { build } from 'rolldown';
import { mkdir } from 'node:fs/promises';
await mkdir('.checks',{recursive:true});
await build({input:'scripts/check-motion.ts',platform:'node',external:['three'],output:{file:'.checks/motion.mjs',format:'esm'}});
await import('../.checks/motion.mjs?'+Date.now());
