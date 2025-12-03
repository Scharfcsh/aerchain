import express from "express";
import SpeechRouter from "./routes/speech.route.js";
import cors from "cors";





const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/v1", (req, res) => {
  res.json({ message: "Speech Recognition API" });
});


// Mount speech routes
app.use("/api/v1", SpeechRouter);

export default app;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});