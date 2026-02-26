import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("zomato_kis.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    manual_for_time DATETIME,
    actual_ready_time DATETIME,
    rider_arrival_time DATETIME,
    total_kitchen_load INTEGER,
    source TEXT -- 'zomato', 'in-store', 'competitor'
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    // Mock stats for the dashboard
    res.json({
      avgRiderWait: 4.2, // minutes
      etaErrorP90: 8.5, // minutes
      orderVolume: 1250,
      activeMerchants: 320,
      improvement: 18.5, // % improvement over baseline
      liveRush: {
        index: 78, // 0-100 scale
        status: 'High',
        sources: [
          { name: 'Zomato Orders', volume: 45, weight: 0.4 },
          { name: 'Competitor Orders', volume: 32, weight: 0.35 },
          { name: 'In-Store Dining', volume: 22, weight: 0.25 }
        ]
      }
    });
  });

  app.get("/api/simulation/data", (req, res) => {
    // Generate some random simulation data
    const data = Array.from({ length: 20 }).map((_, i) => ({
      id: `ORD-${i}`,
      status: ['preparing', 'ready', 'picked_up'][Math.floor(Math.random() * 3)],
      progress: Math.floor(Math.random() * 100),
      isBiased: Math.random() > 0.7,
      load: Math.floor(Math.random() * 10) + 1
    }));
    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
