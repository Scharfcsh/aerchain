import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // {
    //   name: "console-forwarder",
    //   configureServer(server) {
    //     server.middlewares.use("/__log", async (req, res) => {
    //       let data = "";
    //       req.on("data", (chunk) => (data += chunk));
    //       req.on("end", () => {
    //         const parsed = JSON.parse(data);
    //         console.log("[BROWSER]", ...parsed.logs);
    //         res.end("ok");
    //       });
    //     });
    //   },
    // },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
