/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import dotenv from "dotenv";
import app from "./api/index";

// Load environment variables
dotenv.config();

const PORT = 3000;

async function startServer() {
  // Integrate Vite for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sahaba Explorer Server running on http://localhost:${PORT}`);
  });
}

startServer();
