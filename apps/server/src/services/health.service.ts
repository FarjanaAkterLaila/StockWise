export interface HealthCheckResult {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export const getHealthStatus = (): HealthCheckResult => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };
};
