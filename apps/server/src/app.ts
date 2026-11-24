import express from "express";
import cors from "cors";
import apiRouter from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};
