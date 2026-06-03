import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getRoomStats } from "../signaling";
import os from "os";

const router: IRouter = Router();

const startTime = Date.now();

router.get("/healthz", (_req, res) => {
  const { rooms, connections } = getRoomStats();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({
    ...data,
    uptime: uptimeSeconds,
    rooms,
    connections,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    cpu: os.loadavg()[0].toFixed(2),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || "development",
  });
});

export default router;
