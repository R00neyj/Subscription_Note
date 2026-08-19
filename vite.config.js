import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { SITE_URL } from "./site.config.js";

// index.html 의 canonical / og:url / twitter:url 을 site.config.js 값으로 치환한다.
// 도메인이 배포 산출물 여러 곳에 흩어지지 않도록 단일 출처를 유지하기 위함.
const injectSiteUrl = () => ({
  name: "inject-site-url",
  transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", SITE_URL),
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    injectSiteUrl(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', '*.svg', '*.png'],
      manifest: {
        name: '구독노트 - 스마트한 구독 관리',
        short_name: '구독노트',
        description: '나의 모든 구독 서비스를 한눈에 관리하는 대시보드',
        theme_color: '#F8FAFC',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        id: '/',
        categories: ['productivity', 'finance', 'utilities'],
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '720p_screenshot.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: '구독 관리 대시보드 데스크탑 화면'
          },
          {
            src: 'narrow_screenshot.png',
            sizes: '430x912',
            type: 'image/png',
            form_factor: 'narrow',
            label: '구독 관리 대시보드 모바일 화면'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'date-fns'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'state-vendor': ['zustand']
        }
      }
    }
  }
});
