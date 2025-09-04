import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: 'src/index.ts',
    outDir: 'dist/esm',
    format: ['esm'],
    fixedExtension: true,
    unbundle: true,
    treeshake: false,
    dts: false,
  },
  {
    entry: 'src/index.ts',
    outDir: 'dist/cjs',
    format: ['cjs'],
    unbundle: true,
    treeshake: false,
    dts: false,
  },
  {
    entry: 'src/**/*.ts',
    outDir: 'dist/typings',
    format: ['esm', 'cjs'],
    unbundle: true,
    treeshake: false,
    clean: true,
    dts: {
      emitDtsOnly: true,
    },
  },
]);
