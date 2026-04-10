import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./db/pool.js";
import categoriesRouter from "./routes/categories.js";
import brandsRouter from "./routes/brands.js";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import contactRouter from "./routes/contact.js";
import adminRouter from "./routes/admin/index.js";
import { requireAdmin } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cartnexus-api", time: new Date().toISOString() });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await testDbConnection();
    res.json({ ok: true, database: "connected" });
  } catch (e) {
    res.status(503).json({
      ok: false,
      database: "error",
      message: e.message,
    });
  }
});

app.use("/api/categories", categoriesRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", requireAdmin, adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`CartNexus API http://localhost:${PORT}`);
});
