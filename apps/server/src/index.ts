import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "StockWise API is running!",
  });
});

app.listen(PORT, () => {
  console.log(`StockWise API running on port ${PORT}`);
});
