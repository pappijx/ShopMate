import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware

app.use(express.json());
app.use(cors);

// Routes

// Error handling

app.get("/api/contact", (req: Request, res: Response) => {
  res.send({
    name: "Ayush",
  });
});

export default app;
