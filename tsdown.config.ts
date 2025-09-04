import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: 'src/index.ts',
    outDir: 'dist/esm',
    format: ['esm'],
    fixedExtension: true,
    unbundle: true,
    dts: false,
  },
  {
    entry: 'src/index.ts',
    outDir: 'dist/cjs',
    format: ['cjs'],
    unbundle: true,
    dts: false,
  },
  {
    entry: 'src/index.ts',
    outDir: 'dist/typings',
    format: ['esm'],
    unbundle: true,
    dts: {
      emitDtsOnly: true,
    },
  },
]);
