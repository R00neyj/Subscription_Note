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
      // 'autoUpdate' 로 두면 vite-plugin-pwa 의 register 코드가 onNeedRefresh 를
      // 아예 호출하지 않고 새 SW 활성화 즉시 window.location.reload() 를 실행한다.
      // 그러면 SWUpdatePrompt 의 업데이트 안내가 뜰 수 없고, 사용자가 입력하던
      // 내용이 예고 없이 날아간다. 갱신 시점은 사용자가 고르게 한다.
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      // '*.svg', '*.png' 로 뭉뚱그리면 앱 실행에는 쓰이지 않는 스크린샷·OG 이미지까지
      // 프리캐시에 들어가 최초 설치 때 500KB 가까이 헛되이 내려받는다.
      // 오프라인에서 실제로 필요한 것만 명시한다.
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'logo_d.svg',
        'name=*.svg',
      ],
      manifest: {
        name: '구독노트 - 스마트한 구독 관리',
        short_name: '구독노트',
        description: '나의 모든 구독 서비스를 한눈에 관리하는 대시보드',
        lang: 'ko',
        dir: 'ltr',
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
