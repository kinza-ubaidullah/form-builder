// vite.config.ts
import { defineConfig } from "file:///D:/projects/form-builder/node_modules/vite/dist/node/index.js";
import react from "file:///D:/projects/form-builder/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///D:/projects/form-builder/node_modules/vite-plugin-svgr/dist/index.js";
import path from "path";
import {
  miaodaDevPlugin,
  makeTagger,
  injectedGuiListenerPlugin,
  injectOnErrorPlugin
} from "file:///D:/projects/form-builder/node_modules/miaoda-sc-plugin/dist/index.js";
var __vite_injected_original_dirname = "D:\\projects\\form-builder";
var vite_config_default = defineConfig({
  plugins: [
    makeTagger(),
    injectedGuiListenerPlugin({
      path: "https://miaoda-resource-static.s3cdn.medo.dev/common/v2/injected.js"
    }),
    injectOnErrorPlugin(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent"
      }
    }),
    miaodaDevPlugin(),
    {
      name: "hmr-toggle",
      configureServer(server) {
        let hmrEnabled = true;
        const _send = server.ws.send;
        server.ws.send = (payload) => {
          if (hmrEnabled) {
            return _send.call(server.ws, payload);
          } else {
            console.log("[HMR disabled] skipped payload:", payload.type);
          }
        };
        server.middlewares.use("/innerapi/v1/sourcecode/__hmr_off", (_req, res) => {
          hmrEnabled = false;
          let body = { status: 0, msg: "HMR disabled" };
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        });
        server.middlewares.use("/innerapi/v1/sourcecode/__hmr_on", (_req, res) => {
          hmrEnabled = true;
          let body = { status: 0, msg: "HMR enabled" };
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        });
        server.middlewares.use("/innerapi/v1/sourcecode/__hmr_reload", (_req, res) => {
          if (hmrEnabled) {
            server.ws.send({
              type: "full-reload",
              path: "*"
              // Full reload
            });
          }
          res.statusCode = 200;
          let body = { status: 0, msg: "Manual full reload triggered" };
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        });
      },
      load(id) {
        if (id === "virtual:after-update") {
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
              tag: "script",
              attrs: {
                type: "module",
                src: "/@id/virtual:after-update"
              },
              injectTo: "body"
            }
          ]
        };
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwcm9qZWN0c1xcXFxmb3JtLWJ1aWxkZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHByb2plY3RzXFxcXGZvcm0tYnVpbGRlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovcHJvamVjdHMvZm9ybS1idWlsZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIG1pYW9kYURldlBsdWdpbixcbiAgbWFrZVRhZ2dlcixcbiAgaW5qZWN0ZWRHdWlMaXN0ZW5lclBsdWdpbixcbiAgaW5qZWN0T25FcnJvclBsdWdpblxufSBmcm9tIFwibWlhb2RhLXNjLXBsdWdpblwiO1xuXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBtYWtlVGFnZ2VyKCksXG4gICAgaW5qZWN0ZWRHdWlMaXN0ZW5lclBsdWdpbih7XG4gICAgICBwYXRoOiAnaHR0cHM6Ly9taWFvZGEtcmVzb3VyY2Utc3RhdGljLnMzY2RuLm1lZG8uZGV2L2NvbW1vbi92Mi9pbmplY3RlZC5qcydcbiAgICB9KSxcbiAgICBpbmplY3RPbkVycm9yUGx1Z2luKCksXG4gICAgcmVhY3QoKSxcbiAgICBzdmdyKHtcbiAgICAgIHN2Z3JPcHRpb25zOiB7XG4gICAgICAgIGljb246IHRydWUsXG4gICAgICAgIGV4cG9ydFR5cGU6ICduYW1lZCcsXG4gICAgICAgIG5hbWVkRXhwb3J0OiAnUmVhY3RDb21wb25lbnQnLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBtaWFvZGFEZXZQbHVnaW4oKSBhcyBhbnksXG4gICAge1xuICAgICAgbmFtZTogJ2htci10b2dnbGUnLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICBsZXQgaG1yRW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gV3JhcCBvcmlnaW5hbCBzZW5kIG1ldGhvZFxuICAgICAgICBjb25zdCBfc2VuZCA9IHNlcnZlci53cy5zZW5kO1xuICAgICAgICBzZXJ2ZXIud3Muc2VuZCA9IChwYXlsb2FkOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoaG1yRW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZW5kLmNhbGwoc2VydmVyLndzLCBwYXlsb2FkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tITVIgZGlzYWJsZWRdIHNraXBwZWQgcGF5bG9hZDonLCBwYXlsb2FkLnR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBUEkgdG8gdG9nZ2xlIEhNUlxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvaW5uZXJhcGkvdjEvc291cmNlY29kZS9fX2htcl9vZmYnLCAoX3JlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgaG1yRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgIGxldCBib2R5ID0geyBzdGF0dXM6IDAsIG1zZzogJ0hNUiBkaXNhYmxlZCcgfTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvaW5uZXJhcGkvdjEvc291cmNlY29kZS9fX2htcl9vbicsIChfcmVxLCByZXMpID0+IHtcbiAgICAgICAgICBobXJFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgYm9keSA9IHsgc3RhdHVzOiAwLCBtc2c6ICdITVIgZW5hYmxlZCcgfTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYW51YWwgZnVsbCByZWxvYWQgQVBJXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9pbm5lcmFwaS92MS9zb3VyY2Vjb2RlL19faG1yX3JlbG9hZCcsIChfcmVxLCByZXMpID0+IHtcbiAgICAgICAgICBpZiAoaG1yRW5hYmxlZCkge1xuICAgICAgICAgICAgc2VydmVyLndzLnNlbmQoe1xuICAgICAgICAgICAgICB0eXBlOiAnZnVsbC1yZWxvYWQnLFxuICAgICAgICAgICAgICBwYXRoOiAnKicsIC8vIEZ1bGwgcmVsb2FkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICAgICAgbGV0IGJvZHkgPSB7IHN0YXR1czogMCwgbXNnOiAnTWFudWFsIGZ1bGwgcmVsb2FkIHRyaWdnZXJlZCcgfTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBsb2FkKGlkKSB7XG4gICAgICAgIGlmIChpZCA9PT0gJ3ZpcnR1YWw6YWZ0ZXItdXBkYXRlJykge1xuICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICBpZiAoaW1wb3J0Lm1ldGEuaG90KSB7XG4gICAgICAgICAgICAgIGltcG9ydC5tZXRhLmhvdC5vbigndml0ZTphZnRlclVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnZWRpdG9yLXVwZGF0ZScgfSwgJyonKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHRtbCxcbiAgICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRhZzogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ21vZHVsZScsXG4gICAgICAgICAgICAgICAgc3JjOiAnL0BpZC92aXJ0dWFsOmFmdGVyLXVwZGF0ZSdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgaW5qZWN0VG86ICdib2R5J1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdRLFNBQVMsb0JBQW9CO0FBQzdSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxVQUFVO0FBQ2pCO0FBQUEsRUFDRTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLE9BQ0s7QUFUUCxJQUFNLG1DQUFtQztBQVl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxXQUFXO0FB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
