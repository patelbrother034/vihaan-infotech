import { defineConfig, loadEnv } from "vite";
import { createChatMiddleware } from "./server/chat.mjs";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      cors: false,
      watch: { ignored: ['**/*.zip', '**/dist/**'] },
      fs: {
        deny: [
          ".env",
          ".env.*",
          "**/recovery-record.txt",
          "**/server/**",
          "**/*.pem",
          "**/*.key",
        ],
      },
    },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true },
    plugins: [
      {
        name: "local-gemini-chat",
        configureServer(server) {
          server.middlewares.use(createChatMiddleware(env));
        },
        configurePreviewServer(server) {
          server.middlewares.use(createChatMiddleware(env));
        },
      },
    ],
  };
});

