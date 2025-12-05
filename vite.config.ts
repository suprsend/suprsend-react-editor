import { defineConfig, loadEnv, type LibraryFormats } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts';
import pkg from './package.json';
import path from 'path';
import type { PreRenderedAsset } from 'rollup';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const CJSBuild = env.BUILD_TARGET?.toLocaleLowerCase()?.match('cjs');
  const formats: LibraryFormats[] = CJSBuild ? ['cjs'] : ['es'];

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react({
        jsxRuntime: 'classic',
        babel: {
          plugins: ['react-require'],
        },
      }),
      svgr(),
      dts({
        outDir: 'dist/types',
        tsconfigPath: './tsconfig.app.json',
      }),
    ],
    build: {
      outDir: CJSBuild ? 'dist/cjs' : 'dist/es',
      sourcemap: true,
      copyPublicDir: false,
      lib: {
        entry: 'src',
        fileName: `[name]`,
        name: 'SuprSend',
        formats,
      },
      rollupOptions: {
        external: [...Object.keys(pkg.dependencies || {}), 'react'],
        output: {
          globals: {
            react: 'React',
          },
          assetFileNames: (assetInfo: PreRenderedAsset) => {
            return assetInfo.name && assetInfo.name.endsWith('.css')
              ? 'styles.css'
              : '[name][extname]';
          },
        },
      },
    },
  };
});
