import { defineConfig, loadEnv, type LibraryFormats } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts';
import pkg from './package.json';
import path from 'path';
import type { PreRenderedAsset } from 'rollup';
import { visualizer } from 'rollup-plugin-visualizer';

const deps: string[] = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const patterns: RegExp[] = [/^@codemirror\//, /^@lezer\//, /^@babel\/runtime/];

function isExternal(id: string): boolean {
  if (deps.some((dep) => id === dep || id.startsWith(`${dep}/`))) return true;
  if (patterns.some((re) => re.test(id))) return true;
  return false;
}

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
      visualizer({
        open: true, // auto-open in browser
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
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
        external: isExternal,
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
