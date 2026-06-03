import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// BUG 1 FIX: Proper CORS — read ALLOWED_ORIGINS env var, fall back to * only in dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : null;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development" || !allowedOrigins
        ? "*"
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built frontend in all non-development environments.
if (process.env.NODE_ENV !== "development") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.resolve(__dirname, "../../harry-potter-calls/dist/public");

  // BUG 5.3 FIX: Log whether static dir exists
  if (process.env.NODE_ENV === "production") {
    logger.info({ staticDir, exists: fs.existsSync(staticDir) }, "Static dir check");
  }

  app.use(express.static(staticDir));

  app.use((_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  logger.info({ staticDir }, "Serving frontend static files");
}

export default app;
