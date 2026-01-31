import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
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
    plugins: [react() as any],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3001,
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
