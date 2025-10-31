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

// ✅ Ensure PORT is a number and bind to 0.0.0.0 for Railway
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
