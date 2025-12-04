import express from "express";
import SpeechRouter from "./routes/speech.route.js";
import cors from "cors";
import noteRouter from "./routes/notes.route.js";
import connectDB from "./lib/connect.js";





const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/v1", (req, res) => {
  res.json({ message: "Speech Recognition API" });
});
let mongoConnected = false;
app.use((req, res, next) => {
  if (!mongoConnected) {
    connectDB();
    console.log('Connecting to MongoDB...');
    mongoConnected = true;
    console.log('MongoDB connected.');
  }
  next();
});

// Mount speech routes
app.use("/api/v1", SpeechRouter);
app.use("/api/v1", noteRouter);

export default app;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});