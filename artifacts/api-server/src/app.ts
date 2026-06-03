import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built frontend in all non-development environments.
// Using !== "development" (not === "production") so it works even when
// NODE_ENV is not explicitly set (e.g. some Render configurations).
if (process.env.NODE_ENV !== "development") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.resolve(__dirname, "../../harry-potter-calls/dist/public");

  app.use(express.static(staticDir));

  // SPA fallback – use app.use (not app.get("*")) for Express 5 compatibility.
  // In Express 5, bare "*" is no longer a catch-all wildcard.
  app.use((_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  logger.info({ staticDir }, "Serving frontend static files");
}

export default app;
