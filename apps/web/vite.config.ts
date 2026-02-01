import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
// @ts-ignore
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Cast 'as any' để tránh lỗi type do xung đột đường dẫn trong Monorepo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [
      react() as any,
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Hoa An CMMS',
          short_name: 'CMMS',
          description: 'Hệ thống quản lý bảo trì thiết bị',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone', // Quan trọng: Chạy như app native, không hiện thanh URL
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: true // Bật PWA ngay cả khi chạy dev để test
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3001,
      host: true, // Cho phép truy cập qua IP mạng LAN
      allowedHosts: true, // Cho phép truy cập từ các domain lạ (như ngrok) mà không bị chặn
      // Proxy cho local dev nếu cần thiết để tránh CORS
      // proxy: {
      //   '/api': {
      //     target: env.VITE_API_URL || 'http://localhost:3000',
      //     changeOrigin: true,
      //   }
      // }
    },
    // Define global constants replacement
    define: {
      // Đảm bảo biến môi trường được stringify đúng cách nếu cần dùng trực tiếp process.env (ít dùng trong Vite chuẩn)
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
  };
});
