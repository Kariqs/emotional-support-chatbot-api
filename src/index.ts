import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chatRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(chatRouter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
