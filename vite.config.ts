import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import {
  miaodaDevPlugin,
  makeTagger,
  injectedGuiListenerPlugin,
  injectOnErrorPlugin
} from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    makeTagger(),
    injectedGuiListenerPlugin({
      path: 'https://miaoda-resource-static.s3cdn.medo.dev/common/v2/injected.js'
    }),
    injectOnErrorPlugin(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
    miaodaDevPlugin() as any,
    {
      name: 'hmr-toggle',
      configureServer(server) {
        let hmrEnabled = true;

        // Wrap original send method
        const _send = server.ws.send;
        server.ws.send = (payload: any) => {
          if (hmrEnabled) {
            return _send.call(server.ws, payload);
          } else {
            console.log('[HMR disabled] skipped payload:', payload.type);
          }
        };

        // API to toggle HMR
        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_off', (_req, res) => {
          hmrEnabled = false;
          let body = { status: 0, msg: 'HMR disabled' };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        });

        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_on', (_req, res) => {
          hmrEnabled = true;
          let body = { status: 0, msg: 'HMR enabled' };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        });

        // Manual full reload API
        server.middlewares.use('/innerapi/v1/sourcecode/__hmr_reload', (_req, res) => {
          if (hmrEnabled) {
            server.ws.send({
              type: 'full-reload',
              path: '*', // Full reload
            });
          }
          res.statusCode = 200;
          let body = { status: 0, msg: 'Manual full reload triggered' };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        });
      },
      load(id) {
        if (id === 'virtual:after-update') {
          return `
            if (import.meta.hot) {
              import.meta.hot.on('vite:afterUpdate', () => {
                window.postMessage({ type: 'editor-update' }, '*');
              });
            }
          `;
        }
      },
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                type: 'module',
                src: '/@id/virtual:after-update'
              },
              injectTo: 'body'
            }
          ]
        };
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
